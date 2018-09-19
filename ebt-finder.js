const filters = {
    Unknown: L.layerGroup()
};
const layerControl = L.control.layers(null, filters, { collapsed: false })

function processProviderData(data)
{
    // for simplicity in case we want to display a list of results,
    // clear out all markers
    Object.values(filters).forEach(function (filter, index) {
        filter.clearLayers();
    });
    data.filters.forEach(function (filter, index) {
        if (!(filter in filters))
        {
            filters[filter] = L.layerGroup();
            filters[filter].addTo(ebtResourcesMap);
            layerControl.addOverlay(filters[filter],
                                    filter.charAt(0).toUpperCase() + filter.slice(1));
        }
    });
    data.stores.forEach(function (store, index) {
        const markerOpts = {};
        if (store.icon) {
            markerOpts.icon = L.icon( {
                iconUrl: store.icon
            });
        }
        const marker = L.marker([store.latitude, store.longitude], markerOpts);
        marker.bindPopup(store.store_name);
        filters[store.type || "Unknown"].addLayer(marker);
    });
}

function onProvidersReceived(response)
{
    if (response.status !== 200) {
        console.log('Problem with fetch. Status: ' + response.status);
        return;
    }
    response.json().then(processProviderData);
}

function fetchProviders(latitude, longitude)
{
    const ebtProvidersBaseUrl = "https://www.easyfoodstamps.com/"
    const url = ebtProvidersBaseUrl + "stores?latitude=" + latitude +
        "&longitude=" + longitude
    fetch(url)
        .then(onProvidersReceived)
        .catch(function(err) {
            console.log('Fetch error :-S', err);
        });
}

function onGotCurrentPosition(position) 
{
    ebtResourcesMap.panTo(L.latLng(position.coords.latitude,
                          position.coords.longitude))
}

function onLocationChange(e) 
{
    latLng = e.target.getCenter();
    fetchProviders(latLng.lat, latLng.lng);
}

const ebtResourcesMap = L.map('mapid').setView([51.505, -0.09], 13);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoicmViZnJhbmsiLCJhIjoiY2ptOGIzcGZtMGs5cjN3bGt5dTM1bW1lbyJ9.-x71lERJRTdscGneZMFtUg'
}).addTo(ebtResourcesMap);
ebtResourcesMap.on('moveend', onLocationChange)
Object.values(filters).forEach(function (filter, index) {
    filter.addTo(ebtResourcesMap);
});
layerControl.addTo(ebtResourcesMap)
navigator.geolocation.getCurrentPosition(onGotCurrentPosition)

