// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

var map;
var service;
let geocoder;

function initMap() {
  geocoder = new google.maps.Geocoder();
  var start = new google.maps.LatLng(0, 0);
  codeAddress();

  map = new google.maps.Map(document.getElementById('map'), {
    center: start,
    zoom: 15,
  });
}

function createMarker(place) {
  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
  });
  google.maps.event.addListener(marker, 'click', () => {
    let infowindow = new google.maps.InfoWindow();
    infowindow.setContent(place.name);
    infowindow.open(map, marker);
  });
}

function codeAddress() {
  var address = 'toronto';
  geocoder.geocode({ address: address }, codeAddressCallback);
}

function codeAddressCallback(results, status) {
  if (status == 'OK') {
    map.setCenter(results[0].geometry.location);

    // request
    var request = {
      location: results[0].geometry.location,
      radius: '500',
      query: '',
      type: 'gas_station',
    };

    service = new google.maps.places.PlacesService(map);
    service.textSearch(request, textSearchCallback);
  } else {
    alert('Geocode was not successful for the following reason: ' + status);
  }
}

function textSearchCallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      createMarker(results[i]);
    }
  }
}
