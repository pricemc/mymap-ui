var Nightmare = require('nightmare');
var vo = require('vo');
var fs = require('fs');
var read = require('read')
read({ prompt: 'Password: ', silent: true }, function(er, password) {
  doCrawl("achan22", password);
})

function doCrawl(username, pass) {
  categories = fs.readFileSync('deptlist.txt', 'utf8').split("\n");
  descriptions = fs.readFileSync('deptdescript.txt', 'utf8').split("\n");  

  vo(function* () {
    var nightmare = Nightmare({ show: true });
    var allHtml = "";

    var link = yield nightmare
      .goto('https://y.byu.edu/ry/ae/prod/registration/cgi/regOfferings.cgi')
      .type("input[id=netid]", username)
      .type("input[id=password]", pass)
      .click("input[class=submit]")
      .wait("select");

    for (var i = 0; i < categories.length; i++) {
      var selection = yield nightmare
        .select('select[name=Department]', categories[i])
        .evaluate(function () { goOption('3'); })
        .wait("select[name=Course]");

      var html = yield nightmare
        .evaluate(function () {
          return $("select[name=Course]").html();
        });

      allHtml += descriptions[i] + "\n" + html;
    }

    yield nightmare.end();
    return allHtml;
  })
  (function (err, result) {
    if (err) return console.log(err);
    fs.writeFileSync("course-list-temp.html", result);
    console.log("Successfully recorded courses in course-list-temp.html")
  });
}
