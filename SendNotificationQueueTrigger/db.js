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
  email: { type: Sequelize.STRING },
  name: { type: Sequelize.STRING },
  token: { type: Sequelize.STRING },
},
{
  timestamps: false
});

const BotInfo = sequelize.define('botinfos', {
  botid: { type: Sequelize.STRING },
  botname: { type: Sequelize.STRING },
  serviceurl: { type: Sequelize.STRING },
  conversationid: { type: Sequelize.STRING },
  channelid: { type: Sequelize.STRING },
  botuserid: { type: Sequelize.STRING },
  userid: { type: Sequelize.STRING },
  botusername: { type: Sequelize.STRING },
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

User.hasMany(Device, {foreignKey: 'userid'});
Device.belongsTo(User, {foreignKey: 'userid'});

User.hasMany(BotInfo, {foreignKey: 'userid'});
BotInfo.belongsTo(User, {foreignKey: 'userid'});

module.exports = {
    User: User,
    Device: Device,
    BotInfo: BotInfo
}
