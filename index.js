
var express = require('express');
    http = require("http"),
    WebSocket = require("ws");

// // Create an Express server app and serve up a directory of static files.
var app = express();
var server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const path = require('path');
const fs = require('fs');

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/www/index.html');
// });

app.use("/", express.static(__dirname + "/www", {etag: false}));


io.on('connection', (socket) => {

  console.log('a user connected');

  //every 8 sixteenth notes
  socket.on('generate_new', () => {
    socket.emit("generate_new", agent.generate_new())
  });

  //get a hit corresponding to a beat
  //every 16th note
  socket.on('agent_listen', (input) => {
    agent.listen(input)
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

});

var portnum = process.env.PORT || 24125

server.listen(portnum, () => {
  console.log('listening on ' + portnum);
});