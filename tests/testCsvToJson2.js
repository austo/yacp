var path = require('path'),
  filename = process.argv[2],
  convertCsv = require('./csvUtil'),
  ditchRe = /ditch/i;

function logResults(err, results) {
  results.forEach(function (elem) {
    if (!ditchRe.test(elem.status)) {
      console.log(elem.tid);
    }
  });
}

var fname = path.basename(__dirname) === path.dirname(filename) ?
  fname = path.join(path.dirname(__dirname), filename) : path.resolve(__dirname,
    filename);

convertCsv(fname, logResults);