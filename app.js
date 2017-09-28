var express = require('express');
var app = express();
var server = require('http').createServer(app);
var path = require('path');
var bodyParser = require('body-parser');

var io = require('socket.io').listen(server,{ 'destroy buffer size': Infinity });
io.set("log level", 1);

var index_socket = require('./lib/index_socket');
index_socket.setup(io);


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var program = require('commander');
program
  .version('1.0.0')
  .option('-d, --db_name [name]', 'db name. default is "tasktreemap_db".')
  .option('-p, --port <n>', 'port no. default is 3000.')
  .parse(process.argv);

app.set('db_name', program.db_name || 'tasktreemap_db');
app.set('port', program.port || process.env.PORT || 3000);

var mongo_builder = require('./lib/mongo_builder');
var tasktreemap_db = require("./lib/tasktreemap_db");

Promise.all([
  mongo_builder.ready(app.get('db_name'))
])
.then(function(results){
  tasktreemap_db.set_db(results[0]);
  startServer();
});

function startServer(){
  app.post('/getData', function (req, res) {
    console.log("getData");
    console.log(req.body);
    var id = req.body.id;

    tasktreemap_db.find(id)
      .then(function(result){
        console.log(result);
        res.send(result);
      });
  });

  app.post('/saveData', function (req, res) {
    console.log("saveData");
    console.log(req.body);

    tasktreemap_db.save(req.body)
      .then(function(result){
        res.send("save ok");
      });
  });

  server.listen(app.get('port'), function () {
    console.log('TaskTreeMap listening on port ' + app.get('port'));
  });
}


