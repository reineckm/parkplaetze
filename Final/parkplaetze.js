"use strict";
var app = angular.module('ParkApp', []);

// Wir estellen einen neuen Service parkService
// function($http) <- Angular DI Mechanismus der sagt: Wir brauchen das $http
// Modul
app.factory('parkService', function($http) {

    // Erstellt Karte über Google staticmap API.
    // x, y: Mittelpunkt;
    // w, h: Kartengroesse in px
    // @see https://developers.google.com/maps/documentation/staticmaps/?hl=de
    function gmaps(x, y, w, h) {
	return "http://maps.googleapis.com/maps/api/staticmap?center=" + y + "," + x
		+ "&markers=color:blue%7Clabel:P%7C" + y + "," + x + "&zoom=15&size=" + w + "x" + h + "&sensor=false";
    }

    // Wandelt Wert in Pfeile, < 0 : Pfeil nach unten, = 0 Pfeil nach rechts, >
    // 0 Pfeil nach oben @see http://marcoceppi.github.io/bootstrap-glyphicons/
    function trendIcon(tendenz) {
	if (tendenz < 0) {
	    return "icon-circle-arrow-up";
	} else if (tendenz === 0) {
	    return "icon-circle-arrow-right";
	} else {
	    return "icon-circle-arrow-down";
	}
    }

    // Übersetzt Daten vom Service in unser Model
    function transform(set) {
	if (set.attributes.PARKHAUS === null) {
	    set.attributes.PARKHAUS = "--- Kein Name ---";
	}
	if (set.attributes.KAPAZITAET === -1) {
	    set.attributes.KAPAZITAET = 0;
	}
	return {
	    id : set.attributes.IDENTIFIER,
	    name : set.attributes.PARKHAUS,
	    free : set.attributes.KAPAZITAET,
	    link : gmaps(set.geometry.x, set.geometry.y, 400, 400),
	    trend : trendIcon(set.attributes.TENDENZ),
	    tendenz : set.attributes.TENDENZ
	};
    }

    // Umgehung des Same-Origin-Policy Problems. Kann man auch anders lösen ;-)
    var serviceUrl = 'http://www.whateverorigin.org/get?url='
	    + encodeURIComponent("http://www.stadt-koeln.de/externe-dienste/open-data/parking.php")
	    + "&callback=JSON_CALLBACK";

    // Hier nun endlich die Stelle an der der eigentliche GET Request an die von
    // den von der Stadt Köln zur verfügung gestellten Service stattfindet
    var parkService = {
	load : function() {
	    // https://docs.angularjs.org/api/ng/service/$http
	    // https://docs.angularjs.org/api/ng/service/$q
	    var promise = $http.jsonp(serviceUrl).then(function(response) {
		var indata = JSON.parse(response.data.contents);
		var outdata = [ indata.features.length ];
		for (var i = 0; i < indata.features.length; i++) {
		    outdata[i] = transform(indata.features[i]);
		}
		return outdata;
	    });
	    return promise;
	}
    };
    return parkService;
});

// Der Controller - Die Aufgaben sind:
// 1. Beim start und klicken von Holen der Daten aus dem Service
// den Status auf "done" zu setzen wenn die Daten angekommen sind
app.controller('MainCtrl', function(parkService, $scope) {
    $scope.loadData = function() {
	$scope.appState = 'loading';
	parkService.load().then(function(data) {
	    $scope.data = data;
	    $scope.appState = 'done';
	});
    };
    $scope.predicate = 'free';
    $scope.reverse = true;
    $scope.order = function(predicate) {
      $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
      $scope.predicate = predicate;
    };
    $scope.loadData();
});