Leaflet Routing Machine / Mapbox
================================

[[!npm version](https://img.shields.io/npm/v/leaflet-routing-machine.svg)](https://www.npmjs.com/package/lrm-mapbox)

Extends [Leaflet Routing Machine](https://github.com/perliedman/leaflet-routing-machine) with support for [Mapbox's directions API](https://www.mapbox.com/developers/api/directions/).

_Note_: This lib is under active development. Beware that this might be more unstable than the usual ad hoc OSS you pick up. Feedback, issues or pull requests are of course very welcome.

## Installing

To use with for example Browserify:

```sh
npm install --save lrm-mapbox
```

There's not pre-built files yet, but I will get to it.

## Using

There's a single class exported by this module, `L.Routing.Mapbox`. It implements the [`IRouter`](http://www.liedman.net/leaflet-routing-machine/api/#irouter) interface. Use it to replace Leaflet Routing Machine's default OSRM router implementation:

```javascript
var L = require('leaflet');
require('leaflet-routing-machine');
require('lrm-mapbox'); // This will tack on the class to the L.Routing namespace

L.Routing.control({
    router: new L.Routing.Mapbox('your mapbox access token'),
}).addTo(map);
```

Note that you will need to pass a valid Mapbox access token to the constructor.
