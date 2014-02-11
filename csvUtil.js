var fs = require('fs'),
  trailingChars = /[^\w\d]*$/,
  newLine = /[\n\r\s]*$/;

module.exports = function (filename, cb) {
  var retval = [],
    fieldNames = [],
    nFields = 0;

  function addRow(row, index, arr) {
    if (index === 0) { // set field names and redefine function
      return getFieldNames(row);
    }

    var fields = row.split(','),
      rowObj = {};

    for (var i = 0; i < nFields; ++i) {
      if (fields[i]) {
        rowObj[fieldNames[i]] = fields[i];
      }
    }

    retval.push(rowObj);

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
        rowText = trimmedText.split('\n');
      rowText.forEach(addRow);
    }
  }

  function getFieldNames(firstRow) {
    var cleanRow = firstRow.replace(trailingChars, ''),
      rawFields = cleanRow.split(',');
    nFields = rawFields.length;
    rawFields.forEach(function (elem) {
      fieldNames.push(elem.trim().toLowerCase());
    });
  }

  readFile(filename, parse);
};