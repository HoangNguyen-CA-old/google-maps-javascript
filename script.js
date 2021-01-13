// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

/*
GEOCODING EXAMPLE
geocoder = new google.maps.Geocoder();


function codeAddress(address) {
  geocoder.geocode({ address: address }, codeAddressCallback);
}

function codeAddressCallback(results, status) {
  if (status == 'OK') {
    map.setCenter(results[0].geometry.location);
  } else {
    alert('Geocode was not successful for the following reason: ' + status);
  }
}
*/

let map;
let placeService;
let distanceMatrixService;
let directionsService;
let directionsRenderer;
let startPlace;
let endPlace;
let gasItemsArray = [];

function initMap() {
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  distanceMatrixService = new google.maps.DistanceMatrixService();

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

    /*
      Render the directions
    */
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

function nearbySearchCallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
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

    //key is address of gas station
    distanceDictionary = {};

    function distanceMatrixCallback1(results, status) {
      if (status == 'OK') {
        let res = parseDistanceMatrix(results);
        console.log(res);

        // add response to distanceDictionary
        for (item of res) {
          distanceDictionary[item.to] = {
            address: item.to,
            distanceTo: item.distance,
            durationTo: item.duration,
          };
        }

        distanceMatrixService.getDistanceMatrix(
          distanceMatrixReq2,
          distanceMatrixCallback2
        );
      } else {
        alert(
          'distance matrix was not successful for the following reason: ' +
            status
        );
      }
    }

    function distanceMatrixCallback2(results, status) {
      if (status == 'OK') {
        let res = parseDistanceMatrix(results);
        console.log(res);

        let updatedDict = { ...distanceDictionary };

        for (item of res) {
          prevDistance = distanceDictionary[item.from].distanceTo;
          prevDuration = distanceDictionary[item.from].durationTo;
          updatedDict[item.from] = {
            ...distanceDictionary[item.from],
            distanceFrom: item.distance,
            durationFrom: item.duration,
            totalDistance: item.distance + prevDistance,
            totalDuration: item.duration + prevDuration,
          };
        }
        distanceDictionary = updatedDict;

        console.log(distanceDictionary);
        renderGasStations(Object.values(distanceDictionary));
      } else {
        alert(
          'distance matrix was not successful for the following reason: ' +
            status
        );
      }
    }
  } else {
    alert(
      'nearby search was not successful for the following reason: ' + status
    );
  }
}

// helper function to parse  data from direction matrix responses
function parseDistanceMatrix(response) {
  var origins = response.originAddresses;
  var destinations = response.destinationAddresses;

  let ansArr = [];
  for (var i = 0; i < origins.length; i++) {
    var results = response.rows[i].elements;
    for (var j = 0; j < results.length; j++) {
      var element = results[j];
      ans = {};
      ans.distanceText = element.distance.text;
      ans.durationText = element.duration.text;
      ans.distance = element.distance.value; // in meters
      ans.duration = element.duration.value; // in second
      ans.from = origins[i];
      ans.to = destinations[j];
      ansArr.push(ans);
    }
  }
  return ansArr;
}

gasDisplay = document.getElementById('gasDisplay');
function renderGasStations(distanceValues) {
  let sorted = distanceValues.sort((a, b) => a.totalDistance - b.totalDistance);

  console.log(sorted);
  gasItemsArray = [];

  for (item of sorted) {
    let address = item.address;
    let gasItem = document.createElement('div');
    gasItem.classList.add('gas__item');
    gasItem.innerHTML = `
    <h3 class="gas__item__title">${item.address}</h3>
    <p class="gas__item__label">
      total distance = ${(item.totalDistance / 1000).toFixed(1)} km
      </p>
      <p class="gas__item__label">
      total duration = ${(item.totalDuration / 60).toFixed(1)} minutes
      </p>
    `;

    let buttonItem = document.createElement('button');
    buttonItem.classList.add('button');
    buttonItem.classList.add('gas__item__button');
    buttonItem.innerText = 'Add To Route';

    buttonItem.addEventListener('click', () => {
      clearGasItemsHighlight();
      gasItem.classList.add('gas__item--highlighted');
      addToRoute(address);
    });

    gasItemsArray.push(gasItem);
    gasItem.appendChild(buttonItem);
    gasDisplay.appendChild(gasItem);
  }
}

function addToRoute(address) {
  console.log(address);
  let directionsRequest = {
    origin: startPlace.geometry.location,
    waypoints: [{ location: address, stopover: true }],
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
}

function clearGasItemsHighlight() {
  for (item of gasItemsArray) {
    item.classList.remove('gas__item--highlighted');
  }
}
