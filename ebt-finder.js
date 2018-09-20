function EbtFinder(divId)
{
    this.divId = divId;
    this.map = L.map(this.divId).setView([51.505, -0.09], 13);
}

EbtFinder.prototype.init = function()
{
    this.filters = {
        Unknown: L.layerGroup()
    };
    this.layerControl = L.control.layers(null, this.filters, { collapsed: false })

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoicmViZnJhbmsiLCJhIjoiY2ptOGIzcGZtMGs5cjN3bGt5dTM1bW1lbyJ9.-x71lERJRTdscGneZMFtUg'
    }).addTo(this.map);
    this.map.on('moveend', this.onLocationChange.bind(this))
    Object.keys(this.filters).map(function (filter, index) {
        this.filters[filter].addTo(this.map);
    }.bind(this));
    this.layerControl.addTo(this.map)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.onGotCurrentPosition.bind(this));
    }
}

EbtFinder.prototype.processProviderData = function(data)
{
    // for simplicity in case we want to display a list of results,
    // clear out all markers
    Object.keys(this.filters).map(function (filter, index) {
        this.filters[filter].clearLayers();
    }.bind(this));
    data.filters.forEach(function (filter, index) {
        if (!(filter in this.filters))
        {
            this.filters[filter] = L.layerGroup();
            this.filters[filter].addTo(this.map);
            this.layerControl.addOverlay(this.filters[filter],
                                    filter.charAt(0).toUpperCase() + filter.slice(1));
        }
    }.bind(this));
    data.stores.forEach(function (store, index) {
        const markerOpts = {};
        if (store.icon) {
            markerOpts.icon = L.icon( {
                iconUrl: store.icon
            });
        }
        const marker = L.marker([store.latitude, store.longitude], markerOpts);
        marker.bindPopup(store.store_name);
        this.filters[store.type || "Unknown"].addLayer(marker);
    }.bind(this));
}

EbtFinder.prototype.onProvidersReceived = function(response)
{
    if (response.status !== 200) {
        throw new Error('Problem with fetch. Status: ' + response.status);
    }
    return response.json().then(this.processProviderData.bind(this));
}

EbtFinder.prototype.fetchProviders = function(latitude, longitude)
{
    const ebtProvidersBaseUrl = "https://www.easyfoodstamps.com/"
    const url = ebtProvidersBaseUrl + "stores?latitude=" + latitude +
        "&longitude=" + longitude
    return fetch(url)
        .then(this.onProvidersReceived.bind(this))
        .catch(function(err) {
            console.log('Fetch error :-S', err);
        });
}

EbtFinder.prototype.onGotCurrentPosition = function(position) 
{
    this.map.panTo(L.latLng(position.coords.latitude,
                          position.coords.longitude))
}

EbtFinder.prototype.onLocationChange = function(e) 
{
    var latLng = e.target.getCenter();
    return this.fetchProviders(latLng.lat, latLng.lng);
}


// Handle node-style exporting for running tests or running in browser
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = EbtFinder;
