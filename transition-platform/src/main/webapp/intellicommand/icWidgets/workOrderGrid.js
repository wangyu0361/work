'use strict';

angular.module('icDash.workOrderGrid', ['ui.router'])

/**angular.module('myApp.workOrderGrid', ['ngRoute', 'ui.grid', 'ui.grid.edit',  'ui.grid.exporter', 'ui.grid.selection', 'ui.grid.resizeColumns', 'ui.grid.autoResize','myApp.dashboard', 'myApp.pciService', 'myApp.panelComponent', 'myApp.popout'
	,'ui.bootstrap', 'myApp.facilitySelector', 'myApp.clientService', 'myApp.calendar', 'myApp.dateRangeService'])
**
.run(['directiveService', function(directiveService){
   directiveService.addFullComponent({
       tag: function(){return 'work-order-grid';},
       configTag: function(){return 'work-order-grid-config';},
       tagHtml: function(){return "<work-order-grid></work-order-grid>";},
       directiveName: function(){return 'workOrderGrid';},
       namespace: function(){return 'workorders';},
       heading: function(){return 'work-order-grid-name';},
       paletteImage: function(){return 'smallChart.png';}
       }
   );
}])
**/
.directive('workOrderGridName', [function(){
	return{
		template: "Work Order Grid"
	};
}])
 
