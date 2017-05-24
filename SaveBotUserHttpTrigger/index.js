const db = require('../SendNotificationQueueTrigger/db');
const User = db.User;
const Device = db.Device;
const BotInfo = db.BotInfo;

function addDevice(context, userid){
  return Device.create({
    name: null,
    userid: userid,
  }).then(deviceResult => {
    return deviceResult.get('id');     
  });
}

function addBotUser(context, botid, botname, serviceurl, conversationid, channelid, botuserid, botusername, userid){
  return BotInfo.create({
    botid: botid,
    botname: botname,
    serviceurl: serviceurl,
    conversationid: conversationid,
    channelid: channelid,
    botuserid, botuserid,
    botusername, botusername,
    userid, userid,
  });
}

function addUser(context, email, displayName, token, botid, botname, serviceurl, conversationid, channelid, botuserid, botusername){
  let userid;

  return User
      .findOrCreate({ where: { email: email }, defaults: { name: displayName, token: token } })
      .spread((user, created) => {
          userid = user.get('id');
          username = user.get('name');
          if (!created) {
            return [200, username];
          } 

          return addBotUser(context, botid, botname, serviceurl, conversationid, channelid, botuserid, botusername, userid)
            .then(() => {
              return addDevice(context, userid)})
            .then(deviceId => {
              return [201, deviceId];
            });
    });
}

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    context.log(req.body);

    if (!req.body) {
        context.res = {
            status: 400,
            body: "Expected request body" 
        };
        context.log(context.res.status);
        context.done();
        return;
    }

    var email = req.body.email;
    var displayName = req.body.displayName;
    var botuserid = req.body.botUserId;
    var botusername = req.body.botUserName;
    var botid = req.body.botId;
    var botname = req.body.botName;
    var conversationid = req.body.conversationId;
    var channelid = req.body.channelId;
    var serviceurl = req.body.serviceUrl;
    var token = req.body.token;

    context.log("email: " + email);
    context.log("displayName: " + displayName);
    context.log("botuserid: " + botuserid);
    context.log("botusername: " + botusername);
    context.log("botid: " + botid);
    context.log("botname: " + botname);
    context.log("conversationId: " + conversationid);
    context.log("channelId: " + channelid);
    context.log("serviceurl: " + serviceurl);
    //context.log(token);

    if (!email || !displayName || !botuserid || !botusername || !botid || !botname || !conversationid || !channelid || !serviceurl || !token) {
        context.res = {
            status: 400,
            body: "missing params"
        };
        context.log(context.res.status);
        context.done();
        return;
    }

    addUser(context, email, displayName, token, botid, botname, serviceurl, conversationid, channelid, botuserid, botusername)
        .then(result => {
            console.log(result);
            context.res = {
                status: result[0],
                body: result[1] 
            };
            context.log(context.res.status);
            context.done();
        })
        .catch(error => {
            context.res = {
                status: 500,
                body: error
            };
            context.log(context.res.status);
            context.log(error);
            context.done();
        });
};