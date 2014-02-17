var fs = require('fs'),
  path = require('path'),
  readline = require('readline'),
  Stream = require('stream'),
  fname = process.argv[2];

var filename = path.join(__dirname, fname),
  count = 0,
  maxlen = 50000,
  chunkCount = 0;

var rs = fs.createReadStream(filename),
  os = new Stream();

var rl = readline.createInterface({
  input: rs,
  output: os
});

rl.on('line', function (line) {
  // console.log(line);
  ++count;
  if (count % maxlen === 0) {
    rl.pause();
    ++chunkCount;
    console.log(chunkCount);
    setTimeout(function () {
      // count = 0;
      rl.resume();
    }, 1000);
  }
});

rl.on('close', function () {
  console.log('final count: %s', count);
});