const app = require('./app.js');
const os = require('os');
const schedule = require('node-schedule');
const knex = require('./knex/knex.js');


require('dotenv').config();
const port = process.env.ALT_PORT || process.env.PORT || 8000; //azure gives port as an environment variable

// this rule defines how often infomessages are checked
const infoMessageRule = new schedule.RecurrenceRule();
infoMessageRule.hour = 0;
infoMessageRule.minute = 0;
//infoMessageRule.second = 0;

// delete old infomessages at midnight
const job = schedule.scheduleJob(infoMessageRule, async() => {

  const today = new Date();
  const infoMessages = await knex('info_messages');
  const idList = [];

  console.log("Messages: ", infoMessages);

  // add ids of messages that have to be deleted to a list
  infoMessages.forEach(message => {
    const endDate = new Date(message.end);
    endDate.setHours(0, 0, 0, 0);

    if(!(endDate > today)){
      idList.push(message.id);
    }
  });

  // delete messages
  const res = await knex('info_messages').whereIn('id', idList).del(['id', 'message']);
  console.log(`Deleted ${res.length} messages: `, res);
});

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
