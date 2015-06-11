'use strict';

angular.module('icDash.fullFacilityDetails', ['ui.router'])


.controller('fullFacilityDetailsCtrl', ['$scope', '$http','$location', 'PCIdbService','eventPageService','configService','$controller','$timeout','userPrefService', 'assetService',
                                        function($scope, $http, $location, PCIdbService,eventPageService,configService,$controller,$timeout, userPrefService, assetService) {

	$scope.view = "loaded";
	$scope.viewType = "organization";
	$scope.orgDets = {};
	
	// Choose settings that this widget cares about
	var defaultConfig = {
			"facilityName" : undefined,
			"organizationName" : undefined,
	}
	var currentConfig = defaultConfig;
	
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});

	angular.extend(thisController, configService, superController);
	$scope.config = thisController.getConfig();
	// End choose settings that this widget cares about
	
	var refreshConfigs = function() {
		$scope.view = "loading";
		console.log("FULL FACILITY DETAILS updating!");
		var myPrefs = userPrefService.getUserPrefs("full-facility-details");
		
		/* Use default config to determine which preferences should be used in the widget
			Order of preferences: 
			1) User preferences (myPrefs)
			2) XUI configurations ($scope.config)
			3) default configurations by widget (defaultConfig)
		*/
		for (var key in defaultConfig) {
			if (myPrefs[key] !== "" && myPrefs[key] !== undefined) {
				currentConfig[key] = myPrefs[key];
			} else if ($scope.config[key] !== "" && $scope.config[key] !== undefined) {
				currentConfig[key] = $scope.config[key];
			} else {
				currentConfig[key] = defaultConfig[key];
			}
		}
		
		$scope.config = currentConfig;
		if(currentConfig.facilityName !== "" && currentConfig.facilityName !== undefined) $scope.viewType = "facility"; else $scope.viewType = "organization";
		console.log(currentConfig.organizationName);
		console.log(currentConfig.facilityName);
		getAllFacilityDets(currentConfig.organizationName, currentConfig.facilityName);
	}
	
	var getAllFacilityDets = function(org, facility) {
		if (facility == "Merck Research Lab") facility = "Merck Research Laboratory  Boston"; // here until asset service gets updated to match skyspark!...
		var facilityPromise = assetService.getFacilities(org, facility);
		facilityPromise.then(function(facilityList) {
			$scope.facilities = facilityList;
			if ($scope.viewType == "facility") {
				if (facilityList[0]) getWeather(facilityList[0].city, facilityList[0].state);
			} else {
				var currentTime = new Date();
				var totalTime = _.pluck($scope.facilities, 'liveDate').reduce(function(total, n) {return total + (currentTime - (new Date(n)).getTime());}, 0);
				$scope.orgDets.facilitiesMonitored = _.size($scope.facilities);
				$scope.orgDets.totalSqFt = _.pluck($scope.facilities, 'squareFootage').reduce(function(total, n) {return total + n;});
				$scope.orgDets.totalAssets = _.pluck($scope.facilities, 'keyAssets').reduce(function(total, n) {return total + n;});
				$scope.orgDets.avgAge = (totalTime / $scope.orgDets.facilitiesMonitored) / (1000 * 60 * 60 * 24 * 365.25); // average age in days
			}
			if (facilityList[0]) $scope.view = "loaded"; else $scope.view = "failed";
		}, function() {
			$scope.view = "failed";
		});
	}

	$scope.$watch('config', function(){
		refreshConfigs();
	}, true);
	
	// Add this to change between facility and org view
	$(window).bind("storage", function(e, changeType) {
		if (changeType == "organization") {
			if ($scope.viewType != "organization" || sessionStorage.getItem("organization") != currentConfig.organizationName) {
				$scope.viewType = "organization";
				currentConfig.organizationName = sessionStorage.getItem("organization");
				getAllFacilityDets(currentConfig.organizationName, {});
			}
		} else {
			if ($scope.viewType != "facility" || sessionStorage.getItem("facility") != currentConfig.facilityName) {
				$scope.viewType = "facility";
				currentConfig.facilityName = sessionStorage.getItem("facility");
				getAllFacilityDets(sessionStorage.getItem("organization"), currentConfig.facilityName);
			}
		}
	});
	
	// Queries for the weather
	var getWeather = function(city,state){
		if(state==="null"){state="";}
		return $http.get("http://api.openweathermap.org/data/2.5/forecast/daily?q="+city+","+state+"&mode=json&type=accurate&units=imperial&cnt=7&e2b7c435e01ce8ce7833e41644057103")
		//return $http.get("http://api.openweathermap.org/data/2.5/weather?lat=35&lon=139cnt=7")
		.success(function(data) {
			if(data.cod==="200" && data.cnt>=5){
				$scope.weatherData = {};
				for (var i = 0; i < 5; i++) {
					$scope.weatherData[i] = {
						name: getDayName(new Date(data.list[i].dt*1000).getDay()),
						lowTemp: data.list[i].temp.min,
						highTemp: data.list[i].temp.max,
						desc: data.list[i].weather[0].description,
						image: data.list[i].weather[0].icon,
						rain: data.list[i].rain,
						clouds: data.list[i].clouds,
						snow: data.list[i].snow,
					};
				}
			}
			else{
				delete $scope.weatherData;
			}
		})
	}

	// Returns a string based on a number
	var getDayName = function(dayNumber){
		if(dayNumber===1){return "Monday";}
		if(dayNumber===2){return "Tuesday";}
		if(dayNumber===3){return "Wednesday";}
		if(dayNumber===4){return "Thursday";}
		if(dayNumber===5){return "Friday";}
		if(dayNumber===6){return "Saturday";}
		if(dayNumber===0){return "Sunday";}
	}

	refreshConfigs();
}])

.directive('fullFacilityDetails', [ function() {
	return {
		restrict: 'E',
		templateUrl : 'icWidgets/fullFacilityDetails.html'
	}
}]);