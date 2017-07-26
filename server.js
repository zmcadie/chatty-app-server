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
  message = JSON.parse(message);
  switch (message.type) {
    case "postSystemMessage":
      message.type = "incomingSystemMessage";
      break;
    case "postMessage":
      message.type = "incomingMessage";
      break;
  }
  message.id = uuidv4();
  message = JSON.stringify(message);
  return message;
}
const sendClients = (clients) => {
  message =  {
    type: clientUpdate
  }
}

wss.on('connection', (ws) => {
  console.log('Client connected');
  wss.clients.forEach((client) => {
    if (client.readyState === ws.OPEN) {
      client.send(JSON.stringify({ type: "incomingUserNumber", userNumber: wss.clients.size }));
    }
  })
  ws.onmessage = (event) => {
    const message = (buildMessage(event.data));
    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(message);
      }
    })
  };
  ws.on('close', () => console.log('Client disconnected'));
});