.factory('workOrderGridService', ['$http', '$rootScope', 'dateRangeService', function($http, $rootScope, dateRangeService){
	
	var _calcDateRange = function(configObj){
		if(configObj.dateRange !== undefined && configObj.dateRange !== ""){
			var range = configObj.dateRange;
			var dates;
			switch(range){
				case "last month":{
					dates = dateRangeService.previousMonth();
					break;
				}
				case "last calendar year":{
					dates = dateRangeService.lastFullCalendarYear();
					break;
				}
				case "last twelve months":{
					dates = dateRangeService.variableMonthsAgo(12);
					break;
				}
				case "last six months":{
					dates = dateRangeService.variableMonthsAgo(6);
					break;
				}
				case "lifetime": {
					dates = dateRangeService.lifetime();
					break;
				}
			}
			if(dates !== undefined){
				return dates;
			}
		}
		else{
			var dates = dateRangeService.variableMonthsAgo(6);
			return dates;
		}
	}
		
	var _getWorkOrders = function(configObj){
		
			
		/*var client = configObj.clientName;*/
		var station = configObj.stationName;
		var dateRange = configObj.dateRange; 
		/*var start = configObj.startingDate;
		var end = configObj.endingDate;*/
		
		/*if(end === undefined || end === ""){
			configObj.endingDate = new Date();
		}
		if(start === undefined || start === ""){
			configObj.startingDate = new Date(2005,1,1);
		}
	
		if(($.type(start) === "string" && start !== "") || ($.type(end) === "string" && end !== "")){
			start = new Date(start);
			end = new Date(end);
		}*/
	/*	if(asset !== undefined && asset !== ""){
			if(status === undefined || status === ""){
				requestString = "{\"createdTime\" : {\"$gt\" : { \"$date\": \""+start.toJSON()+"\" }, \"$lt\": { \"$date\": \""+end.toJSON()+"\" }}, \"asset\" : \""+asset+"\", \"stationName\" : \""+station+"\"}";
			}
			else{
				requestString = "{\"createdTime\" : {\"$gt\" : { \"$date\": \""+start.toJSON()+"\" }, \"$lt\": { \"$date\": \""+end.toJSON()+"\" }}, \"asset\" : \""+asset+"\", \"stationName\" : \""+station+"\", \"status\" : \""+status+"\"}";
			}
		}
		else if(station !== undefined && station !== ""){
			if(status === undefined || status === ""){
				requestString = "{\"createdTime\" : {\"$gt\" : { \"$date\": \""+start.toJSON()+"\" }, \"$lt\": { \"$date\": \""+end.toJSON()+"\" }}, \"stationName\" : \""+station+"\"}";
			}
			else{
				requestString = "{\"createdTime\" : {\"$gt\" : { \"$date\": \""+start.toJSON()+"\" }, \"$lt\": { \"$date\": \""+end.toJSON()+"\" }}, \"stationName\" : \""+station+"\", \"status\" : \""+status+"\"}";
			}
		}
		else if(client !== undefined && client !== ""){
			if(status === undefined || status === ""){
				requestString = "{\"createdTime\" : {\"$gt\" : { \"$date\": \""+start.toJSON()+"\" }, \"$lt\": { \"$date\": \""+end.toJSON()+"\" }}, \"client\" : \""+client+"\"}";
			}
			else{
				requestString = "{\"createdTime\" : {\"$gt\" : { \"$date\": \""+start.toJSON()+"\" }, \"$lt\": { \"$date\": \""+end.toJSON()+"\" }}, \"client\" : \""+client+"\", \"status\" : \""+status+"\"}";
			}
		}
		else{
			requestString = "{}";
		}
		
		if(caller === "workOrderCycleTime"){
			requestString = "{$or: [{ \"status\" : \"Open\" }, {\"closedTime\" : {\"$gt\" : { \"$date\": \""+start.toJSON()+"\" }, \"$lt\": { \"$date\": \""+end.toJSON()+"\" }}}], \"client\" : \""+client+"\"}";
		}
		
		if(caller === "algorithms"){
			if(anomaly !== undefined){
				requestString = "{\"client\" : \""+client+"\", \"anomaly\" : \""+anomaly+"\"}";
			}
			else{
				return;
			}
		}
		
		if(caller === "agedWorkOrders"){
			status = "Open";
			requestString = "{\"client\" : \""+client+"\", \"status\" : \""+status+"\"}";
		}*/
		
		var _serviceObject = {};
		
		var dates = _calcDateRange(configObj);
		
		configObj.endingDate = dates.endDate;
		configObj.startingDate = dates.startDate;
		
		var endYear = configObj.endingDate.getFullYear();
		var endMonth = configObj.endingDate.getMonth().toString().length == 2 ? configObj.endingDate.getMonth().toString() : "0"+configObj.endingDate.getMonth().toString();
		var endDate = configObj.endingDate.getDate().toString().length == 2 ? configObj.endingDate.getDate().toString() : "0"+configObj.endingDate.getDate().toString();
		var startYear = configObj.startingDate.getFullYear();
		var startMonth = configObj.startingDate.getMonth().toString().length == 2 ? configObj.startingDate.getMonth().toString() : "0"+configObj.startingDate.getMonth().toString();
		var startDate = configObj.startingDate.getDate().toString().length == 2 ? configObj.startingDate.getDate().toString() : "0"+configObj.startingDate.getDate().toString();
		
		var createdRange =  startYear+"-"+startMonth+"-"+startDate+".."+endYear+"-"+endMonth+"-"+endDate;
		
		
		var _url = 'https://galaxy2021temp.pcsgalaxy.net:9453/api/galaxy/eval?eventFilter("'+
		configObj.stationName+
		'" ,'+
		createdRange+
		','+
		'null'+
		','+ 
		'null'+
		')';
		var _config = {
				method: "GET",
				headers:{
					"Content-Type":"text/zinc;charset=utf-8",
					"Authorization":"Basic ZGV2OjEyMzQ1",
					"Accept":"text/csv"
				},
				url: _url
		}
		
		
			return $http.get(_url, _config)
	};
	var _makeRedraw = function(){
		$rootScope.$broadcast('redrawWorkOrderGrid');
	}
	var serviceObject = {
			getWorkOrders : _getWorkOrders,
			makeRedraw : _makeRedraw,
		};
		return serviceObject;	
}])

