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


function addUser(context, email, token, botid, botname, serviceurl, conversationid, channelid, botuserid){
  User.create({
    email: email,
    name: email,
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
    var email = req.body.email;
    var botuserid = req.body.botuserId;
    var username = req.body.userName;
    var botid = req.body.botId;
    var botname = req.body.botName;
    var conversationid = req.body.conversationId;
    var channelid = req.body.channelId;
    var serviceurl = req.body.serviceUrl;
    var token = req.body.token;

    context.log(email);
    context.log(botuserid);
    context.log(username);
    context.log(botid);
    context.log(botname);
    context.log(conversationid);
    context.log(channelid);
    context.log(serviceurl);
    context.log(token);

    if (!userid || !username || !botid || !botname || !serviceurl) {
        context.res = {
            status: 400,
            body: "ID, Name, BotId, BotName, ServiceUrl, Token are requird on the query string or in the request body"
        };
        context.done();
        return;
    }

    addUser(context, email, token, botid, botname, serviceurl, conversationid, channelid, botuserid);
};