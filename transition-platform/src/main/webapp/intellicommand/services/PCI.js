angular.module('icDash.pciService', ['ui.router'])

.factory('userPrefService', ['$rootScope', 'cleaningService','featureCheck', function($rootScope, cleaningService,featureCheck){
	return {
		getUserPrefs: function(myWidget) {
			/** ALL WIDGETS - PUT DEFAULT CONFIGS HERE! **/
			var userPrefs = {
				"aged-work-orders": {
					clientName: sessionStorage.getItem("organization"),
					stationName: sessionStorage.getItem("station"),
					chartColor: sessionStorage.getItem("colors.ticketOpen"),
					colorHigh: sessionStorage.getItem("colors.colorHigh"),
					colorLow: sessionStorage.getItem("colors.colorLow"),
				},
				"algorithms" : {
					/*"assetView" : true,
					"stationView" : false,
					"clientView" : false,*/
					assetName: sessionStorage.getItem("asset"),
					stationName: sessionStorage.getItem("station"),
					clientName: sessionStorage.getItem("organization"),
					closedWorkOrderColor: sessionStorage.getItem("colors.ticketClosed"),
					openWorkOrderColor: sessionStorage.getItem("colors.ticketOpen"),
					//startingDate: sessionStorage.getItem(""),
					//endingDate: sessionStorage.getItem(""),
					//dateRange: sessionStorage.getItem("dateRange"),
				},
				"energy-profile": {
					stationName: sessionStorage.getItem("station"),
					clientName: sessionStorage.getItem("organization"),
					actualColor: sessionStorage.getItem("colors.actualKWH"),
					expectedColor: sessionStorage.getItem("colors.expectedKWH"),
					savingsColor: sessionStorage.getItem("colors.weeklyKWH"),
					cumColor: sessionStorage.getItem("colors.cumulativeKWH"),
					dateRange: "last four weeks",
					//dateRange: sessionStorage.getItem("dateRange"),
				},
				"equipment": {
					clientName: sessionStorage.getItem("organization"),
					closedWorkOrderColor: sessionStorage.getItem("colors.ticketClosed"),
					openWorkOrderColor: sessionStorage.getItem("colors.ticketOpen"),
					//startingDate: sessionStorage.getItem(""),
					//endingDate: sessionStorage.getItem(""),
					//dateRange: sessionStorage.getItem("dateRange"),
				},
				"equipment-tickets": {
					stationName: sessionStorage.getItem("station"),
					assetName: sessionStorage.getItem("asset"),
					chartColor: sessionStorage.getItem("colors.ticketOpen"),
				},
				"event-page": {
					stationName: sessionStorage.getItem("station"),
					assetName: sessionStorage.getItem("asset"),
					anomalyType: sessionStorage.getItem("tickets.anomaly"),
					//workOrderNumber: sessionStorage.getItem("tickets.ticketId"),
				},
				"facility-selector": {
					organizationName: sessionStorage.getItem("userLimits.organization"),
					facilityName: sessionStorage.getItem("userLimits.facility"),
				},
				"full-facility-details": {
					organizationName: sessionStorage.getItem("organization"),
					facilityName: sessionStorage.getItem("facility"),
				},
				"stacked-column-work-orders": {
					clientName: sessionStorage.getItem("organization"),
					stationName: sessionStorage.getItem("station"),
					closedWorkOrderColor: sessionStorage.getItem("colors.ticketClosed"),
					openWorkOrderColor: sessionStorage.getItem("colors.ticketOpen"),
					//startingDate: sessionStorage.getItem(""),
					//endingDate: sessionStorage.getItem(""),
					//dateRange: sessionStorage.getItem("dateRange"),
				},
				"treemap-asset": {
					colorLow: sessionStorage.getItem("colors.colorLow"),
					colorHigh: sessionStorage.getItem("colors.colorHigh"),
					facilityName: sessionStorage.getItem("station"),
					//startDate: sessionStorage.getItem(""),
					//endDate: sessionStorage.getItem(""),
					//chartStart: sessionStorage.getItem(""),
					//chartEnd: sessionStorage.getItem(""),
					//dateRange: sessionStorage.getItem("dateRange"),
				},
				"work-order-cycle-time": {
					clientName: sessionStorage.getItem("organization"),
					colorHigh: sessionStorage.getItem("colors.colorHigh"),
					colorLow: sessionStorage.getItem("colors.colorLow"),
					barChartColor: sessionStorage.getItem("colors.ticketOpen"),
					weekly: sessionStorage.getItem("widgetSpecific.workOrderCycleTime_weeklyFlag"),
					//startingDate: sessionStorage.getItem(""),
					//endingDate: sessionStorage.getItem(""),
					//dateRange: sessionStorage.getItem("dateRange"),
				},
				"work-order-grid": {
					//clientName: sessionStorage.getItem("organization"),
					stationName: sessionStorage.getItem("station"),
					//dateRange: sessionStorage.getItem("dateRange"),
					//anomalyType: sessionStorage.getItem("tickets.anomaly"),
					//status: sessionStorage.getItem("tickets.status"),
				},
			};
			/** END ALL WIDETS - PUT DEFAULT CONFIGS HERE! **/
			return userPrefs[myWidget];
		},
		
		updateUserPrefs: function(newPrefs) {
			var changeType = null;
			// Should be an object of name: value
			// Verify user name to update preferences for
			
			// Use the db response to populate sessionStorage for the user
			$.each(newPrefs,function(key, newValue){
				switch(key) {
					// Basic info
					case "organization":
					case "organizationName":
					case "clientName":
						key = "organization";
						if (changeType == null) changeType = "organization";
						break;
					case "facility":
					case "facilityName":
						key = "facility";
						changeType = "station";
						break;
					case "station":
					case "stationName":
						key = "station";
						changeType = "station";
						break;
					case "asset":
					case "assetName":
						key = "asset";
						changeType = "asset";
						break;
					case "dateRange":
						key = "dateRange";
						break;
					
					// Tickets
					case "status":
						key = "tickets.status";
						break;
					case "workOrderNumber":
						key = "tickets.ticketId";
						break;
					case "anomaly":
					case "anomalyType":
						key = "tickets.anomaly";
						break;
					
					// Colors
					case "ticketOpen":
					case "chartColor":
						key = "colors.ticketOpen";
						break;
					case "ticketClosed":
						key = "colors.ticketClosed";
						break;
					case "colorHigh":
						key = "colors.colorHigh";
						break;
					case "colorLow":
						key = "colors.colorLow";
						break;
					case "actualKWH":
						key = "colors.actualKWH";
						break;
					case "expectedKWH":
						key = "colors.expectedKWH";
						break;
					case "weeklyKWH":
						key = "colors.weeklyKWH";
						break;
					case "cumulativeKWH":
						key = "colors.cumulativeKWH";
						break;
					
					// Widget specific
					
					// Default
					default:
						break;
				}	
				sessionStorage.setItem(key, newValue);
				
				if (key == "station") {
					var newVal = cleaningService.campusFullName(newValue);
					sessionStorage.setItem("facility", newVal);
				}
				if (key == "facility") {
					var newVal = cleaningService.campusName(newValue);
					sessionStorage.setItem("station", newVal);
				}
			})
			
			// Broadcast the update for other widgets to see
			// Window trigger is to allow the header image and title to change
			if (changeType !== null) $(window).trigger("storage", changeType);
			$rootScope.$broadcast('userPrefsChanged');
			console.log("USER PREFS CHANGED");
		},
	};
}])

