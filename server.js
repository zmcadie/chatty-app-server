const express = require('express');
const SocketServer = require('ws').Server;
const uuidv4 = require('uuid/v4');

const PORT = 3001;
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Server listening on ${ PORT }`));

const colours = ["#FF4136", "#0074D9", "#3D9970", "#B10DC9"];

const wss = new SocketServer({ server });

const buildMessage = (message, ws) => {
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
  ws.username = message.username;
  message.colour = {color: ws.colour};
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
const assignColour = (ws) => {
  const num = Math.floor(Math.random() * colours.length);
  ws.colour = colours[num];
}

wss.on('connection', (ws) => {
  console.log('Client connected');
  assignColour(ws);
  ws.onmessage = (event) => {
    const message = (buildMessage(event.data, ws));
    broadcast(ws, wss.clients, message);
  };
  ws.on("close", () => {
    console.log('Client disconnected');
    const message = {id: uuidv4(), type: "incomingSystemMessage", userNumber: wss.clients.size, content: `${ws.username} has left the chat`}
    broadcast(ws, wss.clients, JSON.stringify(message))
  });
});