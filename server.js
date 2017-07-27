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
    case "initialConnect" || "conectionClose":
      message.type = "incomingSystemMessage";
      message.userNumber = wss.clients.size;
      break;
  }
  message.id = uuidv4();
  message = JSON.stringify(message);
  return message;
}
const broadcast = (ws, clients, message) => {
  clients.forEach((client) => {
    if (client.readyState === ws.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  let username;
  console.log('Client connected');
  ws.onmessage = (event) => {
    const message = (buildMessage(event.data));
    username = JSON.parse(event.data).username;
    broadcast(ws, wss.clients, message);
  };
  ws.on("close", () => {
    console.log('Client disconnected');
    const message = {id: uuidv4(), type: "incomingSystemMessage", userNumber: wss.clients.size, content: `${username} has left the chat`}
    broadcast(ws, wss.clients, JSON.stringify(message))
  });
});