.controller('workOrderGridCtrl', ['$rootScope','$scope', '$modal', 'workOrderGridService',
                                  'configService', '$controller', 
                                  'facilitySelectorService', 'dateRangeService', 'userPrefService',  
                                  'uiGridConstants',
                                  function($rootScope, $scope, $modal, workOrderGridService, 
                                		  awesome, $controller, facilitySelectorService,
                                		  dateRangeService, userPrefService, uiGridConstants){
		
	/** angela removed/updated this section **
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});
	
	angular.extend(thisController, awesome, superController);
	$scope.config = thisController.getConfig();
	//console.log($scope.config.clientName);
	//console.log($scope.config);
	var defaultConfig = {
			"clientName" : undefined,
			"stationName" : undefined,
			"assetName" : undefined,
			"startingDate" : undefined,
			"endingDate" : undefined,
			"status" : undefined,
			"caller" : undefined,
			"anomalyType" : undefined,
			"dateRange" : "lifetime"
	}
	

	for(var key in defaultConfig){
		if($scope.config.hasOwnProperty(key) === false){
			$scope.config[key] = defaultConfig[key];
		}
	}
	/** end section angela removed/updated **/
	
	/** angela's new section **/
	// Choose settings that this widget cares about
	$scope.noWatches = true;
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});

	angular.extend(thisController, awesome, superController);
	$scope.config = thisController.getConfig();
	
	var defaultConfig = {
			"clientName" : undefined,
			"stationName" : undefined,
			"assetName" : undefined,
			"startingDate" : undefined,
			"endingDate" : undefined,
			"status" : undefined,
			"caller" : undefined
	}
	var myPrefs = userPrefService.getUserPrefs("work-order-grid");
		
	for(var key in myPrefs){
		if($scope.config.hasOwnProperty(key) === false){
			$scope.config[key] = myPrefs[key];
		}
	}
	$scope.noWatches = false;
	/*console.log($scope.config.clientName);
	console.log($scope.config);*/
	
	// End choose settings that this widget cares about
	
/*	var refreshConfigs = function() {
		console.log("WORK ORDER GRID updating!");
		
		var myPrefs = userPrefService.getUserPrefs("work-order-grid");
		console.log(myPrefs);
		 Use default config to determine which preferences should be used in the widget
			Order of preferences: 
			1) User preferences (myPrefs)
			2) XUI configurations ($scope.config)
			3) default configurations by widget (defaultConfig)
		
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
		*//**** angela note: shouldn't I do this in user pref service automatically?!*//*
		var range = currentConfig.dateRange;
		var dates;
		switch(range){
			case "last month":{
				dates = dateRangeService.previousMonth();
				break;
			}
			case "last calendar year":{
				dates = dateRangeService.lastFullCalendarYear();
				break;
			}
			case "last twelve months":{
				dates = dateRangeService.variableMonthsAgo(12);
				break;
			}
			case "last six months":{
				dates = dateRangeService.variableMonthsAgo(6);
				break;
			}
		}
		if(dates !== undefined){
			currentConfig.startingDate = dates.startDate;
			currentConfig.endingDate = dates.endDate;
		}
		// End update date range
		
		thisController.setConfig(currentConfig);
		$scope.config = currentConfig;
		thisController.setConfig($scope.config)
		$scope.config = thisController.getConfig();
		console.log($scope.config);
		$scope.requestData();
	}*/
	/** end angela's new section **/
	/*$scope.request = function(){
		$scope.config.startingDate = dateRangeService.variableMonthsAgo(6).startDate;
		$scope.config.endingDate = new Date();
		//console.log($scope.config.startingDate, $scope.config.endingDate);
		var endYear = $scope.config.endingDate.getFullYear();
		var endMonth = $scope.config.endingDate.getMonth().toString().length == 2 ? $scope.config.endingDate.getMonth().toString() : "0"+$scope.config.endingDate.getMonth().toString();
		var endDate = $scope.config.endingDate.getDate().toString().length == 2 ? $scope.config.endingDate.getDate().toString() : "0"+$scope.config.endingDate.getDate().toString();
		
		//console.log(endYear+"-"+endMonth+"-"+endDate);
		
		var startYear = $scope.config.startingDate.getFullYear();
		var startMonth = $scope.config.startingDate.getMonth().toString().length == 2 ? $scope.config.startingDate.getMonth().toString() : "0"+$scope.config.startingDate.getMonth().toString();
		var startDate = $scope.config.startingDate.getDate().toString().length == 2 ? $scope.config.startingDate.getDate().toString() : "0"+$scope.config.startingDate.getDate().toString();
		
		//console.log(startYear+"-"+startMonth+"-"+startDate);
		
		var createdRange =  startYear+"-"+startMonth+"-"+startDate+".."+endYear+"-"+endMonth+"-"+endDate;
		
		
		var _url = 'https://galaxy2021temp.pcsgalaxy.net:9453/api/galaxy/eval?eventFilter("'+
		$scope.config.stationName+
		'" ,'+
		createdRange+
		','+
		'null'+
		','+ 
		'null'+
		')';
		var _config = {
				method: "GET",
				headers:{
					"Content-Type":"text/zinc;charset=utf-8",
					"Authorization":"Basic ZGV2OjEyMzQ1",
					"Accept":"text/csv"
				},
				url: _url
		}
		$http.get(_url,_config).then(function(result){console.log(d3.csv.parse(result.data));})
		
	}*/
	
	if(angular.element(document.getElementById("editorHere")).hasClass('xui-css-dockparent')){
		$scope.inEditor = true;
	}
	else{
		$scope.inEditor = false;
	}
	$scope.inDashboard = true;
	if(thisController.getFullConfig().dashboard === undefined){
		$scope.inDashboard = false;
	}
	$scope.rendered = false;
		
		$scope.test = {
				showMessage: function(row){
					userPrefService.updateUserPrefs({
						"ticketId": row.eventID,
						"organization": row.client,
						// "organization": row.organization,
						"facility": row.facility,
						"station": row.station,
						"asset": row.asset,
						"anomaly": row.anomaly,
					});
					/*eventPageService.setWorkOrderNumber(row.eventID);
					eventPageService.setAssetName(row.asset);
					eventPageService.setOrganization(row.organization);
					eventPageService.setAnomalyName(row.anomaly);
					eventPageService.setStationName(row.station);
					eventPageService.setFacility(row.facility);*/
				},
				sendEvent: function(row){
					
				},
				updateEvent: function(row){
				},
		};
		var dateSorter = function(a, b){
			
			var aDate = (new Date(a)).getTime();
			var bDate = (new Date(b)).getTime();
			if(aDate === bDate){return 0;}
			else if(aDate < bDate){return -1;}
			else{return 1;}
		}
		$scope.requestData = function(){
			if($scope.inEditor === false && $scope.rendered){return;}
			workOrderGridService.getWorkOrders($scope.config).then(function(response){
				
				$scope.responseData = d3.csv.parse(response.data);
				if($scope.responseData === null || $scope.responseData === []){return;}
				var eventData = [];
				for(var i=0;i<$scope.responseData.length;i++){
					var anomaly = $scope.responseData[i].signature;
					
					if(anomaly === "null" || anomaly === undefined){
						anomaly = "Not Available";
					}
					
					var ticketCreationDate = $scope.responseData[i].createdTime;
					if(ticketCreationDate === undefined || ticketCreationDate === "" || ticketCreationDate === null){
						ticketCreationDate = "Not Available";
					}
					else{
						ticketCreationDate = $scope.responseData[i].createdTime.slice(0, $scope.responseData[i].createdTime.indexOf(" "));
					}
					var ticketClosingDate = $scope.responseData[i].closureTime;
					if(ticketClosingDate === undefined || ticketClosingDate === "" || ticketClosingDate === null){
						ticketClosingDate = "Pending";
					}
					else{
						ticketClosingDate = $scope.responseData[i].closureTime.slice(0, $scope.responseData[i].closureTime.indexOf(" "));
					}
					var asset = $scope.responseData[i].asset;
					if(asset === undefined || asset === "" || asset === null){
						asset = "Not Available";
					}
					
					var eventRow = {client: $scope.config.clientName, /*organization: $scope.responseData[i].organization,*/ facility: $scope.responseData[i].siteRef.slice($scope.responseData[i].siteRef.indexOf(" "), $scope.responseData[i].siteRef.length), station: $scope.config.stationName, asset: asset, anomaly: anomaly, eventID: $scope.responseData[i].id.slice($scope.responseData[i].id.indexOf("@")+1,$scope.responseData[i].id.length), createdTime: ticketCreationDate, closedTime: ticketClosingDate/*, exportEvent: null, comments: $scope.responseData[i].comments, updateEvent: null*/};
					eventData.push(eventRow);
				}
				$scope.eventData = eventData;
				$scope.rendered = true;
			});
		}
		if($scope.inEditor){
			$scope.requestData();
		}
		$scope.gridOptions = {
			enableSorting: true,
			onRegisterApi: function(gridApi){
				$scope.gridApi = gridApi;
			},
			enableFiltering: true,
			enableRowHeaderSelection: false,
			multiSelect: false,
			
			enableGridMenu: true,
			exporterLinkLabel: 'click to download file',
			
			/*exporterPdfDefaultStyle: {fontSize: 9},
			exporterPdfTableStyle: {margin: [30, 30, 30, 30]},
			exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
			exporterPdfHeader: { text: "My Header", style: 'headerStyle' },
			exporterPdfFooter: function ( currentPage, pageCount ) {
			return { text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle' };
			},
			exporterPdfCustomFormatter: function ( docDefinition ) {
			docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
			docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
			return docDefinition;
			},
			exporterPdfOrientation: 'portrait',
			exporterPdfPageSize: 'LETTER',
			exporterPdfMaxGridWidth: 500,*/
			exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
			data: 'eventData',
			rowTemplate: '<div ng-click="getExternalScopes().showMessage(row.entity)"  ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
			columnDefs: [
				             //{field: 'exportEvent', displayName: '', enableFiltering: false, enableSorting: false, enableCellEdit: false, visible: false, width: '8%', cellTemplate: '<button ng-click="getExternalScopes().sendEvent(row.entity)">Send Event</button>'},
				             //{field: 'updateEvent', displayName: '', enableFiltering: false, enableSorting: false, enableCellEdit: false, visible: false, width: '8%', cellTemplate: '<button ng-click="getExternalScopes().updateEvent(row.entity)">Update Event</button>'},
				             {field: 'client', displayName: 'Client', visible: false, minWidth: '40', enableCellEdit: false, width: '12.5%'},
				             //{field: 'organization', displayName: 'Organization', visible: false, minWidth: '40', enableCellEdit: false, width: '12.5%'},
				             {field: 'facility', displayName: 'Facility', visible: true, minWidth: '40', enableCellEdit: false, width: '12.5%'},
				             {field: 'station', displayName: 'Station', visible: true, minWidth: '40', enableCellEdit: false, width: '12.5%'},
				             {field: 'asset', displayName: 'Asset', visible: true, minWidth: '40', enableCellEdit: false, width: '12.5%'},
				             {field: 'anomaly', displayName: 'Anomaly', visible: true, minWidth: '40', enableCellEdit: false, width: '12.5%'},
				             {field: 'createdTime', displayName: "Created", visible: true, minWidth: '40', enableCellEdit: false, width: '12.5%',sortingAlgorithm: dateSorter, sort: {direction: uiGridConstants.DESC}},
				             {field: 'closedTime', displayName: "Closed", visible: true, minWidth: '40', enableCellEdit: false, width: '12.5%'},
				             {field: 'eventID', displayName: 'Event ID', visible: true, minWidth: '40', enableCellEdit: false, width: '12.5%'},
				             {field: 'comments', displayName: 'Comments', enableFiltering: false, visible: false, enableCellEdit: true, enableSorting: false, minWidth: '100', width: '800'},
			             ]
	
		};
		$scope.openPageConfiguration = function(){
			var modalInstance = $modal.open({
				templateUrl : 'icWidgets/workOrderGridConfig.html',
				controller : 'workOrderGridConfigCtrl',
				resolve: {
					config: function(){
						return $scope.config;
					}
				}			
			})
			modalInstance.result.then(function(config){
				thisController.setConfig(config);
				$scope.requestData();
			})
		};
		
		/*$scope.reset = function(){
			for(var i=0;i<$scope.gridOptions.columnDefs.length;i++){
				$scope.gridOptions.columnDefs[i].visible = true;
			}
			$scope.gridApi.grid.refresh();
		}*/
		$scope.$on('organizationSetFacilitySelector', function(){
			$scope.config.clientName = facilitySelectorService.getOrganization();
			$scope.config.stationName = undefined;
			$scope.config.assetName = undefined;
			$scope.requestData();		
		});
		$scope.$on('facilitySetFacilitySelector', function(){
			$scope.config.stationName = facilitySelectorService.getFacility();
			$scope.config.assetName = undefined;
			$scope.requestData();
		});
		$scope.$on('assetSetFacilitySelector', function(){
			$scope.config.assetName = facilitySelectorService.getAsset();
			$scope.config.stationName = facilitySelectorService.getFacility();
			$scope.requestData();
		});
		
		$scope.$on('redrawWorkOrderGrid', function(){
			$scope.requestData();
		});
		/** end this will all be obsolete **/
		
		/*$scope.$watch('config', function(nuObj, oldObj){
			if(nuObj.clientName === undefined || nuObj.clientName === ""){return;}
			if(nuObj.clientName !== undefined && nuObj.clientName !== ""){
				$scope.requestData();
			}
			if(nuObj.stationName !== undefined && nuObj.stationName !== ""){
				$scope.requestData();
			}
			if(nuObj.anomalyType !== undefined && nuObj.anomalyType !== ""){
				$scope.requestData();
			}
			if(nuObj.caller !== undefined && nuObj.caller !== ""){
					$scope.requestData();	
			}
			if((oldObj.clientName !== "" || oldObj.clientName !== undefined) && (nuObj.clientName !== "" || nuObj.clientName !== undefined)){
				$scope.requestData();
			}
			if((oldObj.stationName !== "" || oldObj.stationName !== undefined) && (nuObj.stationName !== "" || nuObj.stationName !== undefined)){
				$scope.requestData();
			}
			
		},true);*/
		
		
	/*	$scope.$watch('config.clientName', function(){
			if($scope.config.clientName !== undefined && $scope.config.clientName !== ""){
				$scope.rendered = false;
				$scope.requestData();
			}
		}, true);*/
		$scope.$watch('config.stationName', function(){
			if(!$scope.noWatches && $scope.config.stationName !== undefined && $scope.config.stationName !== ""){
				$scope.rendered = false;
				userPrefService.updateUserPrefs($scope.config);
				$scope.requestData();
			}
		}, true)
/*		$scope.$watch('config.anomalyType', function(){
			if($scope.config.anomalyType !== undefined && $scope.config.anomalyType !== ""){
				$scope.rendered = false;
				$scope.requestData();
			}
		}, true);*/
	/*	$scope.$watch('config.caller', function(){
			if($scope.config.caller !== undefined && $scope.config.caller !== ""){
				$scope.rendered = false;
				$scope.requestData();
			}
		}, true);*/
		$scope.$watch('config.dateRange', function(){
			if(!$scope.noWatches && $scope.config.dateRange !== undefined && $scope.config.dateRange !== ""){
				if($scope.config.stationName !== undefined && $scope.config.stationName !== "" && $scope.config.stationName !== null){
					$scope.rendered = false;
					userPrefService.updateUserPrefs($scope.config);
					$scope.requestData();
				}
				
			}
		
		}, true);
		
		
		/** angela new **/
		/*$scope.$watch('config', function(){
			refreshConfigs();
		}, true);*/
		/*$scope.$on('userPrefsChanged',function(){
			refreshConfigs();
		});*/
		/** end angela new **/
		
		/*$scope.$watch('config', function(nu,ol){
			if($scope.inEditor){return;}
			var props = [];
			for(var key in nu){
				if(nu[key] === ol[key]){
					console.log(nu[key], "is equal to", ol[key]);
					props.push(nu[key]);
				}
			}
			console.log(props);
		}, true);*/
		 
		 /*Below is how you might redraw a ui-grid chart dynamically.  Apparently, the 'data' field is just a 
		  * reference to the data used in the chart.  This reference persists, so attempting
		  * something like $scope.gridOptions.data = something different; then refreshing will 
		  * have no effect but changing the variable on the scope ('eventData' in this case)
		  * and then refreshing (really wonky methodology BTW) will redraw the chart with new
		  * data, column definitions etc.  Also, the 'onRegisterApi: yada, yada' is not needed the second time.
		  * Since there really is just one chart, the initial placement on the scope is sufficient */ 
		  /*
		   * 
		   *$scope.reset = function(){
				for(var i=0;i<$scope.gridOptions.columnDefs.length;i++){
					$scope.gridOptions.columnDefs[i].visible = true;
					
				}
				$scope.eventData = [{name: "Butt", age: "Head"}, {name: "Bea", age: "Vis"}];
				$scope.gridOptions = {
						enableSorting: true,
						/*onRegisterApi: function(gridApi){
							$scope.gridApi = gridApi;
						},
						enableFiltering: true,
						multiSelect: false,
						data: 'eventData',
						rowTemplate: '<div ng-click="getExternalScopes().showMessage(row.entity)"  ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
						columnDefs: [
						             {field: 'name', displayName: 'First Name', visible: true},
						             {field: 'age', displayName: 'Last Name', visible: true}
						             ]
				
					};
				$scope.gridApi.grid.refresh();
			}*/	
	//$scope.requestData();
}])

