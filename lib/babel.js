var http = require('http')
, sys  = require('sys')
, io   = require('socket.io/lib/socket.io/index');

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
    request.addListener('end', function() {
      response.writeHead(200, { 'Content-Type': 'text/plain' });
      response.end("OK");
    });
  });
  return server;
};

Babel.prototype.attachSocketListeners = function() {
  var self = this;
  self.socket.addListener('connection', function(client){
    client.addListener('message', function(){})
    client.oaddListenern('disconnect', function(){})
  });
};

module.exports = Babel;