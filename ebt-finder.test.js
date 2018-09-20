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
    document.body.innerHTML = '<div id="mapId"></div>'
    jest.spyOn(L, 'tileLayer');
    var e = new EbtFinder('mapId');
    e.init()
    expect(L.tileLayer).toHaveBeenCalled();
});
