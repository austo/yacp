'use strict';

var fs = require('fs'),
  assert = require('assert'),
  trailingChars = /[^\w\d]*$/,
  newLine = /[\n\r\s]*$/,
  eol = /\n|\r\n|\r/; // support win/legacy mac/unix line endings

exports.parseFromPath = function (filename, options, cb) {
  assert(typeof filename === 'string');

  var retval = [],
    fieldNames = [],
    nFields = 0;

  if (typeof options === 'function') {
    cb = options;
  }
  else if (typeof options === 'object') {
    if (options.fieldnames) {
      fieldNames = options.fieldnames;
    }
  }

  function addRow(row, index, arr) {
    if (index === 0) {
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
      cb(null, retval);
    }
  }

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
      rowText.forEach(addRow);
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

  readFile(filename, parse);
};