var azure = require('azure-storage');

module.exports = function (context, myQueueItem) {
    context.log('JavaScript queue trigger function processed work item', myQueueItem);

    // Lookup data
    var tableSvc = azure.createTableService();

    var query = new azure.TableQuery().top(5).where('PartitionKey eq ?', myQueueItem.deviceID);

    tableSvc.queryEntities('ndbnotifications', query, null, function(error, result, response){
        if(!error){
            context.log('Retrieved ', result);
        }
        else {
            context.log('error', err);
        }
        
        context.done();
    });  
    // Trigger the bot

};