var map;
var mapData;
var scale;
var offset = 128;
var leftOpen = false;
var rightOpen = false;
var heat;
var itemData;
var legacySpawnData;

function showTable(tableId) {
	$("#modal").html("");
	if(itemData != null) {
		$("#modal").append("<h1>"+mapData.itemTables[tableId].category+"</h1>");
		$table = $('<table></table>');
		$.each(mapData.itemTables[tableId].contains, function(key, val) {
			if(val.subcategory == "Legacy Spawn Data") {
				$table.append("<tr><th colspan='2'>"+val.subcategory+"</th></tr>");
				$.each(val.contains, function(key2, val2) {
					$table.append("<tr class='rarity_"+itemData[val2].rarity.toLowerCase()+"'><td><img class='icon' src='Images/Icons/"+itemData[val2].name+"_"+val2+".png' /></td><td><span>"+itemData[val2].name+"</span></td></tr>");
				});

			} else {
				$table.append("<tr><th colspan='2'>"+val.subcategory+"</th><th>"+(100*val.probability).toFixed(1)+"%</th></tr>");
				$.each(val.contains, function(key2, val2) {
					$table.append("<tr class='rarity_"+itemData[val2].rarity.toLowerCase()+"'><td><img class='icon' src='Images/Icons/"+itemData[val2].name+"_"+val2+".png' /></td><td><span>"+itemData[val2].name+"</span></td><td>"+(100*val.probability/val.contains.length).toFixed(1)+"%</td></tr>");
				});
			}
		});
		$("#modal").append($table);
	} else {
		$("#modal").html("Item data not yet loaded, please try again in a few seconds");
	}
	$('#modal').modal();
}

function filterChange() {
	if($("#catfilter").is(':checked')) {
		$("#itemFilter").hide();
		$("#itemTables").show();
	} else if($("#spesificfilter").is(':checked')) {
		$("#itemTables").hide();
		$("#itemFilter").show();
	}
	redrawItems(true);
}

function redrawItems(update) {
	if($("#spesificfilter").is(':checked')) {
		var filter= []; 
		$('#itemSelect :selected').each(function(i, selected){ 
		  filter[i] = $(selected).val();
		});
		
		$.each(mapData.itemTables, function(key, val) {
			val.weight = 0;
			$.each(filter, function( index, value ) {
			  if(val.items && val.items[value]) {
				val.weight+=val.items[value];
			  }
			});
		});
	}
	var h = [];
	$.each(mapData.itemSpawnpoints, function(key, val) {
		if($(".option[data-value='"+val.type+"']").is(':checked') && $("#catfilter").is(':checked')) {
			h.push([val.y / scale - offset, val.x / scale + offset, 1]);
		} else {
			if(mapData.itemTables[val.type].weight && mapData.itemTables[val.type].weight > 0) {
				h.push([val.y / scale - offset, val.x / scale + offset, mapData.itemTables[val.type].weight]);
			}
		}
	});
	
	if(update) {
		if(!map.hasLayer(heat)) heat.addTo(map);
		heat.setLatLngs(h);
	} else {
		return h;
	}	
}
	function sidebarToggle(name, opened) {
		if ($(window).width() > 960) {
			if(name == "left") {
				if(opened) {
					leftOpen = true;
					$("#map").css('width', '100%').css('width', '-=260px');
					$("#map").css("margin", "0 0 0 260px"); /*top right bottom left*/
				} else {
					leftOpen = false;
					if(!rightOpen) {
						$("#map").css("margin", "0");
						$("#map").css("width", "100%");
					}
				}
			} else if(name == "right") {
				if(opened) {
					rightOpen = true;	
					$("#map").css('width', '100%').css('width', '-=260px');
					$("#map").css("margin", "0 260px 0 0"); /*top right bottom left*/
				} else {
					rightOpen = false;
					if(!leftOpen) {
						$("#map").css("margin", "0");
						$("#map").css("width", "100%");
					}
				}
			}
		}
	}
	function loadSidebars() {
		if ($(window).width() > 960) {
				$('#left-menu').sidr({
				  name: 'sidr-left',
				  side: 'left',
				  displace: false,
				  speed: 1,
				  onOpen: function() { sidebarToggle("left", true)},
				  onClose: function() { sidebarToggle("left", false)}
				});
				
				$('#right-menu').sidr({
				  name: 'sidr-right',
				  side: 'right',
				  displace: false,
				  speed: 1,
				  onOpen: function() { sidebarToggle("right", true)},
				  onClose: function() { sidebarToggle("right", false)}
				});
			} else {
				$('#left-menu').sidr({
				  name: 'sidr-left',
				  side: 'left',
				  displace: true,
				  onOpen: function() { sidebarToggle("left", true)},
				  onClose: function() { sidebarToggle("left", false)}
				});
				
				$('#right-menu').sidr({
				  name: 'sidr-right',
				  side: 'right',
				  displace: true,
				  onOpen: function() { sidebarToggle("right", true)},
				  onClose: function() { sidebarToggle("right", false)}
				});
			}
	}

