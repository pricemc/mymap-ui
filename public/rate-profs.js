function createRatingTable (data) {
	var html = '<table class="ui fluid celled padded table">'
	html += "<tr><th>Name</th><th>Helpfulness</th><th>Easiness</th><th>Average Grade</th><th></th><th>Comment</th><th></th></tr>";
	for (var i = 0; i < data.length; i++) {
		var prof = data[i];
		if (prof == "") {
			html += "<tr><td>Sorry</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>"
			continue;
		}
		var comment = prof["comments"][0]["comment"];
		var prev = '<button data-prof-ix=' + i + ' data-com-ix=0 class="mini comment-back ui blue button">&laquo;Prev</button>';
		var next = '<button data-prof-ix=' + i + ' data-com-ix=0 class="mini comment-forward ui blue button">Next&raquo;</button>';
		html += "<tr><td>" + prof["Name"] + "</td><td>" + prof["Helpfulness"] + "</td><td>";
		html += prof["Easiness"] + "</td><td>" + prof["Average Grade"] + "</td><td>" + prev + "</td>"
		html += '<td class="prof-comment six wide">' + comment + "</td><td>" + next + "</td></tr>";
	}
	html += "</table>";
	$("#rate-result").html(html);
	$("#rate-loader").removeClass("active");

	$(".comment-back").on('click', function () {
		var profIx = $(this).attr('data-prof-ix')
		var curComIx = $(this).attr('data-com-ix')
		curComIx = (curComIx > 0) ? (curComIx - 1) : rateDataOnDisplay[profIx]["comments"].length - 1;
		$(this).attr('data-com-ix', curComIx);
		$(this).parent().parent().find(".comment-forward").attr("data-com-ix", curComIx);
		$(this).parent().parent().find(".prof-comment").html(rateDataOnDisplay[profIx]["comments"][curComIx]["comment"]);
	});

	$(".comment-forward").on('click', function () {
		var profIx = $(this).attr('data-prof-ix')
		var curComIx = $(this).attr('data-com-ix')
		curComIx = (curComIx < rateDataOnDisplay[profIx]["comments"].length - 1) ? parseInt(curComIx) + 1 : 0;
		$(this).attr('data-com-ix', curComIx);
		$(this).parent().parent().find(".comment-back").attr("data-com-ix", curComIx);
		$(this).parent().parent().find(".prof-comment").html(rateDataOnDisplay[profIx]["comments"][curComIx]["comment"]);
	})
}