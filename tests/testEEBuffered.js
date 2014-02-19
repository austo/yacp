var path = require('path'),
  filename = process.argv[2],
  Parser = require('../').Parser;

var chunkCount = 0,
  total = 0;

function logResults(err, results, done) {
  console.log('chunk: %d', ++chunkCount);
  if (err) {
    return console.error(err);
  }
  var chunkLength = results.length;
  total += chunkLength;
  console.log('chunk length: %d', chunkLength);
  if (done) {
    console.log('total length: %d', total);
  }
}

var fname = path.basename(__dirname) === path.dirname(filename) ?
  path.join(path.dirname(__dirname), filename) : path.join(__dirname,
    filename);

var options = {
  fieldnames: ['image_id', 'large_image_id', 'upc', 'name'],
  buffer: true
};

var parser = new Parser();
parser.parseFromPath(fname, options, logResults);

parser.on('close', function () {
  console.log('parser has closed');
});