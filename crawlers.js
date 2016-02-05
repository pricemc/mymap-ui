var vo = require('vo');
var Nightmare = require('nightmare');
var PythonShell = require('python-shell');

var SHOW_NIGHTMARE = false;

module.exports = {
  crawlCourse:  function(id, titleCode, year, semester, callback) {
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
      console.log("Success: crawl of " + id + "|" + titleCode);

      var options = {
        mode: 'text',
        pythonPath: 'python',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: [result]
      };

      PythonShell.run('python-scripts/saasta-table-parser.py', options, function (err, results) {
        if (callback !== undefined && err) { console.log("error!"); callback(err); return; }

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
  },

  crawlProfessor: function (names, callback) {
    var options = {
      mode: 'text',
      pythonPath: 'python',
      pythonOptions: ['-u'],
      scriptPath: '',
      args: names
    };

    PythonShell.run('python-scripts/rateprofessor.py', options, callback);    
  }

}