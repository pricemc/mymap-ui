var app = require('express')();
var express = require('express');
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var crawlers = require('./crawlers.js');
var parsers = require("./parsers.js");

app.use( bodyParser() );
app.use(bodyParser.urlencoded({
  extended: true
})); 

/* Parse the huge course list into JSON */

var courseList = parsers.getCourseList("mymap-data/course-list.txt");
var sectionCache = parsers.getSectionCache("mymap-data/section-list.txt");

app.use(express.static('public'));

app.post('/get-courses', function (req, res) {
  res.send(courseList);
});

app.post('/get-sections', function (req, res) {
  var titleCode = req.body.titleCode;
  var year = req.body.year;
  var semester = req.body.semester;
  var courseId = req.body.courseId;
  // The cache doesn't tell me what year it is...next cache I'll have to put that in.
  /*if (sectionCache.hasOwnProperty(courseId + "|" + titleCode)) {
    res.send(sectionCache[courseId + "|" + titleCode]);
  }
  else {*/
    crawlers.crawlCourse(courseId, titleCode, year, semester, function (result) {
      res.send(result);
    });
  //}
})

app.post('/rate-professors', function(req, res) {
  if (req.body.names[0] == "") { res.send({}); return; }

  crawlers.crawlProfessor(req.body.names, function (err, results) {
    if (err) throw err;
    objs = [];
    for (var i = 0; i < results.length; i++) objs.push(JSON.parse(results[i]))
    res.send(objs);
  });
});

server.listen(process.env.PORT || 4004);
console.log("Listening.");