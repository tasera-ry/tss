/**** Express imports ****/
const app = require('./app.js')();
const os = require('os');

require('dotenv').config();
const port = process.env.ALT_PORT || process.env.PORT || 8000; //azure gives port as an environment variable

const server = app.listen(port, () => {
  console.error('Server on ' + port);
});

const io = require('socket.io').listen(server, {
  serveClient: false
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

if(process.env.NODE_ENV === 'stable' && os.hostname() === 'tasera.netum.fi') {
  if(process.getgid() === 0 || process.getuid() === 0) {
    try {
      process.setgid('nodejs');
      process.setuid('nodejs');
    }
    catch(e) {
      console.error('Couldn\'t drop privileges');
      process.exit(1);
    }
  }
}
