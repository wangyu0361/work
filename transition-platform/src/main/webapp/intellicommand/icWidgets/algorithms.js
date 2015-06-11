'use strict';

angular.module('icDash.algorithms', ['ui.router'])

/**angular.module('myApp.algorithms', ['ngRoute', 'ui.grid', 'ui.grid.autoResize', 
                                    'myApp.dashboard', 'myApp.panelComponent', 
                                    'myApp.popout', 'ui.bootstrap',
									'myApp.pciService', // Config service
									'myApp.clientService', // Client service
									'myApp.dashboardTransitionService', // Dashboard transition service
									'myApp.facilitySelector', // Facility selector service
									'myApp.calendar',
									'myApp.ticketImpulse',
									'colorpicker.module',									
									])
**/
.factory('algorithmsDataService',  ['$http', '$rootScope', 'algorithmsViewControlService', function($http, $rootScope, algorithmsViewControlService){
	var serviceObject = {};
	
	var requestString; 
		
	var _getAlgorithmData = function(configObj){
		//var OB = configObj;
		////console.log(OB);
		var organization;
		var station;
		/*//console.log(configObj.clientName);
		//console.log(configObj.stationName);
		//console.log(configObj.assetName);*/
		
		var lifeTime = function(){
			if(algorithmsViewControlService.getRenderAssetView()){
				station = algorithmsViewControlService.getFacilityName();
				var asset = algorithmsViewControlService.getAssetName();
				requestString =  "{\"stationName\" : \""+station+"\", \"asset\" : \""+asset+"\"}"
			}
			else if(algorithmsViewControlService.getRenderFacilityView()){
				station = algorithmsViewControlService.getFacilityName();
				requestString = "{\"stationName\" : \""+station+"\"}"
			}
			else{
				organization = algorithmsViewControlService.getOrganizationName();
				/*if(organization === undefined){
					organization = "Merck";
				}*/
				requestString = "{\"client\" : \""+organization+"\"}"
			}
		};
		var customTimeFrame = function(){
			var start;
			var end;
			if(algorithmsViewControlService.getEndDate() === undefined || algorithmsViewControlService.getEndDate() === ""){
				start = new Date(algorithmsViewControlService.getStartDate());
				end = new Date();
			}
			else if(algorithmsViewControlService.getStartDate() === undefined || algorithmsViewControlService.getStartDate() === ""){
				start = new Date(2005,1,1);
				end = new Date(algorithmsViewControlService.getEndDate());
			}
			else{
				start = new Date(algorithmsViewControlService.getStartDate());
				end = new Date(algorithmsViewControlService.getEndDate());
			}
			if(algorithmsViewControlService.getRenderAssetView()){
				station = algorithmsViewControlService.getFacilityName();
				var asset = algorithmsViewControlService.getAssetName();
				requestString =  "{\"createdTime\" : {\"$gt\" : { \"$date\": \""+start.toJSON()+"\" }, \"$lt\": { \"$date\": \""+end.toJSON()+"\" }}, \"stationName\" : \""+station+"\", \"asset\" : \""+asset+"\"}"
			}
			else if(algorithmsViewControlService.getRenderFacilityView()){
				station = algorithmsViewControlService.getFacilityName();
				requestString = "{\"createdTime\" : {\"$gt\" : { \"$date\": \""+start.toJSON()+"\" }, \"$lt\": { \"$date\": \""+end.toJSON()+"\" }}, \"stationName\" : \""+station+"\"}"
			}
			else{
				organization = algorithmsViewControlService.getOrganizationName();
				/*if(organization === undefined){
					organization = "Merck";
				}*/
				requestString = "{\"createdTime\" : {\"$gt\" : { \"$date\": \""+start.toJSON()+"\" }, \"$lt\": { \"$date\": \""+end.toJSON()+"\" }}, \"client\" : \""+organization+"\"}"
			}
		};
		
		if((algorithmsViewControlService.getStartDate()===undefined||algorithmsViewControlService.getStartDate() === "")  && (algorithmsViewControlService.getEndDate()===undefined|| algorithmsViewControlService.getEndDate() === "")){
			lifeTime();
		}
		else{
			customTimeFrame(); 
		}
		////console.log(requestString);
		if(organization === undefined || organization === ""){
			////console.log(configObj);
		}
		//var mongoUrl = "https://galaxy2021temp.pcsgalaxy.net:9453/db/query";
		var mongoUrl = "https://galaxy2021temp.pcsgalaxy.net:9453/db/query";
		
		//var mongoUrl = "http://1.239.3.132:9763/MongoServlet-0.0.1-SNAPSHOT/query";
		var config = {
				method: 'POST',
				//headers: {'Collection' : 'event'},
				headers: {'Collection' : 'events'},
				url: mongoUrl,
				data: requestString	
		};
		return $http(config);
	};
	serviceObject = {
			getAlgorithmData : _getAlgorithmData
	};
	return serviceObject;
}])

.factory('algorithmsViewControlService', ['$rootScope', function($rootScope){
	
	var _serviceObject = {};
	var _redraw = false;
	var _renderOrganizationView;
	var _renderFacilityView;
	var _renderAssetView;
	
	var _organizationName;
	var _facilityName;
	var _assetName;
	var _anomaly;
	
	var _startDate;
	var _endDate;
	
	var _chartId;
	
	//Views Functions.  Graphs will render based on these values
	var _setChartId = function(id){
		_chartId = id;
	}
	var _getChartId = function(){
		return _chartId;
	}
	
	var _setStartDate = function(start){
		_startDate = start;
	}
	var _getStartDate = function(){
		return _startDate;
	}
	var _setEndDate = function(end){
		_endDate = end;
	}
	var _getEndDate = function(){
		return _endDate;
	}
	var _makeRedraw = function(){
		_redraw = !_redraw;
		$rootScope.$broadcast('renderAlgorithmChart');
	}
	var _setRenderOrganizationView = function(render){
		_renderOrganizationView = render;
	}
	var _getRenderOrganizationView = function(){
		return _renderOrganizationView;
	}
	var _setRenderFacilityView = function(render){
		_renderFacilityView = render;
	}
	var _getRenderFacilityView = function(){
		return _renderFacilityView;
	}
	var _setRenderAssetView = function(render){
		_renderAssetView = render;
	}
	var _getRenderAssetView = function(){
		return _renderAssetView;
	}
	//Variables Functions.  Queries will change based on these functions.  Need to include checks such that facilities don't render without organizations, assets don't render without facilities
	var _setOrganizationName = function(organization){
		_organizationName = organization;
	}
	var _getOrganizationName = function(){
		return _organizationName;
	}
	var _setFacilityName = function(facility){
		_facilityName = facility;
	}
	var _getFacilityName = function(){
		return _facilityName;
	}
	var _setAssetName = function(asset){
		_assetName = asset;
	}
	var _getAssetName = function(){
		return _assetName;
	}
	var _setAnomaly = function(anomaly){
		_anomaly = anomaly;
	}
	var _getAnomaly = function(){
		return _anomaly;
	}
	
	_serviceObject = {
			setChartId : _setChartId,
			getChartId : _getChartId,
			makeRedraw : _makeRedraw,
			setEndDate : _setEndDate,
			getEndDate : _getEndDate,
			setStartDate : _setStartDate,
			getStartDate : _getStartDate,
			setRenderOrganizationView : _setRenderOrganizationView,
			getRenderOrganizationView : _getRenderOrganizationView,
			setRenderFacilityView : _setRenderFacilityView,
			getRenderFacilityView : _getRenderFacilityView,
			setRenderAssetView  : _setRenderAssetView,
			getRenderAssetView : _getRenderAssetView,
			setOrganizationName : _setOrganizationName,
			getOrganizationName : _getOrganizationName,
			setFacilityName : _setFacilityName,
			getFacilityName : _getFacilityName,
			setAssetName : _setAssetName,
			getAssetName : _getAssetName,
			setAnomaly : _setAnomaly,
			getAnomaly : _getAnomaly
	}	 
	return _serviceObject;
}])

