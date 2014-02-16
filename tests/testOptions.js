var path = require('path'),
  filename = process.argv[2],
  yacp = require('../');

function logResults(err, results) {
  console.log(err ? err : results);
}

var fname = path.basename(__dirname) === path.dirname(filename) ?
  path.join(path.dirname(__dirname), filename) : path.join(__dirname,
    filename);

var options = {
  fieldnames: ['image_id', 'large_image_id', 'upc', 'name']
};

yacp.parseFromPath(fname, options, logResults);