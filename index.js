// NOTE: This is my (Per Liedman) demo token. Please DO NOT use
// it in your application. You need to get your own Mapbox account and token.
// I *WILL* recycle this token once in a while, and your app while break if
// you use this token. Thank you.
var accessToken = 'pk.eyJ1IjoibGllZG1hbiIsImEiOiJPRTJiMzV3In0.GjD_YP84NU33OEKXHcGUnQ',
	map = L.map('map'),
	geocoder = L.Control.Geocoder.mapbox(accessToken);

// Trick to get autocomplete working
geocoder.suggest = geocoder.geocode;

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.Routing.control({
	waypoints: [
		L.latLng(37.7363,-122.4511),
		L.latLng(37.4294,-121.8694)
	],
	geocoder: geocoder,
	router: new L.Routing.Mapbox(accessToken),
	routeWhileDragging: true
}).addTo(map);