/**.run(['directiveService', function(directiveService){
	directiveService.addFullComponent({
		tag: function(){return 'algorithms';},
		configTag: function(){return 'algorithms-config';},
		gridTag: function(){return 'algorithms-grid';},
		tagHtml: function(){return "<algorithms></algorithms>";},
		directiveName: function(){return 'algorithms';},
		namespace: function(){return 'algorithms'},
		heading: function(){return 'algorithms-name'},
		paletteImage: function(){return 'pictures/pareto.png';}
		});
}])**/
.directive('algorithms', [function(){
	  return{
		  restrict: 'E',
			//controller: 'algorithmsCtrl',
			templateUrl: 'icWidgets/algorithms.html',
	  }
}])
.directive('algorithmsGrid',[function(){
	  return{
		  restrict:'E',
		  controller: 'algorithmsGridCtrl',
		  templateUrl: 'icWidgets/gridView.html'
	  }
}])
.directive('algorithmsConfig',[function(){
	  return{
		  restrict:'E',
		  controller: 'algorithmsModalOpener',
		  templateUrl: 'icWidgets/algoConfig.html'
	  }
}])
.directive('algorithmsName', [function(){
	return{
		template: "Algorithms Overview"
	};
}])

.controller('algorithmsGridCtrl', ['$scope', '$rootScope', '$controller', 'configService', 'algorithmsViewControlService', function($scope, $rootScope, $controller, awesome, algorithmsViewControl){
	
	$scope.openWorkOrderGrid = function(){
		var thisController = this;
		var superController = $controller('baseWidgetCtrl', {
			"$scope" : $scope
		});
		
		angular.extend(thisController, awesome, superController);
		$scope.config = thisController.getConfig();
		algorithmsViewControl.setChartId($scope.config.anomalyChartId);
		if($scope.config.clientName !== undefined){
			$rootScope.$broadcast('algorithmsGridView');
		}
	};
}])
/** angela removed dashTrans **
.controller('algorithmsCtrl', ['$scope', 'algorithmsDataService', 'chartIdService', 'clientService', '$modal', 'algorithmsViewControlService', 'configService', 'dashTransition', '$controller','facilitySelectorService', 'uiGridConstants', 'userPrefService',
                               function($scope, algorithmsDataService, chartIdService, clientService, $modal, algorithmsViewControlService, awesome, dashTransition, $controller, facilitySelectorService, uiGridConstants, userPrefService){	

*/
.controller('algorithmsCtrl', ['$scope', 'algorithmsDataService', 'chartIdService', 'clientService', '$modal', 'algorithmsViewControlService', 'configService', '$controller','uiGridConstants', 'userPrefService',
                               function($scope, algorithmsDataService, chartIdService, clientService, $modal, algorithmsViewControlService, awesome, $controller, uiGridConstants, userPrefService){	


   $scope.done = false;
	$scope.gridView = false;
	$scope.hideGraphs = false;
	
	/** angela is replacing all of this stuff **
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});
	
	angular.extend(thisController, awesome, superController);
	$scope.config = thisController.getConfig();
	
	$scope.dcName = chartIdService.getNewId();
	$scope.dcFacilityName = chartIdService.getNewId();
	$scope.dcAssetName = chartIdService.getNewId();
	
	var defaultConfig = {
			"assetView" : true,
			"stationView" : false,
			"clientView" : false,
			"assetName" : "",
			"stationName" : "",
			"clientName" : "",
			"startingDate" : "",
			"endingDate" : "",
			"anomalyChartId" : $scope.dcName,
			"facilityChartId" : $scope.dcFacilityName,
			"dcAssetName" : $scope.dcAssetName,
			"closedWorkOrderColor" : "",
			"openWorkOrderColor" : "",
			"dateRange" : ""
	}
    for(var key in defaultConfig){
		 if($scope.config.hasOwnProperty(key) === false){
	  		$scope.config[key] = defaultConfig[key];
	  		}
	}
	/** end area angela replaced **/
	
	
	/** angela's replacement */
	$scope.myChangeType = "organization";
	$scope.dcName = chartIdService.getNewId();
	$scope.dcFacilityName = chartIdService.getNewId();
	$scope.dcAssetName = chartIdService.getNewId();
	
	// Choose settings that this widget cares about
	var defaultConfig = {
		"assetView" : true,
		"stationView" : false,
		"clientView" : false,
		"assetName" : "",
		"stationName" : "",
		"clientName" : "",
		"startingDate" : "",
		"endingDate" : "",
		"anomalyChartId" : $scope.dcName,
		"facilityChartId" : $scope.dcFacilityName,
		"dcAssetName" : $scope.dcAssetName,
		"closedWorkOrderColor" : "",
		"openWorkOrderColor" : "",
		"dateRange" : ""
	};
	var currentConfig = defaultConfig;
	
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});
	angular.extend(thisController, awesome, superController);
	$scope.config = thisController.getConfig();
	// End choose settings that this widget cares about
	
	var setToAssetView = function() {
		currentConfig.startingDate = undefined;
		currentConfig.ending = undefined;
		
		$scope.renderOrg = false;
		$scope.renderFacility = false;
		$scope.renderAsset = true;
		
		$scope.showAssetView = false;
		$scope.showFacilityView = false;
		
		algorithmsViewControlService.setRenderOrganizationView(false);
		algorithmsViewControlService.setRenderFacilityView(false);
		algorithmsViewControlService.setRenderAssetView(true);
		algorithmsViewControlService.setOrganizationName(currentConfig.clientName);
		algorithmsViewControlService.setFacilityName(currentConfig.stationName);
		algorithmsViewControlService.setAssetName(currentConfig.assetName);
		
		$scope.requestData(currentConfig);
	}
	var setToFacilityView = function() {
		currentConfig.assetName = undefined;
		
		$scope.renderOrg = false;
		$scope.renderFacility = true;
		$scope.renderAsset = false;
		
		$scope.showAssetView = false;
		$scope.showFacilityView = false;
		
		algorithmsViewControlService.setRenderOrganizationView(false);
		algorithmsViewControlService.setRenderFacilityView(true);
		algorithmsViewControlService.setRenderAssetView(false);
		algorithmsViewControlService.setOrganizationName(undefined);
		algorithmsViewControlService.setFacilityName(currentConfig.stationName);
		algorithmsViewControlService.setAssetName(undefined);
		
		$scope.requestData(currentConfig);
	}
	var setToOrganizationView = function() {
		currentConfig.assetName = "";
		currentConfig.stationName = "";
		
		$scope.renderOrg = true;
		$scope.renderFacility = false;
		$scope.renderAsset = false;
		
		$scope.showAssetView = false;
		$scope.showFacilityView = false;
		
		algorithmsViewControlService.setRenderOrganizationView(true);
		algorithmsViewControlService.setRenderFacilityView(false);
		algorithmsViewControlService.setRenderAssetView(false);
		algorithmsViewControlService.setOrganizationName(currentConfig.clientName);
		algorithmsViewControlService.setFacilityName(undefined);
		algorithmsViewControlService.setAssetName(undefined);
		
		$scope.requestData(currentConfig);
	}
	
	var refreshConfigs = function() {
		console.log("ALGORITHMS OVERVIEW updating!");
		var myPrefs = userPrefService.getUserPrefs("algorithms");
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
		
		// Update date range
		/**** angela note: shouldn't I do this in user pref service automatically?!*/
		if(currentConfig.dateRange != ""){
			var range = currentConfig.dateRange;
			var dates;
			switch(range){
				case "last month":{
					dates = previousMonth();
					break;
				}
				case "last calendar year":{
					dates = lastFullCalendarYear();
					break;
				}
				case "last twelve months":{
					dates = lastYear();
					break;
				}
				case "last six months":{
					dates = variableMonthsAgo(6);
					break;
				}
				case "lifetime":{
					dates = lifetime();
					break;
				}
			}
			algorithmsViewControlService.setStartDate(dates.startDate);
			algorithmsViewControlService.setEndDate(dates.endDate);
		}
		// End update date range
		
		// Update view type
		switch($scope.myChangeType) {
			case "facility":
			case "station": {
				setToFacilityView();
				break;
			}
			case "asset": {
				setToAssetView();
				break;
			}
			case "organization":
			default: {
				setToOrganizationView();
				break;
			}
		}
		// End update view type
		$scope.config = currentConfig;
		$scope.requestData(currentConfig);
	}
	
	
	/** end angela's replacement section */
	
	
	
	
	$scope.inDashboard = true;
	if(thisController.getFullConfig().dashboard === undefined){
		$scope.inDashboard = false;
	}
	$scope.showFacilityView = false;
	$scope.showAssetView = false;
	$scope.renderOrg = false;
	$scope.callerCount = 0;
	
	var algoData;
	var anomalyTypeChartDomain = [];
	var response = [];
	var variableMonthsAgo = function(number){
		var end = new Date();
		var start = new Date(end.getFullYear(), end.getMonth()-number, end.getDate());
		return {"startDate" : start, "endDate" : end};
	};
	var currentMonth = function(){
		var end = new Date();
		var start = new Date(end.getFullYear(), end.getMonth(), 1);
		return {"startDate" : start, "endDate" : end};
	};
	var previousMonth = function(){
		var today = new Date();
		var end = new Date(today.getFullYear(), today.getMonth(), 0);
		var start = new Date(end.getFullYear(), end.getMonth(), 1);
		return {"startDate" : start, "endDate" : end};
	};
	var previousSixMonths = function(){
		var today = new Date();
		var end = new Date(today.getFullYear(), today.getMonth(), 1);
		var start = new Date(end.getFullYear(), end.getMonth()-6, 1);
		return {"startDate" : start, "endDate" : end};
	};
	var lastYear = function(){
		var end = new Date();
		var start = new Date(end.getFullYear()-1, end.getMonth(), end.getDate());
		return {"startDate" : start, "endDate" : end};
	};
	var lastFullCalendarYear = function(){
		var today = new Date();
		var end = new Date(today.getFullYear(), 0, 1);
		var start = new Date(end.getFullYear()-1, 0, 1);
		return {"startDate" : start, "endDate" : end};
	};
	var lifetime = function(){
		var start = new Date(2005, 1, 1);
		var end = new Date();
		return {"startDate" : start, "endDate" : end};
	}
	if(angular.element(document.getElementById("editorHere")).hasClass("xui-css-dockparent")){
		/*//console.log("You are in the editor");*/
		$scope.inEditor = true;
	}
	else{
		/*//console.log("you are not in the editor.");*/
		$scope.inEditor = false;
	}
	$scope.finishedChanges = false;
	$scope.facilityView = function(){
		if($scope.renderOrg)
		{
			if(!$scope.showAssetView){
			$scope.showFacilityView = !$scope.showFacilityView;
			$scope.makeAFacilityChart();
			}
		}
		else if($scope.renderFacility){
			$scope.assetView();
			$scope.makeAnAssetChart();
		}		
	};
	
	$scope.assetView = function(){
		$scope.showAssetView = !$scope.showAssetView;
	};
		
	$scope.makeFacilityPareto = function(){
		var paretoObjects = [];
		var facilityNames = [];
		var paretoNames = [];
		
		for(var i=0;i<$scope.facilityValues.length;i++){
			if(facilityNames.indexOf($scope.facilityValues[i].facility) == -1){
				facilityNames.push($scope.facilityValues[i].facility)
				paretoObjects.push($scope.facilityValues[i]);
			}
		}
		paretoObjects.sort(function(a,b){
			return b.total - a.total;
		});
		for(var i=0;i<paretoObjects.length;i++){
			paretoNames.push(paretoObjects[i].facility);
		}
		return paretoNames;
	}
	
	$scope.makeAssetsPareto = function(){
		var paretoNames = [];
		var assetNames = [];
		var paretoObjects = [];
		for(var i=0;i<$scope.assetValues.length;i++){
			if(assetNames.indexOf($scope.assetValues[i].asset) === -1){
				assetNames.push($scope.assetValues[i].asset);
				if($scope.assetValues[i].total > 1){
					paretoObjects.push($scope.assetValues[i]);
				}
			}
		}
		/*//console.log(assetNames);
		//console.log($scope.assetValues);
		//console.log(paretoObjects);*/
		paretoObjects.sort(function(a,b){
			return b.total - a.total;
		});
		for(var i=0;i<paretoObjects.length;i++){
			paretoNames.push(paretoObjects[i].asset)
		}
		return paretoNames;
	}
	
	$scope.makeAnomalyPareto = function(data){
		response = [];
		////console.log(data.result);
		for(var i=0;i<data.result.length;i++){
			if(anomalyTypeChartDomain.indexOf(data.result[i].anomaly) === -1 && data.result[i].potentialSaving !== "0"){
				anomalyTypeChartDomain.push(data.result[i].anomaly);
			}
			if(data.result[i].potentialSaving !== "0"){
				response.push(data.result[i]);
			}
		}
		var totalValueAndAnomalyObject = [];
		for(var i=0;i<anomalyTypeChartDomain.length;i++){
			var total = 0;
			for(var j=0;j<response.length;j++){
				if(anomalyTypeChartDomain[i] === response[j].anomaly){
					total += parseFloat(response[j].potentialSaving);
				}
			}
			
			totalValueAndAnomalyObject.push({anomaly:anomalyTypeChartDomain[i], total:total});
		}
		var paretoNames = [];
		totalValueAndAnomalyObject.sort(function(a,b){
			return b.total - a.total;
		});
		////console.log(totalValueAndAnomalyObject);
		for(var i=0;i<totalValueAndAnomalyObject.length;i++){
			if(totalValueAndAnomalyObject[i].anomaly !== undefined){
				paretoNames.push(totalValueAndAnomalyObject[i].anomaly);
			}	
		}
		$scope.anomalyTypeChartDomain = paretoNames;
		$scope.algoData = crossfilter(response);
	};
	$scope.makeAnomaliesReallyPareto = function(){
		var anomalyValues = [];
		var paretoObjects = [];
		
		$scope.anomalyTypeChartDomain = [];
		
		var anomalyLength = $scope.anomalyValues.length;
		for(var i=0;i<anomalyLength;i++){
			if(anomalyValues.indexOf($scope.anomalyValues[i].anomaly) === -1){
				anomalyValues.push($scope.anomalyValues[i]);
			}
		}
		anomalyValues.sort(function(a,b){
			return b.total - a.total;
		});
		for(var i = 0;i < anomalyValues.length; i++){
			$scope.anomalyTypeChartDomain.push(anomalyValues[i].anomaly);
		}
	};
	
/**	$scope.$watch('config', function(nuObj, oldObj){
		/*
		//console.log($scope.config.clientView, $scope.config.stationView, $scope.config.assetView);*
		//if(nuObj.clientView === "" && nuObj.stationView === "" && nuObj.assetView === ""){return;}
		if($scope.done === true){
			return;
		}
		if(nuObj.clientView != "" && (nuObj.clientView === true || nuObj.clientView === "true")){
			////console.log("setting client view true");
			$scope.renderOrg = true; algorithmsViewControlService.setRenderOrganizationView(true);
			$scope.renderFacility = false; algorithmsViewControlService.setRenderFacilityView(false);
			$scope.renderAsset = false; algorithmsViewControlService.setRenderAssetView(false);
		}
		if(nuObj.stationView != "" && (nuObj.stationView === true|| nuObj.stationView === "true")){
			////console.log('setting station view true');
			$scope.renderOrg = false; algorithmsViewControlService.setRenderOrganizationView(false);
			$scope.renderFacility = true; algorithmsViewControlService.setRenderFacilityView(true);
			$scope.renderAsset = false; algorithmsViewControlService.setRenderAssetView(false);
		}
		if(nuObj.assetView != "" && (nuObj.assetView === true|| nuObj.assetView === "true")){
			////console.log('setting asset view true');
			$scope.renderOrg = false; algorithmsViewControlService.setRenderOrganizationView(false);
			$scope.renderFacility = false; algorithmsViewControlService.setRenderFacilityView(false);
			$scope.renderAsset = true; algorithmsViewControlService.setRenderAssetView(true);
		}
		$scope.showAssetView = false;
		$scope.showFacilityView = false;
		var props = [];
		
		for(var key in nuObj){
			if(nuObj[key] === oldObj[key] && nuObj[key]){
				props.push(nuObj[key]);
			}
		}
		////console.log('this many properties are now equal:', props.length);
		
		if(nuObj.dateRange != ""){
			var range = nuObj.dateRange;
			var dates;
			switch(range){
				case "last month":{
					dates = previousMonth();
					break;
				}
				case "last calendar year":{
					dates = lastFullCalendarYear();
					break;
				}
				case "last twelve months":{
					dates = lastYear();
					break;
				}
				case "last six months":{
					dates = variableMonthsAgo(6);
					break;
				}
				case "lifetime":{
					dates = lifetime();
					break;
				}
			}
			algorithmsViewControlService.setStartDate(dates.startDate);
			algorithmsViewControlService.setEndDate(dates.endDate);
		}
		
			if(nuObj.clientName != ""){
				////console.log('setting client name')
				algorithmsViewControlService.setOrganizationName(nuObj.clientName);
			}
			if(nuObj.stationName != ""){
				////console.log('setting station name');
				algorithmsViewControlService.setFacilityName(nuObj.stationName);
			}
			if(nuObj.assetName != ""){
				////console.log("setting asset name");
				algorithmsViewControlService.setAssetName(nuObj.assetName);
				//if(algorithmsViewControlService.getFacilityName() === ""){return;}
			}
		
		////console.log(algorithmsViewControlService.getRenderAssetView());
		if(algorithmsViewControlService.getRenderAssetView() && algorithmsViewControlService.getAssetName() != "" && algorithmsViewControlService.getAssetName() != undefined){
			if(algorithmsViewControlService.getFacilityName() != "" && algorithmsViewControlService.getFacilityName() != undefined){
				////console.log('requesting asset data');
				$scope.requestData();
				$scope.done = true;
			}
		}
		else if(algorithmsViewControlService.getRenderFacilityView() === true && algorithmsViewControlService.getFacilityName() != "" && algorithmsViewControlService.getFacilityName() != undefined){
			////console.log('requesting station data');
			$scope.requestData();
			$scope.done = true;
		}
		else if(algorithmsViewControlService.getRenderOrganizationView() && algorithmsViewControlService.getOrganizationName() != "" && algorithmsViewControlService.getOrganizationName() != undefined){
			////console.log('requesting client data');
			$scope.requestData();
			$scope.done = true;
		}
		
	}, true);
*/

	$scope.$on('renderAlgorithmChart', function(){
		if(algorithmsViewControlService.getChartId() === $scope.config.anomalyChartId){
			if(algorithmsViewControlService.getRenderOrganizationView()){
				$scope.renderOrg = true;
				$scope.renderFacility = false;
				$scope.renderAsset = false;

			}
			else if(algorithmsViewControlService.getRenderFacilityView()){
				$scope.renderOrg = false;
				$scope.renderFacility = true;
				$scope.renderAsset = false;

			}
			else if(algorithmsViewControlService.getRenderAssetView()){
				$scope.renderOrg = false;
				$scope.renderFacility = false;
				$scope.renderAsset = true;
			}
			$scope.showAssetView = false;
			$scope.showFacilityView = false;
			$scope.requestData($scope.config);
		}

	})
	
	/** angela new **/
		$scope.$watch('config', function(){
			refreshConfigs();
		}, true);
		$scope.$on('userPrefsChanged',function(){
			refreshConfigs();
		});
		// Add this to change between facility and org view
		$(window).bind("storage", function(e, changeType) {
			$scope.myChangeType = changeType;
			refreshConfigs();
		});
	/** end angela new **/

	
	
	/** this all becomes obsolete... *
	$scope.$on('organizationSetFacilitySelector', function(){
		
		var client = facilitySelectorService.getOrganization();
		if($scope.config.clientName === client){return;}
		$scope.renderOrg = true;
		$scope.renderFacility = false;
		$scope.renderAsset = false;
		$scope.showAssetView = false;
		$scope.showFacilityView = false;
		
		$scope.config.assetName = undefined;
		$scope.config.stationName = undefined;
		$scope.config.clientName = client;
		$scope.config.stationName = "";
		$scope.config.assetName = "";
		algorithmsViewControlService.setRenderOrganizationView(true);
		algorithmsViewControlService.setRenderFacilityView(false);
		algorithmsViewControlService.setRenderAssetView(false);
		algorithmsViewControlService.setOrganizationName(client);
		algorithmsViewControlService.setFacilityName(undefined);
		algorithmsViewControlService.setAssetName(undefined);
		$scope.requestData($scope.config);
	});
	$scope.$on('facilitySetFacilitySelector', function(){
		var station = facilitySelectorService.getFacility();
		var asset = facilitySelectorService.getAsset();
		/*
		//console.log('asset is: ');
		//console.log(asset);*
		//if($scope.config.stationName === station){return;}		
		$scope.renderOrg = false;
		$scope.renderFacility = true;
		$scope.renderAsset = false;
		
		$scope.showAssetView = false;
		$scope.showFacilityView = false;
		
		
		$scope.config.stationName = station;
		$scope.config.assetName = undefined;
		
		algorithmsViewControlService.setRenderOrganizationView(false);
		algorithmsViewControlService.setRenderFacilityView(true);
		algorithmsViewControlService.setRenderAssetView(false);
		
		algorithmsViewControlService.setOrganizationName(undefined);
		algorithmsViewControlService.setFacilityName(station);
		algorithmsViewControlService.setAssetName(undefined);
		
		$scope.requestData($scope.config);
	});
	$scope.$on('assetSetFacilitySelector', function(){
		/*
		//console.log("asset changed");*
		var station = facilitySelectorService.getFacility();
		var client = facilitySelectorService.getOrganization();
		var asset = facilitySelectorService.getAsset();
		
		$scope.renderOrg = false;
		$scope.renderFacility = false;
		$scope.renderAsset = true;
		
		$scope.showAssetView = false;
		$scope.showFacilityView = false;
		
		$scope.config.startingDate = undefined;
		$scope.config.endingDate = undefined;
		$scope.config.stationName = station;
		$scope.config.assetName = asset;
		
		$scope.config.assetName = asset;
		algorithmsViewControlService.setRenderOrganizationView(false);
		algorithmsViewControlService.setRenderFacilityView(false);
		algorithmsViewControlService.setRenderAssetView(true);
		algorithmsViewControlService.setOrganizationName(client);
		algorithmsViewControlService.setFacilityName(station);
		algorithmsViewControlService.setAssetName(asset);
		$scope.requestData($scope.config);
	});
	/** end area that becomes obsolete **/
	
	$scope.$on('algorithmsGridView', function(){
		if(algorithmsViewControlService.getChartId() === $scope.config.anomalyChartId){
			$scope.openWorkOrderGrid();
		}
	});
	
	$scope.requestData = function(){
		$scope.gridView = false;
		$scope.hideGraphs = false;
		$scope.drawChartNow = false;
		
		if($scope.config.clientName === undefined){
			$scope.hasOrg = false; 
		}
		else{
			$scope.hasOrg = true;
		}
		if(($scope.config.assetName === "" || $scope.config.assetName === undefined) && ($scope.config.stationName === "" || $scope.config.stationName === undefined)){
			$scope.renderOrg = true;
			$scope.renderFacility = false;
			$scope.renderAsset = false;
		}
		else if($scope.config.assetName === "" || $scope.config.assetName === undefined){
			$scope.renderOrg = false;
			$scope.renderFacility = true;
			$scope.renderAsset = false;
		}
		else{
			$scope.renderOrg = false;
			$scope.renderFacility = false;
			$scope.renderAsset = true;
		}
		
		anomalyTypeChartDomain = [];		
		
		algorithmsDataService.getAlgorithmData().success(function(data){
			if(data.result === null || data.result.length === 0){
				//alert("No data for the most recent request. Invalid configuration object."); 
				$scope.gridView = false;
				$scope.hideGraphs = false;
				$scope.drawChartNow = false;
				$scope.noData = true;
				return; 
			}else{
				$scope.noData = false;
			}
			
			////console.log(data.result);
			
			$scope.bounce = false;
			if($scope.bounce || $scope.noData){return;}
			//console.log(data);
			$scope.makeAnomalyPareto(data);
			
			$scope.createGroupsAndDimensions();			
			
			$scope.makeAnAlgorithmChart();
			
			$scope.drawChartNow = true;
			
		})
		.error(function(error){
			/*$scope.drawChartNow = true;
			$scope.hasOrg = true;
			$scope.bounce = true;
			d3.json("/app/offlineData/algorithms/deutscheBankEventdata.json",function(json){
     			$scope.config.clientName = "Deutsche Bank";
				$scope.hasOrg = true;
				$scope.makeAnomalyPareto(json.data);
				$scope.createGroupsAndDimensions();
     			$scope.makeAnAlgorithmChart();
     		});*/
		})
		.finally(function(data){	
			////console.log('nice one');
		});
	}
	$scope.makeAnAlgorithmChart = function(){
		try{
			$scope.anomalyValues = [];
			 var anomalyTypeBarChart = dc.barChart("#anomaly_type_barchart_"+$scope.dcName)
					.width(300)
					.height(500)
					.margins({top: 50, right: 20, bottom: 250, left: 75})
					.dimension($scope.algorithmDimension)
					.group($scope.anomalyTicketValueGroup, "Closed Work Orders")
					.valueAccessor(function(p){return p.value.closedTicketValue;})
					.stack($scope.anomalyTicketValueGroup, 'Open Work Orders', function(p){return p.value.openTicketValue;})
					//.yAxisLabel('Total Avoidable Cost')
					.elasticX(false)
					.elasticY(true)
					.yAxisPadding('5%')
					.centerBar(false)
					.barPadding(0.05)
					.x(d3.scale.ordinal().domain($scope.anomalyTypeChartDomain))
					.xUnits(dc.units.ordinal)
					.renderHorizontalGridLines(true)
					.renderLabel(true)
					.title(function(p){$scope.anomalyValues.push({anomaly:p.key, total:p.value.totalValue}); return "Organization: "+$scope.config.clientName+"\nAnomaly: "+p.key+"\nRealized Avoidable Cost: $"+Math.round(p.value.closedTicketValue)+"\nPotential Avoidable Cost: $"+Math.round(p.value.openTicketValue)+"\nTotal Avoidable Cost: $"+Math.round(p.value.totalValue);})
					.renderTitle(true)
					.brushOn(false)
					.legend(dc.legend() 					
			    	    .x(0) 
						.y(0)
			    	    .itemHeight(13)
			    	    .gap(5)
			    	)
			    	.on('renderlet', function(chart){
						chart.selectAll("rect")
						.on("mouseup", function(d){
							algorithmsViewControlService.setAnomaly(d.data.key);
						});
					})
					.on('renderlet', function(chart){
						chart.selectAll("g.x text")
							.attr('transform', "rotate(-80)")
							.attr('dx', '-10')
							.attr('dy', '-5')
							.style("text-anchor", "end")
						;
					});
					if($scope.config.openWorkOrderColor !== undefined && $scope.config.closedWorkOrderColor !== undefined){
						anomalyTypeBarChart.ordinalColors([$scope.config.closedWorkOrderColor, $scope.config.openWorkOrderColor])
					}
					
					anomalyTypeBarChart
						.transitionDuration(150) //prevents delay in d3 x-axis being rotated
						.render();
					$scope.makeAnomaliesReallyPareto();
					anomalyTypeBarChart
						.x(d3.scale.ordinal().domain($scope.anomalyTypeChartDomain))
						.render();
					if(algorithmsViewControlService.getRenderAssetView()){
						anomalyTypeBarChart
							.on("postRender", function(chart){
								chart.selectAll('rect')
									.on('click', function(d){
										//var eventPageString = {"ctl_eventpage1":{"tag":"","desc":"","dataBinder":"","dataField":"","autoTips":true,"className":"","disableClickEffect":false,"disableHoverEffect":false,"disableTips":false,"disabled":false,"defaultFocus":false,"hoverPop":"","hoverPopType":"outer","dock":"none","dockIgnore":false,"dockOrder":1,"showEffects":"","hideEffects":"","dockFloat":false,"dockMinW":0,"dockMinH":0,"tips":"","rotate":0,"left":0,"top":0,"width":1600,"height":"auto","right":"auto","bottom":"auto","renderer":null,"zIndex":1,"tabindex":1,"position":"relative","visibility":"","display":"","selectable":false,"workOrderNumber":"","stationName":$scope.config.stationName,"assetName":$scope.config.assetName,"anomalyType":d.data.key,"chartStart":$scope.config.startingDate,"chartEnd":$scope.config.endingDate,"axis":{"label":"","autoAxis":true,"pointsOnAxis":[{"pointName":"","stationName":"","assetName":""}]},"allPoints":["B100_KWH","B200_KWH"],"config":{"workOrderNumber":"","stationName":"","assetName":"","anomalyType":"","chartStart":"2014-03-10T17:10:44.458Z","chartEnd":"2015-03-10T17:10:44.458Z","axis":[{"label":"","autoAxis":true,"pointsOnAxis":[{"pointName":"","stationName":"","assetName":""}]}],"allPoints":["B100_KWH","B200_KWH"]},"asset":"","parentAlias":"canvas","classKey":"xui.UI.EventPage"}};
										//var eventPageString = {"ctl_eventpage1":{"tag":"","desc":"","dataBinder":"","dataField":"","autoTips":true,"className":"","disableClickEffect":false,"disableHoverEffect":false,"disableTips":false,"disabled":false,"defaultFocus":false,"hoverPop":"","hoverPopType":"outer","dock":"none","dockIgnore":false,"dockOrder":1,"showEffects":"","hideEffects":"","dockFloat":false,"dockMinW":0,"dockMinH":0,"tips":"","rotate":0,"left":0,"top":0,"width":100%,"height":"auto","right":"auto","bottom":"auto","renderer":null,"zIndex":1,"tabindex":1,"position":"relative","visibility":"","display":"","selectable":false,"workOrderNumber":"","stationName":$scope.config.stationName,"assetName":$scope.config.assetName,"anomalyType":d.data.key,"chartStart":$scope.config.startingDate,"chartEnd":$scope.config.endingDate,"axis":[""],"allPoints":["B100_KWH","B200_KWH"],"config":{"workOrderNumber":"","stationName":"","assetName":"","anomalyType":"","chartStart":"2014-03-10T17:10:44.458Z","chartEnd":"2015-03-10T17:10:44.458Z","axis":[],"allPoints":["B100_KWH","B200_KWH"]},"asset":"","parentAlias":"canvas","classKey":"xui.UI.EventPage"}};
										var eventPageString = {"ctl_eventpage1":{"tag":"","desc":"","dataBinder":"","dataField":"","autoTips":true,"className":"","disableClickEffect":false,"disableHoverEffect":false,"disableTips":false,"disabled":false,"defaultFocus":false,"hoverPop":"","hoverPopType":"outer","dock":"none","dockIgnore":false,"dockOrder":1,"showEffects":"","hideEffects":"","dockFloat":false,"dockMinW":0,"dockMinH":0,"tips":"","rotate":0,"left":0,"top":0,"width":"100%","height":"auto","right":"auto","bottom":"auto","renderer":null,"zIndex":1,"tabindex":1,"position":"relative","visibility":"","display":"","selectable":false,"workOrderNumber":"","stationName":$scope.config.stationName,"assetName":$scope.config.assetName,"anomalyType":d.data.key,"chartStart":$scope.config.startingDate,"chartEnd":$scope.config.endingDate,"axis":[],"allPoints":[],"config":{"workOrderNumber":"","stationName":$scope.config.stationName,"assetName":$scope.config.assetName,"anomalyType":d.data.key,"chartStart":"2014-03-10T17:10:44.458Z","chartEnd":"2015-03-10T17:10:44.458Z","axis":[],"allPoints":["B100_KWH","B200_KWH"]},"asset":"","parentAlias":"canvas","classKey":"xui.UI.EventPage"}};

								/*		$.ajax({
											url: "/xui",
											type: "post",
											data: JSON.stringify(eventPageString),
											headers: {
												"dataObj" : JSON.stringify(eventPageString),
												"Content-Type" : "application/json"
											},
											dataType: "html"
												
										}).done(function(data){
											//console.log(data);
											var newTab = window.open("", "_blank");
											window.setTimeout(
													function(){
														newTab.document.write(data);
													}, 1000);
										});*/
									})//end of on click function 
							}) //end of .on function
								
					} //end of if
					
		
		}
		catch(error){
			//console.log(error);
		}
		finally{
			algorithmsViewControlService.setOrganizationName(undefined);
			algorithmsViewControlService.setFacilityName(undefined);
			algorithmsViewControlService.setAssetName(undefined);
			$scope.done = false;
		}
	}

	$scope.makeAFacilityChart = function(){
			if($scope.showFacilityView && !$scope.showAssetView){
			try{
				$scope.facilityValues = [];
				$scope.facilityTypeRowChart = dc.barChart("#facility_type_rowchart_"+$scope.dcFacilityName)
					.width(250)
					.height(250)
					.margins({top: 60, right: 10, bottom: 50, left: 60})
					.dimension($scope.facilityDimension)
					.barPadding(0.05)
					.yAxisPadding('5%')
					.centerBar(false)
					.yAxisLabel("Total Avoidable Cost by Facility")
					.elasticY(true)
					.renderHorizontalGridLines(true)
					.group($scope.facilityRowChartGroup)
					.valueAccessor(function(q){return q.value.closedTicketValue;})
					.stack($scope.facilityRowChartGroup, function(q){return q.value.openTicketValue;})
					.x(d3.scale.ordinal().domain([]))
					.xUnits(dc.units.ordinal)
					.transitionDuration(150)
					.title(function(q){ $scope.facilityValues.push({facility: q.key, total: q.value.totalValue}); return "Facility: "+q.key+"\nRealized Avoidable Cost: $"+Math.round(q.value.closedTicketValue)+"\nPotential Avoidable Cost: $"+Math.round(q.value.openTicketValue)+"\nTotal Avoidable Cost: $"+Math.round(q.value.totalValue);})
					.on('renderlet', function(chart){
						chart.selectAll("g.x text")
						.attr('transform', "rotate(-80)")
						.attr('dx', '-10')
						.attr('dy', '-5')
						.style("text-anchor", "end")
						;
					})
					.on('renderlet', function(chart){
						chart.selectAll("rect")
						.on("mouseup", function(d){
							algorithmsViewControlService.setFacilityName(d.data.key);
						});
					})
				;					
			}
			catch(error){
				//console.log(error.message);
			}
			finally{
				$scope.facilityTypeRowChart.render();
				var ordinal = $scope.makeFacilityPareto();
				$scope.facilityTypeRowChart
				.x(d3.scale.ordinal().domain(ordinal))
				if($scope.config.openWorkOrderColor !== undefined && $scope.config.closedWorkOrderColor !== undefined){
					$scope.facilityTypeRowChart.ordinalColors([$scope.config.closedWorkOrderColor, $scope.config.openWorkOrderColor])
				}
				$scope.facilityTypeRowChart.render();	
			
			}
		}
	}

	$scope.makeAnAssetChart = function(){
		if($scope.showAssetView){
			try{
				$scope.assetValues = [];
					$scope.assetTypeRowChart = dc.barChart("#asset_type_rowchart_"+$scope.dcAssetName)
						.width(250)
						.height(250)
						.margins({top: 20, right: 10, bottom: 75, left: 60})
						.dimension($scope.assetDimension)
						.barPadding(0.05)
						.yAxisPadding('5%')
						.centerBar(false)
						.yAxisLabel("Total Avoidable Cost by Asset")
						.elasticY(true)
						.renderHorizontalGridLines(true)
						.group($scope.assetRowChartGroup)
						.valueAccessor(function(q){return q.value.closedTicketValue;})
						.stack($scope.assetRowChartGroup, function(q){return q.value.openTicketValue;})
						.x(d3.scale.ordinal().domain([]))
						.xUnits(dc.units.ordinal)
						.transitionDuration(150)
						.title(function(q){$scope.assetValues.push({asset:q.key, total:q.value.totalValue});return "Asset: "+q.key+"\nRealized Avoidable Cost: $"+Math.round(q.value.closedTicketValue)+"\nPotential Avoidable Cost: $"+Math.round(q.value.openTicketValue)+"\nTotal Avoidable Cost: $"+Math.round(q.value.totalValue);})
						.on('renderlet', function(chart){
							chart.selectAll("rect")
							.on("click", function(d){
								
								var ePageConfig = {
										"stationName" : algorithmsViewControlService.getFacilityName(),
										"anomalyType" : algorithmsViewControlService.getAnomaly(),
										"asset" : d.data.key,
										"chartStart" : $scope.config.startingDate,
										"chartEnd" : $scope.config.endingDate
								};
								//var eventPageString = {"ctl_eventpage1":{"tag":"","desc":"","dataBinder":"","dataField":"","autoTips":true,"className":"","disableClickEffect":false,"disableHoverEffect":false,"disableTips":false,"disabled":false,"defaultFocus":false,"hoverPop":"","hoverPopType":"outer","dock":"none","dockIgnore":false,"dockOrder":1,"showEffects":"","hideEffects":"","dockFloat":false,"dockMinW":0,"dockMinH":0,"tips":"","rotate":0,"left":0,"top":0,"width":1600,"height":"auto","right":"auto","bottom":"auto","renderer":null,"zIndex":1,"tabindex":1,"position":"relative","visibility":"","display":"","selectable":false,"workOrderNumber":"","stationName":ePageConfig.stationName,"assetName":ePageConfig.asset,"anomalyType":ePageConfig.anomalyType,"chartStart":$scope.config.startingDate,"chartEnd":$scope.config.endingDate,"axis":{"label":"","autoAxis":true,"pointsOnAxis":[{"pointName":"","stationName":"","assetName":""}]},"allPoints":["B100_KWH","B200_KWH"],"config":{"workOrderNumber":"","stationName":"","assetName":"","anomalyType":"","chartStart":"2014-03-10T17:10:44.458Z","chartEnd":"2015-03-10T17:10:44.458Z","axis":[{"label":"","autoAxis":true,"pointsOnAxis":[{"pointName":"","stationName":"","assetName":""}]}],"allPoints":["B100_KWH","B200_KWH"]},"asset":"","parentAlias":"canvas","classKey":"xui.UI.EventPage"}};
								var eventPageString = {"ctl_eventpage1":{"tag":"","desc":"","dataBinder":"","dataField":"","autoTips":true,"className":"","disableClickEffect":false,"disableHoverEffect":false,"disableTips":false,"disabled":false,"defaultFocus":false,"hoverPop":"","hoverPopType":"outer","dock":"none","dockIgnore":false,"dockOrder":1,"showEffects":"","hideEffects":"","dockFloat":false,"dockMinW":0,"dockMinH":0,"tips":"","rotate":0,"left":0,"top":0,"width":"1600","height":"auto","right":"auto","bottom":"auto","renderer":null,"zIndex":1,"tabindex":1,"position":"relative","visibility":"","display":"","selectable":false,"workOrderNumber":"","stationName":ePageConfig.stationName,"assetName":ePageConfig.asset,"anomalyType":ePageConfig.anomalyType,"chartStart":$scope.config.startingDate,"chartEnd":$scope.config.endingDate,"axis":[],"allPoints":[],"config":{"workOrderNumber":"","stationName":ePageConfig.stationName,"assetName":ePageConfig.asset,"anomalyType":ePageConfig.anomalyType,"chartStart":"2014-03-10T17:10:44.458Z","chartEnd":"2015-03-10T17:10:44.458Z","axis":[],"allPoints":[]},"asset":"","parentAlias":"canvas","classKey":"xui.UI.EventPage"}};

						/*		$.ajax({
									url: "/xui",
									type: "post",
									data: JSON.stringify(eventPageString),
									headers: {
										"dataObj" : JSON.stringify(eventPageString),
										"Content-Type" : "application/json"
									},
									dataType: "html"
										
								}).done(function(data){
									//console.log(data);
									var newTab = window.open("", "_blank");
									window.setTimeout(
											function(){
												newTab.document.write(data);
											}, 1000);
								});*/
								
								/*dashTransition.newTab("#/eventPage", {
									"stationName" : algorithmsViewControlService.getFacilityName(),
									"anomalyType" : algorithmsViewControlService.getAnomaly(),
									"asset" : d.data.key,
									"chartStart" : $scope.config.startingDate,
									"chartEnd" : $scope.config.endingDate
									}
								)*/
							});
							
						})
						.on('renderlet', function(chart){
						chart.selectAll("g.x text")
						.attr('transform', "rotate(-80)")
						.attr('dx', '-10')
						.attr('dy', '-5')
						.style("text-anchor", "end")
						;
					})
					;
					$scope.assetTypeRowChart.render();
					var ordinal = $scope.makeAssetsPareto();
					$scope.assetTypeRowChart
					.x(d3.scale.ordinal().domain(ordinal))
					if($scope.config.openWorkOrderColor !== undefined && $scope.config.closedWorkOrderColor !== undefined){
						$scope.assetTypeRowChart.ordinalColors([$scope.config.closedWorkOrderColor, $scope.config.openWorkOrderColor])
					}
					$scope.assetTypeRowChart.render();
					if($scope.renderOrg){
						$scope.inhibitFiltering();
					}
				}
				catch(error){
					////console.log(error.message);
				}
				finally{
					/*$scope.assetTypeRowChart.render();
					var ordinal = $scope.makeAssetsPareto();
					$scope.assetTypeRowChart
					.x(d3.scale.ordinal().domain(ordinal))
					if($scope.config.openWorkOrderColor !== undefined && $scope.config.closedWorkOrderColor !== undefined){
						$scope.assetTypeRowChart.ordinalColors([$scope.config.closedWorkOrderColor, $scope.config.openWorkOrderColor])
					}
					$scope.assetTypeRowChart.render();
					if($scope.renderOrg){
						$scope.inhibitFiltering();
					}*/
				}
		}
	}
	$scope.createGroupsAndDimensions = function(){
		$scope.algorithmDimension = $scope.algoData.dimension(function(d){
			if(d.anomaly !== undefined){
				return d.anomaly;
			}
		});
		$scope.facilityDimension = $scope.algoData.dimension(function(d){
			return d.stationName;
		});
		$scope.assetDimension = $scope.algoData.dimension(function(d){
			return d.asset;
		})
		//define groups
		$scope.facilityValues = [];
		$scope.assetValues = [];
		
		$scope.anomalyTicketValueGroup = $scope.algorithmDimension.group().reduce(
				function(p, v){
					if($scope.showFacilityView){return p;}
					if(v.status === "Closed"){
						p.closedTicketValue += parseFloat(v.potentialSaving);
					}
					else{
						p.openTicketValue += parseFloat(v.potentialSaving);
					}
					p.totalValue = p.openTicketValue + p.closedTicketValue;
					return p;
				},
				function(p, v){
					if($scope.showFacilityView){return p;}
					if(v.status === "Closed"){
						p.closedTickValue -= parseFloat(v.potentialSaving);
					}
					else{
						p.openTicketValue -= parseFloat(v.potentialSaving);
					}
					p.totalValue = p.openTicketValue + p.closedTicketValue;
					
					return p;
				},
				function(){
					return {
						closedTicketValue:0,
						openTicketValue:0,
						totalValue:0
					};
				}	
		);
		$scope.facilityRowChartGroup = $scope.facilityDimension.group().reduce(
				function(q, w){
					if($scope.showAssetView){return q;}
					if(true){
						if(w.status === "Closed"){
							q.closedTicketValue += parseFloat(w.potentialSaving);
							
						}
						else{
							q.openTicketValue += parseFloat(w.potentialSaving);
						}
						q.totalValue = q.openTicketValue + q.closedTicketValue;
						q.facility = w.facility;
						q.anomaly = w.anomaly;
					}					
					return q;	
				},
				function(q, w){
					if($scope.showAssetView){return q;}
					if(true){
						if(w.status === "Closed"){
							q.closedTicketValue -= parseFloat(w.potentialSaving);
						}
						else{
							q.openTicketValue -= parseFloat(w.potentialSaving);
						}
						q.totalValue = q.openTicketValue + q.closedTicketValue;
						q.facility = w.facility;
					}
					return q;
				},
				function(){
					return {
						anomaly:"",
						facility:"",
						closedTicketValue:0,
						openTicketValue:0,
						totalValue:0,	
					};
				}	
		);
		$scope.assetRowChartGroup = $scope.assetDimension.group().reduce(
				function(q, w){
					if(true){
						if(w.status === "Closed"){
							q.closedTicketValue += parseFloat(w.potentialSaving);
						}
						else{
							q.openTicketValue += parseFloat(w.potentialSaving);
						}
						q.totalValue = q.openTicketValue + q.closedTicketValue;
					}
					return q;	
				},
				function(q, w){
					if(true){
						if(w.status === "Closed"){
							q.closedTicketValue -= parseFloat(w.potentialSaving);
						}
						else{
							q.openTicketValue -= parseFloat(w.potentialSaving);
						}
						q.totalValue = q.openTicketValue + q.closedTicketValue;
					}
					return q;
				},
				function(){
					return {
						closedTicketValue:0,
						openTicketValue:0,
						totalValue:0
					};
				}	
		);
	};
  	$scope.openPageConfiguration = function() {
  		
		var modalInstance = $modal.open({
            templateUrl: 'icWidgets/algorithmsConfig.html',
            controller: 'algorithmsConfigCtrl',
			resolve: {
				config: function(){
					return $scope.config;
				}
			}
        });
		
		modalInstance.result.then(function(config){
			
			thisController.setConfig(config);
			algorithmsViewControlService.setChartId($scope.config.anomalyChartId);
			
			//make a decision on what type of graph to draw
			algorithmsViewControlService.setOrganizationName($scope.config.clientName);
			algorithmsViewControlService.setFacilityName($scope.config.stationName);
			algorithmsViewControlService.setAssetName($scope.config.assetName);
			
			if($scope.config.assetName === "" && $scope.config.stationName === ""){
				algorithmsViewControlService.setRenderOrganizationView(true);
				algorithmsViewControlService.setRenderFacilityView(false);
				algorithmsViewControlService.setRenderAssetView(false);
			}
			else if($scope.config.assetName === ""){
				algorithmsViewControlService.setRenderOrganizationView(false);
				algorithmsViewControlService.setRenderFacilityView(true);
				algorithmsViewControlService.setRenderAssetView(false);				
			}
			else{
				algorithmsViewControlService.setRenderOrganizationView(false);
				algorithmsViewControlService.setRenderFacilityView(false);
				algorithmsViewControlService.setRenderAssetView(true);
			}
			algorithmsViewControlService.setStartDate($scope.config.startingDate);
			algorithmsViewControlService.setEndDate($scope.config.endingDate);
			$scope.showAssetView = false;
			$scope.showFacilityView = false;
			algorithmsViewControlService.makeRedraw();
		}, function() {
			////console.log('fail to receive results from config modal');
		});
	};
	
	$scope.openWorkOrderGrid = function(){
		if($scope.gridView === true){
			$scope.gridView = false;			
			if($scope.tempAsset){
				$scope.showAssetView = true;
			}
			else{
				$scope.showAssetView = false;
			}
			if($scope.tempFacility){
				$scope.showFacilityView = true;
			}
			else{
				$scope.showFaciltyView = false;
			}
			$scope.hideGraphs = false;
			$scope.drawChartNow = true;				
			return;
		}
		else{
			if($scope.showAssetView){
				$scope.tempAsset = true;
			}
			else{
				$scope.tempAsset = false;
			}
			if($scope.showFacilityView){
				$scope.tempFacility = true;
			}
			else{
				$scope.tempFacility = false;
			}			
			$scope.showAssetView = false; 
			$scope.showFacilityView = false;
			$scope.drawChartNow = false;
			
			var rectData = [];
			var chartData = [];
			
			var chart = d3.select("#anomaly_type_barchart_"+$scope.config.anomalyChartId);
			var selects = chart.selectAll('rect');
			/*//console.log(chart);*/
			var rectLength = selects[0].length;
			for(var i=0;i<rectLength;i++){
				if(selects[0][i].__data__ !== undefined){
					if(selects[0][i].__data__.layer === "Closed Work Orders"){
						rectData.push(selects[0][i].__data__.data);
					}
				}
			}
			var rectDataLength = rectData.length;				
			for(var i=0;i<rectDataLength;i++){
				if(rectData[i] !== undefined){
					var row = {"Anomaly" : rectData[i].key, "Potential Avoidable Cost" : d3.round(rectData[i].value.openTicketValue, 2), "Realized Avoidable Cost" : d3.round(rectData[i].value.closedTicketValue, 2), "Total Avoidable Cost" : d3.round(rectData[i].value.totalValue, 2)};
					chartData.push(row);
				}
			}
			$scope.chartData = chartData;
			$scope.gridOptions = {
					onRegisterApi: function(gridApi){
						$scope.gridApi = gridApi;
					},
					rowTemplate: '<div style = "cursor:pointer" ng-click="getExternalScopes().openTicketingDashboard(row.entity)"  ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
					enableRowHeaderSelection: false,
					multiSelect: false,
					enableGridMenu: true,
					showFooter: true,
					data: 'chartData',
					columnDefs: [
					             {field: 'Anomaly'},
					             {field: 'Potential Avoidable Cost', width: "120",  displayName: 'Potential', aggregationType: uiGridConstants.aggregationTypes.sum},
					             {field: 'Realized Avoidable Cost', width: "120", displayName: 'Realized', aggregationType: uiGridConstants.aggregationTypes.sum},
					             {field: 'Total Avoidable Cost', width: "120", displayName: 'Total', aggregationType: uiGridConstants.aggregationTypes.sum}
					             ]
			};
			$scope.hideGraphs = true;
			$scope.gridView = true;
		}
	};
	$scope.onRowClick = {
			/*showMessage: function(row){
				dashTransition.newTab("#/workOrderGrid", {
					"clientName" : $scope.config.clientName,
					"stationName" : $scope.config.stationName,
					"endingDate" : undefined,
					"startingDate" : undefined,
					"assetName" : undefined,
					"status" : "Open"
					}
				)
			},*/
			openTicketingDashboard : function(row){
				var dashString = JSON.stringify(
						{
						"ctl_workordergrid1":{"tag":"","desc":"","dataBinder":"","dataField":"","autoTips":true,"className":"","disableClickEffect":false,"disableHoverEffect":false,"disableTips":false,"disabled":false,"defaultFocus":false,"hoverPop":"","hoverPopType":"outer","dock":"none","dockIgnore":false,"dockOrder":1,"showEffects":"","hideEffects":"","dockFloat":false,"dockMinW":0,"dockMinH":0,"tips":"","rotate":0,"left":0,"top":0,"width":800,"height":400,"right":800,"bottom":200,"renderer":null,"zIndex":1,"tabindex":1,"position":"relative","visibility":"","display":"","selectable":false,"clientName":$scope.config.clientName,"stationName":"","assetName":"","status":"","caller":"algorithms","anomalyType":row.Anomaly,"parentAlias":"canvas","classKey":"xui.UI.WorkOrderGrid"},
						"ctl_eventpage1":{"tag":"","desc":"","dataBinder":"","dataField":"","autoTips":true,"className":"","disableClickEffect":false,"disableHoverEffect":false,"disableTips":false,"disabled":false,"defaultFocus":false,"hoverPop":"","hoverPopType":"outer","dock":"none","dockIgnore":false,"dockOrder":1,"showEffects":"","hideEffects":"","dockFloat":false,"dockMinW":0,"dockMinH":0,"tips":"","rotate":0,"left":620,"top":0,"width":"auto","height":400,"right":"auto","bottom":"auto","renderer":null,"zIndex":1,"tabindex":1,"position":"static","visibility":"","display":"","selectable":false,"workOrderNumber":"","stationName":"","assetName":"","anomalyType":"","chartStart":"2014-03-11T15:52:00.948Z","chartEnd":"2015-03-11T15:52:00.948Z","axis":[],"allPoints":[],"parentAlias":"canvas","classKey":"xui.UI.EventPage"},
						"ctl_equipmenttickets1":{"tag":"","desc":"","dataBinder":"","dataField":"","autoTips":true,"className":"","disableClickEffect":false,"disableHoverEffect":false,"disableTips":false,"disabled":false,"defaultFocus":false,"hoverPop":"","hoverPopType":"outer","dock":"center","dockIgnore":false,"dockOrder":1,"showEffects":"","hideEffects":"","dockFloat":false,"dockMinW":0,"dockMinH":0,"tips":"","rotate":0,"left":0,"top":505,"width":600,"height":200,"right":"auto","bottom":"auto","renderer":null,"zIndex":1,"tabindex":1,"position":"static","visibility":"","display":"","selectable":false,"parentAlias":"canvas","classKey":"xui.UI.EquipmentTickets"}
					}
				);
		/*		$.ajax({
					url: "/xui",
					type: "post",
					data: dashString,
					headers: {
						"dataObj" : dashString,
						"Content-Type" : "application/json"
					},
					dataType: "html"
						
				}).done(function(data){
					//console.log(data);
					var newTab = window.open("", "_blank");
					window.setTimeout(
							function(){
								newTab.document.write(data);
							}, 100);
				});*/
				
				/*dashTransition.newTab('#/dashboard', {
					'dashboard':{
						'only':{
							0: {
								0: {
									'body':[['work-order-grid', 'empty-panel','empty-panel'], ['event-page','empty-panel','empty-panel'],['equipment-tickets','equipment-in-faults','empty-panel']]
								}
							}
						},
						'main':{
							0:{
								0: {
									"clientName" : $scope.config.clientName,
									"stationName" : $scope.config.stationName,
									"endingDate" : $scope.config.endingDate,
									"startingDate" : $scope.config.startingDate,
									"assetName" : undefined,
									"status" : undefined,
									"caller" : "algorithms",
									"anomaly" : row.Anomaly
								},
								1:{
									
								},
								2:{
									
								}
							},
							
							1:{
								0: {
									
								},
								1:{
									
								},
								2:{
									
								}
							},
							2:{
								0:{
									
								},
								1:{
									
								},
								2:{
									
								}
							}
						}
					}
				})*/
			}
	
	};
	$scope.inhibitFiltering = function(){
		try{
			var barsToClick = d3.select("#anomaly_type_barchart_"+$scope.dcName)
			.selectAll("rect")
			.on("click", function(d){
				//do something?
			});			
		}
		catch(messedUp){
			////console.log(messedUp.message);		
		}
	}
	
}])

