// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

let map;
let service;
let geocoder;
let directionsService;
let directionsRenderer;

function initMap() {
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  geocoder = new google.maps.Geocoder();
  let start = new google.maps.LatLng(56.1304, -106.3468);

  map = new google.maps.Map(document.getElementById('map'), {
    center: start,
    zoom: 4,
  });
  directionsRenderer.setMap(map);

  let startInput = document.getElementById('start__input');
  let endInput = document.getElementById('end__input');
  var autocompleteOptions = {
    componentRestrictions: { country: 'ca' },
  };
  let startAutocomplete = new google.maps.places.Autocomplete(
    startInput,
    autocompleteOptions
  );
  let endAutocomplete = new google.maps.places.Autocomplete(
    endInput,
    autocompleteOptions
  );

  let destinationSubmit = document.getElementById('destination__submit');

  var options = {
    types: ['(cities)'],
    componentRestrictions: { country: 'fr' },
  };

  destinationSubmit.addEventListener('click', () => {
    startPlace = startAutocomplete.getPlace();
    endPlace = endAutocomplete.getPlace();
    let request = {
      origin: startPlace.geometry.location,
      destination: endPlace.geometry.location,
      travelMode: 'DRIVING',
    };
    directionsService.route(request, function (result, status) {
      if (status == 'OK') {
        directionsRenderer.setDirections(result);
      } else {
        alert(
          'Directions service was not successful for the following reason: ' +
            status
        );
      }
    });

    createMarker(startPlace);
    createMarker(endPlace);
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
      radius: '5000',
      query: '',
      type: 'gas_station',
    };

    //service = new google.maps.places.PlacesService(map);
    //service.nearbySearch(request, textSearchCallback);
  } else {
    alert('Geocode was not successful for the following reason: ' + status);
  }
}

function textSearchCallback(results, status) {
  console.log(results);
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      createMarker(place);
    }
  }
}
