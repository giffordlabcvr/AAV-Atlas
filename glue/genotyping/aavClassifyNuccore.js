
var ncbiCurated;
var whereClause = "source.name like 'ncbi-nuccore-aav%'";
ncbiCurated = glue.tableToObjects(glue.command(["list", "sequence", "sequenceID", "source.name", "-w", whereClause]));
//glue.log("INFO", "RESULT WAS ", ncbiCurated);

var processed = 0;

_.each(ncbiCurated, function(ncbiCurated) {

	var sequenceID = ncbiCurated.sequenceID;
	var sourceName = ncbiCurated["source.name"]; // note: here can't use the dot notation (.) so use the bracket notation instead.

	var whereClause = "sequenceID = '" + sequenceID + "'";
	//glue.log("INFO", "ID RESULT WAS ", sequenceID);

	var genotypeResults;
	glue.inMode("/module/aavMaxLikelihoodGenotyper", function() {
		genotypeResults = glue.command(["genotype", "sequence", "-w", whereClause]);
		//glue.log("INFO", "Genotype RESULT WAS ", genotypeResults);			
	});

	var genotypeRows = genotypeResults.genotypeCommandResult.row;
	var speciesRow = genotypeRows[0].value;
	var speciesResult = speciesRow[1]
	var serotypeResult = speciesRow[2]
	//glue.log("INFO", "speciesRow RESULT WAS ", speciesRow);			
	//glue.log("INFO", "speciesResult RESULT WAS ", speciesResult);			
	//glue.log("INFO", "serotypeResult RESULT WAS ", serotypeResult);			

	if (speciesResult) {

		var species = speciesResult.replace("AL_", "");
		glue.inMode("sequence/"+sourceName+"/"+sequenceID, function() {		
			glue.command(["set", "field", "species", species]);
		});
	
	}
	if (serotypeResult) {

		var serotype = serotypeResult.replace("AL_", "");
		glue.inMode("sequence/"+sourceName+"/"+sequenceID, function() {
			glue.command(["set", "field", "serotype", serotype]);
		});
	
	}

	processed++;

	if(processed % 10 == 0) {
		glue.logInfo("Typed "+processed+" AAV sequences. ");
		glue.command(["commit"]);
		glue.command(["new-context"]);
	}

});	
