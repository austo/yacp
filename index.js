'use strict';

var fs = require('fs'),
  readline = require('readline'),
  Stream = require('stream'),
  EventEmitter = require('events').EventEmitter,
  util = require('util'),
  assert = require('assert'),
  slice = Array.prototype.slice,
  trailingChars = /[^\w\d]*$/,
  newLine = /[\n\r\s]*$/,
  eol = /\n|\r\n|\r/, // support win/legacy mac/unix line endings
  versionRe = /^v(\d+)\.(\d+)/,
  lineBufSize = 50000; // default lines to read at once in buffered mode

function Parser() {
  if (!(this instanceof Parser)) {
    return new Parser();
  }
  EventEmitter.call(this);
}

util.inherits(Parser, EventEmitter);

Parser.prototype.parseFromPath = function (filename, options, cb) {
  assert(typeof filename === 'string');

  var self = this;

  var fieldNames = [],
    nFields = 0,
    buffered = false,
    lbufsz = 0,
    debug = false;

  function initOptions(opts) {
    if (opts.fieldnames) {
      fieldNames = opts.fieldnames;
    }
    if (opts.buffer === true) {
      buffered = true;
      if ((opts.bufSize >>> 0) > 0) {
        lbufsz = +opts.bufSize;
      }
      else {
        lbufsz = lineBufSize;
      }
    }
    if (opts.debug === true) {
      debug = true;
    }
  }

  if (typeof options === 'function') {
    cb = options; // no options
  }
  else if (typeof options === 'object') {
    initOptions(options);
  }

  function addRow(firstPass, callback) {
    var retval = [];
    return function (row, index, arr) {
      if (index === 0 && firstPass) {
        return getFieldNames(row);
      }

      var fields = row.split(','),
        rowObj = {},
        add = false;

      for (var i = 0; i < nFields; ++i) {
        if (fields[i]) {
          add = true;
          rowObj[fieldNames[i]] = fields[i];
        }
      }

      if (add) {
        retval.push(rowObj);
      }

      if (index === arr.length - 1) {
        callback(null, retval);
      }
    };
  }

  // Non-buffered mode
  // TODO: pass error to callback

  function readFile(fpath, callback) {
    fs.open(fpath, 'r', function (err, fd) {
      fs.fstat(fd, handleStats(fd, callback));
    });
  }

  function handleStats(fd, callback) {
    return function (err, stats) {
      var buf = new Buffer(stats.size);
      fs.read(fd, buf, 0, stats.size, 0, callback);
    };
  }

  function parse(err, bytesRead, buffer) {
    if (err) {
      console.log(err);
    }
    else {
      var rawText = buffer.toString('utf8'),
        trimmedText = rawText.replace(newLine, ''),
        rowText = trimmedText.split(eol);
      rowText.forEach(addRow(true, function () {
        var args = slice.call(arguments);
        args.push(true); // done
        self.emit('close');
        cb.apply(null, args);
      }));
    }
  }

  function getFieldNames(firstRow) {
    if (fieldNames.length > 0) {
      nFields = fieldNames.length;
      return;
    }
    var cleanRow = firstRow.replace(trailingChars, ''),
      rawFields = cleanRow.split(',');
    nFields = rawFields.length;
    rawFields.forEach(function (elem) {
      fieldNames.push(elem.trim().toLowerCase());
    });
  }

  // Buffered mode

  function readBufferedFile(fpath) {
    var rs = fs.createReadStream(fpath),
      os = new Stream(),
      count = 0,
      chunkCount = 0,
      lines = [],
      firstPass = true;

    var rl = readline.createInterface({
      input: rs,
      output: os
    });

    function handleLine(line) {
      ++count;
      lines.push(line);
      if (count % lbufsz === 0) {
        rl.pause();
        if (chunkCount++ > 0) {
          firstPass = false;
        }
        lines.forEach(addRow(firstPass, function () {
          var args = slice.call(arguments);
          cb.apply(null, args);
          lines = [];
          rl.resume();
        }));
      }
    }

    rl.on('line', handleLine);

    rl.on('close', function () {
      // issue fixed in v.0.11+
      var vMatches = process.version.match(versionRe);
      if ((Number(vMatches[1]) === 0) && (Number(vMatches[2]) <= 10)) {
        lines.push(rl._line_buffer);
      }
      lines.forEach(addRow(firstPass, function () {
        var args = slice.call(arguments);
        args.push(true); // done
        self.emit('close');
        if (debug) {
          console.log('total lines processed (including first line): %d',
            count);
        }
        cb.apply(null, args);
      }));
    });
  }

  return buffered ? readBufferedFile(filename) : readFile(filename, parse);
};

exports.Parser = Parser;