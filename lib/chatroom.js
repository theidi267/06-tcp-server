'use strict';

const EventEmitter = require('events');
const net = require('net');

const uuid = require('uuid/v4');

const port = process.env.PORT || 3000;
const server = net.createServer();
const events = new EventEmitter();
const socketPool = {};

let User = function(socket) {
  let id = uuid();
  this.id = id;
  this.nickname = `User-${id}`;
  this.socket = socket;
};

server.on('connection', (socket) => {
  let user = new User(socket);
  socketPool[user.id] = user;
  socket.on('data', (buffer) => dispatchAction(user.id, buffer));
});

let parse = (buffer) => {
  let text = buffer.toString().trim();
  if ( !text.startsWith('@') ) { return null; }
  let [command,payload] = text.split(/\s+(.*)/);
  let [target,message] = payload.split(/\s+(.*)/);
  return {command,payload,target,message};
};

let dispatchAction = (userId, buffer) => {
  let entry = parse(buffer);
  entry && events.emit(entry.command, entry, userId);
};

events.on('@all', (data, userId) => {
  for( let connection in socketPool ) {
    let user = socketPool[connection];
    user.socket.write(`<${socketPool[userId].nickname}>: ${data.payload}\n`);
  }
});

events.on('@nick', (data, userId) => {
  socketPool[userId].nickname = data.target;
});

events.on('@dm', (data, userId) => {
  for(let connection in socketPool){
    let user = socketPool[target];
    user.socket.write(`<${socketPool[userId].nickname}>: ${data.payload}\n`)
  }
});

events.on('@quit', (data, userId) => {  
  //i need to get the user removed from socketPool
  user.socket.destroy([`${socketPool[userId].nickname}, has left`]);  
});

events.on('@list', (data, userId) =>{

});

server.listen(port, () => {
  console.log(`Chat Server up on ${port}`);
});