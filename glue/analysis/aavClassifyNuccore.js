
var ncbiCurated;
var whereClause = "source.name like 'ncbi-nuccore-aav%' and species = null";
ncbiCurated = glue.tableToObjects(glue.command(["list", "sequence", "sequenceID", "source.name", "-w", whereClause]));
//glue.log("INFO", "RESULT WAS ", ncbiCurated);

var processed = 0;

_.each(ncbiCurated, function(ncbiCurated) {

	var sequenceID = ncbiCurated.sequenceID;
	var sourceName = ncbiCurated["source.name"]; // here can't use the dot notation (.) so use the bracket notation instead.

	var whereClause = "sequenceID = '" + sequenceID + "'";
	//glue.log("INFO", "ID RESULT WAS ", sequenceID);

	var genotypeResults;
	glue.inMode("/module/aavMaxLikelihoodGenotyper", function() {
		genotypeResults = glue.command(["genotype", "sequence", "-w", whereClause]);
		//glue.log("INFO", "Genotype RESULT WAS ", genotypeResults);			
	});

	var genotypeRows = genotypeResults.genotypeCommandResult.row;
	var lineageRow = genotypeRows[0].value;
	var lineageResult = lineageRow[1]
	var speciesResult = lineageRow[2]
	//glue.log("INFO", "lineageRow RESULT WAS ", lineageRow);			
	//glue.log("INFO", "lineageResult RESULT WAS ", lineageResult);			
	//glue.log("INFO", "speciesResult RESULT WAS ", speciesResult);			

	if (lineageResult) {

		var lineage = lineageResult.replace("AL_", "");
		glue.inMode("sequence/"+sourceName+"/"+sequenceID, function() {		
			glue.command(["set", "field", "lineage", lineage]);
		});
	
	}
	if (speciesResult) {

		var species = speciesResult.replace("AL_", "");
		glue.inMode("sequence/"+sourceName+"/"+sequenceID, function() {
			glue.command(["set", "field", "species", species]);
		});
	
	}

	processed++;

	if(processed % 10 == 0) {
		glue.logInfo("Genotyped "+processed+" sequences. ");
		glue.command(["commit"]);
		glue.command(["new-context"]);
	}

});	
