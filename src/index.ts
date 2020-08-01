import express from 'express';
import http from 'http';
import socketIo from 'socket.io';
import ClientManager from './clients/ClientManager';

/**
 * Rate at which connected clients will be notified about other clients in the room
 */
const CONNECTED_CLIENTS_NOTIFY_RATE =
  Number(process.env.CLIENTS_NOTIFY_RATE) || 5000; // ms
/**
 * Maximum number of simultaneously connected clients
 */
const CONNECTED_CLIENTS_LIMIT = Number(process.env.CLIENTS_LIMIT) || 50;

const app = express();
const server = http.createServer(app);
const io = socketIo.listen(server);

const PORT = process.env.PORT || 4575;

const clientManager = new ClientManager();

// Check if connected clients are too many
io.use((socket, next) => {
  if (clientManager.count() + 1 > CONNECTED_CLIENTS_LIMIT) {
    return next(new Error('cant_accept'));
  }
  return next();
});

io.use((socket, next) => {
  // Check for name in the connection query
  const name = socket.handshake.query.author;
  if (name && name.length > 1) {
    return next();
  }
  return next(new Error('no_name'));
});

io.use((socket, next) => {
  // Drop connection if the name is already taken
  const messageAuthor = socket.handshake.query.author;

  if (clientManager.hasName(messageAuthor)) {
    return next(new Error('name_taken'));
  }
  return next();
});

io.on('connection', (socket) => {
  const messageAuthor = socket.handshake.query.author;

  // Add client to connection pool
  const clientHash = clientManager.add({
    name: messageAuthor,
    ip: socket.client.conn.remoteAddress,
  });

  // On message
  socket.on('chat_message', (msg: string) => {
    if (msg.length > 0) {
      try {
        // Emit the message to the connected clients
        io.emit(
          'chat_message',
          JSON.stringify({
            message: msg.slice(0, 2000), // max 2k characters
            author: messageAuthor,
          })
        );
      } catch (err) {
        console.error('Error occurred sending message', err);
      }
    }
  });

  // On disconnection
  socket.on('disconnect', () => {
    // Remove client from connection pool
    clientManager.remove(clientHash);
  });
});

async function connectedClientsNotify() {
  io.emit('connected_clients', JSON.stringify(clientManager.getClients()));
  setTimeout(() => connectedClientsNotify(), CONNECTED_CLIENTS_NOTIFY_RATE);
}

server.listen(PORT, () => {
  console.log('Server listening on port', PORT);

  // Notify clients about other clients at a fixed rate
  connectedClientsNotify();
});
