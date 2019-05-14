const MongoClient = require('mongodb').MongoClient;

module.exports.ready = function(db_name){
  return new Promise(function(resolve,reject){
    if ( process.env.MONGODB_URI){
      MongoClient.connect(process.env.MONGODB_URI, {useNewUrlParser: true}, function(error, client){
        console.log("mongodb connected to " + process.env.MONGODB_URI);
        resolve(client.db());
      });
    }else{
      MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser: true}, function(err, client) {
        console.log("mongodb connected to localhost");
        resolve(client.db(db_name));
      });
    }
  });
};

