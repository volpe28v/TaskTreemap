var tasktreemap_db = require("./tasktreemap_db");
var burndown_db = require("./burndown_db");

module.exports.setup = function(io){
  io.sockets.on('connection', function(client) {
    console.log("New Connection from " + client.client.id);

    client.on('get_data', function(data) {
      tasktreemap_db.find(data.id)
        .then(function(result){
          client.emit("id_" + data.id, result);
        });
    });

    client.on('save_data', function(data) {
      tasktreemap_db.save(data)
        .then(function(result){
          client.broadcast.emit('id_' + data.id, data);
        });
    });

    client.on('get_burn', function(data) {
      burndown_db.find(data.id)
        .then(function(result){
          client.emit("burn_" + data.id, result);
        });
    });

    client.on('save_burn', function(data) {
      burndown_db.save(data)
        .then(function(result){
          client.broadcast.emit('burn_' + data.id, data);
        });
    });
  });
}