.factory('PCIdbService', ['$http', function($http){
	var _getData = function(config){
		return $http(config)
		.success(
				function (data) {
				}
		)
	};
	
	var servObj = {
			getData: _getData,
	};
	return servObj;
}])
.factory('objectTools',[function(){
	var _isEqual = function(obj1,obj2){
		 if(obj1 === undefined || obj2 === undefined || obj1 === null || obj2 === null){
			 return false;
		 }
		 
		 if(obj1.length !== obj2.length){
			 return false;
		 }
		 
		 if(typeof(obj1) !== typeof(obj2)){
			 return false;
		 }
		 
		 if(typeof(obj1) === "string" || typeof(obj1) === "number" || typeof(obj1) === "boolean"){
			 return obj1 === obj2 ? true : false;
		 }
		 
		 for(var key in obj1){
			 if(obj2.hasOwnProperty(key) === false)
			 {
				 return false;
			 }
			 else if(Object.keys(obj1[key]).length > 0 && Object.keys(obj2[key]).length > 0){
				 if(_isEqual(obj1[key],obj2[key]) === false){return false;}
			 }
			 else if(obj1[key] !== obj2[key]){
				 return false;
			 }
		 }
		 return true;
	 }
	
	return {
		isEqual:_isEqual
	}
}])

