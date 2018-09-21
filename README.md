# ebt-finder
A map for EBT card-holders to locate nearby resources. Check it out [here][1].

### Setup

Use `npm install` from within the package directory to install dependencies for running tests. Then use `npm test`.

The main JavaScript entry-point is ebt-finder.js, which exports the EbtFinder class (currently used for running tests). The site simply adds it to the page using a <script> tag.
  
The app uses [Leaflet][3] for drawing the map along with the [Leaflet.GeoSearch][4] and [Leaflet.Locate][5] plugins for geosearch and geolocation, respectively.

### Notes

I have only tested this with Chrome. Currently it uses some functions that won't work on older/other browsers, such as fetch.

### Attributions

This borrows from [Fresh EBT][2]'s product and uses their icons. As such I have not included a license here.


[1]: https://rebfrank.github.io/ebt-finder/
[2]: https://www.freshebt.com/
[3]: https://leafletjs.com/
[4]: https://github.com/smeijer/leaflet-geosearch
[5]: https://github.com/domoritz/leaflet-locatecontrol
