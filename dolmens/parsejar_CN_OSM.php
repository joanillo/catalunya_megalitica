<?php
$osm = simplexml_load_file('CN_menhirs_OSM.xml');
foreach ($osm->children() as $elem) { 
	//echo "***".$elem->getName() ."\n";
	if ($elem->getName() == "node") {
		$name = "";
		$wikidata = "";
		$municipi = "";
		$lat = "";
		$lon = "";
		$lat = $elem->attributes()->lat;
		$lon = $elem->attributes()->lon;
		//echo $lat."\t".$lon."\t";
		
		foreach ($elem->children() as $tags) {
			$tag_k = $tags->attributes()->k;
			$tag_v = $tags->attributes()->v;
			//echo $tag;
			if ($tag_k=="name") $name = $tag_v;
			if ($tag_k=="wikidata") $wikidata = $tag_v;
		}
	} else if ($elem->getName() == "area") {
		foreach ($elem->children() as $tags) {
			$tag_k = $tags->attributes()->k;
			$tag_v = $tags->attributes()->v;
			//echo $tag;
			if ($tag_k=="name") {
				$municipi = $tag_v;
				echo $name."\t".$municipi."\t".$lat."\t".$lon."\t\t\t\t".$wikidata."\n";
			}
		}
	}
}
?>