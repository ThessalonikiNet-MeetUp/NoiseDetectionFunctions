const db = require('./db');
const Sequelize = require('sequelize');
const rp = require('request-promise');
const Swagger = require('swagger-client');

const directLineSecret = process.env.DIRECT_LINE_SECRET;
const directLineClientName = 'DirectLineClient';
const directLineSpecUrl = 'https://docs.botframework.com/en-us/restapi/directline3/swagger.json';

const User = db.User;
const Device = db.Device;
const BotInfo = db.BotInfo;

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
        }, include: { model: User, include: { model: BotInfo } }
      }).then(function(response) {
      if(response === null) {
        context.log('error', {source: 'f', message: 'Device not found'});
        context.done();
      }
      var device = response.dataValues;
      if(device.user === null) {
        context.log('error', {source: 'f', message: 'User info could not be retrieved'});
        context.done();
      }
      var user = response.dataValues.user.dataValues;
      context.log('user', user);

      var botinfos = user.botinfos;
      if(botinfos === null || (Array.IsArray(botinfos) && botinfos.length === 0)) {
        context.log('error', {source: 'f', message: 'Bot info could not be retrieved'});
        context.done();
      }
      context.log('botinfos', botinfos);

      var i = 0;
      for(i = 0; i<botinfos.length; i++) {
        var botinfo = botinfos[i].dataValues;

        var botData = {};
        botData.conversationId = botinfo.conversationid;
        botData.channelId = botinfo.channelid;
        botData.recipientId = botinfo.userid;
        botData.recipientName = user.name;
        botData.serviceUrl = botinfo.serviceurl;
        botData.token = user.token;

        context.log('set client', botData);

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
                        text: 'NDBDATA:' + JSON.stringify(botData),
                        type: 'message',
                        from: {
                            id: directLineClientName,
                            name: directLineClientName
                        }
                    }
                }).catch(function (err) {
                    context.log('Error sending message:', err);
                    context.done();      
                });
            });
        });

      });
      context.done();
      
    }, function(error) {
        context.log('error', error);
        context.done();      
    });
};
