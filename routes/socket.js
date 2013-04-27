// export function for listening to the socket.
var fs = require('fs');

module.exports = function (socket) {

  var file = fs.readFileSync(__dirname + '/data.json', 'utf8');
  var data = JSON.parse(file);
  var nicks = data.nicks;

  // send the nicks
  socket.emit('init', {
    nicks: nicks
  });

  // notify other clients
  socket.broadcast.emit('data:update', {
    nicks: nicks
  });

  // broadcast when update is requested
  socket.on('data:update', function (data) {
    console.log('data:update socket');
    socket.broadcast.emit('data:update', {
      nicks: nicks
    });
  });

};