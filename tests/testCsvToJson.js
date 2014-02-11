var path = require('path'),
  filename = process.argv[2],
  convertCsv = require('../csvUtil');

function logResults(err, results) {
  console.log(err ? err : results);
}

var fname = path.basename(__dirname) === path.dirname(filename) ?
  fname = path.join(path.dirname(__dirname), filename) : path.resolve(__dirname,
    filename);

console.log(fname);
convertCsv(fname, logResults);