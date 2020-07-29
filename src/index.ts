import express from 'express';
import http from 'http';
import socketIo from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = socketIo.listen(server);

const PORT = process.env.PORT || 4575;

io.on('connection', (socket) => {
  socket.on('chat_message', (msg: string) => {
    if (msg.length > 0) {
      // Emit the message to the connected clients
      io.emit('chat_message', msg.slice(0, 2000)); // max 2k characters
    }
  });
});

server.listen(PORT, () => {
  console.log('Server listening on port', PORT);
});
