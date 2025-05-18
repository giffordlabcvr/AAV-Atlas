/**
 * Main script for processing amino acid replacements in AAV sequences.
 * This script identifies and catalogs amino acid replacements relative to reference sequences
 * across alignments, while ensuring that only coding features are analyzed.
 */

// Step 1: Retrieve the set of tip alignments to process
var tipAlignments = {};
getTipAlignments(tipAlignments); // Fills tipAlignments with alignment-name-to-reference mapping

// Step 2: Retrieve all coding features in the project and map them for quick reference
var codingFeaturesMap = {}; // Stores coding features by name for easy lookup
var featuresList = glue.tableToObjects(
    glue.command(["list", "feature", "-w", "featureMetatags.name = 'CODES_AMINO_ACIDS' and featureMetatags.value = true", "name", "displayName", "parent.name"])
);
_.each(featuresList, function(featureObj) {
    codingFeaturesMap[featureObj.name] = true; // Mark this feature as coding
});

// Step 3: Retrieve coding features specific to each reference
var refFeaturesMap = {}; // Maps reference names to their associated coding features

_.each(_.keys(tipAlignments), function(alignmentName) {
    var refseqName = tipAlignments[alignmentName];
    glue.inMode("reference/" + refseqName, function() {
        var featureLocations = glue.tableToObjects(glue.command(["list", "feature-location"]));
        refFeaturesMap[refseqName] = _.filter(featureLocations, function(featureLoc) {
            return codingFeaturesMap[featureLoc["feature.name"]]; // Include only coding features
        });
    });
});

