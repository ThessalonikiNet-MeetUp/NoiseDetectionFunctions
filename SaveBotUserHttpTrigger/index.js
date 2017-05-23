const Sequelize = require('sequelize');
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
  email: Sequelize.STRING,
  name: Sequelize.STRING,
  botid: Sequelize.STRING,
  botname: Sequelize.STRING,
  serviceurl: Sequelize.STRING,
  token: Sequelize.STRING,
  conversationid: Sequelize.STRING,
  channelid: Sequelize.STRING,
  userid: Sequelize.STRING,
},
{
  timestamps: false
});

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    var userid = (req.query.UserId || req.body.UserId);
    var username = (req.query.UserName || req.body.UserName);
    var botid = (req.query.BotId || req.body.BotId);
    var botname = (req.query.BotName || req.body.BotName);
    var serviceurl = (req.query.ServiceUrl || req.body.ServiceUrl);
    var token = (req.query.token || req.body.token);
    var conversationid = (req.query.ConversationId || req.body.ConversationId);
    var channelid = (req.query.ChannelId || req.body.ChannelId);

    if (userid && username && botid && botname && serviceurl) {

        User.sync().then(() => {
            return User.create({
                userid: userid,
                username: username,
                botid: botid,
                botname: botname,
                serviceurl: serviceurl,
                token: token,
                conversationid: conversationid,
                channelid: channelid,
            });
        });
    } else {
        context.res = {
            status: 400,
            body: "ID, Name, BotId, BotName, ServiceUrl, Token are requird on the query string or in the request body"
        };
    }
    context.done();
};