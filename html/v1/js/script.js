var map;
var vectorLayerIcones;

function init_mapa(cat) {
	map = new ol.Map({
		target: 'map',
		layers: [
			new ol.layer.Tile({
			source: new ol.source.OSM()
		})
		],
		view: new ol.View({
			center: ol.proj.fromLonLat([2.3,42.01528]),
			zoom: 8
		})
	});

	var icones = [];
	var dolmens = dolmensC.concat(dolmensCN);

	for (var i=0;i<dolmens.length;i++) {
		var iconPoint = new ol.Feature({
			geometry: new ol.geom.Point(ol.proj.fromLonLat([dolmens[i].lon,dolmens[i].lat]))
		});
		var txt = "";
		var vmegalith_type = ""
	
		if (dolmens[i].megalith_type == "menhir") {
			txt = "<img src=\"img/menhir_16.png\" title=\"menhir\" />&nbsp;";
			vmegalith_type = "menhir";
		} else if (dolmens[i].megalith_type == "passage_grave") {
			txt = "<img src=\"img/passage_grave_16.png\" title=\"galeria\" />&nbsp;";
			vmegalith_type = "passage_grave";
		} else if (dolmens[i].megalith_type == "stone") {
			txt = "<img src=\"img/stone_16.png\" title=\"pedra\" />&nbsp;";
			vmegalith_type = "stone";
		} else if (dolmens[i].megalith_type == "cist") {
			txt = "<img src=\"img/cist_16.png\" title=\"cista\" />&nbsp;";
			vmegalith_type = "cist";
		} else { //dolmen i d'altres
			txt = "<img src=\"img/dolmen_16.png\" title=\"dolmen\" />&nbsp;";
			vmegalith_type = "dolmen";
		}

		txt += "<b>" + dolmens[i].name + "</b><br />" + dolmens[i].municipi + "<br />";
		if (dolmens[i].wikipedia != "") txt += "<a href=\"http://ca.wikipedia.org/wiki/" + dolmens[i].wikipedia.replace("ca:","") + "\" target=\"_blank\">+info</a>&nbsp;";
		if (dolmens[i].source != "") txt += "<a href=\"" + dolmens[i].source + "\" target=\"_blank\">+info</a>";

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
	var vectorSourceIcones = new ol.source.Vector({
		features: icones
	});

	vectorLayerIcones = new ol.layer.Vector({
		source: vectorSourceIcones
	});

	map.addLayer(vectorLayerIcones);

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
//map.render();
//map.updateSize();
//vectorLayerIcones.redraw(true);
//vectorLayerIcones.getSource().clear();
//vectorLayerIcones.redraw();
//map.render();
//map.renderSync();
}

function init() {

	var dolmens = dolmensC.concat(dolmensCN);
	dolmens.sort(compare);
	var municipi;
	var str_dolmens = "";
	for (var i=0;i<dolmens.length;i++) {
		//console.log(dolmens[i].name);
		if (municipi != dolmens[i].municipi) {
			municipi = dolmens[i].municipi;
			if (i!=0) {
				str_dolmens += "</ul>";
			}
			str_dolmens += municipi + "<br />";
			str_dolmens += "<ul>";
			str_dolmens += "<li>" + dolmens[i].name + "</li>";
		} else {
			str_dolmens += "<li>" + dolmens[i].name + "</li>";
		}
	}
	str_dolmens += "</ul>";
	document.getElementById("llista_dolmens").innerHTML = str_dolmens;
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
