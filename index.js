var PythonShell = require('python-shell');
var app = require('express')();
var express = require('express');
var server = require('http').Server(app);
var bodyParser = require('body-parser');
app.use( bodyParser() );
app.use(bodyParser.urlencoded({
  extended: true
})); 

app.use(express.static('public'));

app.post('/rate-professors', function(req, res) {
  console.log(req.body);
  if (req.body.names[0] == "") { res.send({}); return; }

  var options = {
    mode: 'text',
    pythonPath: 'python',
    pythonOptions: ['-u'],
    scriptPath: '',
    args: req.body.names
  };

  PythonShell.run('rateprofessor.py', options, function (err, results) {
    if (err) throw err;
    objs = [];
    for (var i = 0; i < results.length; i++) objs.push(JSON.parse(results[i]))
    res.send(objs);
  });
});


server.listen(process.env.PORT || 4004);

console.log("Listening.");