.service('noReloadUrl', ['$location', '$route', '$rootScope', function($location, $route, $rootScope) {
    $location.skipReload = function (path) {
        var lastRoute = $route.current;
        var un = $rootScope.$on('$locationChangeSuccess', function () {
            $route.current = lastRoute;
            un();
        });
        return $location.url(path);
    };
    return $location;
}])

//base implementation of widget controls.  To be injected into Galaxy widgets.
.controller('baseWidgetCtrl', ['$scope', '$http', 'userPrefService', function($scope, $http, userPrefService){
	var thisController = this;
	
	thisController.$http = $http;
	
		
	/*if(uictrl !== null && uictrl.n0 !== null && uictrl.n0.alias !== null){
		if($scope.$parent.xuiAlias !== undefined){
			thisController.xuiAlias = $scope.$parent.xuiAlias;
		}
	}*/
	//propagate the row and column from panelControllers -> widgets
	if($scope.$parent !== null){
		if($scope.$parent.hasOwnProperty('row')){
			$scope.row = $scope.$parent.row;
			thisController.row = $scope.$parent.row;
		}
		
		if($scope.$parent.hasOwnProperty('column')){
			$scope.column = $scope.$parent.column;
			thisController.column = $scope.$parent.column;
		}
		
		//propagate side/top bar indexes from wrapper components -> widgets
		if($scope.$parent.hasOwnProperty('sideBarIndex')){
			$scope.sideBarIndex = $scope.$parent.sideBarIndex;
			thisController.sideBarIndex = $scope.$parent.sideBarIndex;
		}
		
		if($scope.$parent.hasOwnProperty('topBarIndex')){
			$scope.topBarIndex = $scope.$parent.topBarIndex;
			thisController.topBarIndex = $scope.$parent.topBarIndex;
		}
		
		if($scope.$parent.hasOwnProperty('xuiAlias')){
			$scope.xuiAlias = $scope.$parent.xuiAlias;
			thisController.xuiAlias = $scope.$parent.xuiAlias;
		}
	}
	
	//ng-include creates an isolate scope directly above the widget... preventing propagation of the row & column.... for now check the grandparent
	if($scope.$parent.$parent !== null){
		if($scope.$parent.$parent.hasOwnProperty('row')){
			$scope.row = $scope.$parent.$parent.row;
			thisController.row = $scope.$parent.$parent.row;
		}
		
		if($scope.$parent.$parent.hasOwnProperty('column')){
			$scope.column = $scope.$parent.$parent.column;
			thisController.column = $scope.$parent.$parent.column;
		}
		
		//propagate side/top bar indexes from wrapper components -> widgets
		if($scope.$parent.$parent.hasOwnProperty('sideBarIndex')){
			$scope.sideBarIndex = $scope.$parent.$parent.sideBarIndex;
			thisController.sideBarIndex = $scope.$parent.$parent.sideBarIndex;
		}
		
		if($scope.$parent.$parent.hasOwnProperty('topBarIndex')){
			$scope.topBarIndex = $scope.$parent.$parent.topBarIndex;
			thisController.topBarIndex = $scope.$parent.$parent.topBarIndex;
		}
		
		if($scope.$parent.$parent.hasOwnProperty('xuiAlias')){
			$scope.xuiAlias = $scope.$parent.$parent.xuiAlias;
			thisController.xuiAlias = $scope.$parent.$parent.xuiAlias;
		}
	}
  }])
  