// Step 4: Iterate through alignments and process amino acid replacements
var whereClause = "sequence.source.name like 'ncbi-nuccore-aav%'"; // Filters alignment members by source
_.each(_.keys(tipAlignments), function(alignmentName) {

    var refseqName = tipAlignments[alignmentName];
    glue.logInfo("Processing: " + alignmentName + " constrained by reference: "+refseqName );


    // Initialize a container for amino acid replacements in the current alignment
    var replacementsSet = {};

    _.each(refFeaturesMap[refseqName], function(featureLoc) {
        var featureName = featureLoc["feature.name"];
        var refAaObjsMap = {}; // Maps codon labels to reference amino acid objects for the feature

        // Retrieve amino acid information from the reference sequence for this feature
        glue.inMode("reference/" + refseqName + "/feature-location/" + featureName, function() {
            var refAaObjs = glue.tableToObjects(glue.command(["amino-acid"]));
            _.each(refAaObjs, function(refAaObj) {
                refAaObjsMap[refAaObj.codonLabel] = refAaObj; // Map codon label to amino acid object
            });
        });

        // Process members of the alignment for this feature
        glue.inMode("alignment/" + alignmentName, function() {
            var almtMemberObjs = glue.tableToObjects(glue.command(["list", "member", "-w", whereClause]));
            var processed = 0; // Counter for processed alignment members

            _.each(almtMemberObjs, function(almtMemberObj) {
                glue.inMode("member/" + almtMemberObj["sequence.source.name"] + "/" + almtMemberObj["sequence.sequenceID"], function() {
                    var memberAaObjs = glue.tableToObjects(glue.command(["amino-acid", "-r", refseqName, "-f", featureName]));

                    // Compare member amino acids to the reference
                    _.each(memberAaObjs, function(memberAaObj) {
                        if (memberAaObj.definiteAas && memberAaObj.definiteAas !== "" &&
                            (memberAaObj.definiteAas.length === 1 || memberAaObj.codonNts.indexOf('N') < 0)) {

                            var refAaObj = refAaObjsMap[memberAaObj.codonLabel];

                            if (refAaObj && refAaObj.definiteAas && refAaObj.definiteAas !== "" &&
                                refAaObj.definiteAas !== memberAaObj.definiteAas) {

                                // Identify mismatched amino acids
                                var refAas = refAaObj.definiteAas.split('');
                                var memberAas = memberAaObj.definiteAas.split('');

                                _.each(refAas, function(refAa) {
                                    _.each(memberAas, function(memberAa) {
                                        if (refAa !== memberAa) {

											// Generate a unique ID for each replacement
											var replacementID = refseqName + ":" + featureName + ":" + refAa + ":" + memberAaObj.codonLabel + ":" + memberAa;
											var replacementObj = replacementsSet[replacementID];

											// Create a new replacement object if it doesn't already exist
											if (!replacementObj) {
												replacementObj = {
													id: replacementID,
													feature: featureName,
													parentFeature: featureLoc["parent.name"],
													codonLabel: memberAaObj.codonLabel,
													refNt: memberAaObj.relRefNt,
													refAa: refAa,
													replacementAa: memberAa,
													memberSeqs: []
												};
												replacementsSet[replacementID] = replacementObj;
											}

                                            // Add sequence to the replacement object
                                            replacementObj.memberSeqs.push(almtMemberObj);
                                        }
                                    });
                                });
                            }
                        }
                    });

                    // Increment and log progress for every 500 sequences processed
                    processed++;
                    if (processed % 500 === 0) {
                        glue.logInfo("Processed for replacements in " + featureName + ": " + processed + " sequences.");
                        glue.command(["new-context"]);
                    }
                });
            });
        });
    });

    // Step 5: Commit replacements for this alignment
    var processed = 0; // Counter for committed replacements


	_.each(_.values(replacementsSet), function(replacementObj) {

		var variationName = "aav_aa_rpl:" + replacementObj.id;
		var variationExists = false;

		// Check for existing variation; create if it doesn't exist
		glue.inMode("reference/" + refseqName + "/feature-location/" + replacementObj.feature, function() {
			var existing = glue.tableToObjects(glue.command(["list", "variation", "-w", "name = '" + variationName + "'"]));
			variationExists = existing.length > 0;

			if (!variationExists) {
				glue.command(["create", "variation", variationName, "-t", "aminoAcidSimplePolymorphism", "--labeledCodon", replacementObj.codonLabel, replacementObj.codonLabel]);

				glue.inMode("variation/" + variationName, function() {
					glue.command(["set", "metatag", "SIMPLE_AA_PATTERN", replacementObj.replacementAa]);
					glue.command(["set", "metatag", "MIN_COMBINED_TRIPLET_FRACTION", 0.25]);
				});
			}
		});

		// If variation does not exist, calculate additional metrics and create custom table row
		if (!variationExists) {
			var grantham_distance_double;
			var grantham_distance_int;
			var miyata_distance;
			var classifyReplacement = false;

			// Check if classification metrics can be calculated
			if (
				replacementObj.refAa !== "*" &&
				replacementObj.refAa !== "X" &&
				replacementObj.replacementAa !== "*" &&
				replacementObj.replacementAa !== "X"
			) {
				classifyReplacement = true;

				// Calculate Grantham distance
				glue.inMode("module/aavGrantham1974DistanceCalculator", function() {
					var granthamResult = glue.command(["distance", replacementObj.refAa, replacementObj.replacementAa]).grantham1974DistanceResult;
					grantham_distance_double = granthamResult.distanceDouble;
					grantham_distance_int = granthamResult.distanceInt;
				});

				// Calculate Miyata distance
				glue.inMode("module/aavMiyata1979DistanceCalculator", function() {
					miyata_distance = glue.command(["distance", replacementObj.refAa, replacementObj.replacementAa]).miyata1979DistanceResult.distance;
				});
			}

			// Create or update the custom table row for this replacement
			glue.command(["create", "custom-table-row", "aav_replacement", replacementObj.id]);
			glue.inMode("custom-table-row/aav_replacement/" + replacementObj.id, function() {
				var displayName = replacementObj.refAa + replacementObj.codonLabel + replacementObj.replacementAa;
				glue.command(["set", "field", "display_name", displayName]);
				glue.command(["set", "field", "refseq_name", refseqName]);
				glue.command(["set", "field", "parent_feature", replacementObj.feature]);
				glue.command(["set", "field", "codon_label", replacementObj.codonLabel]);
				glue.command(["set", "field", "reference_nt", replacementObj.refNt]);
				glue.command(["set", "field", "reference_aa", replacementObj.refAa]);
				glue.command(["set", "field", "replacement_aa", replacementObj.replacementAa]);

				glue.command(["set", "link-target", "variation",
					"reference/" + refseqName + "/feature-location/" + replacementObj.feature + "/variation/" + variationName]);

				// Set classification metrics if calculated
				if (classifyReplacement) {
					glue.command(["set", "field", "grantham_distance_double", grantham_distance_double]);
					glue.command(["set", "field", "grantham_distance_int", grantham_distance_int]);
					glue.command(["set", "field", "miyata_distance", miyata_distance]);
				}
			});
		}

		// Create links between aav_replacement_sequence and sequence
		_.each(replacementObj.memberSeqs, function(memberObj) {
			var sourceName = memberObj["sequence.source.name"];
			var sequenceID = memberObj["sequence.sequenceID"];
			var linkObjId = replacementObj.id + ":" + sourceName + ":" + sequenceID;
			var variation_present = true;

			// Create a new row in the aav_replacement_sequence table
			glue.command(["create", "custom-table-row", "aav_replacement_sequence", linkObjId]);

			// Link the replacement sequence to the corresponding aav_replacement and sequence
			glue.inMode("custom-table-row/aav_replacement_sequence/" + linkObjId, function() {
				glue.command(["set", "link-target", "aav_replacement", "custom-table-row/aav_replacement/" + replacementObj.id]);
				glue.command(["set", "link-target", "sequence", "sequence/" + sourceName + "/" + sequenceID]);
			});

			// Mark the sequence with variation presence
			glue.inMode("sequence/" + sourceName + "/" + sequenceID, function() {
				glue.command(["set", "field", "variation_present", variation_present]);
			});
		});

		// Increment and log progress for every 500 replacements
		processed++;
		if (processed % 500 === 0) {
			glue.logInfo("Ensured creation/association of " + processed + " replacements.");
			glue.command(["commit"]);
			glue.command(["new-context"]);
		}
	});

	// Final log and commit for this alignment
	glue.logInfo("Ensured creation/association of " + processed + " replacements.");
	glue.command(["commit"]);
	glue.command(["new-context"]);


});


/**
 * Retrieves the tip alignments (alignments without child alignments).
 * Populates `tipAlignments` with alignment-name-to-reference mapping.
 */
function getTipAlignments(tipAlignments) {
    var alignmentList = glue.tableToObjects(glue.command(["list", "alignment", "-w", "name not like 'AL_UNC%'"]));

    var parentAlignments = {};
    _.each(alignmentList, function(alignmentObj) {
        var parentName = alignmentObj["parent.name"];
        if (parentName) {
            parentAlignments[parentName] = true;
        }
    });

    _.each(alignmentList, function(alignmentObj) {
        var alignmentName = alignmentObj["name"];
        var refseqName = alignmentObj["refSequence.name"];
        if (!parentAlignments[alignmentName]) {
            tipAlignments[alignmentName] = refseqName;
        }
    });
}
