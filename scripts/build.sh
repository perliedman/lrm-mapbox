#!/bin/sh

VERSION=`echo "console.log(require('./package.json').version)" | node`

echo Building dist files for $VERSION...
mkdir -p dist
browserify -t browserify-shim src/L.Routing.Mapbox.js >dist/lrm-mapbox.js
uglifyjs dist/lrm-mapbox.js >dist/lrm-mapbox.min.js
echo Done.
