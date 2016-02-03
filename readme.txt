What's the format of course-list.html?

If title:
	TITLE HERE
else:
	!value="idnumtitleCode">Course description

How did you scrape it all?
	node course-id-scraper.js -> course-list-temp.html

But how did you format all of it?
	Sublimetext find all </option> delete
	find all <option , replace with !
	find all "\n\n" and replace with "\n"
