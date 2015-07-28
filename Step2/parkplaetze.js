"use strict";
var app = angular.module('ParkApp', []);

// Wir estellen einen neuen Service parkService
// function($http) <- Angular DI Mechanismus der sagt: Wir brauchen das $http
// Modul
app.factory('parkService', function($http) {
    // Übersetzt Daten vom Service in unser Model
    function transform(set) {
	return {
	    id : set.attributes.IDENTIFIER,
	    name : set.attributes.PARKHAUS,
	    free : set.attributes.KAPAZITAET,
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
// 1. Beim start hole die Daten aus dem Service
app.controller('MainCtrl', function(parkService, $scope) {
    $scope.loadData = function() {
	$scope.appState = 'loading';
	parkService.load().then(function(data) {
	    $scope.data = data;
	});
    };
    $scope.loadData();
});