/*.factory('eventPageService', [ '$rootScope', function($rootScope){
	  var workOrderNumber = undefined;
	  var assetName = undefined;
	  var organization = undefined;
	  var stationName = undefined;
	  var facility = undefined;
	  var anomalyName = undefined;
	  
	  var _getWorkOrderNumber = function(){
		  return workOrderNumber;
	  };
	  
	  var _setWorkOrderNumber = function(value){
		  workOrderNumber = value;
		  $rootScope.$broadcast('workOrderNumberSet');
	  };
	  
	  var _getStationName = function(){
		  return stationName;
	  };
	  
	  var _setStationName = function(value){
		  stationName = value;
		  $rootScope.$broadcast('stationNameSet');
	  };
	  
	  var _getFacility = function(){
		  return facility;
	  };
	  
	  var _setFacility = function(value){
		  facility = value;
		  $rootScope.$broadcast('facilitySet');
	  };
	  
	  var _getAssetName = function(){
		  return assetName;
	  }
	  
	  var _setAssetName = function(value){
		  assetName = value;
		  $rootScope.$broadcast('assetNameSet');
	  }
	  
	  var _getOrganization = function(){
		  return organization;
	  }
	  
	  var _setOrganization = function(value){
		  organization = value;
		  $rootScope.$broadcast('organizationSet');
	  }
	  
	  var _getAnomalyName = function(){
		  return anomalyName;
	  }
	  
	  var _setAnomalyName = function(value){
		  anomalyName = value;
		  $rootScope.$broadcast('anomalyNameSet');
	  }
	  
	  var serviceObject = {
	    getWorkOrderNumber: _getWorkOrderNumber,
	    setWorkOrderNumber: _setWorkOrderNumber,
	    getAssetName: _getAssetName,
	    setAssetName: _setAssetName,
		getStationName: _getStationName,
	    setStationName: _setStationName,
	    getFacility: _getFacility,
	    setFacility: _setFacility,
	    getOrganization: _getOrganization,
	    setOrganization: _setOrganization,
	    getAnomalyName: _getAnomalyName,
	    setAnomalyName: _setAnomalyName
	  };
	  
	  return serviceObject;
  }])*/
 .factory('configService',['$location',function($location){
	  var _config = []; //[dashboard#][view][row][column]
	  
	  var _getCoordinates = function(thisController){
		  var dash = "dashboard";
		  var view = "only";
		  var row = 0;
		  var col = 0;
		  var object = {};
		  		  
		  if(thisController.hasOwnProperty("row")){
			  view = "main";
			  row = thisController.row;
			  col = thisController.column;
		  }else if(thisController.hasOwnProperty("sideBarIndex")){
			  view = "side";
			  row = thisController.sideBarIndex;
		  }else if(thisController.hasOwnProperty("topBarIndex")){
			  view = "top";
			  col = thisController.topBarIndex;
		  }else if(thisController.hasOwnProperty("xuiAlias")){
			  dash = "xui";
			  view = "main";
			  row = 0;
			  col = thisController.xuiAlias;
		  }
		  
		  if(view === "only"){
			  dash = $location.$$path.substring(1);
			  
			  if($location.$$url.indexOf("?")!== -1){
				  var paramString = $location.$$url.substring($location.$$url.indexOf("?")+1);
				  while(paramString.indexOf("&") > 0){
					  var equals = paramString.indexOf("=");
					  var and = paramString.indexOf("&");
					  
					  object[paramString.substring(0,equals)] = paramString.substring(equals+1,and);
					  paramString = paramString.substring(and+1);
				  }
				  
				  var equals = paramString.indexOf("=");
				  object[paramString.substring(0,equals)] = paramString.substring(equals+1);
			  }
		  }
		  		  
		  if(_config[dash] === undefined){_config[dash] = [];}
		  if(_config[dash][view] === undefined){_config[dash][view] = [];}
		  if(_config[dash][view][row] === undefined){_config[dash][view][row] = [];}
		  if(_config[dash][view][row][col] === undefined || $location.$$url.indexOf("?") !== -1){_config[dash][view][row][col] = object;}
		  
		  return {
			  "dash":dash,
			  "view":view,
			  "row":row,
			  "col":col
		  };
	  }

	  var _setConfig = function(coor,obj){
		  var tempObj = _config[coor.dash][coor.view][coor.row][coor.col];
		  for(var key in obj){
			  tempObj[key] = obj[key];
		  }
	  }
	  
	  var _getConfig = function(coor){
		  if(_config[coor.dash] === undefined ||
			 _config[coor.dash][coor.view] === undefined ||
			 _config[coor.dash][coor.view][coor.row] === undefined ||
			 _config[coor.dash][coor.view][coor.row][coor.col] === undefined
		  ){
			  return undefined;
		  }
		  
		  return _config[coor.dash][coor.view][coor.row][coor.col];
	  }
	  
	  var _getFullConfig = function(){
		  return _config;
	  }
		  
	  var _setFullConfig = function(obj){
		  for(var i in obj){
			  if(_config[i] === undefined){_config[i] = [];}
			  for(var j in obj[i]){
				  if(_config[i][j] === undefined){_config[i][j] = [];}
				  for(var k in obj[i][j]){
					  if(_config[i][j][k] === undefined){_config[i][j][k] = [];}
					  for(var l in obj[i][j][k]){
						  if(_config[i][j][k][l] === undefined){_config[i][j][k][l] = {}}
						  var coor = {
						  'dash':i,
						  'view':j,
						  'row':k,
						  'col':l
						}
						_setConfig(coor,obj[i][j][k][l]);
					  }
				  }
			  }
		  }
	  }
	  	  
	  var _getConfigInjection = function(){
			var thisController = this;
			var coordinates = _getCoordinates(thisController);
			
			return _getConfig(coordinates);
	  }
	  
	  var _setConfigInjection = function(configObj){
			var thisController = this;
			var coordinates = _getCoordinates(thisController);
			
			_setConfig(coordinates,configObj);
	  }

	  var serviceObject = {
			  getConfig 			: _getConfigInjection,
			  setConfig 			: _setConfigInjection,
			  getFullConfig	 		: _getFullConfig,
			  setFullConfig			: _setFullConfig,
	  };
	  
	  return serviceObject;
  }])
  .directive('resize', function ($window) {
	return function (scope, element, attr) {
	    var w = angular.element($window);
	    var panel = element;
	    
	    while(angular.element(panel)[0].tagName !== "BODY"){
	    	if(angular.element(panel)[0].className === "panel-body"){
	    		break;
	    	}else{
	    		panel = angular.element(panel[0].parentElement);
	    	}
	    }
	    	    
	    scope.$watch(function () {
	        return {
	            'h': window.innerHeight, 
	            'w': window.innerWidth,
	            'ph':panel[0].offsetHeight,
	            'pw':panel[0].offsetWidth
	        };
	    }, function (newValue, oldValue) {
	        scope.windowHeight = newValue.h;
	        scope.windowWidth = newValue.w;
	        scope.panelHeight = newValue.ph;
	        scope.panelWidth = newValue.pw;
	
	        scope.resizeWithOffset = function (offsetH) {
	            scope.$eval(attr.notifier);
	            return { 
	                'height': (newValue.h - offsetH) + 'px'                    
	            };
	        };
	    }, 
	    true);
	    
	    w.bind('resize', function () {
	        scope.$apply();
	    });
	}
})
.factory('chartIdService', ['$http', function($http){
    var _count = 0;
    var _getNewId = function () {
        return "selfgen_chartid_"+_count++;
    };
    return {
        getNewId : _getNewId
    };
}])




