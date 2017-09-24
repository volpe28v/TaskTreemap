var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.post('/getData', function (req, res) {
  console.log("getData");
  console.log(req.body);
  var id = req.body.id;

  //TODO DBから取得する
  
  //TODO ダミーの値を返す
  res.send(id);
});

app.post('/saveData', function (req, res) {
  console.log("saveData");
  console.log(req.body);
  var id = req.body.id;

  //TODO DBに保存する
  
  res.send("save ok");
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
