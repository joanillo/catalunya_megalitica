var map;

var dolmens = [dolmensC, dolmensCN];
var vectorLayerIcones = [];

//https://stackoverflow.com/questions/27658280/layer-switching-in-openlayers-3
var layersOSM = new ol.layer.Group({
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ]
});


var layersWatercolor = new ol.layer.Group({
    layers: [
        new ol.layer.Tile({
            source: new ol.source.Stamen({
           layer: 'watercolor'
     })
        })
    ]
});

var layersToner = new ol.layer.Group({
    layers: [
        new ol.layer.Tile({
            source: new ol.source.Stamen({
           layer: 'toner'
     })
        })
    ]
});

var layersTerrain = new ol.layer.Group({
    layers: [
        new ol.layer.Tile({
            source: new ol.source.Stamen({
           layer: 'terrain'
     })
        })
    ]
});

function setMapType(newType) {

    if(newType == 'OSM') {
        map.setLayerGroup(layersOSM);
    } else if (newType == 'watercolor') {
        map.setLayerGroup(layersWatercolor);
    } else if (newType == 'toner') {
        map.setLayerGroup(layersToner);
    } else if (newType == 'terrain') {
        map.setLayerGroup(layersTerrain);
    }

	vectorLayerIcones = [];
    init_layer(0); //Catalunya
	init_layer(1); //Catalunya Nord
}

function init_mapa() {

	var renderOSM = [
			new ol.layer.Tile({
				source: new ol.source.OSM()
			})
		]

    var renderTerrain = [
        new ol.layer.Tile({
            source: new ol.source.Stamen({
           layer: 'terrain'
     })
        })
    ]

	map = new ol.Map({
		target: 'map',
		layers: renderTerrain,
		view: new ol.View({
			center: ol.proj.fromLonLat([2.3,42.01528]),
			zoom: 8
		})
	});

	init_layer(0); //Catalunya
	init_layer(1); //Catalunya Nord
}

function enable_layer(paisid) {
	if (paisid==0) {
		vectorLayerIcones[0].setVisible(true);
		vectorLayerIcones[1].setVisible(false);
	} else if (paisid==1) {
		vectorLayerIcones[0].setVisible(false);
		vectorLayerIcones[1].setVisible(true);
	} else {
		vectorLayerIcones[0].setVisible(true);
		vectorLayerIcones[1].setVisible(true);
	}
	map.render();
}

function init_layer(paisid) {

	var icones = [];

	for (var i=0;i<dolmens[paisid].length;i++) {
		var iconPoint = new ol.Feature({
			geometry: new ol.geom.Point(ol.proj.fromLonLat([dolmens[paisid][i].lon,dolmens[paisid][i].lat]))
		});
		var txt = "";
		var vmegalith_type = ""
	
		if (dolmens[paisid][i].megalith_type == "menhir") {
			txt = "<img src=\"img/menhir_16.png\" title=\"menhir\" />&nbsp;";
			vmegalith_type = "menhir";
		} else if (dolmens[paisid][i].megalith_type == "passage_grave") {
			txt = "<img src=\"img/passage_grave_16.png\" title=\"galeria\" />&nbsp;";
			vmegalith_type = "passage_grave";
		} else if (dolmens[paisid][i].megalith_type == "stone") {
			txt = "<img src=\"img/stone_16.png\" title=\"pedra\" />&nbsp;";
			vmegalith_type = "stone";
		} else if (dolmens[paisid][i].megalith_type == "cist") {
			txt = "<img src=\"img/cist_16.png\" title=\"cista\" />&nbsp;";
			vmegalith_type = "cist";
		} else { //dolmen i d'altres
			txt = "<img src=\"img/dolmen_16.png\" title=\"dolmen\" />&nbsp;";
			vmegalith_type = "dolmen";
		}

		txt += "<b>" + dolmens[paisid][i].name + "</b><br />" + dolmens[paisid][i].municipi + "<br />";
		if (dolmens[paisid][i].wikipedia != "") txt += "<a href=\"http://ca.wikipedia.org/wiki/" + dolmens[paisid][i].wikipedia.replace("ca:","") + "\" target=\"_blank\">+info</a>&nbsp;";
		if (dolmens[paisid][i].source != "") txt += "<a href=\"" + dolmens[paisid][i].source + "\" target=\"_blank\">+info</a>&nbsp;";
		txt += "<a href=\"#\" onclick=\"veure_dolmen(" + dolmens[paisid][i].lat + "," + dolmens[paisid][i].lon + ");\">GO</a>";
		var estil = new ol.style.Style({
	        fill: new ol.style.Fill({
	        color: 'rgba(255,255,255,1)'
	      }),
	      image: new ol.style.Icon(({
	        anchor: [0.5, 1],
	        src: "./img/" + vmegalith_type + "_16.png"
	      })),
	      stroke: new ol.style.Stroke({
	        color: '#3399CC',
	        width: 3.25
	      }),
	      text: new ol.style.Text({
	        font: '14px Calibri,sans-serif',
	        offsetY: '-15',
	        textAlign: 'left',
	        fill: new ol.style.Fill({ color: '#000' }),
	        stroke: new ol.style.Stroke({
	          color: '#fff', width: 2
	        }),
	      })
	    });

		iconPoint.setStyle(estil);
		//iconPoint.setStyle(styleFunction);
		//iconPoint.setStyle(function() {styleFunction("dolmen")});
		iconPoint.set('description', txt);
		icones.push(iconPoint);
	}
	var vectorSourceicones = new ol.source.Vector({
		features: icones
	});

	vectorLayericones = new ol.layer.Vector({
		source: vectorSourceicones
	});
	vectorLayerIcones.push(vectorLayericones);

	map.addLayer(vectorLayericones);

	map.on("click", function(e) {
		map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
			if (feature.N.description != undefined) {
				//console.log(feature.N.description);
                var txt = feature.N.description;
                document.getElementById('popup').style.visibility="visible";
                var content = document.getElementById('popup-content');
                content.innerHTML = txt;
			}
		})
	});
}

