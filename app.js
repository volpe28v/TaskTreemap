var app = require('./lib/server');
var server = require('http').createServer(app);
var path = require('path');

var io = require('socket.io').listen(server,{ 'destroy buffer size': Infinity });
var index_socket = require('./lib/index_socket');
index_socket.setup(io);

var program = require('commander');
program
  .version('1.0.0')
  .option('-d, --db_name [name]', 'db name. default is "tasktreemap_db".')
  .option('-p, --port <n>', 'port no. default is 3000.')
  .parse(process.argv);

app.set('db_name', program.db_name || 'tasktreemap_db');
app.set('port', program.port || process.env.PORT || 3000);
app.set('force_ssl', program.forceSsl || process.env.FORCE_SSL === 'true');

var mongo_builder = require('./lib/mongo_builder');
var tasktreemap_db = require("./lib/tasktreemap_db");
var burndown_db = require("./lib/burndown_db");

Promise.all([
  mongo_builder.ready(app.get('db_name'))
])
.then(function(results){
  tasktreemap_db.set_db(results[0]);
  burndown_db.set_db(results[0]);
  startServer();
});

function startServer(){
  app.get('/', function(req, res, app) {
    console.log('/');
    res.render('index',{});
  });

  app.get('/list', function (req, res) {
    console.log('/list');
    res.render('list',{});
  });

  app.get('/all_maps', function (req, res) {
    tasktreemap_db.findAll()
    .then(function(result){
      res.send(result);
    });
  });

  if (app.get('force_ssl')) {
    app.get('*', function(req, res, next) {
      if (req.recure || req.headers['x-forwarded-proto'] === 'https') {
        next();
      } else {
        res.redirect('https://' + req.headers.host + req.url);
      }
    });
  }

  server.listen(app.get('port'), function () {
    console.log('TaskTreeMap listening on port ' + app.get('port'));
  });
}
