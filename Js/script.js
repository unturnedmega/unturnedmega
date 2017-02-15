var mapData;
var map;

function loadMap(mapName, firstTime) {
	if (mapName == "" || /\W/.test(mapName)) mapName = "PEI";
	
	var l = "Click";
	if(firstTime) {
		l = "Load";
	}
	ga('send', {
	  hitType: 'event',
	  eventCategory: 'Maps',
	  eventAction: mapName,
	  eventLabel: l
	});

	$.getJSON("Data/" + mapName + ".json", function(data) {
		mapData = data;
	    switch (data.size) {
	        case "SMALL":
	            var scale = (1024 - 64 * 2) / 256;
	            var maxNativeZoom = 4;
	            var offset = 128;
	            break;
	        case "MEDIUM":
	            var scale = (2048 - 64 * 2) / 256;
	            var maxNativeZoom = 5;
	            var offset = 128;
	            break;
	        default:
	            var scale = (4096 - 64 * 2) / 256;
	            var maxNativeZoom = 6;
	            var offset = 128;
	    }
		if(typeof map !== 'undefined' && typeof map.remove === 'function') {
			map.remove();
		}

	    map = L.map('map', {
	        crs: L.CRS.Simple,
	        minZoom: 1,
	        maxZoom: 8,
			fullscreenControl: true,
			  fullscreenControlOptions: {
				position: 'topleft'
			  }
	    });

	    var mapBounds = new L.LatLngBounds(
	        map.unproject([0, 8192], 5),
	        map.unproject([8192, 0], 5));

	    map.fitBounds(mapBounds);

	    layer = L.tileLayer('Maps/' + mapName + '/{z}/{x}/{y}.jpg', {
	        minZoom: 0,
	        maxNativeZoom: maxNativeZoom,
	        maxZoom: 8,
	        bounds: mapBounds,
	        noWrap: true,
	        tms: false
	    }).addTo(map);

	    var mapMarkers = L.layerGroup();
	    var airdrops = L.layerGroup();

	    var noIcon = L.icon({
	        iconUrl: 'none.png',
	        iconSize: [0, 0],
	        iconAnchor: [0, 0],
	        popupAnchor: [0, 0],
	    });

	    var crateIcon = L.icon({
	        iconUrl: 'Images/airdrop.png',
	        iconSize: [18, 18],
	        iconAnchor: [9, 9],
	        popupAnchor: [0, 0],
	    });

	    $.each(data.nodes, function(key, val) {
	        if (val.name) {
	            var marker = new L.marker([val.y / scale - offset, val.x / scale + offset], {
	                icon: noIcon,
	                opacity: 0
	            });
	            marker.bindTooltip(val.name, {
	                permanent: true,
	                className: "mapMarker",
	                offset: [0, 0],
	                direction: "center"
	            });
	            marker.addTo(mapMarkers);
	        }
	        if (val.type == "AIRDROP") {
	            var marker = new L.marker([val.y / scale - offset, val.x / scale + offset], {
	                icon: crateIcon
	            });
	            marker.addTo(airdrops);
	        }
	    });
	    mapMarkers.addTo(map);


	    var zombieZones = L.layerGroup();
	    $.each(data.bounds, function(key, val) {
	        L.rectangle([
	            [val.corners[3] / scale - offset, val.corners[2] / scale + offset],
	            [val.corners[1] / scale - offset, val.corners[0] / scale + offset]
	        ], {
	            color: "#ff0000",
	            weight: .15
	        }).addTo(zombieZones);
	    });
		
	    var h = [];

	    $.each(data.itemSpawnpoints, function(key, val) {
	        h.push([val.y / scale - offset, val.x / scale + offset, 1]);
	    });

	    var heat = L.heatLayer(h, {
	        radius: 15,
	        minOpacity: 0.4
	    });
	

	    var overlayMaps = {
	        "Places": mapMarkers,
	        "Zombie Zones": zombieZones,
	        "Item Spawns": heat,
	        "Airdrop Locations": airdrops
	    };
	    L.control.layers({}, overlayMaps).addTo(map);
		
		var logo = L.control({position: 'bottomright'});
		logo.onAdd = function(map){
			var div = L.DomUtil.create('div', 'myclass');
			div.innerHTML= "<img src='Images/logo.png'/>";
			return div;
		}
		logo.addTo(map);
	});
}

$(".maplink").each(function() {
	$(this).css("background-image", "url('Images/"+$(this).data( "name" )+".jpg')");
});

$(".maplink").click(function() {
	loadMap($(this).data( "name" ), true);
});

loadMap(window.location.hash.substr(1), false);