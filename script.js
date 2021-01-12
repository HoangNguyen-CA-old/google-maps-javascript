// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

var map;
var service;
var infowindow;
let geocoder;

function initMap() {
  geocoder = new google.maps.Geocoder();
  var pyrmont = new google.maps.LatLng(43.6532, 79.3832);
  codeAddress();

  map = new google.maps.Map(document.getElementById('map'), {
    center: pyrmont,
    zoom: 15,
  });
}

function createMarker(place) {
  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
  });
  google.maps.event.addListener(marker, 'click', () => {
    infowindow.setContent(place.name);
    infowindow.open(map);
  });
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      createMarker(results[i]);
    }
  }
}

function codeAddress() {
  var address = 'toronto';
  geocoder.geocode({ address: address }, function (results, status) {
    if (status == 'OK') {
      map.setCenter(results[0].geometry.location);
      /* marker on current position
      var marker = new google.maps.Marker({
        map: map,
        position: results[0].geometry.location,
      });
      */

      var request = {
        location: results[0].geometry.location,
        radius: '500',
        query: '',
        type: 'gas_station',
      };

      service = new google.maps.places.PlacesService(map);
      service.textSearch(request, callback);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

/*
  const sydney = new google.maps.LatLng(-33.867, 151.195);
  infowindow = new google.maps.InfoWindow();
  map = new google.maps.Map(document.getElementById('map'), {
    center: sydney,
    zoom: 15,
  });
  const request = {
    query: 'Toronto',
    fields: ['gas_station'],
  };
  service = new google.maps.places.PlacesService(map);
  service.findPlaceFromQuery(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (let i = 0; i < results.length; i++) {
        createMarker(results[i]);
      }
      map.setCenter(results[0].geometry.location);
    }
  });
  */
