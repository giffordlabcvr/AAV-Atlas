
var featuresList = glue.tableToObjects(
		
		glue.command(["list", "feature", "-w", "featureMetatags.name = 'CODES_AMINO_ACIDS' and featureMetatags.value = true", "name", "displayName", "parent.name"]));

//glue.log("INFO", "ID RESULT WAS ", featuresList);

var comparisonRefName = "REF_MASTER_AAV2";

// get alignment set to process
//var tipAlignments = {};
//getTipAlignments(tipAlignments);

var tipAlignments = {};
tipAlignments['AL_AAV2']= 1;
tipAlignments['AL_AAV5']= 1;
tipAlignments['AL_AAV6']= 1;

// production
var whereClause = "sequence.source.name = 'ncbi-nuccore-aav'";

// Iterate through tip alignments
_.each(_.keys(tipAlignments), function(alignmentName) {

	// production
	var replacementsSet = {};
	
	_.each(featuresList, function(featureObj) {

		var refAaObjsMap = {};
		glue.inMode("reference/"+comparisonRefName+"/feature-location/"+featureObj.name, function() {
	
			var refAaObjs = glue.tableToObjects(glue.command(["amino-acid"]));
		
			_.each(refAaObjs, function(refAaObj) {
				refAaObjsMap[refAaObj.codonLabel] = refAaObj;
			});
	
		});
	
		glue.inMode("alignment/"+alignmentName, function() {
	
			var almtMemberObjs = glue.tableToObjects(glue.command(["list", "member", "-w", whereClause]));
			var processed = 0;

			_.each(almtMemberObjs, function(almtMemberObj) {
		
				glue.inMode("member/"+almtMemberObj["sequence.source.name"]+"/"+almtMemberObj["sequence.sequenceID"], function() {
			
					var memberAaObjs = glue.tableToObjects(glue.command(["amino-acid", "-r", comparisonRefName, "-f", featureObj.name]));
			   
					_.each(memberAaObjs, function(memberAaObj) {
				
						// Require no Ns in the codonNts in order to generate a replacement,
						// unless the replacement is unambiguously a single AA residue.
						// This means we are interpreting N as 'unable to sequence' rather than
						// 'equal proportion A, C, G, T'  
						//glue.log("INFO", "Amino acid RESULT WAS ", memberAaObj);

					
						if(memberAaObj.definiteAas != null && memberAaObj.definiteAas != "" &&
						  (memberAaObj.definiteAas.length == 1 || memberAaObj.codonNts.indexOf('N') < 0)) {
					  
							refAaObj = refAaObjsMap[memberAaObj.codonLabel];
						
						
							if(refAaObj != null && refAaObj.definiteAas != null && refAaObj.definiteAas != "" && 
									refAaObj.definiteAas != memberAaObj.definiteAas) {
							
								var refAas = refAaObj.definiteAas.split('');
							
								var memberAas = memberAaObj.definiteAas.split('');
							
								_.each(refAas, function(refAa) {
							
									_.each(memberAas, function(memberAa) {
								
										if(refAa != memberAa) {
									
											//glue.log("INFO", "Replacement amino acid RESULT WAS ", memberAaObj);
									
											var replacementID = featureObj.name+":"+refAa+":"+memberAaObj.codonLabel+":"+memberAa;
											var replacementObj = replacementsSet[replacementID];
										
											if(replacementObj == null) {
										
												replacementObj = {
													id: replacementID,
													feature: featureObj.name,
													parentFeature: featureObj["parent.name"],
													codonLabel: memberAaObj.codonLabel,
													refNt: memberAaObj.relRefNt,
													refAa: refAa,
													replacementAa: memberAa,
													memberSeqs: []
												};
												replacementsSet[replacementID] = replacementObj; // Make sure to add the new object to the set
										
											}
										
											replacementObj.memberSeqs.push(almtMemberObj);
										}
								
									});
							
								});
						
							}
					
						}
				
					});
					processed++;
					if(processed % 500 == 0) {
						glue.logInfo("Processed for replacements in "+featureObj.name+": "+processed+" sequences. ");
						glue.command(["new-context"]);
					}
				});
			
			}); 
		});
	
	});

	//glue.log("INFO", "FINAL RESULT WAS ", replacementsSet);


	processed = 0;


	_.each(_.values(replacementsSet), function(replacementObj) {

		//glue.log("INFO", "Creating replacement object", replacementObj);

		var variationName = "aav_aa_rpl:"+replacementObj.id;
		var variationExists = false;
	
		glue.inMode("reference/REF_MASTER_AAV2/feature-location/"+replacementObj.feature, function() {
			var existing = glue.tableToObjects(glue.command(["list", "variation", "-w", "name = '"+variationName+"'"]));
			if(existing.length > 0) {
				variationExists = true;
			}
			if(!variationExists) {
		
				glue.command(["create", "variation", variationName, 
					"-t", "aminoAcidSimplePolymorphism", 
					"--labeledCodon", replacementObj.codonLabel, replacementObj.codonLabel]);
				
				glue.inMode("variation/"+variationName, function() {
			
					glue.command(["set", "metatag", "SIMPLE_AA_PATTERN", replacementObj.replacementAa]);
					glue.command(["set", "metatag", "MIN_COMBINED_TRIPLET_FRACTION", 0.25]);
			
				});
			
			}
		});

		if(!variationExists) {

			var hanada_radical_I;
			var hanada_radical_II;
			var hanada_radical_III;
			var grantham_distance_double;
			var grantham_distance_int;
			var miyata_distance;
			var classifyReplacement = false;
		
			if(replacementObj.refAa != '*' && replacementObj.refAa != 'X'
				 && replacementObj.replacementAa != '*' && replacementObj.replacementAa != 'X') {
				classifyReplacement = true;
				glue.inMode("module/aavHanada2006ReplacementClassifier", function() {
					var classifierResults = glue.tableToObjects(glue.command(["classify", "replacement", replacementObj.refAa, replacementObj.replacementAa]));
					hanada_radical_I = classifierResults[0].radical;
					hanada_radical_II = classifierResults[1].radical;
					hanada_radical_III = classifierResults[2].radical;
				});
				glue.inMode("module/aavGrantham1974DistanceCalculator", function() {
					var granthamResult = glue.command(["distance", replacementObj.refAa, replacementObj.replacementAa]).grantham1974DistanceResult;
					grantham_distance_double = granthamResult.distanceDouble;
					grantham_distance_int = granthamResult.distanceInt;
				});
				glue.inMode("module/aavMiyata1979DistanceCalculator", function() {
					miyataDistance = glue.command(["distance", replacementObj.refAa, replacementObj.replacementAa]).miyata1979DistanceResult.distance;
				});
			}

			
			glue.command(["create", "custom-table-row", "aav_replacement", replacementObj.id]);
			glue.inMode("custom-table-row/aav_replacement/"+replacementObj.id, function() {

				var displayName = replacementObj.refAa+replacementObj.codonLabel+replacementObj.replacementAa;
				glue.command(["set", "field", "display_name", displayName]);
				glue.command(["set", "field", "codon_label", replacementObj.codonLabel]);		
				glue.command(["set", "field", "codon_label_int", parseInt(replacementObj.codonLabel)]);		
				glue.command(["set", "field", "reference_nt", replacementObj.refNt]);
				glue.command(["set", "field", "reference_aa", replacementObj.refAa]);
				glue.command(["set", "field", "replacement_aa", replacementObj.replacementAa]);
			
				glue.command(["set", "link-target", "variation", 
					"reference/REF_MASTER_AAV2/feature-location/"+replacementObj.feature+
					"/variation/"+variationName]);

				if(classifyReplacement) {
					glue.command(["set", "field", "radical_hanada_category_i", hanada_radical_I]);
					glue.command(["set", "field", "radical_hanada_category_ii", hanada_radical_II]);
					glue.command(["set", "field", "radical_hanada_category_iii", hanada_radical_III]);
					glue.command(["set", "field", "grantham_distance_double", grantham_distance_double]);
					glue.command(["set", "field", "grantham_distance_int", grantham_distance_int]);
					glue.command(["set", "field", "miyata_distance", miyataDistance]);
				}

			});

		}
	
		_.each(replacementObj.memberSeqs, function(memberObj) {
	
			var sourceName = memberObj["sequence.source.name"];
			var sequenceID = memberObj["sequence.sequenceID"];
			var linkObjId = replacementObj.id+":"+sourceName+":"+sequenceID;
			var variation_present = true;
		
			glue.command(["create", "custom-table-row", "aav_replacement_sequence", linkObjId]);
		
			glue.inMode("custom-table-row/aav_replacement_sequence/"+linkObjId, function() {
				glue.command(["set", "link-target", "aav_replacement", "custom-table-row/aav_replacement/"+replacementObj.id]);
				glue.command(["set", "link-target", "sequence", "sequence/"+sourceName+"/"+sequenceID]);
			});
		
			glue.inMode("sequence/"+sourceName+"/"+sequenceID, function() {
				glue.command(["set", "field", "variation_present", variation_present]);
			});
		
		});
	
	
		processed++;
		if(processed % 500 == 0) {
			glue.logInfo("Ensured creation / associated "+processed+" replacements. ");
			glue.command(["commit"]);
			glue.command(["new-context"]);
		}

	});

	glue.logInfo("Ensured creation / associated "+processed+" replacements. ");
	glue.command(["commit"]);
	glue.command(["new-context"]);


		
});


// Get tip alignments
function getTipAlignments (tipAlignments) {

	// List alignments
	var alignmentList = glue.tableToObjects(glue.command(["list", "alignment", "-w", "name not like 'AL_UNC%'"]));
	//glue.log("INFO", "MSA RESULT WAS ", alignmentList);

	// Get set that are parents
	var parentAlignments = {};
	_.each(alignmentList, function(alignmentObj) {
	
		var parentName = alignmentObj["parent.name"];
		if (parentName) {
			parentAlignments[parentName]= 1;
		}
	});
	//glue.log("INFO", "PARENT RESULT WAS ", parentAlignments);
	
	// Iterate through whole list, capture all those that are to parents
	_.each(alignmentList, function(alignmentObj) {
	
		var alignmentName = alignmentObj["name"];
		
		if (!parentAlignments[alignmentName]) {
			tipAlignments[alignmentName]= 1;
		}
	});
	//glue.log("INFO", "TIP RESULT WAS ", tipAlignments);

}

