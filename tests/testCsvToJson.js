var path = require('path'),
  filename = process.argv[2],
  yacp = require('../');

function logResults(err, results) {
  console.log(err ? err : results.length);
}

var fname = path.basename(__dirname) === path.dirname(filename) ?
  path.join(path.dirname(__dirname), filename) : path.join(__dirname,
    filename);

console.log(fname);
var parser = new yacp.Parser();
parser.parseFromPath(fname, logResults);
