require.paths.unshift(__dirname + "/vendor");

process.addListener('uncaughtException', function(err, stack) {
  console.log('--------------------------------------------');
  console.log('Exception: ' + err);
  console.log(err.stack);
  console.log('--------------------------------------------');
});

var Babel = require('./lib/babel');

new Babel({
  port: 8000
});