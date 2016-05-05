(function() {
	'use strict';

	var L = require('leaflet');
	var corslite = require('corslite');
	var polyline = require('polyline');

	L.Routing = L.Routing || {};

	L.Routing.Mapbox = L.Class.extend({
		options: {
			serviceUrl: 'https://api.tiles.mapbox.com/v4/directions/',
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
					data = resp && resp.responseText ? JSON.parse(resp.responseText) : {};
					if (!err && !data.hasOwnProperty('error')) {
						this._routeDone(data, wps, callback, context);
					} else {
						callback.call(context || callback, {
							status: -1,
							message: 'HTTP request failed: ' + (err || data.error)
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
			    indices,
			    i;

			context = context || callback;

			actualWaypoints = this._toWaypoints(inputWaypoints,
				[response.origin].concat(response.waypoints).concat([response.destination]));

			for (i = 0; i < response.routes.length; i++) {
				route = response.routes[i];
				coordinates = polyline.decode(route.geometry, 6);
				indices = this._mapWaypointIndices(actualWaypoints, route.steps, coordinates);
				alts.push({
					name: route.summary,
					coordinates: coordinates,
					instructions: this._convertInstructions(route.steps, indices.stepIndices),
					summary: this._convertSummary(route),
					inputWaypoints: inputWaypoints,
					waypoints: actualWaypoints,
					waypointIndices: indices.waypointIndices
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

		_convertInstructions: function(steps, stepIndices) {
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
						distance: step.distance || 0,
						time: step.duration || 0,
						road: step.way_name,
						direction: step.direction,
						index: stepIndices[i]
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
				stepIndices = [],
				wpIndex = 0,
				stepIndex = 0,
				wp = waypoints[wpIndex],
				stepCoord = instructions[stepIndex].maneuver.location.coordinates,
			    i,
			    c;

			for (i = 0; i < coordinates.length; i++) {
				c = coordinates[i];
				if (Math.abs(c[0] - wp.latLng.lat) < 1e-5 &&
					Math.abs(c[1] - wp.latLng.lng) < 1e-5) {
					wpIndices.push(i);
					wp = waypoints[++wpIndex];
				}
				if (stepCoord && Math.abs(c[0] - stepCoord[1]) < 1e-5 &&
					Math.abs(c[1] - stepCoord[0]) < 1e-5) {
					stepIndices.push(i);
					stepIndex++;
					stepCoord = instructions[stepIndex] && instructions[stepIndex].maneuver.location.coordinates;
				}
			}

			// For some reason, Mapbox Directions sometimes doesn't return a coordinate
			// which is exactly the last waypoint; it looks like they might accidentally truncate
			// the last oordinate or similar; this is a workaround: if we're mising the last
			// waypoint, just add the last coordinate as a probable match.
			if (wpIndices.length < waypoints.length && wpIndex === waypoints.length - 1) {
				wpIndices.push(coordinates.length - 1);
			}

			if (wpIndices.length !== waypoints.length) {
				console.warn('Could not find all waypoints in route\'s coordinates. :(');
			}

			return {
				waypointIndices: wpIndices,
				stepIndices: stepIndices
			};
		}
	});

	L.Routing.mapbox = function(accessToken, options) {
		return new L.Routing.Mapbox(accessToken, options);
	};

	module.exports = L.Routing.Mapbox;
})();
