const net = require('net');

const bindHost = '127.0.0.1';
const bindPort = 1337;
const bufferSize = 1024 * 1024;
const buffer = Buffer.alloc(bufferSize);

let nextClientId = 0;

for (let i = 0; i < bufferSize; i++) {
  buffer.write('0', i, 1);
}

function connectionHandler(socket) {
  clientId = ++nextClientId;

  console.log(`New connection, client ${clientId}`);
  sendMore(socket, clientId);
}

function sendMore(socket, clientId) {
  if (!socket.destroyed) {
    try {
        socket.write(buffer, undefined, () => sendMore(socket, clientId));
    } catch (error) {
      console.error(`Not sending any more to client ${clientId} after write error:`, error);
    }
  } else {
    console.log(`Connection closed for client ${clientId}`);
  }
}

const server = net.createServer();
server.listen(bindPort, bindHost, () => {
  console.log(`Listening on port ${bindPort}`);
});

server.on('connection', connectionHandler);

function shutdown() {
  server.close(error => {
    if (error) {
      console.error(error);
    } else {
      console.log("Server halted.");
    }

    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

