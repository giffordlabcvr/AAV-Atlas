var partialSeqs;
//var whereClause = "sequenceID = 'HC000040'"; // test clause
var whereClause = "length >= 100"; // Minimum length (adjust if needed)

partialSeqs = glue.tableToObjects(glue.command(["list", "sequence", "sequenceID", "source.name", "length", "-w", whereClause]));

var processed = 0;

_.each(partialSeqs, function(seqObj) {

	var sequenceID = seqObj.sequenceID;
	var sourceName = seqObj["source.name"];


	var coverageCategory = null;

	// Full genome override based on length
	// sequences longer than this are considered 'genomic' 
	if(seqObj.length > 2700) {
		coverageCategory = "full_genome";
		
	}
	else {
	
		glue.inMode("/module/aavGeneRecogniser", function() {
			var result = glue.command(["recognise", "sequence", "-w", "sequenceID = '" + sequenceID + "'"]);

			if(result.blastSequenceRecogniserResult && result.blastSequenceRecogniserResult.row) {
				var categoryId = result.blastSequenceRecogniserResult.row[0].value[1];
				coverageCategory = categoryId; // 'NS' or 'VP'
			}
			
		});
	}

	if(coverageCategory != null) {
		glue.inMode("sequence/" + sourceName + "/" + sequenceID, function() {
			glue.command(["set", "field", "coverage_category", coverageCategory]);
		});
	}


	processed++;
	if(processed % 10 === 0) {
		glue.logInfo("Processed "+processed+" sequences.");
		glue.command(["commit"]);
		glue.command(["new-context"]);
	}

});

glue.logInfo("Done. Total sequences processed: " + processed);