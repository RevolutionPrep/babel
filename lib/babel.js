var http       = require('http')
, sys        = require('sys')
, url        = require('url')
, fs         = require('fs')
, io         = require('socket.io');

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
  self.httpServer.listen(self.settings.port, {
    transportOptions: {
      'xhr-polling': {
        closeTimeout: 1000 * 60 * 5
      }
    }
  });
  self.socket = io.listen(self.httpServer);
  self.attachSocketListeners();
  sys.log('Server started at http://localhost:' + self.settings.port);
};

Babel.prototype.createHttpServer = function() {
  var self = this
    , server = http.createServer(function(request, response){
    var path = url.parse(request.url).pathname;
    switch (path){
      case '/index.html':
      fs.readFile(__dirname + '/../examples/client' + path, function(err, data){
        if (err) return self.send404(response);
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data, 'utf8');
        response.end();
      });
      break;
      
      case '/jquery-1.4.3.min.js':
        fs.readFile(__dirname + '/../examples/client' + path, function(err, data) {
          if (err) return self.send404(response);
          response.writeHead(200, {'Content-Type': 'text/javascript'});
          response.write(data, 'utf8');
          response.end();
        });
        break;

      case '/babel.js':
      fs.readFile(__dirname + '/../public' + path, function(err, data){
        if (err) return self.send404(response);
        response.writeHead(200, {'Content-Type': 'text/javascript'});
        response.write(data, 'utf8');
        response.end();
      });
      break;

      default: self.send404(response);
    }
  })
  return server;
};

Babel.prototype.send404 = function(response) {
  response.writeHead(404);
  response.end('404');
}

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