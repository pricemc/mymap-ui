import urllib
import re
import json;
from bs4 import BeautifulSoup;
import sys;

def clean (s):
	return s.replace("<br>", "").replace("</br>", "").replace("<br/>", "").strip();

args = sys.argv[1::]
if len(args) < 1:
	print "Usage: 'ex-scrape.html'"
	sys.exit();

#with open(args[0]) as f:
#	lines = f.read();
#soup = BeautifulSoup(lines, 'html.parser')
soup = BeautifulSoup(args[0], 'html.parser');

table = soup.find("table");
rows = table.findChildren("tr")[1::];

sections = [];

for row in rows:
	tds = row.findAll("td");
	if len(tds) < 13:
		continue;
	section = {};
	section["name"] = str(tds[0].get_text(strip=True).split("##")[-1])
	section["prof"] = str(tds[4].get_text(strip = True))
	section["days"] = filter(lambda x: x != "", [clean(str(a.encode("ascii"))) for a in tds[6].contents])
	section["startTime"] = filter(lambda x: x != "", [clean(str(a.encode("ascii"))) for a in tds[7].contents])
	section["endTime"] = filter(lambda x: x != "", [clean(str(a.encode("ascii"))) for a in tds[8].contents])
	section["place"] = filter(lambda x: x != "", [clean(str(a.encode("ascii"))) for a in tds[9].contents])
	section["seats"] = str(tds[11].get_text(strip = True))
	section["waitlist"] = str(tds[12].get_text(strip = True))
	sections.append(section);

sections = [json.dumps(s) for s in sections];
for s in sections:
	print s;