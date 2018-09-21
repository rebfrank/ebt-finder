const mockData = { 
    filters: ["store", "market"],
    stores: [{
                 address: "219 Saint Nicholas Ave", 
                 "address line #2": "", 
                 city: "Brooklyn", 
                 county: "KINGS", 
                 latitude: 40.703335, 
                 longitude: -73.91449, 
                 state: "NY", 
                 store_name: "219 Quick Stop Corporation", 
                 zip4: "4840", 
                 zip5: "11237",
                 icon: "icon.png"
             }, 
             {
                 address: "281 Saint Nicholas Ave", 
                 "address line #2": "",
                 city: "Ridgewood", 
                 county: "QUEENS", 
                 latitude: 40.701839, 
                 longitude: -73.911987, 
                 state: "NY", 
                 store_name: "Las Lagunas Deli Grocery Corp",
                 zip4: "2149",
                 zip5: "11385",
                 icon: "icon.png"
             }],
    other: []
};

const mockData2 = { 
    filters: ["store", "market"],
    stores: [{
                 address: "220 Saint Nicholas Ave", 
                 "address line #2": "", 
                 city: "Brooklyn", 
                 county: "KINGS", 
                 latitude: 40.71, 
                 longitude: -73.92, 
                 state: "NY", 
                 store_name: "Test Store", 
                 zip4: "4840", 
                 zip5: "11237"
             }, 
             {
                 address: "250 Saint Nicholas Ave", 
                 "address line #2": "",
                 city: "Ridgewood", 
                 county: "QUEENS", 
                 latitude: "40.70", 
                 longitude: "-73.91", 
                 state: "NY", 
                 store_name: "Test Store #2",
                 zip4: "2149",
                 zip5: "11385"
             }],
    other: []
};

const mockData3 = { 
    filters: ["store", "market"],
    other: [{
                 address: "221 Saint Nicholas Ave", 
                 "address line #2": "", 
                 city: "Brooklyn", 
                 county: "KINGS", 
                 latitude: 40.71, 
                 longitude: -73.92, 
                 state: "NY", 
                 store_name: "Test Store #3", 
                 zip4: "4840", 
                 zip5: "11237",
                 type: "market"
             }, 
             {
                 address: "251 Saint Nicholas Ave", 
                 "address line #2": "",
                 city: "Ridgewood", 
                 county: "QUEENS", 
                 latitude: "40.70", 
                 longitude: "-73.91", 
                 state: "NY", 
                 store_name: "Test Store #4",
                 zip4: "2149",
                 zip5: "11385"
             }],
    stores: []
};

const mockResponse = (status, statusText, data) => {
      const resp = {
              status: status,
              statusText: statusText,
              json: () => { return Promise.resolve(data) },
              ok: false
      };
      if (status >= 200 && status <= 299) {
          resp.ok = true;
      };
      return resp;
};

const mockCenter = {
    lat: 40.6,
    lng: -74.2
};

const mockEvent = {
    target: {
        getCenter: () => { return mockCenter; }
    }
};


beforeEach(() => {
    L = require('leaflet');
    GeoSearch = require('leaflet-geosearch');
    C = require('leaflet.locatecontrol');
    EbtFinder = require('./ebt-finder');
    alert = jest.fn()

    document.body.innerHTML = '<div id="mapId"></div>';
    e = new EbtFinder('mapId');
});


test('move the map fetches new providers', () => {
    // set up mocks
    jest.spyOn(e.map, 'on');
    global.fetch = jest.fn().mockImplementation(() => {
        return Promise.resolve(mockResponse(200, null, mockData))
    });
    jest.spyOn(e, 'processProviderData');

    // run init
    e.init();

    // find the call to "on" for "moveend"
    var moveendListeners = e.map.on.mock.calls.filter(call => {
        return call[0] == 'moveend';    
    });
    expect(moveendListeners.length).toBe(1);
    return moveendListeners[0][1](mockEvent)
        .then(() => { expect(e.processProviderData).toBeCalledWith(mockData) });
});

test('generates alert when provider fetch returns error', () => {
    // set up mocks
    jest.spyOn(e.map, 'on');
    global.fetch = jest.fn().mockImplementation(() => {
        return Promise.resolve(mockResponse(400, "Test error status", null))
    });
    jest.spyOn(e, 'processProviderData');

    // mock out setView that gets called during init so it doesn't fetch
    // providers
    e.map.setView = jest.fn().mockImplementation((center, zoom) => { 
        return;
    });

    // run init
    e.init();

    // find the call to "on" for "moveend"
    var moveendListeners = e.map.on.mock.calls.filter(call => {
        return call[0] == 'moveend';    
    });
    expect(moveendListeners.length).toBe(1);
    return moveendListeners[0][1](mockEvent)
        .then(() => { 
            expect(e.processProviderData).toHaveBeenCalledTimes(0);
            expect(alert).toHaveBeenCalledTimes(1);
        });
});

