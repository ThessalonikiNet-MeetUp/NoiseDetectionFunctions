const Sequelize = require('sequelize');
const DirectLine = require('./direct-line');
const rp = require('request-promise');
const Swagger = require('swagger-client');


var directLineSecret = process.env.DIRECT_LINE_SECRET;
var directLineClientName = 'DirectLineClient';
var directLineSpecUrl = 'https://docs.botframework.com/en-us/restapi/directline3/swagger.json';

const db = process.env.DB;
const dbuser = process.env.DBUSER;
const dbpwd = process.env.DBPWD;
const dbhost = process.env.DBHOST;

const sequelize = new Sequelize(db, dbuser, dbpwd, {
  host: dbhost,
  dialect: 'mssql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  dialectOptions: {
    encrypt: true
  }
});

const User = sequelize.define('users', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: Sequelize.STRING },
  name: { type: Sequelize.STRING },
  botid: { type: Sequelize.STRING },
  botname: { type: Sequelize.STRING },
  serviceurl: { type: Sequelize.STRING },
  token: { type: Sequelize.STRING },
  conversationid: { type: Sequelize.STRING },
  channelid: { type: Sequelize.STRING },
  userid: { type: Sequelize.STRING }
},
{
  timestamps: false
});

const Device = sequelize.define('devices', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: Sequelize.STRING },
  userid: { type: Sequelize.INTEGER }
},
{
  timestamps: false
});

module.exports = function (context, myQueueItem) {
    context.log('JavaScript queue trigger function processed work item', myQueueItem);

    context.log('set client')

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
                    text: input,
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

    User.findAll({
        where: {
            email: 'ritazh@microsoft.com'
        }
    }).then(function(response) {
      var user = response[0].dataValues;

      context.log('result', user);
      context.done();
    }, function(error) {
      context.log('error', error);
      context.done();
    });
};