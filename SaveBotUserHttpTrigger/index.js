const db = require('../SendNotificationQueueTrigger/db');
const User = db.User;
const Device = db.Device;
const BotInfo = db.BotInfo;

function addDevice(context, userid){
  Device.create({
    name: null,
    userid: userid,
  }).then(deviceResult => {
    context.res = {
        status: 200,
        body: deviceResult.get('id')
    };
    context.done();
  }).catch(error => {
      context.res = {
          status: 500,
          body: error
      };
      context.log(error);
  });
}

function addBotUser(context, botid, botname, serviceurl, conversationid, channelid, botuserid, userid){
  BotInfo.create({
    botid: botid,
    botname: botname,
    serviceurl: serviceurl,
    conversationid: conversationid,
    channelid: channelid,
    botuserid, botuserid,
    userid, userid,
  }).then(botinfoResult => {
      context.res = {
        status: 200
    };
    context.done();
  }).catch(error => {
      context.res = {
          status: 500,
          body: error
      };
      context.log(error);
  });
}


function addUser(context, email, displayName, token, botid, botname, serviceurl, conversationid, channelid, botuserid){
  User.create({
    email: email,
    name: displayName,
    token: token,
  }).then(userResult => {
      addBotUser(context, botid, botname, serviceurl, conversationid, channelid, botuserid, userResult.get('id'));
      addDevice(context, userResult.get('id'));
  }).catch(error => {
      context.res = {
          status: 500,
          body: error
      };
      context.log(error);
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
        context.done();
        return;
    }

    var email = req.body.Email;
    var displayName = req.body.DisplayName;
    var botuserid = req.body.BotUserId;
    var botusername = req.body.BotUserName;
    var botid = req.body.BotId;
    var botname = req.body.BotName;
    var conversationid = req.body.ConversationId;
    var channelid = req.body.ChannelId;
    var serviceurl = req.body.ServiceUrl;
    var token = req.body.Token;

    context.log(email);
    context.log(displayName);
    context.log(botuserid);
    context.log(botusernamee);
    context.log(botid);
    context.log(botname);
    context.log(conversationid);
    context.log(channelid);
    context.log(serviceurl);
    context.log(token);

    if (!email || !displayName || !botuserid || !botusername || !conversationid || !channelid || !serviceurl || !token) {
        context.res = {
            status: 400,
            body: "missing params"
        };
        context.done();
        return;
    }

    addUser(context, email, displayName, token, botid, botname, serviceurl, conversationid, channelid, botuserid);
};