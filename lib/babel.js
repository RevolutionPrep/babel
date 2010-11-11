var http = require('http')
, sys    = require('sys')
, util   = require('util')
, url    = require('url')
, fs     = require('fs')
, io     = require('socket.io');

function Babel(options) {
  if(! (this instanceof arguments.callee)) { // forces the use of new
    return new arguments.callee(arguments);
  }
  var self = this;
  self.settings = {
    port:     options.port || 8000
  , channels: {}
  , clients:  []
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
      self.handleMessage(client, message);
    });

    client.addListener('disconnect', function(){
      
    });
  });
};

Babel.prototype.handleMessage = function(client, data) {
  var self = this;
  if (data instanceof Object) {
    if (data.subscription === true && 'channels' in data) {
      sys.log("Subscription request received!");
      var i = data.channels.length;
      while(i--) {
        if (!self.settings.channels.hasOwnProperty(data.channels[i])) {
          sys.log('Channel ' + data.channels[i] + ' does not exist. Creating...');
          self.settings.channels[data.channels[i]] = { clients: [] };
          sys.log('Channel ' + data.channels[i] + ' created.');
        }
        sys.log('Subscribing client to channel ' + data.channels[i]);
        if(self.settings.channels[data.channels[i]].clients.indexOf(client) === -1) { self.settings.channels[data.channels[i]].clients.push(client); }
        client.send({
          subscription: true
        , channels: [data.channels[i]]
        });
        sys.log(util.inspect(self.settings.channels[data.channels[i]]));
      }
    }
    if (data.message === true && 'payload' in data) {
      if ('channels' in data) {
        var i = data.channels.length, j, clients;
        while(i--) {
          clients = self.settings.channels[data.channels[i]].clients;
          j = clients.length;
          while(j--) {
            clients[j].send({
              message: true,
              payload: data.payload
            });
          }
        }
      } else {
        
      }
    }
  }
};

module.exports = Babel;