'use strict';

var fs = require('fs'),
  readline = require('readline'),
  Stream = require('stream'),
  assert = require('assert'),
  slice = Array.prototype.slice,
  filename = process.argv[2];

if (!filename) {
  console.error('no filename argument specified');
  process.exit(2);
}

var lbufsz = 5000;

function addRow(callback) {
  var retval = [];
  return function (row, index, arr) {
    retval.push(row);
    if (index === arr.length - 1) {
      callback(null, retval);
    }
  };
}

function readBufferedFile(fpath, cb) {
  var rs = fs.createReadStream(fpath),
    os = new Stream(),
    count = 0,
    lines = [];

  var rl = readline.createInterface({
    input: rs,
    output: os
  });

  function handleLine(line) {
    ++count;
    lines.push(line);
    if (count % lbufsz === 0) {
      rl.pause();
      lines.forEach(addRow(function () {
        var args = slice.call(arguments);
        cb.apply(null, args);
        lines = [];
        rl.resume();
      }));
    }
  }

  rl.on('line', handleLine);

  rl.on('close', function () {
    lines.forEach(addRow(function () {
      var args = slice.call(arguments);
      args.push(rl._line_buffer);
      cb.apply(null, args);
    }));
  });
}

function compareLastLineToBuffer(err, lines, lineBuf) {
  if (err) {
    console.error(err);
  }
  var lineCount = lines.length;
  console.log('processed %d lines', lineCount);

  if (lineBuf) {
    var lastLine = lines[lineCount - 1];
    console.log('last line:\n%s\n', lastLine);
    console.log('_line_buffer:\n%s\n', lineBuf);
    assert.equal(lastLine, lineBuf, 'extra line in buffer');
  }
}

readBufferedFile(filename, compareLastLineToBuffer);