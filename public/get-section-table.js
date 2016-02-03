function createSectionTable (data, attachElement, callback) {
	var html = "<table class='ui fluid celled padded table'>"
	var cols = ["Name", "Professor", "Days", "Time", "Place", "Seats Available", "Waitlist"];
	html += "<tr>" + cols.reduce(function (x, y) { return x + "<th>" + y + "</th>"}, "") + "</tr>";
	// Sections data looks like [{ tblah blah}, {blah blah}]...so just print it I guess
	html += data.reduce(function (acc, section) {
		var ret = "<tr>";
		ret += "<td>" + section["name"] + "</td><td>" + section["prof"] + "</td>";
		ret += "<td>" + section["days"].join(", ") + "</td>";
		ret += "<td>" + _.map(_.zip(section.startTime, section.endTime), function (times) {
			return times[0] + " - " + times[1];
		}).join(", ") + "</td>";
		ret += "<td>" + section["place"].join(", ") + "</td>";
		ret += "<td>" + section["seats"] + "</td>";
		ret += "<td>" + section["waitlist"] + "</td>";
		ret += "</tr>";
		return acc + ret;
	}, "");
	html += "</table>"
	html += "<button id='rate-profs' class='ui blue button'>Rate Professors</button>"
	//$("#section-loader").removeClass("active");
	//$("#section-table").html(html);
	attachElement.html(html);

	$("#rate-profs").on('click', function () {
		$("#rate-loader").addClass("active");
		var profNames = sectionsOnDisplay.map(function (x) { 
			var name = x.prof.replace(",", "").split(" "); 
			return name[1] + " " + name[0];
		});
		var seen = {};
		profNames = profNames.filter(function (x) {
			if (seen.hasOwnProperty(x)) return false;
			seen[x] = true;
			return true;
		});
		$.ajax({
			url: "rate-professors",
			data: { names: profNames },
			type: "POST",
			success: function (data) {
				rateDataOnDisplay = data;
				$("#rate-loader").removeClass("active");
				createRatingTable(data);
			},
			error: function (data) {
				console.log("Error fetching ratings: " + data);
			}
		})
	});
	if (callback !== undefined) callback();
}