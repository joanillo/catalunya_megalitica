# encoding: utf-8

import json #parsejar JSON

import termios, fcntl, sys, os #script interactiu

import requests #cercar node
import jxmlease

from osmapi import OsmApi #create, update node

from math import sin, cos, sqrt, atan2, radians #per calcular la distància entre dos punts amb coordenades GPS

overpass_url = "http://overpass-api.de/api/interpreter"

#---
def press_key():
	fd = sys.stdin.fileno()

	oldterm = termios.tcgetattr(fd)
	newattr = termios.tcgetattr(fd)
	newattr[3] = newattr[3] & ~termios.ICANON & ~termios.ECHO
	termios.tcsetattr(fd, termios.TCSANOW, newattr)

	oldflags = fcntl.fcntl(fd, fcntl.F_GETFL)
	fcntl.fcntl(fd, fcntl.F_SETFL, oldflags | os.O_NONBLOCK)

	try:
		while 1:
			try:
				c = sys.stdin.read(1)
				#print "Got character", repr(c)
				return c;
			except IOError: pass
	finally:
		termios.tcsetattr(fd, termios.TCSAFLUSH, oldterm)
		fcntl.fcntl(fd, fcntl.F_SETFL, oldflags)
#---

with open('../dolmens/dolmensCN.json', 'r') as f:
    dolmens_dict = json.load(f)

# creem la sessió, doncs només vull fer un changeset per tots els canvis
MyApi = OsmApi(passwordfile="/home/joan/projectes/OSM/.password")
changeset_comment = '{"comment": "Inserció i actualització dòlmens Catalunya Nord (20-02-2020)"}'
changeset_comment_json = json.loads(changeset_comment)
MyApi.ChangesetCreate(changeset_comment_json)

num_item = 1;
for dolmen in dolmens_dict:

	name = dolmen['name'];
	lat = float(dolmen['lat']);
	lon = float(dolmen['lon']);
	hi_es = dolmen['hi_es'];
	megalith_type = dolmen['megalith_type'];
	wikipedia = dolmen['wikipedia'];
	wikidata = dolmen['wikidata'];
	source = dolmen['source'];
	alt_name = dolmen['alt_name'];

	print("=================================")
	print(num_item)
	print("=================================")
	print (name)
	print ("(",lat,",",lon,")");
	print("name: " + name)
	print("hi_es: " + hi_es)
	print("megalith_type: " + megalith_type)
	print("wikipedia: " + wikipedia)
	print("wikidata: " + wikidata)
	print("source: " + source)
	print("alt_name: " + alt_name)

	#cerquem els dòlmens que tenim, per actualitzar o per inserir
	overpass_query = "node[name~Dolmen](around:80,%f,%f);node[name~menhir](around:80,%f,%f);node[name~cist](around:80,%f,%f);node[historic=archaeological_site](around:80,%f,%f); out;" % (lat,lon,lat,lon,lat,lon,lat,lon)
	#print overpass_query;
	response = requests.get(overpass_url, params={'data': overpass_query})
	print response.content;
	#volem recuperar el id del node que hem trobat
	root = jxmlease.parse(response.content)
	num = 0	
	for i in root['osm'].find_nodes_with_tag('node', recursive=False):
		#càlcul distància (https://stackoverflow.com/questions/19412462/getting-distance-between-two-points-based-on-latitude-longitude)
		# approximate radius of earth in km
		R = 6373000.0 #metres (és el radi de la Terra)
		lat1 = radians(lat)
		lon1 = radians(lon)
		lat2 = radians(float(i.get_xml_attr("lat")))
		lon2 = radians(float(i.get_xml_attr("lon")))
		dlon = lon2 - lon1
		dlat = lat2 - lat1
		a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
		c = 2 * atan2(sqrt(a), sqrt(1 - a))
		distance = R * c
		print "node: " + i.get_xml_attr("id"), " en les immediacions (dist: ", round(distance,1), " m)"
		num+=1;
		print("ACTUALITZACIÓ\n=============");
		print('Vols actualitzar les dades (y/n)');
		tecla = press_key();
		if (tecla=='y'):
			print('Anem a actualitzar')

			node = MyApi.NodeGet(i.get_xml_attr("id"))
			tags = node["tag"]
			#hi ha algun cas que el dolmen no té nom
			if ("name" not in tags.keys() and name!=""):
				tags[u"name"] = name
			tags[u"historic"] = u"archaeological_site"
			tags[u"site_type"] = "megalith"
			#if (tags[u"wikipedia"]):
			if ("wikipedia" not in tags.keys() and wikipedia!=""):
				tags[u"wikipedia"] = wikipedia
			if ("wikidata" not in tags.keys() and wikidata!=""):
				tags[u"wikidata"] = wikidata
			if ("source" not in tags.keys() and source!=""):
				tags[u"source"] = source
			if ("alt_name" not in tags.keys() and alt_name!=""):
				tags[u"alt_name"] = alt_name

			print(MyApi.NodeUpdate(node))

			print ("dolmen/menhir actualitzat\n");
			num_item = num_item + 1;
		else:
			print('No volem actualitzar\n')

	if (num==0):
		print("\n\nINSERCIÓ\n========")
		print('Vols inserir (y/n)');
		tecla = press_key();
		print(tecla)
		if (tecla=='y'):

			#primer les dades que segur que hi són:
			data = '{"lat":%f, "lon":%f, "tag": { "historic":"archaeological_site","site_type":"megalith", "name":"%s", "megalith_type":"%s"' % (lat, lon, name, megalith_type)
			if (wikipedia != ""):
				data += ',"wikipedia":"%s"' % (wikipedia)
			if (wikidata != ""):
				data += ',"wikidata":"%s"' % (wikidata)			
			if (source != ""):
				data += ',"source":"%s"' % (source)
			if (alt_name != ""):
				data += ',"alt_name":"%s"' % (alt_name)
			data += '}}';
			print(data);	
			#data = '{"lat":%f, "lon":%f, "tag": { "natural": "tree", "name": "%s", "species": "%s", "species:ca": "%s", "note": "%s", "website": "%s" }}' % (lat, lon, name, species, species_ca, note, website)
			data_json = json.loads(data)
			print(data_json)
			print(MyApi.NodeCreate(data_json))
			#MyApi.flush()
			print ("dolmen inserit\n");
			num_item = num_item + 1;
		else:
			print('No volem inserir\n')

# tanquem la sessió
MyApi.ChangesetClose()