.factory('alarmRecordsAPI', ['$http', function($http){
	
	var _alarmsIp = "https://galaxy2021temp.pcsgalaxy.net:9453/db/query";
	
	var _getAlarmsByStation = function(_station, _start, _end){
		var _url = _alarmsIp;
		var _requestString = '{}';
		
		var _config = {
				method: 'POST',
				headers: {'collection' : _station+'_NiagaraAlarms'},
				url : _url,
				data: _requestString
		};
		return new Promise(function(resolve,reject){
			$http(_config)
				.success(function(_data){
					resolve(_data)
				})
				.error(function(_data,_status){
					reject({data:_data,status:_status});
				});
		})		
	};
	
	var _serviceObj = {
			getAlarmsByStation	:_getAlarmsByStation
	};
	return _serviceObj;
	
}])
.factory('featureCheck',[function(){

	var _addScript = function(url){
		var script = document.createElement('script');
		script.src = url;
		var head = document.getElementsByTagName('head')[0],done=false;
		
		script.onload = script.onreadystatechange = function(){
			if(!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')){
				done = true;
				script.onload = script.onreadystatechange=null;
				head.removeChild(script);
			};
		};
		head.appendChild(script);
	}
	
	var _checkPromise = function(){
		if(typeof(Promise) === "undefined"){	
			console.log("promise undefined");
			_addScript('bower_components/bluebird/js/browser/bluebird.min.js');
		}
	}()
	
	var serviceObject = {
		checkPromise:_checkPromise
	}
	
	return serviceObject;
}])