.controller('algorithmsModalOpener', ['$scope','$modal','configService','$controller','algorithmsViewControlService', 'uiGridConstants',function($scope,$modal,awesome,$controller,algorithmsViewControlService, uiGridConstants){
	
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});
		
	angular.extend(thisController, awesome, superController);
	
  	$scope.config = thisController.getConfig();  	
  	
  	$scope.openConfiguration = function() {
  		if(angular.element(document.getElementById("editorHere")).hasClass("xui-css-dockparent")){return;}
		var modalInstance = $modal.open({
            templateUrl: 'icWidgets/algorithmsConfig.html',
            controller: 'algorithmsConfigCtrl',
			resolve: {
				config: function(){
					return $scope.config;
				}
			}
        });
		
		modalInstance.result.then(function(config){
			
			thisController.setConfig(config);
			algorithmsViewControlService.setChartId($scope.config.anomalyChartId);
			
			//make a decision on what type of graph to draw
			algorithmsViewControlService.setOrganizationName($scope.config.clientName);
			algorithmsViewControlService.setFacilityName($scope.config.stationName);
			algorithmsViewControlService.setAssetName($scope.config.assetName);
			
			if($scope.config.assetName === "" && $scope.config.stationName === ""){
				algorithmsViewControlService.setRenderOrganizationView(true);
				algorithmsViewControlService.setRenderFacilityView(false);
				algorithmsViewControlService.setRenderAssetView(false);
			}
			else if($scope.config.assetName === ""){
				algorithmsViewControlService.setRenderOrganizationView(false);
				algorithmsViewControlService.setRenderFacilityView(true);
				algorithmsViewControlService.setRenderAssetView(false);				
			}
			else{
				algorithmsViewControlService.setRenderOrganizationView(false);
				algorithmsViewControlService.setRenderFacilityView(false);
				algorithmsViewControlService.setRenderAssetView(true);
			}
			algorithmsViewControlService.setStartDate($scope.config.startingDate);
			algorithmsViewControlService.setEndDate($scope.config.endingDate);
			//handles the re-rendering of the graph.
			$scope.showAssetView = false;
			$scope.showFacilityView = false;
			algorithmsViewControlService.makeRedraw();
		}, function() {
			////console.log*('fail to receive results from config modal');
		});
	};
}])