.controller('workOrderGridModalOpener', ['$scope', '$modal', '$controller', 'configService', 'workOrderGridService', function($scope, $modal, $controller, awesome, workOrderGridService){
	
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});
	angular.extend(thisController, awesome, superController);
	$scope.config = thisController.getConfig();
	
	$scope.openConfiguration = function(){
		if(angular.element(document.getElementById("editorHere")).hasClass("xui-css-dockparent")){return;}
		var modalInstance = $modal.open({
			templateUrl : 'icWidgets/workOrderGridConfig.html',
			controller : 'workOrderGridConfigCtrl',
			resolve: {
				config: function(){
					return $scope.config;
				}
			}			
		})
		
		modalInstance.result.then(function(config){
			thisController.setConfig(config);
			workOrderGridService.makeRedraw();
		})
	}
}])

.controller('workOrderGridConfigCtrl', ['$scope', '$modalInstance', 'clientService', 'config', function($scope, $modalInstance, clientService, config){
	$scope.client = config.clientName;
	$scope.station = config.stationName;
	$scope.startDate = config.startingDate;
	$scope.endDate = config.endingDate;
	clientService.getOrganizationList().then(function(clients){
		$scope.organizationNames = clients;
	});
	
	if($scope.client !== undefined && $scope.client !== ""){
		clientService.getStationList($scope.client).then(function(stations){
			$scope.facilityNames = stations;
		});
	}
		
	$scope.setOrganization = function(organizationName){
		$scope.client = organizationName;
		$scope.station = undefined;
		clientService.getStationList($scope.client).then(function(stations){
			$scope.facilityNames = stations;
		});
	};
	$scope.setFacility = function(facilityName){
		$scope.station = facilityName;
	};
	$scope.ok = function(){
		var config = {
				"clientName" : $scope.client,
				"stationName" : $scope.station,
				"startingDate" : $scope.startDate,
				"endingDate" : $scope.endDate,
		};
		$modalInstance.close(config)
	};
	$scope.cancel = function(){
		$modalInstance.dismiss('bummer');
	};
}])

.directive('workOrderGridConfig', [function() {
	return {
		restrict: 'E',
		controller: 'workOrderGridModalOpener',
		templateUrl: 'icWidgets/algoConfig.html'
	}
}])

.directive('workOrderGrid', [function() {
	return {
		restrict: 'E',
		scope: {},
		controller: 'workOrderGridCtrl',
		templateUrl: 'icWidgets/workOrderGrid.html'
	}
}]);
