angular.module('icDash.pciService', ['ui.router'])

.factory('userPrefService', ['$rootScope', 'cleaningService', function($rootScope, cleaningService){
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
  
.factory('eventPageService', [ '$rootScope', function($rootScope){
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
  }])
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
.factory('SkySparkAPI',['$http',function($http){
	var _skySparkIp = "https://galaxy2021temp.pcsgalaxy.net:9453/api/galaxy/";

	var _readFromId = function(_id){
		var _req = {
				method:"POST",
				url:_skySparkIp+"read/",
				headers:{
					"Content-Type":"text/zinc;charset=utf-8",
					"Authorization":"Basic ZGV2OjEyMzQ1",
					"Accept":"text/csv"
				},
				data:"ver:\"2.0\"\n"+
					"id\n"+
					_id
		}
		return _actuallyRequest(_req);
	}

	var _getEquipOnStation = function(_station){
		var _req = {
				method:"POST",
				url:_skySparkIp+"read/",
				headers:{
					"Content-Type":"text/zinc;charset=utf-8",
					"Authorization":"Basic ZGV2OjEyMzQ1",
					"Accept":"text/csv"
				},
				data:"ver:\"2.0\""+"\n"+
					"filter"+"\n"+
					"\"equip and siteRef->station==\\\""+_station+"\\\"\""
		}
		return _actuallyRequest(_req);
	}
	
	var _getStations = function(){
		var _req = {
				method:"POST",
				url:_skySparkIp+"read/",
				headers:{
					"Content-Type":"text/zinc;charset=utf-8",
					"Authorization":"Basic ZGV2OjEyMzQ1",
					"Accept":"text/csv"
				},
				data:"ver:\"2.0\""+"\n"+
					"filter"+"\n"+
					"\"site\""
		}
		return _actuallyRequest(_req);
	}
	
	var _getStationByAbbr = function(_station){
		var _req = {
				method:"POST",
				url:_skySparkIp+"read/",
				headers:{
					"Content-Type":"text/zinc;charset=utf-8",
					"Authorization":"Basic ZGV2OjEyMzQ1",
					"Accept":"text/csv"
				},
				data:"ver:\"2.0\""+"\n"+
					"filter"+"\n"+
					"\"site and station==\\\""+_station+"\\\"\""
		}
		
		return _actuallyRequest(_req);
	}
	
	var _getPointsOnEquipId = function(_equip){
		var _req = {
				method:"POST",
				url:_skySparkIp+"read",
				headers:{
					"Content-Type":"text/zinc;charset=utf-8",
					"Authorization":"Basic ZGV2OjEyMzQ1",
					"Accept":"text/csv"
				},
				data:"ver:\"2.0\""+"\n"+
					"filter"+"\n"+
					"\"point and equipRef=="+_equip+"\""
		}
		
		return _actuallyRequest(_req);
		
	}
	
	var _getHistoryForId = function(_id,_start,_end){
		
		var sparkDayFormat = d3.time.format("%Y-%m-%d");

		_start = _start === undefined ? "2000-01-01" : sparkDayFormat(new Date(_start));
		_end = _end === undefined ? sparkDayFormat(new Date()) : sparkDayFormat(new Date(_end));
		
		var date = ",\""+_start+","+_end+"\"";
		
		var _data = typeof(_id)=== "string" ? _id+date : function(){
			var _ids = "";
			
			for(var i = 0; i < _id.length-1; i++){
				_ids+= _id[i]+date+"\n";
			}
			_ids+=_id[_id.length-1]+date;
			return _ids;
		}();
		
		var _req = {
				method:"POST",
				url:_skySparkIp+"hisRead/",
				headers:{
					"Content-Type":"text/zinc;charset=utf-8",
					"Authorization":"Basic ZGV2OjEyMzQ1",
					"Accept":"text/csv"
				},
				data:"ver:\"2.0\""+"\n"+
					"id,range"+"\n"+
					_data
		}
		
		return _actuallyRequest(_req);
	}
	
	var _getByEquipAndSiteNamesAndTags = function(_equip,_site,_tags){ // Generic catch all, conveniece method for equipName and stationName, tags can be a single string or an array of filter strings
		var _data = "\"id"; // contains id as a guaranteed call, so not have to deal with special exceptions around spaces and and

		if(_equip !== undefined){_data += " and equipRef->navName==\\\""+_equip+"\\\""}
		if(_site !== undefined){_data += " and siteRef->station==\\\""+_site+"\\\""}
		
		if(_tags !== undefined){
			if(typeof(_tags) === "string"){_data += " and "+_tags+"";}
			else{
				for(var i = 0; i < _tags.length; i++){
					_data+= " and "+_tags[i];
				}
				
			}
		}
		_data+="\"";
		
		var _req = {
				method:"POST",
				url:_skySparkIp+"read/",
				headers:{
					"Content-Type":"text/zinc;charset=utf-8",
					"Authorization":"Basic ZGV2OjEyMzQ1",
					"Accept":"text/csv"
				},
				data:"ver:\"2.0\""+"\n"+
					"filter"+"\n"+
					_data
		}
		
		return _actuallyRequest(_req);
	}
	
	
	var _getEventsByDate = function(_facility,_createdDateRange,_updatedDateRange,_status){
		var sparkDayFormat = d3.time.format("%Y-%m-%d");
		var _data = "\"eventFilter(";

		if(_facility !== undefined){_data += "\\\""+_facility+"\\\","}
		if(_createdDateRange !== undefined){_data += _createdDateRange === null ? null+"," : sparkDayFormat(new Date(_createdDateRange))+"..2999-01-01,";} 
		if(_updatedDateRange !== undefined){_data += _updatedDateRange === null ? null+"," : sparkDayFormat(new Date(_updatedRateRange))+"..2999-01-01,";}
		if(_status !== undefined){_data += _updatedDateRange+")"}
		else{_data += "null)"}
		_data+="\"";
		
		var _req = {
				method:"POST",
				url:_skySparkIp+"eval/",
				headers:{
					"Content-Type":"text/zinc;charset=utf-8",
					"Authorization":"Basic ZGV2OjEyMzQ1",
					"Accept":"text/csv"
				},
				data:"ver:\"2.0\""+"\n"+
					"expr"+"\n"+
					_data
		}

		return _actuallyRequest(_req);
	}
	
	
	var _actuallyRequest = function(_req){
		var start = new Date();
		return new Promise(function(resolve,reject){
			$http(_req)
				.success(function(data,status,something,config){
					var info = d3.csv.parse(data);
					if(info === undefined || info === null || info.length === 0){reject(info);}
					else{resolve(info);}
				})
				.error(function(data,status,something,config){console.log("error",data,status,something,config);reject({});})
			;
		})
	}
	
	var serviceObject = {
		getEquipOnStation:_getEquipOnStation,
		readFromId:_readFromId,
		getPointsOnEquipId:_getPointsOnEquipId,
		getStations:_getStations,
		getStationByAbbr:_getStationByAbbr,
		getHistoryForId:_getHistoryForId, // leave start/end undefined for all history for the ids, id can be a single string or an array of strings
		getByEquipAndSiteNamesAndTags:_getByEquipAndSiteNamesAndTags,
		getEventsByDate:_getEventsByDate,
		actuallyRequest:_actuallyRequest,
		ip:_skySparkIp
	}
	
	return serviceObject; 
}])
.factory('BMSRecordsAPI',['$http','SkySparkAPI',function($http,ss){	
	
	var _getExpectedConsumptionForDay = function(_station, _time, _zeroDbTemp){
		if(_zeroDbTemp === undefined || _zeroDbTemp === null){_zeroDbTemp = 0;}
		
		var ssFormat = d3.time.format("%Y-%m-%d");
		
		var _url = _time.hasOwnProperty("length") ? 
		  ss.ip+"eval?expr=rangedDailyExpectedConsumption(\""+_station+"\","+ssFormat(new Date(_time[0]))+","+ssFormat(new Date(_time[1]))+","+_zeroDbTemp+")"
		: ss.ip+"eval?expr=dailyExpectedConsumption(\""+_station+"\","+ssFormat(new Date(_time))+","+_zeroDbTemp+")"

		return new Promise(function(resolve,reject){
			var _req = {
					method:"GET",
					url:_url,
					headers:{
						"Content-Type":"text/zinc;charset=utf-8",
						"Authorization":"Basic ZGV2OjEyMzQ1",
						"Accept":"text/csv"
					}
			}
			$http(_req)
				.success(function(val){
					var myVal = d3.csv.parse(val);
					_time.hasOwnProperty("length") ? function(){
						var output = [];
						
						for(var i = 0; i < myVal.length; i++){
							output.push({
								timestamp:new Date(myVal[i].timestamp),
								consumption:parseFloat(myVal[i].consumption)
							})
						}
						resolve({content:{expected:output}})
					}()
					: resolve({content:{expected:parseFloat(myVal[0].val)}});
			}).error(function(error){reject(error)})
		})
	}
	
	var _findEnergyHistoryIds = function(_station){
		return new Promise(function(resolve,reject){
			ss.getByEquipAndSiteNamesAndTags(undefined,_station,["energy","point"]).then(
				function(objs){
					var hisIds = [];
					for(var i = 0; i < objs.length; i++){
						hisIds.push(objs[i].id.substring(0,objs[i].id.indexOf(" ")));
					}
					resolve({_embedded:{strings:hisIds}});
				},
				function(error){reject(error);}
			)
		})
	}
	
	var _findNewestRecordByHistoryId = function(_historyId){
		return new Promise(function(resolve,reject){
			ss.readFromId(_historyId).then(
				function(point){
					if(point.length === 1){
						resolve({
							pointName:point[0].navName,
							historyId:point[0].id.substring(0,point[0].id.indexOf(" ")),
							timestamp:point[0].hisEnd,
							value:parseFloat(point[0].hisEndVal),
							status:point[0].hisStatus,
							units:point[0].unit,
						})
					}else{reject(point);}
				},
				function(error){reject(error);}
			)
		})
	}
	
	var _groupRecordsDailyForHistoryId = function(_historyId,startTime,endTime){
		var dayFormat = d3.time.format("%x")
		
		return new Promise(function(resolve,reject){
			ss.getHistoryForId(_historyId,startTime,endTime).then(
				function(rawHistories){
					var histories = {};
					for(var i = 0; i < rawHistories.length; i++){
						var hist = rawHistories[i];
						var ts = new Date(hist.ts.substring(0,hist.ts.indexOf(" ")));
						var date = dayFormat(ts);

						var tempObj = {};
						tempObj[ts] = parseFloat(hist.val);
						
						if(histories.hasOwnProperty(date) === false){
							histories[date] = {};
						}

						angular.extend(histories[date],tempObj);
					}
					
					resolve(histories);
				},
				function(error){
					reject(error);
				}
			)
		})
	}
	 
	var serviceObject = {
			findEnergyHistoryIds			:_findEnergyHistoryIds,
			findNewestRecordByHistoryId		:_findNewestRecordByHistoryId,
			groupRecordsDailyForHistoryId 	:_groupRecordsDailyForHistoryId,
			getExpectedConsumptionForDay	:_getExpectedConsumptionForDay,
	}
	
	return serviceObject;
}])

.factory('AssetsAPI',['$http','SkySparkAPI',function($http,ss){	
	
	var _getUniqueAssetNames = function(_facility){
		return new Promise(function(resolve,reject){
			ss.getEquipOnStation(_facility).then(
				function(assets){
					var assetNames = [];
					
					for(var i = 0; i < assets.length; i++){
						assetNames.push(assets[i].navName);
					}
					
					resolve(assetNames)},
				function(error){reject(error)}
			)
		})
	}
	
	var _getAllAssetsByType = function(_facility,_assetType){
		if(_assetType === "AHUs"){_assetType = "ahu"}
		else if(_assetType === "VAVs"){_assetType = "vav"}
		else if(_assetType === "CoolingTowers"){_assetType = "coolingTower"}
		else if(_assetType === "Plants"){_assetType = "chiller"}
		else if(_assetType === "Meters"){_assetType = "meter"}
		
		return new Promise(function(resolve,reject){
			var assets = [];
			
			ss.getByEquipAndSiteNamesAndTags(undefined,_facility,["equipRef->"+_assetType,"point"]).then(
				function(points){
					var assetObj = {};
					
					for(var i = 0; i < points.length; i++){
						var siteName = points[i].siteRef.substring(points[i].siteRef.indexOf(" ")+1);
						var equipId = points[i].equipRef.substring(0,points[i].equipRef.indexOf(" "));
						
						var assetName = points[i].equipRef.substring(points[i].equipRef.indexOf(siteName)+siteName.length+1);
						
						if(assetObj.hasOwnProperty(assetName) == false){
							assetObj[assetName] = {
								assetName:assetName,
								assetType:_assetType,
								assetId: equipId,
								points:[]
							}
						}
						
						assetObj[assetName].points.push({
							pointName:points[i].navName,
							historyId:points[i].id.substring(0,points[i].id.indexOf(" ")),
							pointUnits:points[i].unit,
							historyStatus:points[i].hisStatus,
							pciTag:points[i].navName
						})
					}
					
					
					var assetArray = [];
					for(var obj in assetObj){
						assetArray.push(assetObj[obj]);
					}

					resolve(assetArray);
				},
				function(error){
					reject(error)
				}
			)
		})
		
	}
	
	var _getAllAHUs = function(_facility){
		return _getAllAssetsByType(_facility,"ahu");
	}
	
	var _getAllVAVs = function(_facility){
		return _getAllAssetsByType(_facility,"vav");
	}
	
	var _findAssetByName = function(_facility,_assetName){
		var asset = {assetName:_assetName,points:[]};
		return new Promise(function(resolve,reject){
			ss.getByEquipAndSiteNamesAndTags(_assetName,_facility,"point").then(
				function(rawPoints){
					for(var i = 0; i < rawPoints.length; i++){
						var pt = rawPoints[i];
						var tempObj = {
								pointName:pt.navName,
								historyId:pt.id.substring(0,pt.id.indexOf(" ")),
								pciTag:pt.navName
						};
						
						asset.points.push(tempObj);
					}
					
					resolve(asset)},
				function(error){reject(error)}
			)
		})
	}
	 
	var serviceObject = {
			getUniqueAssetNames	:_getUniqueAssetNames,
			getAllAssetsByType	:_getAllAssetsByType,
			getAllAHUs			:_getAllAHUs,
			getAllVAVs 			:_getAllVAVs,
			findAssetByName		:_findAssetByName
	}
	
	return serviceObject;
}])
.factory('alarmRecordsAPI', ['$http', function($http){
	
	var _alarmsIp = "http://10.239.3.132:8111/db/query";
	
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

























