var PythonShell = require('python-shell');
var app = require('express')();
var express = require('express');
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var Nightmare = require('nightmare');
var vo = require('vo');
var fs = require('fs');
app.use( bodyParser() );
app.use(bodyParser.urlencoded({
  extended: true
})); 

var SHOW_NIGHTMARE = false;

/* Parse the huge course list into JSON */
function getCourseList (fName) {
  var lines = fs.readFileSync(fName, "utf8").split("\n");
  var res = []
  var currentKey = "";
  var dept = {};
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].charAt(0) != '!') {
      if (Object.keys(dept) != 0) res.push(dept);
      dept = {};
      dept["name"] = lines[i];
      dept["courses"] = [];
    } else {
      var parts = lines[i].split(">");
      var val = parts[0].split("=")[1];
      var course = {};
      course["id"] = val.split("|")[0];
      course["titleCode"] = val.split("|")[1];
      course["title"] = parts[1];
      dept["courses"].push(course);
    }
  }
  return res;
}

function crawlCourse (id, titleCode, year, semester, callback) {
  var query = "yearTerm=" + year + semester + "&curriculumId=" + id + "&titleCode=" + titleCode;

  vo(function* () {
    var nightmare = Nightmare({ show: SHOW_NIGHTMARE });
    var allHtml = "<html><body><table>";

    var link = yield nightmare
      .goto('http://saasta.byu.edu/noauth/classSchedule/index.php?' + query)
      .wait("div[onclick='resetSearch()']")

    
    var numEntries = yield nightmare
      .evaluate(function () {
        var info = $(".dataTables_info").html().split(" ")
        return parseInt(info[info.indexOf("of") + 1]);
      });

    var numPages = Math.ceil(numEntries / 50);

    for (var i = 0; i < 1; i++) {
      var page = yield nightmare
        .evaluate(function () {
          return $("#searchResults").html();
        });

      allHtml += page;

      var clickNext = yield nightmare
        .click("#searchResults_next")
        .wait();
    }

    allHtml += "</table></body></html>"

    yield nightmare.end();
    return allHtml;
  })
  (function (err, result) {
    if (err) return console.log(err);
    console.log("Successful crawl of " + id + " - requesting soup from Python");

    var options = {
      mode: 'text',
      pythonPath: 'python',
      pythonOptions: ['-u'],
      scriptPath: '',
      args: [result]
    };

    PythonShell.run('saasta-table-parser.py', options, function (err, results) {
      if (callback !== undefined && err) { callback(err); return; }

      if (results === null) {
        console.log("RESULTS ARE NULL?");
        if (callback !== undefined) callback([]);
        return;
      }
      //fs.writeFileSync("ex-scrape.html", result);
      objs = [];
      for (var i = 0; i < results.length; i++) objs.push(JSON.parse(results[i]))
      if (callback !== undefined) callback(objs);
    });
    // I guess I would ask the python to beautiful soup this thing, get JSON back.
    //fs.writeFileSync("ex-scrape.html", result);
  });
}

var courseList = getCourseList("course-list.txt");
/*crawlCourse("02859", "006", 2016, 1, function(data) {
  console.log(data);
})*/

app.use(express.static('public'));

app.post('/get-courses', function (req, res) {
  res.send(courseList);
});

app.post('/get-sections', function (req, res) {
  var titleCode = req.body.titleCode;
  var year = req.body.year;
  var semester = req.body.semester; // 1, 2, 3, 4
  var courseId = req.body.courseId;
  crawlCourse(courseId, titleCode, year, semester, function (result) {
    res.send(result);
  });
})

app.post('/rate-professors', function(req, res) {
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