const net = require('net');

const bindHost = '127.0.0.1';
const bindPort = 1337;
const bufferSize = 1024 * 1024;
const buffer = Buffer.alloc(bufferSize);

for (let i = 0; i < bufferSize; i++) {
  buffer.write('0', i, 1);
}

function connectionHandler(socket) {
  console.log("New client connection");
  sendMore(socket);
}

function sendMore(socket) {
  try {
    socket.write(buffer, undefined, () => sendMore(socket));
  } catch (error) {
    console.error("Not sending any more after write error:", error);
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
    }

    report();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

