module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if ((req.query.deviceID || (req.body && req.body.deviceID)) && 
        (req.query.noiseLevel || (req.body && req.body.noiseLevel))) {

        var deviceID = (req.query.deviceID || req.body.deviceID);
        var noiseLevel = (req.query.noiseLevel || req.body.noiseLevel);

        var queueItem = {
            deviceID: deviceID,
            noiseLevel: noiseLevel
        };

        context.bindings.nbdDeviceID = queueItem;

        context.log('queue', queueItem);
        
        context.res = {
            status: 200,
            body: "All good"
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass deviceID and noiseLevel on the query string or in the request body"
        };
    }
    context.done();
};