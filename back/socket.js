const { Server } = require('socket.io');

// attaches the socket.io relay to an http server:
// messages from one client are broadcast to all the others
function attachSocketIo(httpServer) {
  const io = new Server(httpServer, {
    serveClient: false,
  });

  io.on('connection', (socket) => {
    socket.on('rangeUpdate', (status) => {
      socket.broadcast.emit('rangeUpdate', status);
    });
    socket.on('trackUpdate', (msg) => {
      socket.broadcast.emit('trackUpdate', msg);
    });
    socket.on('refresh', () => {
      socket.broadcast.emit('refresh');
    });
  });

  return io;
}

module.exports = { attachSocketIo };
