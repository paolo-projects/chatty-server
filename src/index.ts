import express from 'express';
import http from 'http';
import socketIo from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = socketIo.listen(server);

const PORT = process.env.PORT || 4575;

io.use((socket, next) => {
  // Check for name in the connection query
  const name = socket.handshake.query.author;
  if (name && name.length > 1) {
    return next();
  }
  return next(new Error('Bad name provided'));
});

io.on('connection', (socket) => {
  // On message
  socket.on('chat_message', (msg: string) => {
    if (msg.length > 0) {
      try {
        // Emit the message to the connected clients
        io.emit(
          'chat_message',
          JSON.stringify({
            message: msg.slice(0, 2000), // max 2k characters
            author: socket.handshake.query.author,
          })
        );
      } catch (err) {
        console.error('Error occurred sending message', err);
      }
    }
  });

  // On disconnection
  socket.on('disconnect', () => {
    //
  });
});

server.listen(PORT, () => {
  console.log('Server listening on port', PORT);
});
