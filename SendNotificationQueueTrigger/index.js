const db = require('./db');
const Sequelize = require('sequelize');
const rp = require('request-promise');
const Swagger = require('swagger-client');

const directLineSecret = process.env.DIRECT_LINE_SECRET;
const directLineClientName = 'DirectLineClient';
const directLineSpecUrl = 'https://docs.botframework.com/en-us/restapi/directline3/swagger.json';

const User = db.User;
const Device = db.Device;

var directLineClient = rp(directLineSpecUrl)
  .then(function (spec) {
    // client
    return new Swagger({
        spec: JSON.parse(spec.trim()),
        usePromise: true,
        authorizations : {
        AuthorizationBotConnector: new Swagger.ApiKeyAuthorization('Authorization', `Bearer ${directLineSecret}`, 'header'),
      }
    });
})
.catch(function (err) {
    context.log('Error initializing DirectLine client', err);
});

module.exports = function (context, myQueueItem) {

  context.log('JavaScript queue trigger function processed work item', myQueueItem);
  var deviceID = myQueueItem.deviceID;
  Device.find({
    where: {
        id: deviceID
    }, include: [User]}).then(function(response) {
      if(response === null) {
        context.log('error', {source: 'f', message: 'device not found'});
        context.done();
      }
      var device = response.dataValues;
      if(device.user === null) {
        context.log('error', {source: 'f', message: 'user info could not be retrieved'});
        context.done();
      }

      context.log('user id', response.dataValues.user.id);
      context.log('set client')

      directLineClient.then(function (client) {
        context.log('start convo');
        client.Conversations.Conversations_StartConversation()                          // create conversation
          .then(function (response) {
              context.log(response.obj.conversationId);
              return response.obj.conversationId;
          })                            // obtain id
          .then(function (conversationId) {
             context.log(conversationId);
             context.log('post');

             client.Conversations.Conversations_PostActivity(
             {
                  conversationId: conversationId,
                  activity: {
                      textFormat: 'plain',
                      text: "{'userid', '" + response.dataValues.user.id+ "'}",
                      type: 'message',
                      from: {
                          id: directLineClientName,
                          name: directLineClientName
                      }
                  }
              }).catch(function (err) {
                  context.log('Error sending message:', err);
              });
          });
      });
      context.done();
      
    }, function(error) {
        context.log('error', error);
        context.done();      
    });
};