var mongo = require('mongodb');
var db;
var table_name = 'tasktreemap';

module.exports.set_db = function(current_db){
  db = current_db;
};

module.exports.save = function(data) {
  return new Promise(function(callback){
    db.collection(table_name, function(err, collection) {
      if (data.id){
        collection.findOne({id: data.id},function(err, target_data) {
          if (target_data != null){
            collection.update( {id: target_data.id}, {'$set': {id: data.id, text: data.text}}, {safe: true}, function(){});
            console.log("update " + target_data.id);
          }else{
            collection.save( data, function(){} );
            console.log("save " + data.id);
          }
          callback(data);
        });
      }else{
        collection.save( data, function(){
          callback(data);
        });
      }
    });
  });
};

module.exports.find = function(id){
  return new Promise(function(callback){
    db.collection(table_name, function(err, collection) {
      collection.findOne({id: id}, function(err, data){
        callback(data);
      });
    });
  });
};

module.exports.delete = function(data) {
  return new Promise(function(callback){
    db.collection(table_name, function(err, collection) {
      collection.remove( {id: data.id} ,{safe:true}, function(){
        callback();
      });
    });
  });
};

