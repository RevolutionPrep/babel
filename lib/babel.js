var http       = require('http')
  , sys        = require('sys')
  , url        = require('url')
  , io         = require('socket.io')
  , nodeStatic = require('node-static');

function Babel(options) {
  if(! (this instanceof arguments.callee)) { // forces the use of new
    return new arguments.callee(arguments);
  }
  var self = this;
  self.settings = {
    port: options.port || 8000
  }
  self.init();
};

Babel.prototype.init = function() {
  var self = this;
  self.httpServer = self.createHttpServer();
  self.httpServer.listen(self.settings.port);
  self.socket = io.listen(self.httpServer);
  self.attachSocketListeners();
  sys.log('Server started at http://localhost:' + self.settings.port);
};

Babel.prototype.createHttpServer = function() {
  var server = http.createServer(function(request, response) {
    var file = new nodeStatic.Server('./public', {
      cache: false
    });
    var location = url.parse(request.url, true);
    if (location.pathname == '/') {
      response.writeHead(200, { 'Content-Type': 'text/plain' });
      response.write('OK');
      response.end();
    } else {
      file.serve(request, response);
    }
  });
  return server;
};

Babel.prototype.attachSocketListeners = function() {
  var self = this;
  self.socket.addListener('connection', function(client){

    client.addListener('message', function(message){
      self.socket.broadcast(message);
    });

    client.addListener('disconnect', function(){
      
    });
  });
};

module.exports = Babel;