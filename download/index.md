---
layout: default
---

[Leaflet Routing Machine / Mapbox](https://github.com/perliedman/lrm-mapbox)
================================

Download prebuilt files:

<ul>
{% for version in site.data.versions reversed %}
  <li>
    <a href="{{site.baseurl}}/dist/lrm-mapbox-{{ version.version }}.js">
      lrm-mapbox-{{ version.version }}.js
    </a>
    (<a href="{{site.baseurl}}/dist/lrm-mapbox-{{ version.version }}.min.js">
      lrm-mapbox-{{ version.version }}.min.js
    </a>)
  </li>
{% endfor %}
</ul>

Just load one of these files with a `<script>` tag in your page, after
Leaflet and Leaflet Routing Machine has been loaded.

Or, to use with for example Browserify:

```sh
npm install --save lrm-mapbox
```

See the [lrm-mapbox project page](https://github.com/perliedman/lrm-mapbox) for info 
and docs on using the plugin.
