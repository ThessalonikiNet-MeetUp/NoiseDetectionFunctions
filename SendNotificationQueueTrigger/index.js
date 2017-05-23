const Sequelize = require('sequelize');
const DirectLine = require('./direct-line');

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

    var directLine = new DirectLine(process.env.DIRECT_LINE_SECRET);

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