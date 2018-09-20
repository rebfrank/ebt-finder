const L = require('leaflet');
const EbtFinder = require('./ebt-finder');

jest.mock(navigator.geolocation);

//test('handles error on provider response', () => {
//    document.body.innerHTML = '<div id="mapid"></div>'
//    const onProvidersReceived = require('./ebt-finder');
//    response = {
//        status: 400
//    };
//    expect(() => {
//        onProvidersReceived(response);
//    }).toThrow();
//});

test('my first integration test', () => {
    document.body.innerHTML = '<div id="mapId"></div>';
    jest.spyOn(L, 'tileLayer');
    var e = new EbtFinder('mapId');
    e.init();
    expect(L.tileLayer).toHaveBeenCalled();
});

test('move the map fetches new providers', () => {
    document.body.innerHTML = '<div id="mapId"></div>';
    debugger;
    var e = new EbtFinder('mapId');
    
    // set up mocks
    jest.spyOn(e.map, 'on');
    const mockResponse = (status, statusText, data) => {
          return {
                  status: status,
                  statusText: statusText,
                  json: () => { return Promise.resolve(data) }
          };
    };
    const mockData = { 
        filters: ["store", "market"],
        stores: []
    };
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
    mockCenter = {
        lat: 40.6,
        lng: -74.2
    };
    mockEvent = {
        target: {
            getCenter: () => { return mockCenter; }
        }
    };
    return moveendListeners[0][1](mockEvent)
        .then(() => { expect(e.processProviderData).toBeCalledWith(mockData) });
});

test('processProviderData normal case', () => {
    document.body.innerHTML = '<div id="mapId"></div>';
    var e = new EbtFinder('mapId');
    e.init();

    
}
