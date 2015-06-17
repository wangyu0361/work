'use strict';

angular.module('icDash.ahuChart', ['ui.router', 'ui.bootstrap'])
  .directive('ahuChart', [function(){
	  return{
		  restrict:'E',
		  templateUrl : '/intellicommand/views/ahuChart.html',
	  }
  }])
  .controller('ahuChartCtrl',['$scope','$http','$location','$window','$controller','$timeout','$element','chartIdService','BMSRecordsAPI','AssetsAPI','configService','SkySparkAPI',
     function($scope, $http, $location, $window, $controller,$timeout,$element,chartIdService,BMSRecordsAPI,AssetsAPI,configService,SkySparkAPI) {
	  	 $scope.logScope = function(){
	  		 console.log($scope);
	  	 }
	  	 $scope.done = null;
	  	 var thisController = this;		 									//instance of the controller while running
		
		 var superController = $controller('baseWidgetCtrl', { 				// attaches the row/column variables to the scope if within the dashboard
		 	 "$scope" : $scope
		 });

		 angular.extend(thisController, configService, superController,BMSRecordsAPI,AssetsAPI,SkySparkAPI); 	// adds the actions from configService and superController to thisController

	  	 $scope.config = thisController.getConfig();
	  	 
	  	 $scope.ahuChartId = chartIdService.getNewId();
	  	 $scope.equips = [];
	  	
	  	 var defaultConfig = { 												// configuration object framework for eventPage
  			 "stationName"	:"",
  			 "orgName"		:"",
  			 "assetName"	:"",
  			 "axis"			:[],
  			 "chartStart"	:"",
  			 "chartEnd"		:""
	  	 }
	  	 
	  	 thisController.getEquipOnStation("HAUN").then(
	  			 function(equip){
	  				 $scope.equips.slice(0);
	  				 for(var i = 0; i < equip.length; i++){
	  					 $scope.equips.push(equip[i]);
	  				 }
	  				 $scope.cols = ["navName","ahu","vav","coolingTower","boiler","chiller","pump","primaryLoop","meter","global"];
	  				 //console.log(equip);$scope.$apply();
	  			 },
	  			 function(error){console.log("error",error)}
	  	 )
	  	 
  }])
  .directive('ahuChartConfig',[function(){
	  return{
		  restrict:'E',
		  templateUrl : '/intellicommand/views/ahuChartConfig.html',
	  }
  }])
  .controller('ahuChartConfigCtrl',['$scope',function($scope){
	  $scope.openSettings = function(){
		  console.log($scope);
	  }
  }])

;