test('generates alert when provider fetch returns error during init', (done) => {
    // set up mocks
    jest.spyOn(e.map, 'on');
    jest.spyOn(e, 'processProviderData');
    e.map.setView = jest.fn().mockImplementation((center, zoom) => {
        return e.onLocationChange(mockEvent)
            .then(() => {
                expect(e.processProviderData).toHaveBeenCalledTimes(0);
                expect(alert).toHaveBeenCalledTimes(1);
                done();
            });
    });
    global.fetch = jest.fn().mockImplementation((url) => {
        return Promise.resolve(mockResponse(400, "Test error status", null))
    });

    // run init, which fetches providers
    e.init();
});

test('processProviderData inits filter list', () => {
    e.init();
    e.processProviderData(mockData);
    expect(Object.keys(e.filters).length).toBe(2);
    expect("store" in e.filters);
    expect("market" in e.filters);
});

test('processProviderData does not delete filters', () => {
    e.init();
    e.filters["OtherFilter"] = L.layerGroup();
    e.processProviderData(mockData);
    expect(Object.keys(e.filters).length).toBe(3);
    expect("store" in e.filters);
    expect("market" in e.filters);
    expect("OtherFilter" in e.filters);
});

test('processProviderData does not duplicate filters', () => {
    e.init();
    e.processProviderData(mockData);
    e.processProviderData(mockData2);
    expect(Object.keys(e.filters).length).toBe(2);
    expect("store" in e.filters);
    expect("market" in e.filters);
});

test('processProviderData clears all markers', () => {
    e.init();
    e.processProviderData(mockData);
    const oldMarkers = e.filters["store"].getLayers();
    expect(oldMarkers.length).toBe(2);
    e.processProviderData(mockData2);
    oldMarkers.forEach(marker => {
        expect(e.filters["store"].hasLayer(marker)).toBeFalsy();
    });
});

test('processProviderData makes new filters visible', () => {
    e.init();
    e.processProviderData(mockData);
    Object.keys(e.filters).forEach(filter => {
        expect(e.map.hasLayer(e.filters[filter])).toBeTruthy();
    });
});

test('processProviderData adds provider', () => {
    e.init();
    e.processProviderData(mockData);
    const markers = e.filters["store"].getLayers();
    expect(markers.length).toBe(2);
    var expectedCoords0 = { 
        lat: mockData.stores[0].latitude,
        lng: mockData.stores[0].longitude 
    }
    var expectedCoords1 = { 
        lat: mockData.stores[1].latitude,
        lng: mockData.stores[1].longitude 
    }
    var coords = []
    markers.forEach(marker => {
        expect(e.map.hasLayer(marker)).toBeTruthy();
        coords.push(marker.getLatLng());
    });
    if (expectedCoords0.lat == coords[0].lat)
    {
        expect(expectedCoords0).toEqual(coords[0]);
    }
    else
    {
        expect(expectedCoords1).toEqual(coords[1]);
    }
    
});

test('grabs icon from provided url', () => {
    e.init();
    e.processProviderData(mockData);
    expect(e.filters["store"].getLayers()[0].options.icon.options.iconUrl).toEqual(mockData.stores[0].icon);
});

test('grabs icon from default url', () => {
    e.init();
    e.processProviderData(mockData2);
    expect(e.filters["store"].getLayers()[0].options.icon.options.iconUrl).toEqual("img/store-icon.png");
});

test('user friendly names gets correct name for known translations', () => {
    expect(e.getUserFriendlyFilterName("store")).toBe("<img src='img/store-icon.png' width='16' height='16'/> Stores");
    expect(e.getUserFriendlyFilterName("market")).toBe("<img src='img/market-icon.png' width='16' height='16'/> Markets");
});

test('user friendly names handles unexpected name', () => {
    expect(e.getUserFriendlyFilterName("test")).toBe("Test");
});

test('processProviderData does not modify user settings on past filters', () =>
{
    e.init();
    e.processProviderData(mockData);
    expect(e.map.hasLayer(e.filters["store"])).toBeTruthy();
    e.map.removeLayer(e.filters["store"]);
    e.processProviderData(mockData2);
    expect(e.map.hasLayer(e.filters["store"])).toBeFalsy();
});

test('processProviderData handles missing store type', () =>
{
    e.init();
    e.processProviderData(mockData3);
    expect(e.filters["store"].getLayers().length).toBe(1);
    expect(e.filters["market"].getLayers().length).toBe(1);
    expect(Object.keys(e.filters).length).toBe(2);
});

