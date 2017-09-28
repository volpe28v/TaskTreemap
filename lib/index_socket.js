var tasktreemap_db = require("./tasktreemap_db");

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
      console.log(data);
      tasktreemap_db.save(data)
        .then(function(result){
          client.broadcast.emit('id_' + data.id, data);
        });
    });
  });
}

