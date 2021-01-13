// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

let map;
let placeService;
let distanceMatrixService;
let geocoder;
let directionsService;
let directionsRenderer;
let startPlace;
let endPlace;

function initMap() {
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  distanceMatrixService = new google.maps.DistanceMatrixService();

  geocoder = new google.maps.Geocoder();
  let start = new google.maps.LatLng(56.1304, -106.3468);

  map = new google.maps.Map(document.getElementById('map'), {
    center: start,
    zoom: 4,
  });
  directionsRenderer.setMap(map);
  placeService = new google.maps.places.PlacesService(map);

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

  destinationSubmit.addEventListener('click', () => {
    startPlace = startAutocomplete.getPlace();
    endPlace = endAutocomplete.getPlace();

    var searchRequest = {
      location: startPlace.geometry.location,
      radius: '5000',
      query: '',
      type: 'gas_station',
    };

    placeService.nearbySearch(searchRequest, nearbySearchCallback);

    let directionsRequest = {
      origin: startPlace.geometry.location,
      destination: endPlace.geometry.location,
      travelMode: 'DRIVING',
    };
    directionsService.route(directionsRequest, function (result, status) {
      if (status == 'OK') {
        directionsRenderer.setDirections(result);
      } else {
        alert(
          'Directions service was not successful for the following reason: ' +
            status
        );
      }
    });
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
  } else {
    alert('Geocode was not successful for the following reason: ' + status);
  }
}

function nearbySearchCallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      createMarker(place);
    }

    /*
      GETTING DISTANCES USING DIRECTIONS MATRIX
    */

    transformedResults = results.map((res) => res.geometry.location);

    let distanceMatrixReq1 = {
      // distance from start to each gas station
      origins: [startPlace.geometry.location],
      destinations: transformedResults,
      travelMode: 'DRIVING',
    };

    let distanceMatrixReq2 = {
      // distance from each gas station to end
      origins: transformedResults,
      destinations: [endPlace.geometry.location],
      travelMode: 'DRIVING',
    };

    distanceMatrixService.getDistanceMatrix(
      distanceMatrixReq1,
      distanceMatrixCallback1
    );

    distanceMatrixService.getDistanceMatrix(
      distanceMatrixReq2,
      distanceMatrixCallback2
    );
    function distanceMatrixCallback1(results, status) {
      console.log(results);
    }

    function distanceMatrixCallback2(results, status) {
      console.log(results);
    }
  } else {
    alert(
      'nearby search was not successful for the following reason: ' + status
    );
  }
}