function llista() {
	llista_parcial(0);
	llista_parcial(1);
}

function llista_parcial(idpais) {

	dolmens[idpais].sort(compare);
	var municipi;
	var str_dolmens = "";
	for (var i=0;i<dolmens[idpais].length;i++) {
		//console.log(dolmens[i].name);
		if (municipi != dolmens[idpais][i].municipi) {
			municipi = dolmens[idpais][i].municipi;
			if (i!=0) {
				str_dolmens += "</ul>";
			}
			str_dolmens += municipi + "<br />";
			str_dolmens += "<ul>";
			str_dolmens += info_dolmen(dolmens[idpais][i]);
			//str_dolmens += "<li>" + dolmens[idpais][i].name + " " + dolmens[idpais][i].wikipedia + "</li>";
		} else {
			str_dolmens += info_dolmen(dolmens[idpais][i]);
			//str_dolmens += "<li>" + dolmens[idpais][i].name + " " + dolmens[idpais][i].wikipedia + "</li>";
		}
	}
	str_dolmens += "</ul>";
	if (idpais==0) {
		document.getElementById("llista_dolmens_C").innerHTML = str_dolmens;
	} else {
		document.getElementById("llista_dolmens_CN").innerHTML = str_dolmens;
	}
}


function styleFunction() {
  return [
    new ol.style.Style({
        fill: new ol.style.Fill({
        color: 'rgba(255,255,255,1)'
      }),
      image: new ol.style.Icon(({
        anchor: [0.5, 1],
        src: "./img/dolmen_16.png"
      })),
      stroke: new ol.style.Stroke({
        color: '#3399CC',
        width: 3.25
      }),
      text: new ol.style.Text({
        font: '14px Calibri,sans-serif',
        offsetY: '-15',
        textAlign: 'left',
        fill: new ol.style.Fill({ color: '#000' }),
        stroke: new ol.style.Stroke({
          color: '#fff', width: 2
        }),
      })
    })
  ];
}

function compare(a, b) {
  // Use toUpperCase() to ignore character casing
  const municipiA = a.municipi.toUpperCase();
  const municipiB = b.municipi.toUpperCase();

  var comparison = 0;
  if (municipiA > municipiB) {
    comparison = 1;
  } else if (municipiA < municipiB) {
    comparison = -1;
  }
  return comparison;
}

function veure_dolmen(lat,lon) {
	var coordinate= [lon,lat];
	map.getView().setZoom(14);
	map.getView().setCenter(ol.proj.transform(coordinate, 'EPSG:4326', 'EPSG:3857'));
	map.render()
}

function info_dolmen(dolmen) {
	var str="";
	console.log(dolmen);
	if (dolmen.wikipedia != "") {
		str = "<li><a href=\"https://ca.wikipedia.org/wiki/" + dolmen.wikipedia.replace("ca:","") + "\" target=\"_blank\">" + dolmen.name + "</a>&nbsp;" + "(<a href=\"#\" onclick=\"veure_dolmen(" + dolmen.lat + "," + dolmen.lon + ");\">GO</a>)" + "</li>";
	} else if (dolmen.source != "") {
		str = "<li><a href=\"" + dolmen.source + "\" target=\"_blank\">" + dolmen.name + "</a>&nbsp;" + "(<a href=\"#\" onclick=\"veure_dolmen(" + dolmen.lat + "," + dolmen.lon + ");\">GO</a>)" + "</li>";
	} else {
		str = "<li>" + dolmen.name + "&nbsp;" + "(<a href=\"#\" onclick=\"veure_dolmen(" + dolmen.lat + "," + dolmen.lon + ");\">GO</a>)" + "</li>";
	}
	return str;
}
