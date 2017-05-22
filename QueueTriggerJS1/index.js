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
  token: Sequelize.STRING,
  channelid: Sequelize.STRING,
  botuserid: Sequelize.STRING,
  botusername: Sequelize.STRING,
  deviceid: Sequelize.INTEGER
});

const Device = sequelize.define('devices', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name: Sequelize.STRING
});

module.exports = function (context, myQueueItem) {
    context.log('JavaScript queue trigger function processed work item', myQueueItem);

    // sequelize.sync()
    // .then(() => User.create({
    //     username: 'janedoe',
    //     birthday: new Date(1980, 6, 20)
    // }))
    // .then(jane => {
    //     console.log(jane.get({
    //     plain: true
    //     }));
    // });

    var user = User.findAll({
        where: {
            email: 'ritazh@microsoft.com'
        }
    }).then(function(response) {
      context.log('result', response);
      context.done();
    }, function(error) {
      context.log('error', error);
      context.done();
    });
};