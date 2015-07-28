"use strict";
var app = angular.module('ParkApp', []);

// Wir erstellen einen neuen Service: parkService
// ($http): Angular DI Mechanismus der sagt: Wir brauchen das $http Modul
app.factory('parkService', function($http) {
    // Umgehung des Same-Origin-Policy Problems.
    var serviceUrl = 'http://www.whateverorigin.org/get?url='
	    + encodeURIComponent("http://www.stadt-koeln.de/externe-dienste/open-data/parking.php")
	    + "&callback=JSON_CALLBACK";

    // Daten holen und erstmal in der Console ausgeben
    var parkService = {
		load : function() {
			// https://docs.angularjs.org/api/ng/service/$http
			// https://docs.angularjs.org/api/ng/service/$q
			var promise = $http.jsonp(serviceUrl).then(function(response) {
				return JSON.parse(response.data.contents);
			});
			return promise;
		}
    };
    return parkService;
});

// Der Controller - Die Aufgabe ist vorerst, einmal den Service anzufragen
// und das ergebnis in die JS Console zu loggen
app.controller('MainCtrl', function(parkService, $scope) {
    $scope.loadData = function() {
		parkService.load().then(function(data) {
			console.dir(data);
		});
	}
    $scope.loadData();
});