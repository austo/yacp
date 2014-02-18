var path = require('path'),
  filename = process.argv[2],
  Parser = require('../').Parser;

function logResults(err, results) {
  console.log(err ? err : results);
}

var fname = path.basename(__dirname) === path.dirname(filename) ?
  path.join(path.dirname(__dirname), filename) : path.join(__dirname,
    filename);

var options = {
  fieldnames: ['image_id', 'large_image_id', 'upc', 'name']
};

var parser = new Parser();
parser.parseFromPath(fname, options, logResults);

parser.on('close', function () {
  console.log('parser has closed');
});