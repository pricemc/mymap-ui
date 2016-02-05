var crawlers = require("./crawlers.js");
var parsers = require("./parsers.js");
var _ = require("underscore");
var fs = require('fs')

var courseList = parsers.getCourseList("mymap-data/course-list.txt");
var allSections = {};
var courses = _.flatten(_.map(courseList, function (x) { 
	return x.courses;
}));


/*
Dies because it tries to run nightmare concurrently.
sample.forEach(function (course) {
	crawlers.crawlCourse(course.id, course.titleCode, 2016, 1, function (result) {
		allSections[courses[i].uid] = result;
		console.log("All: " + allSections.length);
	})
})*/
console.log("OKAY LET'S CRAWL " + courses.length + " COURSES!");

// Crawl every course in batches because I don't want my computer to fry :-)
var step = 1;
function crawlSome (start, max) {
	if (start >= max) {
		console.log("ALL DONE, writing to section-list.txt!");
		fs.writeFileSync('mymap-data/section-list.txt', JSON.stringify(allSections));
		return;
	}

	var upperBound = Math.min(start + step, max);
	var completedTasks = 0;
	for (var i = start; i < upperBound; i++) {
		(function (i) {
			console.log("Crawling " + courses[i].id + " " + courses[i].titleCode + " " + courses[i].title)
			crawlers.crawlCourse(courses[i].id, courses[i].titleCode, 2016, 1, function (result) {

				allSections[courses[i].uid] = result;
				completedTasks += 1;
				console.log("ALLSECTIONS LENGTH " + Object.keys(allSections).length)

				if (completedTasks == upperBound - start) {
					console.log("DONE WITH THIS BATCH");
					if (start % 50 == 0) {
						console.log("SAVING PROGRESS");
						fs.writeFileSync("mymap-data/section-list-restore.txt", JSON.stringify(allSections));
						fs.writeFileSync("mymap-data/section-list-prognum.txt", "" + upperBound);
					}
					crawlSome(start + step, max);
				}
			});
		})(i);
	}
}

startNum = parseInt(fs.readFileSync('mymap-data/section-list-prognum.txt'))
allSections = JSON.parse(fs.readFileSync('mymap-data/section-list-restore.txt'))

console.log("STARTING AT " + startNum + " W allsections length: " + Object.keys(allSections).length)
crawlSome(startNum, courses.length)