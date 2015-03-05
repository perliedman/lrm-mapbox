Leaflet Routing Machine / Mapbox
================================

[![npm version](https://img.shields.io/npm/v/lrm-mapbox.svg)](https://www.npmjs.com/package/lrm-mapbox)

Extends [Leaflet Routing Machine](https://github.com/perliedman/leaflet-routing-machine) with support for [Mapbox's directions API](https://www.mapbox.com/developers/api/directions/).

[See the lrm-mapbox demo](http://www.liedman.net/lrm-mapbox/)

Some brief instructions follow below, but the [Leaflet Routing Machine tutorial on alternative routers](http://www.liedman.net/leaflet-routing-machine/tutorials/alternative-routers/) is recommended.

## Installing

Go to the [download page](http://www.liedman.net/lrm-mapbox/download/) to get the script
to include in your page. Put the script after Leaflet and Leaflet Routing Machine has been
loaded.

To use with for example Browserify:

```sh
npm install --save lrm-mapbox
```

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
