
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  socket = require('./routes/socket.js');

var app = module.exports = express(),
  http = require('http'),
  server = http.createServer(app),
  io = require('socket.io').listen(server);

// Configuration
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);

// JSON API
app.get('/api/ldap', api.ldapLoad);
app.get('/data.json', api.data);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Socket.io communication
io.sockets.on('connection', socket);

// Start server
server.listen(3002, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
