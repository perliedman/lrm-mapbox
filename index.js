var map = L.map('map'),
	geocoder = L.Control.Geocoder.mapbox(LRM.apiToken);

// Trick to get autocomplete working
geocoder.suggest = geocoder.geocode;

L.tileLayer('https://a.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + LRM.apiToken, {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.Routing.control({
	waypoints: [
		L.latLng(37.7363,-122.4511),
		L.latLng(37.4294,-121.8694)
	],
	geocoder: geocoder,
	router: new L.Routing.Mapbox(LRM.apiToken),
	routeWhileDragging: true
}).addTo(map);
