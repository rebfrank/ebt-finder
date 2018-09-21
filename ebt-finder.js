function EbtFinder(divId)
{
    this.divId = divId;
    this.map = L.map(this.divId);
}

EbtFinder.prototype.init = function()
{
    this.map.zoomControl.setPosition('bottomright');

    this.locateControl = L.control.locate( {
        position: 'bottomright',
        keepCurrentZoomLevel: true
    }).addTo(this.map);

    this.provider = new GeoSearch.OpenStreetMapProvider();
    this.searchControl = new GeoSearch.GeoSearchControl({
        provider: this.provider,
        style: 'button',
        retainZoomLevel: true,
        autoClose: true,
        keepResult: true
    });
    this.map.addControl(this.searchControl);

    this.filters = {};
    this.layerControl = L.control.layers(null, null, { collapsed: false })

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

    this.map.setView([40.70851,-73.90896], 13);
}

EbtFinder.prototype.getUserFriendlyFilterName = function(rawFilterName)
{
    const filterNames = {
        store: "Stores",
        market: "Markets",
        foodbank: "Food Banks",
        snapoffice: "Snap Offices",
        wicoffice: "WIC Offices"
    };
    return filterNames[rawFilterName] || rawFilterName.charAt(0).toUpperCase() + rawFilterName.slice(1);
}

EbtFinder.prototype.processProvider = function(provider)
{
    // Assumption: all items without a "type" and/or "icon" are stores
    const markerOpts = {
        icon: L.icon( {
            iconUrl: provider.icon || "store-icon.png"
        })
    };
    const marker = L.marker([provider.latitude, provider.longitude], markerOpts);
    marker.bindPopup(provider.store_name);
    this.filters[provider.type || "store"].addLayer(marker);
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
                                    this.getUserFriendlyFilterName(filter));
        }
    }.bind(this));
    data.stores.forEach(this.processProvider.bind(this));
    data.other.forEach(this.processProvider.bind(this));
}

EbtFinder.prototype.fetchProviders = function(latitude, longitude)
{
    const ebtProvidersBaseUrl = "https://www.easyfoodstamps.com/"
    const url = ebtProvidersBaseUrl + "stores?latitude=" + latitude +
        "&longitude=" + longitude
    return fetch(url);
}

EbtFinder.prototype.onLocationChange = function(e) 
{
    var latLng = e.target.getCenter();
    return this.fetchProviders(latLng.lat, latLng.lng)
        .then(function(response) {
            if (!response.ok) throw new Error('Failed to retrieve providers. Status: ' + response.status);
            return response.json();
        })
        .then(this.processProviderData.bind(this))
        .catch(function(err) {
            alert("We're unable to search for providers in your area right now. Please try again.");
        });
}


// Handle node-style exporting for running tests or running in browser
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = EbtFinder;
