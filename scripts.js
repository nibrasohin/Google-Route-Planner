
var newRouteId = 2;
var destinationList = [];
var distanceArray = [];
var source;
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var mapEvent = google.maps.event;


var destinationIds = [];
google.maps.event.addDomListener(window, 'load', function () {
    new google.maps.places.SearchBox(document.getElementById('txtSource'));
    new google.maps.places.SearchBox(document.getElementById('destination1'));
    directionsDisplay = new google.maps.DirectionsRenderer({ 'draggable': true });
});

function addDomListener() {
    destinationIds.forEach(function (el) {
        new google.maps.places.SearchBox(document.getElementById(el));
    });
}



function calculateRoute() {
    var routeSummaryDiv = document.getElementById("routeSummary");
    var service = new google.maps.DistanceMatrixService();
    var mumbai = new google.maps.LatLng(18.9750, 72.8258);
    var mapOptions = {
        zoom: 7,
        center: mumbai
    };

    map = new google.maps.Map(document.getElementById('dvMap'), mapOptions);
    directionsDisplay.setMap(map);
    routeSummaryDiv.innerHTML = '';
    // directionsDisplay.setPanel(document.getElementById('dvPanel'));

    //*********DIRECTIONS AND ROUTE**********************//
    source = document.getElementById("txtSource").value;
    if (destinationIds.indexOf('destination1') === -1 && !!document.getElementById("destination1")) {
        destinationIds.push('destination1');
    }



    destinationIds.forEach((id) => {
        if (!!document.getElementById(id).value) {
            destinationList.push(document.getElementById(id).value);
        }
    });

    if (destinationList.length <= 0) {
        alert("Please enter a destination to optimize your route!");
    }
    else {
        service.getDistanceMatrix({
            origins: [source],
            destinations: destinationList,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        }, function (response, status) {

            var destination;
            var waypointsList;

            destination = getDestination(response.rows[0].elements);
            waypointsList = generateWaypointsList();


            var request = {
                origin: source,
                destination: destination,
                waypoints: waypointsList,
                optimizeWaypoints: true,
                travelMode: google.maps.TravelMode.DRIVING
            };

            directionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {

                    //preprocess routeArray
                    var srcDestNames = destinationNamesGenerator(source, destination, response.routes[0].waypoint_order, waypointsList);
                    //setting route summary and map
                    routeSummaryDiv.innerHTML += routeSummary(response.routes[0].legs, srcDestNames);
                    destinationList = [];
                    directionsDisplay.setDirections(response);
                }
                else {
                    alert("Unable to find the distance via road.");
                }
            });

        });
    }

}

function routeSummary(routeArray, srcDestNames) {
    var routeSummary = 'Optimized Route Summary<br/><br/>';
    routeArray.forEach((route) => {
        routeSummary += srcDestNames.shift().split(',')[0] + ' -> ' + srcDestNames.shift().split(',')[0] + ' [Distance: ' + route.distance.text + ', Duration: ' + route.duration.text + ']<br/>';
    });
    return routeSummary;
}

function destinationNamesGenerator(src, dest, waypointsOrder, waypointsList) {
    var destNames = [];
    destNames.push(src);
    if (!waypointsOrder) {
        destNames.push(waypointsList[0].location, waypointsList[0].location)
    }
    else {
        waypointsOrder.forEach((waypoint) => {
            destNames.push(waypointsList[waypoint].location, waypointsList[waypoint].location);
        });
    }
    destNames.push(dest);
    return destNames;
}

function generateWaypointsList() {
    var waypointsList = [];
    destinationList.forEach((waypoint) => {
        waypointsList.push({
            location: waypoint,
            stopover: true
        })
    });
    return waypointsList;
}

function getDestination(routeList) {
    var distance;
    var maxDistance = 0;
    var maxDistanceCounter = 0;
    var furthestDestinationIndex = -1;
    var destination;

    routeList.forEach((routeInfo) => {
        distance = parseFloat((routeInfo.distance.text.split(' ')[0]).split(',').join(''));
        if (distance > maxDistance) {
            furthestDestinationIndex = maxDistanceCounter;
            maxDistance = distance;
        }
        maxDistanceCounter++;
    });
    destination = destinationList[furthestDestinationIndex];
    destinationList.splice(furthestDestinationIndex, 1);
    return destination;
}

function addRoute() {
    var routeBody = document.getElementById("newRouteBody");
    var br1 = document.createElement("br");
    br1.setAttribute("id", "break" + newRouteId);
    var br2 = document.createElement("br");
    br2.setAttribute("id", newRouteId + "break");

    var newlabel = document.createElement("Label");
    newlabel.setAttribute("id", "label" + newRouteId);
    newlabel.innerHTML = "Destination:";
    newlabel.setAttribute("class", "labelDst");
    routeBody.appendChild(newlabel);

    var newRoute = document.createElement("input");
    newRoute.setAttribute("type", "text");
    newRoute.setAttribute("id", "destination" + newRouteId);
    newRoute.setAttribute("class", "w3-input w3-border w3-round-large");
    newRoute.setAttribute("style", "width: 400px");
    newRoute.setAttribute("value", "Winnipeg, MB, Canada");

    var deleteButton = document.createElement("input");
    deleteButton.setAttribute("type", "button");
    deleteButton.setAttribute("id", "del" + newRouteId);
    deleteButton.setAttribute("value", "Delete");
    deleteButton.setAttribute("onclick", "removeRoute(this.id);");

    routeBody.appendChild(newRoute);
    routeBody.appendChild(deleteButton);
    routeBody.appendChild(br1);
    routeBody.appendChild(br2);
    destinationIds.push("destination" + newRouteId);
    addDomListener();
    newRouteId++;
}

function removeRoute(id) {
    var idCounter = id.split('del')[1];
    var routeBody = document.getElementById("newRouteBody");
    routeBody.removeChild(document.getElementById("destination" + idCounter));
    routeBody.removeChild(document.getElementById("label" + idCounter));
    routeBody.removeChild(document.getElementById("break" + idCounter));
    routeBody.removeChild(document.getElementById(idCounter + "break"));
    routeBody.removeChild(document.getElementById(id));
    destinationIds = destinationIds.filter(dest => dest !== 'destination' + idCounter);
}
