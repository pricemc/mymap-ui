import urllib
import re
import json;
from bs4 import BeautifulSoup;

import sys;

def crawlProfessor(name, tid):
    url = 'http://www.ratemyprofessors.com/ShowRatings.jsp?tid=' + str(tid);
    html = urllib.urlopen(url).read()

    data = re.findall(r'\">(.*?)</',html)
    details = {};

    add = False;
    for x in xrange(len(data)):
        if data[x] == 'Submit a Correction':
            details["Name"] = name;
            add = True;

        elif data[x] == 'Helpfulness' and add:
        	details["Overall Quality"] = str(data[x - 2]);
        	details["Average Grade"] = str(data[x - 1]);
        	details["Helpfulness"] = str(data[x + 1]);

        elif data[x] == 'Easiness' and add:
        	details["Easiness"] = str(data[x + 1]);
        	break

    # Fetch comments
    soup = BeautifulSoup(html, 'html.parser');
    commentTable = soup.find("table", {"class": "tftable", "border": "0"});
    commentsSource = filter(lambda x: x.has_attr("id"), commentTable.findAll("tr"));
    comments = [];
    for c in commentsSource:
    	comment = {};
    	ratings = c.find("div", {"class": "breakdown"}).findAll("div", {"class":"break"});
    	for rating in ratings:
    		descriptor = str(rating.find("span", {"class":"descriptor"}).string.encode("ascii"));
    		comment[descriptor] = str(rating.find("span", {"class":"score"}).string.encode("ascii"));
    	comment["comment"] = str(c.find("p", {"class":"commentsParagraph"}).string.encode("ascii"));
    	comments.append(comment);

    details["comments"] = comments;

    return details

def getProfessorId (searchTerms):
	searchTerms = searchTerms.replace(" ", "+");
	url = "http://www.ratemyprofessors.com/search.jsp?query=" + searchTerms;
	soup = BeautifulSoup(urllib.urlopen(url).read(), 'html.parser')
	listings = soup.find("ul", {"class": "listings"});

	results = soup.findAll("li", {"class":"listing PROFESSOR"});
	for result in results:
		profName = result.find("span", {"class": "main"}).contents
		profUniv = result.find("span", {"class": "sub"}).contents
		if "Brigham" in str(profUniv):
			return result.find("a")["href"].split("tid=")[1];
	return None

def getProfessorStats (name):
    searchTerms = name.replace("\s+", " ") + " brigham"
    profId = getProfessorId(searchTerms);
    if profId is None:
        return "";
    return crawlProfessor(name, profId);

args = sys.argv[1::]
profs = [json.dumps(getProfessorStats(i)) for i in args];
for p in profs:
	print p;
