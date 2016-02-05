var fs = require("fs");

module.exports = {
	/* Parses the big course file into JSON:
	[{  name : <department name>
			courses : [
				{ id, title, titlecode, uid }
			]
	}] */
	getCourseList : function (fName) {
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
			  course["uid"] = val;
			  course["title"] = parts[1];
			  dept["courses"].push(course);
			}
		}
		return res;
	},
}