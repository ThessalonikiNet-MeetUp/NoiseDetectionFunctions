"use strict"

const rp = require('request-promise')
const Swagger = require('swagger-client');
const WebSocket = require('ws')

const SWAGGER_SPEC_URL = 'https://docs.botframework.com/en-us/restapi/directline3/swagger.json'

class DirectLine {
  constructor(directLineSecret) {
    this._directLineClient = rp(SWAGGER_SPEC_URL)
      .then(spec => {
        return new Swagger({
          spec: JSON.parse(spec.trim()),
          usePromise: true,
          authorizations : {
            AuthorizationBotConnector: new Swagger.ApiKeyAuthorization('Authorization', `Bearer ${directLineSecret}`, 'header'),
          }
      })})
      .catch(err => {
        console.error('Error initializing DirectLine client', err);
      })
  }

  startConversation (onMessage) {
    if (this._conversationId) {
      return;
    }

    this._directLineClient.then(client => {
      client.Conversations.Conversations_StartConversation()
        .then(response => {

          if (response.status !== 200 && response.status !== 201) {
            reject(new Error(`${response.statusCode}: ${response.body}`));
          }
          
          return response.obj
        })
        .then(response => {
          this._conversationId = response.conversationId;
          this._expiresIn = new Date(new Date().getTime() + response.expires_in * 1000);
          this._token = response.token;
          this._streamUrl = response.streamUrl;
          this._ws = new WebSocket(this._streamUrl)

          this._ws.on('message', obj => {
            console.log(`ws message: ${obj}`)
            if (obj) {
              const msg = JSON.parse(obj)
              const activity = msg.activities[0]
              onMessage(activity).catch(err => console.error(err))
            }
          })

        })
        .catch(err => { 
          console.error("Error starting conversation ", err)
          throw err;
        })
    })
  }

  postActivity (activity) {
    if (!this._conversationId) {
      throw new Error('Conversation not yet initialized');
    }

    return this._directLineClient
      .then(client => {
        client.Conversations.Conversations_PostActivity({
          conversationId: this._conversationId,
          activity: activity
      })
      .then(response => {
        if (response.status !== 200 && response.status !== 201) {
          reject(new Error(`${response.statusCode}: ${response.body}`));
        }
      })
      .catch(err => { 
        console.error("Error posting activity", err)
        throw err;
      })
    })
  }
}

module.exports = DirectLine;
