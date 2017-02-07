const net = require('net');
const numeral = require('numeral');
const durations = require('durations');
const prettyBytes = require('pretty-bytes');

const host = '127.0.0.1';
const port = 1337;

const watch = durations.stopwatch();
const lastReport = durations.stopwatch().start();
let bytes = 0;

client = new net.Socket();

client.connect(port, host, function() {
  console.log(`Connected to server ${host}:${port}`);
  watch.start();
});

client.on('data', data => {
  bytes += data.length;

  if (lastReport.duration().millis() >= 1000) {
    report();
    lastReport.reset().start();
  }
});

client.on('close', () => {
  console.log(`Connection closed.`);
  shutdown();
  process.exit(0);
});


function report() {
  let bps = prettyBytes(bytes / watch.duration().seconds());
  let bytesPretty = numeral(bytes).format('0,0');
  let bytesHuman = prettyBytes(bytes);
  console.log(`${bytesPretty} bytes (${bytesHuman}) written in ${watch} : ${bps}/s`);
}

function shutdown() {
  client.end();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

