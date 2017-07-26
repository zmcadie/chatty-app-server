const express = require('express');
const SocketServer = require('ws').Server;
const uuidv4 = require('uuid/v4');

const PORT = 3001;
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Server listening on ${ PORT }`));

const wss = new SocketServer({ server });

const buildMessage = (message) => {
  message = json.parse(message);
  message.id = uuidv4();
  message = json.stringify(message);
  return message;
}

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.onmessage = (event) => {
    const message = (buildMessage(event.data))

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    })
  };
  ws.on('close', () => console.log('Client disconnected'));
});