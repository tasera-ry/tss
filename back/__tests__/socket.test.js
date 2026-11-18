const http = require('http');
const { io: Client } = require('socket.io-client');
const { attachSocketIo } = require('../socket');

describe('socket.io relay', () => {
  let httpServer;
  let io;
  let url;
  let clients;

  beforeAll((done) => {
    httpServer = http.createServer();
    io = attachSocketIo(httpServer);
    httpServer.listen(() => {
      url = `http://localhost:${httpServer.address().port}`;
      done();
    });
  });

  afterAll((done) => {
    io.close();
    httpServer.close(done);
  });

  afterEach(() => {
    clients.forEach((client) => client.disconnect());
  });

  beforeEach(() => {
    clients = [];
  });

  // connects a sender and a receiver and resolves once both are connected
  async function expectBroadcast(eventName, payload) {
    const sender = Client(url);
    const receiver = Client(url);
    clients.push(sender, receiver);
    await Promise.all([
      new Promise((resolve) => sender.on('connect', resolve)),
      new Promise((resolve) => receiver.on('connect', resolve)),
    ]);

    const received = new Promise((resolve) => receiver.on(eventName, resolve));
    let senderGotIt = false;
    sender.on(eventName, () => {
      senderGotIt = true;
    });

    sender.emit(eventName, payload);
    expect(await received).toEqual(payload);

    // give a possible echo a moment to arrive before asserting it never did
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(senderGotIt).toBe(false);
  }

  test('rangeUpdate is relayed to other clients only', async () => {
    await expectBroadcast('rangeUpdate', { status: 'present' });
  });

  test('trackUpdate is relayed to other clients only', async () => {
    await expectBroadcast('trackUpdate', { track_id: 1 });
  });

  test('refresh is relayed to other clients only', async () => {
    await expectBroadcast('refresh');
  });
});
