const ebtProvidersBaseUrl = "https://www.easyfoodstamps.com/"

function processProviderData(data)
{
    const filters = {
        unknown: L.layerGroup()
    };
    data.filters.forEach(function (filter, index) {
        filters[filter] = L.layerGroup();
    });
    data.stores.forEach(function (store, index) {
        var marker = L.marker([store.latitude, store.longitude]);
        marker.bindPopup(store.store_name);
        filters[store.type || "unknown"].addLayer(marker);
    });
    Object.values(filters).forEach(function (filter, index) {
        filter.addTo(ebtResourcesMap);
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

var ebtResourcesMap = L.map('mapid').setView([51.505, -0.09], 13);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoicmViZnJhbmsiLCJhIjoiY2ptOGIzcGZtMGs5cjN3bGt5dTM1bW1lbyJ9.-x71lERJRTdscGneZMFtUg'
}).addTo(ebtResourcesMap);
ebtResourcesMap.on('moveend', onLocationChange)
navigator.geolocation.getCurrentPosition(onGotCurrentPosition)
