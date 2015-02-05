(function() {
	'use strict';

	var L = require('leaflet');
	var corslite = require('corslite');
	var polyline = require('polyline');

	L.Routing = L.Routing || {};

	L.Routing.Mapbox = L.Class.extend({
		options: {
			serviceUrl: '//api.tiles.mapbox.com/v4/directions/',
			timeout: 30 * 1000,
			profile: 'mapbox.driving'
		},

		initialize: function(accessToken, options) {
			L.Util.setOptions(this, options);
			this._accessToken = accessToken;
		},

		route: function(waypoints, callback, context, options) {
			var timedOut = false,
				wps = [],
				url,
				timer,
				wp,
				i;

			options = options || {};
			url = this.buildRouteUrl(waypoints, options);

			timer = setTimeout(function() {
								timedOut = true;
								callback.call(context || callback, {
									status: -1,
									message: 'OSRM request timed out.'
								});
							}, this.options.timeout);

			// Create a copy of the waypoints, since they
			// might otherwise be asynchronously modified while
			// the request is being processed.
			for (i = 0; i < waypoints.length; i++) {
				wp = waypoints[i];
				wps.push({
					latLng: wp.latLng,
					name: wp.name,
					options: wp.options
				});
			}

			corslite(url, L.bind(function(err, resp) {
				var data;

				clearTimeout(timer);
				if (!timedOut) {
					if (!err) {
						data = JSON.parse(resp.responseText);
						this._routeDone(data, wps, callback, context);
					} else {
						callback.call(context || callback, {
							status: -1,
							message: 'HTTP request failed: ' + err
						});
					}
				}
			}, this), true);

			return this;
		},

		_routeDone: function(response, inputWaypoints, callback, context) {
			var alts = [],
				route,
				coordinates,
			    actualWaypoints,
			    i;

			context = context || callback;

			actualWaypoints = this._toWaypoints(inputWaypoints,
				[response.origin].concat(response.waypoints).concat([response.destination]));

			for (i = 0; i < response.routes.length; i++) {
				route = response.routes[i];
				coordinates = polyline.decode(route.geometry, 6);
				alts.push({
					name: route.summary,
					coordinates: coordinates,
					instructions: this._convertInstructions(route.steps),
					summary: this._convertSummary(route),
					inputWaypoints: inputWaypoints,
					waypoints: actualWaypoints,
					waypointIndices: this._mapWaypointIndices(actualWaypoints, route.steps, coordinates)
				});
			}

			callback.call(context, undefined, alts);
		},

		_toWaypoints: function(inputWaypoints, vias) {
			var wps = [],
			    i,
			    c;
			for (i = 0; i < vias.length; i++) {
				c = vias[i].geometry.coordinates;
				wps.push({
					latLng: L.latLng(c[1], c[0]),
					name: vias[i].properties.name,
					options: inputWaypoints[i].options
				});
			}

			return wps;
		},

		buildRouteUrl: function(waypoints, options) {
			var locs = [],
			    computeInstructions,
			    computeAlternative,
			    locationKey;

			for (var i = 0; i < waypoints.length; i++) {
				locationKey = this._locationKey(waypoints[i].latLng);
				locs.push((i ? ';' : '') + locationKey);
			}

			computeAlternative = computeInstructions =
				!(options && options.geometryOnly);

			return this.options.serviceUrl + this.options.profile + '/' + locs + '.json?' +
				'instructions=' + computeInstructions + '&' +
				'alternatives=' + computeAlternative + '&' +
				'geometry=polyline&access_token=' + this._accessToken;
		},

		_locationKey: function(location) {
			return location.lng + ',' + location.lat;
		},

		_convertSummary: function(route) {
			return {
				totalDistance: route.distance,
				totalTime: route.duration
			};
		},

		_convertInstructions: function(steps) {
			var result = [],
			    i,
			    step,
			    type;

			for (i = 0; i < steps.length; i++) {
				step = steps[i];
				type = this._drivingDirectionType(step.maneuver);
				if (type) {
					result.push({
						type: type,
						distance: step.distance,
						time: step.duration,
						road: step.way_name,
						direction: step.direction,
						index: step[3]
					});
				}
			}

			return result;
		},

		_drivingDirectionType: function(maneuver) {
			switch (maneuver.type) {
			case 'continue':
				return 'Straight';
			case 'bear right':
				return 'SlightRight';
			case 'turn right':
				return 'Right';
			case 'sharp right':
				return 'SharpRight';
			case 'u-turn':
				return 'TurnAround';
			case 'sharp left':
				return 'SharpLeft';
			case 'turn left':
				return 'Left';
			case 'bear left':
				return 'SlightLeft';
			case 'waypoint':
				return 'WaypointReached';
			case 'depart':
				// TODO: "Head on"
				// https://github.com/DennisOSRM/Project-OSRM/blob/master/DataStructures/TurnInstructions.h#L48
				return 'Straight';
			case 'enter roundabout':
				return 'Roundabout';
			case 'arrive':
				return 'DestinationReached';
			default:
				return null;
			}
		},

		_mapWaypointIndices: function(waypoints, instructions, coordinates) {
			var wpIndices = [],
				wpIndex = 0,
				wp = waypoints[wpIndex],
			    i,
			    c;

			for (i = 0; i < coordinates.length; i++) {
				c = coordinates[i];
				if (Math.abs(c[0] - wp.latLng.lat) < 1e-5 &&
					Math.abs(c[1] - wp.latLng.lng) < 1e-5) {
					wpIndices.push(i);
					wp = waypoints[++wpIndex];
				}
			}

			return wpIndices;
		}
	});

	L.Routing.mapbox = function(accessToken, options) {
		return new L.Routing.Mapbox(accessToken, options);
	};

	module.exports = L.Routing.Mapbox;
})();
