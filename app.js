var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/app', function (req, res) {
  var pageName = req.url.split('/').pop();

  if (pageName == ''){
    console.log("this is index");
  }else{
    console.log("page = " + pageName);
  }

  var options = { root: path.join(__dirname, 'public') };
  res.sendFile('index.html', options);
});

/*
app.get('*', function (req, res) {
  var pageName = req.url.split('/').pop();
  console.log("page = ");

  if (pageName == ''){
    console.log("this is index");
  }else{
    console.log("page = " + pageName);
  }

  var options = { root: path.join(__dirname, 'public') };
  res.sendFile('index.html', options);
});

*/
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