function loadMap(mapName, firstTime) {
	var hasHeat = false;
	if(map && heat) hasHeat = map.hasLayer(heat);
	$.sidr('close', 'sidr-right');
	$.sidr('close', 'sidr-left');
	$("#map").css("margin", "0");
	$("#map").css("width", "100%");
	
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
	            scale = (1024 - 64 * 2) / 256;
	            var maxNativeZoom = 4;
	            break;
	        case "MEDIUM":
	            scale = (2048 - 64 * 2) / 256;
	            var maxNativeZoom = 5;
	            break;
	        default:
	            scale = (4096 - 64 * 2) / 256;
	            var maxNativeZoom = 6;
	    }
		if(typeof map !== 'undefined' && typeof map.remove === 'function') {
			map.remove();
		}

	    map = L.map('map', {
	        crs: L.CRS.Simple,
			attributionControl: false,
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
		var deadzones = L.layerGroup();
		var water = L.layerGroup();
		var fuel = L.layerGroup();
		var vehicles = L.layerGroup();

	    var noIcon = L.icon({
	        iconUrl: 'Images/none.png',
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
		
		var waterIcon = L.icon({
	        iconUrl: 'Images/water.png',
	        iconSize: [18, 18],
	        iconAnchor: [9, 9],
	        popupAnchor: [0, 0],
	    });
		
		var fuelIcon = L.icon({
	        iconUrl: 'Images/fuel.png',
	        iconSize: [18, 18],
	        iconAnchor: [9, 9],
	        popupAnchor: [0, 0],
	    });
		
		var vehicleIcon = L.icon({
	        iconUrl: 'Images/car.png',
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
	        } else if(val.type == "DEADZONE") {
				L.circle([val.y / scale - offset, val.x / scale + offset], val.radius / scale, {
					color: '#bf9b30',
					weight: 1,
					fillColor: '#ffff00',
					fillOpacity: 0.1
					}).addTo(deadzones);
			}
	    });
	    mapMarkers.addTo(map);
		
		$.each(data.objects, function(key, val) {
	        if (val.type == "WATER") {
	            var marker = new L.marker([val.y / scale - offset, val.x / scale + offset], {
	                icon: waterIcon,
					title: val.name
	            });
	            marker.addTo(water);
	        } else if (val.type == "FUEL") {
	            var marker = new L.marker([val.y / scale - offset, val.x / scale + offset], {
	                icon: fuelIcon,
					title: val.name
	            });
	            marker.addTo(fuel);
	        }
	    });

		$.each(data.vehicleSpawnpoints, function(key, val) {
			var marker = new L.marker([val.y / scale - offset, val.x / scale + offset], {
				icon: vehicleIcon
			});
			marker.addTo(vehicles);
	    });

	    var zombieZones = L.layerGroup();
	    $.each(data.bounds, function(key, val) {
	        L.rectangle([
	            [val.corners[3] / scale - offset, val.corners[2] / scale + offset],
	            [val.corners[1] / scale - offset, val.corners[0] / scale + offset]
	        ], {
	            color: "#ff0000",
	            weight: .15,
				fillColor: '#ff0000',
				fillOpacity: 0.1
	        }).addTo(zombieZones);
	    });
		
		$("#itemTables").html("");
		$(".itemSelection").prop("disabled", true);
		$.each(data.itemTables, function(key, val) {
			if(val.contains.length < 1) {
				var ilist = [];
				if(legacySpawnData[val.id]) {
					val.items = legacySpawnData[val.id].items;
					$.each(legacySpawnData[val.id].items, function(key2, val2) {
						ilist.push(key2);
					});
					val.contains = [{
									  "subcategory": "Legacy Spawn Data",
									  "probability": 1,
									  "contains": ilist
									}];
				}
			}
			if(val.contains.length > 0) {
				$li = $('<li></li>');
				$li.append('<label style="float:left;clear: both;"><input type="checkbox" class="option" id="category_'+val.id+'" data-value="'+key+'" checked> '+val.category+'</label><button data-value="'+key+'" class="tblbtn">Table</button>');
				$("#itemTables").append($li);
			}
			$.each(val.contains, function(key2, val2) {
				$.each(val2.contains, function(key3, val3) {
					$(".itemSelection[value='"+val3+"']").prop("disabled", false);
				});
			});
			
		});
		$(".chosen-container").trigger("chosen:updated");
		
		$(".tblbtn").each(function( index ) {
			$(this).click(function() {
				showTable($(this).data( "value" ));
			});
		});
		
		var mylist = $('#itemTables');
		var listitems = mylist.children('li').get();
		listitems.sort(function(a, b) {
			return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
		})
		$.each(listitems, function(idx, itm) { mylist.append(itm); });
		
		$buttonLi = $('<li style="clear: both;"></li>');
		$all = "<button id='all'>All</button>"
		$none = " <button id='none'>None</button>"
		$buttonLi.append($all);
		$buttonLi.append($none);
		$("#itemTables").append($buttonLi);
		$("#all").click(function() {
		  $('#itemTables').find('input[type="checkbox"]').prop({
			checked: true
		  });
		  redrawItems(true);
		});
		$("#none").click(function() {
		  $('#itemTables').find('input[type="checkbox"]').prop({
			checked: false
		  });
		  redrawItems(true);
		});
		
		$('.option').change(function(e) {
			redrawItems(true);
		 });
		 
		var h = redrawItems(false);
		 
		heat = L.heatLayer(h, {
	        radius: 15,
	        minOpacity: 0.4
	    });		

	    var overlayMaps = {
	        "Places": mapMarkers,        
	        "Item Spawns": heat,
			"Vehicle Spawns": vehicles,
			"Water": water,
			"Fuel": fuel,
			"Airdrop Locations": airdrops,
			"Deadzones": deadzones,
			"Zombie Zones": zombieZones
			
	    };
	    L.control.layers({}, overlayMaps).addTo(map);
		
		var leftmenu = L.control({position: 'bottomleft'});
		leftmenu.onAdd = function(map){
			var div = L.DomUtil.create('div', 'menubtn');
			div.innerHTML= '<a class="leaflet-control-layers leaflet-control" id="left-menu" href="#left-menu"></a>';
			return div;
		}
		leftmenu.addTo(map);
		
		var rightmenu = L.control({position: 'bottomright'});
		rightmenu.onAdd = function(map){
			var div = L.DomUtil.create('div', 'menubtn');
			div.innerHTML= '<a class="leaflet-control-layers leaflet-control" id="right-menu" href="#right-menu"></a>';
			return div;
		}
		rightmenu.addTo(map);
		
		loadSidebars();
		if(firstTime && hasHeat) setTimeout(function(){redrawItems(true);}, 500);

	});
	
}

$(".maplink").each(function() {
	$(this).css("background-image", "url('Images/"+$(this).data( "name" )+".jpg')");
});

$(".maplink").click(function() {
	loadMap($(this).data( "name" ), true);
});

$(document).ready(function() {
	$.getJSON("Data/Common/legacyTables.json", function(data2) {
		legacySpawnData = data2;
		$.getJSON("Data/Common/items.json", function(data) {
			$.each(data, function(key, val) {
				$("#itemSelect").append("<option class='itemSelection' value='"+key+"' disabled>"+val.name+"</option>");
			});
			itemData = data;
			$(".chosen-container").chosen().change(function(){redrawItems(true)});
			
			loadMap(window.location.hash.substr(1), false);
			$(".filteroption").click(function() {
				filterChange();
			});
		});
	});
});

$( window ).resize(function() {
	$.sidr('close', 'sidr-right');
	$.sidr('close', 'sidr-left');
	$("#map").css("margin", "0");
	$("#map").css("width", "100%");
	loadSidebars();
});


