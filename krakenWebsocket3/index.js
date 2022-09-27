const express = require('express')
const app = express()
const server = require('http').createServer(app)
const WebSocket = require('ws')
const wss = new WebSocket.server ({server:server});

wss.on('connection', function connection(ws) {
    console.log('A new client has connected')
    ws.send('welcome new client');

    ws.on('message', function message(data) {
      console.log('received: %s', data);
      ws.send('Got your message, its:' + message)
    });
  });

app.get('/',(req, res) =>res.send('hello world'))
server.listen(4200, () => console.log('listenning omn port 4200'))