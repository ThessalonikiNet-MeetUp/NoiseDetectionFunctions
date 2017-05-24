const db = require('../SendNotificationQueueTrigger/db');
const User = db.User;
const Device = db.Device;

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
    var userid = req.body.userId;
    var username = req.body.userName;
    var botid = req.body.botId;
    var botname = req.body.botName;
    var conversationid = req.body.conversationId;
    var channelid = req.body.channelId;
    var serviceurl = req.body.serviceUrl;
    var token = req.body.token;

    context.log(email);
    context.log(userid);
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

    User.create({
        email: email,
        userid: userid,
        username: username,
        botid: botid,
        botname: botname,
        serviceurl: serviceurl,
        token: token,
        conversationid: conversationid,
        channelid: channelid,
    }).then(result => {
        context.res = {
            status: 200,
            body: result.get('id')
        };
        context.done();
    }).catch(error => {
        context.res = {
            status: 500,
            body: error
        };
        context.log(error);
    });
};