.controller('algorithmsConfigCtrl', ['$scope', '$modalInstance', 'clientService', 'config', function($scope, $modalInstance, clientService, config){
				
	$scope.organization = config.clientName;
	$scope.facility = config.stationName;
	$scope.startDate = config.startingDate;
	$scope.endDate = config.endingDate;
	$scope.asset = config.assetName;
	$scope.closedColor = config.closedWorkOrderColor;
	$scope.openColor = config.openWorkOrderColor;
	
	clientService.getAllStations().then(function(allFacilitiesList) {		
		
		//fix for naming convention changes	
		allFacilitiesList = _.map(allFacilitiesList, function(x) {
			return {
				client: x.orgFullName,
				station: x.stationName
			};
		});
		
		
		$scope.organizationNames = [];
		$scope.facilityNames = [];
		$scope.assetNames = [];
		$scope.allFacilities = allFacilitiesList;
		for(var i=0;i<allFacilitiesList.length;i++){
			if($scope.organizationNames.indexOf(allFacilitiesList[i].client) == -1){
				$scope.organizationNames.push(allFacilitiesList[i].client);
			}
		}
		
		if($scope.organization !== undefined && $scope.organization !== ""){
			for(var i=0;i<allFacilitiesList.length;i++){
				if($scope.organization === allFacilitiesList[i].client){
					$scope.facilityNames.push(allFacilitiesList[i].station);
				}
			}
		}
		if($scope.facility !== undefined && $scope.facility !== ""){
			clientService.getAssetList($scope.organization, $scope.facility).then(function(assetList){
				$scope.assetNames = assetList;
			})
		}
		
		$scope.changeOrganization = function(organization){
			$scope.facilityNames = [];
			$scope.facility = "";
			$scope.asset = "";
			$scope.organization = organization;
			for(var i=0;i<$scope.allFacilities.length;i++){
				if($scope.allFacilities[i].client === $scope.organization){
					$scope.facilityNames.push($scope.allFacilities[i].station)
				}
			}
		}
		$scope.changeFacility = function(facility){
			$scope.assetNames = [];
			$scope.asset = "";
			$scope.facility = facility;
			clientService.getAssetList($scope.organization, $scope.facility).then(function(assetList){
				$scope.assetNames = assetList;
			})
		}
		$scope.changeAsset = function(asset){
			$scope.asset = asset;
		}
	}, function(){
		
	});
	$scope.ok = function() {
		var config = {
			"clientName": $scope.organization,	
			"stationName": $scope.facility,
			"assetName": $scope.asset,
			"startingDate": $scope.startDate,
			"endingDate": $scope.endDate,
			"closedWorkOrderColor" : $scope.closedColor,
			"openWorkOrderColor" : $scope.openColor
		};
		$modalInstance.close(config);
	};
	$scope.cancel = function(){
		$modalInstance.dismiss('cancel');
	}
	$scope.makeDefault = function(){
		$scope.startDate = undefined;
		$scope.endDate = undefined;
	}
}])
