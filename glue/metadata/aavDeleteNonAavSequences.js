// This script removes from the AAV-Atlas sequences that are not AAV-derived but are mislabelled as such in GenBank

// Load list human sequences to delete
var loadResult;
glue.inMode("module/tabularUtilityTab", function() {
	loadResult = glue.tableToObjects(glue.command(["load-tabular", "tabular/nuccore-human-exclude.tsv"]));
    //glue.log("INFO", "load result was:", loadResult);
});

_.each(loadResult, function(seqIdObj) {

	var sequenceID = seqIdObj.sequenceID;
	glue.log("INFO", "Deleting human-derived sequence:", sequenceID);
	glue.command(["delete", "sequence", "-w", "sequenceID = '"+sequenceID+"'"]);

});


// Load list avian AAV sequences to delete
var avianLoadResult;
glue.inMode("module/tabularUtilityTab", function() {
	avianLoadResult = glue.tableToObjects(glue.command(["load-tabular", "tabular/nuccore-avian-exclude.tsv"]));
    //glue.log("INFO", "load result was:", avianLoadResult);
});

_.each(avianLoadResult, function(seqIdObj) {

	var sequenceID = seqIdObj.sequenceID;
	glue.log("INFO", "Deleting avian AAV sequence:", sequenceID);
	glue.command(["delete", "sequence", "-w", "sequenceID = '"+sequenceID+"'"]);

});


		