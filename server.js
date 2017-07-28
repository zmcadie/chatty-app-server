const express = require('express');
const SocketServer = require('ws').Server;
const uuidv4 = require('uuid/v4');

const PORT = 3001;
const server = express()
  // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Server listening on ${ PORT }`));

const wss = new SocketServer({ server });

const buildMessage = (message, ws) => {
  let parsedMessage = JSON.parse(message);
  switch (parsedMessage.type) {
  case "postSystemMessage":
    parsedMessage.type = "incomingSystemMessage";
    break;
  case "postMessage":
    parsedMessage.type = "incomingMessage";
    break;
  case "initialConnect" || "conectionClose":
    parsedMessage.type = "incomingSystemMessage";
    parsedMessage.userNumber = wss.clients.size;
    break;
  case "postImageMessage":
    parsedMessage.imageUrl = parsedMessage.content.match(/https?:\/\/.*\.(png|jpe?g|gif)/);
    parsedMessage.content = parsedMessage.content.replace(/https?:\/\/.*\.(png|jpe?g|gif)/, "");
    parsedMessage.type = "incomingImageMessage";
    break;
  }
  ws.username = parsedMessage.username;
  parsedMessage.id = uuidv4();
  return parsedMessage = JSON.stringify(parsedMessage);
};

const broadcast = (ws, clients, message) => {
  clients.forEach((client) => {
    if (client.readyState === ws.OPEN) {
      client.send(message);
    }
  });
};

wss.on('connection', (ws) => {

  ws.onmessage = (event) => {
    const message = (buildMessage(event.data, ws));
    broadcast(ws, wss.clients, message);
  };

  ws.on("close", () => {
    const message = {id: uuidv4(), type: "incomingSystemMessage", userNumber: wss.clients.size, content: `${ws.username} has left the chat`};
    broadcast(ws, wss.clients, JSON.stringify(message));
  });
});