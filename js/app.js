$(document).ready(function () {
    $('[data-toggle=offcanvas]').click(function () {
        $('.row-offcanvas').toggleClass('active');
    });
});

// Distillery Array
var distilleries = [{
        title: "Doc Porter's Craft Spirits",
        website: "http://www.docporters.com",
        location: {
            lat: 35.188287,
            lng: -80.879757
        }
    },
    {
        title: "Broadslab Distillery LLC",
        website: "http://www.broadslabdistillery.com/",
        location: {
            lat: 35.347335,
            lng: -78.49085
        }
    },
    {
        title: "Piedmont Distillers Inc",
        website: "https://www.piedmontdistillers.com",
        location: {
            lat: 36.354719,
            lng: -79.947929
        }
    },
    {
        title: "Muddy River Distillery",
        website: "http://www.muddyriverdistillery.com",
        location: {
            lat: 35.23678,
            lng: -81.015675
        }
    },
    {
        title: "Outer Banks Distillery",
        website: "http://outerbanksdistilling.com",
        location: {
            lat: 35.908145,
            lng: -75.674897
        }
    },
    {
        title: "Top of the Hill Distillery",
        website: "http://www.topodistillery.com",
        location: {
            lat: 35.909482,
            lng: -79.063617
        }
    },
    {
        title: "Blue Ridge Distilling Co.",
        website: "https://www.defiantwhisky.com",
        location: {
            lat: 35.539428,
            lng: -81.793028
        }
    }
];

function AppViewModel() {
    var self = this;
    self.markers = [];
    self.searchBox = ko.observable('');

    self.initMap = function () {
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 7,
            styles: styles,
            mapTypeControl: false,
            gestureHandling: "none",
            center: {
                lat: 35.657296,
                lng: -79.299316,
            },
        });

        self.largeInfoWindow = new google.maps.InfoWindow();

        // The following group uses the distillery array to create an array of markers on initialize
        for (var i = 0; i < distilleries.length; i++) {
            this.title = distilleries[i].title;
            //Get the position from the distillery array.
            this.position = distilleries[i].location;
            // Create a marker per distillery, and put into the markers array.
            this.marker = new google.maps.Marker({
                map: map,
                position: this.position,
                title: this.title,
                animation: google.maps.Animation.DROP,
                id: i
            });
            this.marker.setMap(map);
            //Push marker to our array of markers.
            this.markers.push(this.marker);
            this.marker.addListener('click', self.animateMarker);
        }
    };

    // This function populates the infowindow when the marker is clicked. We will only allow one infowindow
    // which will open at the marker that is clicked, and populate based on that markers position.
    self.populateInfoWindow = function (marker, infowindow) {

        // Check to make sure the infowindow is not already open on this marker
        if (infowindow.marker != marker) {

            //Clear the infowindow content to give the streetview time to load
            infowindow.setContent('<p><b>' + marker.title + '</b><p>');
            infowindow.marker = marker;

            // WeatherUnderground API Call. Info available at https://www.wunderground.com/weather/api/
            $.ajax({
                url: "http://api.wunderground.com/api/5171c4e2f92e5a6a/geolookup/conditions/q/" + marker.position.lat() + "," + marker.position.lng() + ".json",
                dataType: "jsonp",
                success: function (parsed_json) {
                    // var temp_f = parsed_json['current_observation']['temp_f'];
                    var temp_f = parsed_json.current_observation.temp_f;
                    var windowContent = ('<p><b>' + marker.title + '</b></p>' +
                        '<p><i>Current Temperature is:</i> ' + temp_f.toString() + ' F'
                    );
                    infowindow.setContent(windowContent);
                },
                error: function () {
                    alert('Error! Weather data not available. Please try your request again.');
                }
            });

            //Open the infowindow on the correct marker
            infowindow.open(map, marker);

            //Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function () {
                infowindow.marker = null;
            });
        }
    };

    self.animateMarker = function () {
        self.populateInfoWindow(this, self.largeInfoWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function () {
            this.setAnimation(null);
        }).bind(this), 1500);
    };

    self.initMap();

    //Filter the list view and markers based on the user search query
    self.filterResults = ko.computed(function () {
        var result = [];
        for (var i = 0; i < this.markers.length; i++) {
            var markerLocation = this.markers[i];
            if (markerLocation.title.toLowerCase().includes(this.searchBox()
                    .toLowerCase())) {
                result.push(markerLocation);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return result;
    }, this);
}

function onError() {
	alert("Google Maps has failed to load. Please check your internet connection and try again.");
}

// Activates knockout.js
function runApp() {
    ko.applyBindings(new AppViewModel());
}