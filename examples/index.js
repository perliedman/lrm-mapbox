var map = L.map('map');

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.Routing.control({
	waypoints: [
		L.latLng(57.74, 11.94),
		L.latLng(57.6792, 11.949)
	],
	geocoder: L.Control.Geocoder.nominatim(),
    // NOTE: This is my (Per Liedman) demo token. Please DO NOT use
    // it in your application. You need to get your own Mapbox account and token.
    // I *WILL* recycle this token once in a while, and your app while break if
    // you use this token. Thank you.
    router: new L.Routing.Mapbox('pk.eyJ1IjoibGllZG1hbiIsImEiOiJPRTJiMzV3In0.GjD_YP84NU33OEKXHcGUnQ'),
    routeWhileDragging: true
}).addTo(map);
