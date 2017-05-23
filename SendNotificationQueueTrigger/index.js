const db = require('./db');
const DirectLine = require('./direct-line');

const User = db.User;
const Device = db.Device;

module.exports = function (context, myQueueItem) {

  var errorHandler = function(error) {
    context.log('error', error);
    context.done();
  }

  context.log('JavaScript queue trigger function processed work item', myQueueItem);

  var directLine = new DirectLine(process.env.DIRECT_LINE_SECRET);

  var deviceID = myQueueItem.deviceID;

  Device.find({
    where: {
        id: deviceID
    }, include: [User]}).then(function(response) {
      if(response === null) {
        errorHandler({source: 'f', message: 'device not found'});
      }
      var device = response.dataValues;
      if(device.user === null) {
        errorHandler({source: 'f', message: 'user info could not be retrieved'});
      }

      context.log('user id', response.dataValues.user.id);

      context.done();
    }, errorHandler);
};
