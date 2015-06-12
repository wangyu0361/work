'use strict';

angular.module('icDash.stackedColumnWorkOrders', ['ui.router'])

/**angular.module('myApp.stackedColumnWorkOrders', ['ngRoute', 'ui.grid', 'ui.grid.autoResize', 
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
**
.run(['directiveService', function(directiveService){
	directiveService.addFullComponent({
		tag: function(){return 'stacked-column-work-orders';},
		configTag: function(){return 'stacked-column-work-orders-config';},
		gridTag: function(){return 'stacked-column-work-orders-grid';},
		tagHtml: function(){return "<stacked-column-work-orders></stacked-column-work-orders>";},
		directiveName: function(){return 'stackedColumnWorkOrders';},
		namespace: function(){return 'stackedColumnWorkOrders'},
		heading: function(){return 'stacked-column-name'},
		paletteImage: function(){return 'pictures/pareto.png';}
	});
}])**/

.directive('stackedColumnWorkOrders', [function(){
	return {
		restrict: 'E',
		controller: 'stackedColumnWorkOrdersCtrl',
		templateUrl: 'icWidgets/stackedColumnWorkOrders.html'
	}
}])

.directive('stackedColumnWorkOrdersConfig', [function(){
	return{
		restrict: 'E',
		controller: 'stackedColumnWorkOrdersModalOpenCtrl',
		templateUrl: 'icWidgets/algoConfig.html'
	}
}])
.directive('stackedColumnWorkOrdersGrid', [function(){
	return{
		restrict: 'E',
		controller: 'stackedColumnWorkOrdersGridCtrl',
		templateUrl: 'icWidgets/gridView.html'
	};
}])
.directive('stackedColumnName', [function(){
	return{
		template: "Work Order Count"
	};
}])

.factory('stackedColumnWorkOrdersDataService', ['$http', 'stackedColumnWorkOrdersViewControlService', function($http, stackedColumnWorkOrdersViewControlService){
	var _serviceObject = {};
	var _getEventData = function(){
		//var mongoUrl = "https://galaxy2021temp.pcsgalaxy.net:9453/db/query";
		var mongoUrl = "https://galaxy2021temp.pcsgalaxy.net:9453/db/query";
		/*console.log('in factory');*/
		
		var requestString;
		var client = stackedColumnWorkOrdersViewControlService.getClient();
		var station = stackedColumnWorkOrdersViewControlService.getStation();
		var startDate = stackedColumnWorkOrdersViewControlService.getStartDate();
		var endDate = stackedColumnWorkOrdersViewControlService.getEndDate();
		if(startDate === undefined || startDate === "" || endDate === undefined || endDate === "" ){
			endDate = new Date();
			stackedColumnWorkOrdersViewControlService.setEndDate(endDate);
			startDate = new Date(endDate.getFullYear(),endDate.getMonth(),endDate.getDate() - 84)
			stackedColumnWorkOrdersViewControlService.setStartDate(startDate);
		}
		var calledFrom = stackedColumnWorkOrdersViewControlService.getCalledFrom(); 	
		if(calledFrom === "modalOpener"){
				requestString = "{\"createdTime\" : {\"$gt\" : { \"$date\": \""+startDate.toJSON()+"\" }, \"$lt\": { \"$date\": \""+endDate.toJSON()+"\" }}, \"client\" : \""+client+"\"}";
		}
		
		else if(calledFrom === "drawTimeAxisClientChart"){
			requestString = "{\"createdTime\" : {\"$gt\" : { \"$date\": \""+stackedColumnWorkOrdersViewControlService.getWeekStart().toJSON()+"\" }, \"$lt\": { \"$date\": \""+stackedColumnWorkOrdersViewControlService.getWeekEnd().toJSON()+"\" }}, \"client\" : \""+client+"\"}";
		}
				
		else if(calledFrom === "drawStationAxisClientChart"){
			requestString = "{\"createdTime\" : {\"$gt\" : { \"$date\": \""+startDate.toJSON()+"\" }, \"$lt\": { \"$date\": \""+endDate.toJSON()+"\" }}, \"stationName\" : \""+station+"\"}";
		}
		else if(calledFrom === "drawWeeklyStationChart"){
			requestString = "{\"createdTime\" : {\"$gt\" : { \"$date\": \""+stackedColumnWorkOrdersViewControlService.getWeekStart().toJSON()+"\" }, \"$lt\": { \"$date\": \""+stackedColumnWorkOrdersViewControlService.getWeekEnd().toJSON()+"\" }}, \"stationName\" : \""+station+"\"}";
		}
		/*console.log(requestString);*/
		var config = {
				method: 'POST',
				//headers : {'Collection' : 'events'},
				headers : {'Collection' : 'events'},
				url : mongoUrl,
				data: requestString
		};
		return $http(config);
	};
	_serviceObject = {
			getEventData : _getEventData
	};
	return _serviceObject;
}])

.factory('stackedColumnWorkOrdersViewControlService', ['$rootScope', function($rootScope){
	var _serviceObject = {};
	var _chartId;
	var _client;
	var _station;
	var _startDate = undefined;
	var _endDate = undefined;
	var _weekStart;
	var _weekEnd;
	var _weekEnding;
	var _calledFrom = undefined;
	var _redraw = false;
	
	var _setChartId = function(id){
		_chartId = id;
	};
	var _getChartId = function(){
		return _chartId;
	};
	var _makeRedraw = function(){
		$rootScope.$broadcast('renderStackedColumnClientChart');
	};
	var _getChartId = function(){
		return _chartId;
	};
	var _setChartId = function(id){
		_chartId = id;
	};
	var _getClient = function(){
		return _client;
	};
	var _setClient = function(client){
		_client = client;
	};
	var _getStation = function(){
		return _station;
	};
	var _setStation = function(station){
		_station = station;
	};
	var _getStartDate = function(){
		return _startDate;
	};
	var _setStartDate = function(start){
		_startDate = start;
	};
	var _getEndDate = function(){
		return _endDate;
	};
	var _setEndDate = function(end){
		_endDate = end;
	};
	var _getWeekStart = function(){
		return _weekStart;
	};
	var _setWeekStart = function(week){
		_weekStart = week;
	};
	var _getWeekEnd = function(){
		return _weekEnd;
	};
	var _setWeekEnd = function(week){
		_weekEnd = week;
	};
	var _getCalledFrom = function(){
		return _calledFrom;
	};
	var _setCalledFrom = function(called){
		_calledFrom = called;
	}
	_serviceObject = {
			setChartId : _setChartId,
			getChartId : _getChartId,
			makeRedraw : _makeRedraw,
			getClient : _getClient,
			setClient : _setClient,
			getStation : _getStation,
			setStation : _setStation,
			getStartDate : _getStartDate,
			setStartDate : _setStartDate,
			getEndDate : _getEndDate,
			setEndDate : _setEndDate,
			getWeekStart : _getWeekStart,
			setWeekStart : _setWeekStart,
			getWeekEnd : _getWeekEnd,
			setWeekEnd : _setWeekEnd,
			getCalledFrom : _getCalledFrom,
			setCalledFrom : _setCalledFrom
	};
	
	
	return _serviceObject;
}])
.controller('stackedColumnWorkOrdersGridCtrl',['$scope', '$rootScope', '$controller', 'configService', 
                                               'stackedColumnWorkOrdersViewControlService',
                                               function($scope, $rootScope, $controller,
                                            		   awesome,  stackedColumnWorkOrdersViewControlService){
	$scope.openWorkOrderGrid = function(){
		var thisController = this;
		var superController = $controller('baseWidgetCtrl', {
			"$scope" : $scope
		});
	
		angular.extend(thisController, awesome, superController);
		$scope.config = thisController.getConfig();
		stackedColumnWorkOrdersViewControlService.setChartId($scope.config.chartId);
		$rootScope.$broadcast('stackedColumnGridView');		
	}
}])


.controller('stackedColumnWorkOrdersCtrl', ['$scope', 'stackedColumnWorkOrdersDataService', 'stackedColumnWorkOrdersViewControlService', 
                                            'chartIdService', '$modal', 'configService', '$controller','facilitySelectorService', 'uiGridConstants', 'userPrefService', function($scope, stackedColumnWorkOrdersDataService, 
                                           stackedColumnWorkOrdersViewControlService, chartIdService, $modal, awesome, $controller, facilitySelectorService, uiGridConstants, userPrefService){
	$scope.hideGraphs = true;
	
	/** angela is replacing all of this stuff **
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});

	angular.extend(thisController, awesome, superController);
	$scope.config = thisController.getConfig();

	if($scope.config.chartId === undefined){
		$scope.config.chartId = chartIdService.getNewId();
	}
	var defaultConfig = {
			"clientName" : undefined,
			"stationName" : undefined,
			"startingDate" : "",
			"endingDate" : "",
			"chartId" : undefined,
			"closedWorkOrderColor" : undefined,
			"openWorkOrderColor" : undefined,
			"dateRange" : ""
	}

	for(var key in defaultConfig){
		if($scope.config.hasOwnProperty(key) === false){
			$scope.config[key] = defaultConfig[key];
		}
	}
	/** end area angela replaced **/
	
	
	/** angela's replacement */
	// Choose settings that this widget cares about
	var defaultConfig = {
		"clientName" : undefined,
		"stationName" : undefined,
		"startingDate" : "",
		"endingDate" : "",
		"chartId" : undefined,
		"closedWorkOrderColor" : undefined,
		"openWorkOrderColor" : undefined,
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
	
	var refreshConfigs = function() {
		console.log("WORK ORDER COUNT updating!");
		var myPrefs = userPrefService.getUserPrefs("stacked-column-work-orders");
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
				case "last twelve weeks":{
					dates = variableWeeksAgo(12);
					break;
				}
				case "last six weeks":{
					dates = variableWeeksAgo(6);
					break;
				}
				case "last six months":{
					dates = variableMonthsAgo(6);
					break;
				}
			}
			currentConfig.startingDate = dates.startDate;
			currentConfig.endingDate = dates.endDate;
		}
		if (currentConfig.startingDate === undefined || currentConfig.endingDate === undefined) {
			currentConfig.endingDate = new Date();
			currentConfig.startingDate = new Date(end.getFullYear(), end.getMonth(), end.getDate()-84);
		}
		// End update date range

		
		if(currentConfig.chartId === undefined)	currentConfig.chartId = chartIdService.getNewId();
	
		stackedColumnWorkOrdersViewControlService.setClient(currentConfig.clientName);
		stackedColumnWorkOrdersViewControlService.setStartDate(currentConfig.startingDate);
		stackedColumnWorkOrdersViewControlService.setEndDate(currentConfig.endingDate);
		
		$scope.hasOrg = true;
		$scope.weeklyStationView = false;
		$scope.assetView = false;
		
		$scope.config = currentConfig;
		$scope.requestClientViewData();
	}
	/** end angela's replacement section */
	
	
	if(angular.element(document.getElementById("editorHere")).hasClass("xui-css-dockparent")){
		/*console.log("You are in the editor");*/
		$scope.inEditor = true;
	}
	else{
		/*console.log("you are not in the editor.");*/
		$scope.inEditor = false;
	}
	$scope.inDashboard = true;
	if(thisController.getFullConfig().dashboard === undefined){
		$scope.inDashboard = false;
	}
	
	var variableMonthsAgo = function(number){
		var end = new Date();
		var start = new Date(end.getFullYear(), end.getMonth()-number, end.getDate());
		return {"startDate" : start, "endDate" : end};
	};
	var variableWeeksAgo = function(number){
		var days = number * 7;
		var end = new Date();
		var start = new Date(end.getFullYear(), end.getMonth(), end.getDate()-days);
		return {"startDate" : start, "endDate" : end};
	};
	var variableDaysAgo = function(number){
		var end = new Date();
		var start = new Date(end.getFullYear(), end.getMonth(), end.getDate()-number);
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
	};
	
	$scope.assetView = false;
	$scope.weeklyStationView = false;
	$scope.noData = false;
	$scope.requestClientViewData = function(){
		/*console.log($scope.config);*/
		stackedColumnWorkOrdersDataService.getEventData()
			.success(function(data){
				
				if(data.result === null){
					$scope.noData = true;
					$scope.hasOrg = true;
					$scope.stationClientView = false;
					$scope.timeClientView = false;
					$scope.weeklyStationView = false;
					$scope.gridView = false;
					$scope.hideGraphs = false;
					return;
				}else{
					$scope.noData = false;
				}
				
				if($scope.config.startingDate === "" || $scope.config.endingDate === ""){
					/*console.log($scope.config.startingDate);
					console.log($scope.config.endingDate);
*/					$scope.config.startingDate = stackedColumnWorkOrdersViewControlService.getStartDate();
					$scope.config.endingDate = stackedColumnWorkOrdersViewControlService.getEndDate();
				}
				$scope.hasOrg = true;
				//console.log(data.result);
				$scope.stationClientView = false;
				$scope.timeClientView = true;
				$scope.weeklyStationView = false;
				$scope.gridView = false;
				$scope.hideGraphs = true;
				$scope.clientCrossData = crossfilter(data.result);
				
				$scope.defineAllClientDimensions();
				$scope.defineAllClientGroups();	
				$scope.drawTimeAxisClientChart();
			})
			.error(function(){
				/*console.log("use offline data");*/
			})
	};
	$scope.requestWeeklyStationData = function(){
		stackedColumnWorkOrdersDataService.getEventData()
			.success(function(data){
				$scope.weeklyStationCrossData = crossfilter(data.result);
				$scope.defineAllWeeklyStationDimensions();
				$scope.defineAllWeeklyStationGroups();
				$scope.drawWeeklyStationChart();
				$scope.gridView = false;
				$scope.hideGraphs = true;
				$scope.weeklyStationView = true;
				$scope.stationClientView = false;
				$scope.timeClientView = false;
			})
			.error(function(){
				/*console.log("use offline data");*/
			})
	};
	$scope.requestAssetViewData = function(){
		stackedColumnWorkOrdersDataService.getEventData()
			.success(function(data){
				$scope.assetViewCrossData = crossfilter(data.result); 
				$scope.defineAllAssetDimensions(); 
				$scope.defineAllAssetGroups(); 
				$scope.drawAssetViewChart(); 
				$scope.gridView = false;
				$scope.hideGraphs = true;
				$scope.assetView = true;
				$scope.weeklyStationView = false;
				$scope.stationClientView = false;
				$scope.timeClientView = false;
			})
			.error(function(){
				/*console.log("use offline data");*/
			})
	}; 
	$scope.defineAllClientDimensions = function(){
		
		$scope.clientMonthDimension = $scope.clientCrossData.dimension(function(d){
			return d3.time.month(new Date(d.createdTime.$date.toString()));
		});
		$scope.clientWeekDimension = $scope.clientCrossData.dimension(function(d){
			return d3.time.week(new Date(d.createdTime.$date.toString()));
		});
		$scope.clientStationDimension = $scope.clientCrossData.dimension(function(d){
			return d.stationName;
		});
		$scope.assetDimension = $scope.clientCrossData.dimension(function(d){
			return d.asset;
		});
	};
	$scope.defineAllWeeklyStationDimensions = function(){
		$scope.stationWeeklyDimension = $scope.weeklyStationCrossData.dimension(function(d){
			return d.stationName;
		});
	};
	$scope.defineAllAssetDimensions = function(){
		$scope.assetDimension = $scope.assetViewCrossData.dimension(function(d){
			return d.asset;
		});
	};
	
	$scope.defineAllClientGroups = function(){
	
		$scope.clientMonthGroup = $scope.clientMonthDimension.group().reduce(
			function(p, v){
				if(v.status === "Closed"){
					p.numClosedTickets += 1;
				}
				else{
					p.numOpenTickets += 1;
				}
				return p;
			}, 
			function(p, v){
				if(v.status === "Closed"){
					p.numClosedTickets -= 1;
				}
				else{
					p.numOpenTickets -= 1;
				}
				return p;
			}, 
			function(){
				return {
					numberOpenTickets : 0,
					numberClosedTickets : 0,
				};
			}	
		);
		$scope.clientWeekGroup = $scope.clientWeekDimension.group().reduce(
				function(p, v){
					if(v.status === "Closed"){
						p.numberClosedTickets += 1;
					}
					else{
						p.numberOpenTickets += 1;
					}
					return p;
				}, 
				function(p, v){
					if(v.status === "Closed"){
						p.numberClosedTickets -= 1;
					}
					else{
						p.numberOpenTickets -= 1;
					}
					return p;
				}, 
				function(){
					return {
						numberOpenTickets : 0,
						numberClosedTickets : 0
					};
				}
		);
		$scope.clientStationGroup = $scope.clientStationDimension.group().reduce(
				function(p, v){
					if(v.status === "Closed"){
						p.numberClosedTickets += 1;
					}
					else{
						p.numberOpenTickets += 1;
					}
					return p;
				},
				function(p, v){
					if(v.status === "Closed"){
						p.numberClosedTickets -= 1;
					}
					else{
						p.numberOpenTickets -= 1; 
					}
					return p;
				}, 
				function(){
					return {
						numberOpenTickets : 0,
						numberClosedTickets : 0
					};
				}
		);
	};
	
	$scope.defineAllWeeklyStationGroups = function(){
		$scope.stationWeeklyGroup = $scope.stationWeeklyDimension.group().reduce(
				function(p, v){
					if(v.status === "Closed"){
						p.numberClosedTickets += 1;
					}
					else{
						p.numberOpenTickets += 1;
					}
					return p;
				}, 
				function(p, v){
					if(v.status === "Closed"){
						p.numberClosedTickets -= 1;
					}
					else{
						p.numberOpenTickets -= 1; 
					}
					return p;
				}, 
				function(){
					return {
						numberOpenTickets : 0,
						numberClosedTickets : 0
					};
				}
		);
	};
	$scope.defineAllAssetGroups = function(){
		$scope.assetGroup = $scope.assetDimension.group().reduce(
				function(p, v){
					if(v.status === "Closed"){
						p.numberClosedTickets += 1;
					}
					else{
						p.numberOpenTickets += 1;
					}
					return p;
				}, 
				function(p, v){
					if(v.status === "Closed"){
						p.numberClosedTickets -= 1;
					}
					else{
						p.numberOpenTickets -= 1;
					}
					return p;
				}, 
				function(){
					return {
						numberOpenTickets : 0,
						numberClosedTickets : 0
					};
				}
		);
	};
	
	$scope.drawTimeAxisClientChart = function(){
		/*console.log('$scope.drawTimeAxisClientChart called');*/
		if(!$scope.timeClientView || $scope.stationClientView || $scope.weeklyStationView){return;}
		
		if($scope.config.startingDate === undefined || $scope.config.startingDate === ""){
			/*console.log('Why am I here again??');*/
			var dates = variableWeeksAgo(12);
		/*	console.log(dates);*/
			stackedColumnWorkOrdersViewControlService.setStartDate(dates.startDate);
			stackedColumnWorkOrdersViewControlService.setEndDate(dates.endDate);
			
			$scope.config.startingDate = dates.startDate;
			$scope.config.endingDate = dates.endDate;
		}
		
		//$scope.timeAxisClientChart = dc.barChart("#time_axis_client_chart_"+$scope.config.chartId)
/*		$scope.timeAxisClientChart = dc.barChart('#time_axis_client_chart_'+$scope.config.chartId)
			.width(600)
			.height(500)
			.margins({top: 50, right: 60, bottom: 60, left: 60})
			.dimension($scope.clientWeekDimension)
			.group($scope.clientWeekGroup, 'Closed Work Orders')
			.valueAccessor(function(p){return p.value.numberClosedTickets;})
			.stack($scope.clientWeekGroup, 'Open Work Orders', function(p) {return p.value.numberOpenTickets;})
			//$scope.timeAxisClientChart.yAxisLabel('Total Number of work Orders'); //still causing errors...
			.elasticX(true)
			.elasticY(true)
			.centerBar(true)
			.barPadding(0.05)
			.yAxisPadding('5%')
			.transitionDuration(250)
			.x(d3.time.scale().domain([new Date($scope.config.startingDate.getFullYear(),$scope.config.startingDate.getMonth(),$scope.config.startingDate.getDate() - 4), $scope.config.endingDate]))
			.xUnits(d3.time.weeks)
			.brushOn(false)
			.title(function(d){var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; 
			return "Client: "+$scope.config.clientName+"\nWeek Of: "+months[d.key.getMonth()]+" "+d.key.getDate()+", "+d.key.getFullYear()+
			"\nNumber of Tickets Opened: "+d.value.numberOpenTickets+"\nNumber of Tickets Closed: "+d.value.numberClosedTickets+
			"\nTotal Number of Tickets: "+parseInt(parseInt(d.value.numberClosedTickets)+parseInt(d.value.numberOpenTickets));
			})
			.legend(dc.legend() 					
		    	    .x(425)
					.y(0)
		    	    .itemHeight(13)
		    	    .gap(5)
			)
			.renderlet(function(chart){
				chart.selectAll("g.x text")
				.attr('transform', "rotate(-80)")
				.attr('dx', '-10')
				.attr('dy', '-5')
				.style("text-anchor", "end")
				;
			})
			.renderlet(function(chart){
				chart.selectAll("rect")
					.on("click", function(d){
						console.log($scope);
						stackedColumnWorkOrdersViewControlService.setWeekStart(d.data.key);
						stackedColumnWorkOrdersViewControlService.setWeekEnd(new Date(d.data.key.getFullYear(),d.data.key.getMonth(),d.data.key.getDate()+7));
						stackedColumnWorkOrdersViewControlService.setCalledFrom("drawTimeAxisClientChart");
						$scope.requestWeeklyStationData();
				})
			})
	
		.xAxis().ticks(getNumberOfTicks());
	
		if($scope.config.openWorkOrderColor !== undefined && $scope.config.closedWorkOrderColor !== undefined){
			$scope.timeAxisClientChart.ordinalColors([$scope.config.closedWorkOrderColor, $scope.config.openWorkOrderColor])
		}
		$scope.timeAxisClientChart.render();*/
				
		$scope.timeAxisClientChart = dc.barChart("#time_axis_client_chart_"+$scope.config.chartId)
			.width(600)
			.height(500)
			.margins({top: 50, right: 60, bottom: 60, left: 60})
			.dimension($scope.clientWeekDimension)
			.group($scope.clientWeekGroup, "Closed Work Orders")
			.valueAccessor(function(p){return p.value.numberClosedTickets;})
			.stack($scope.clientWeekGroup, "Open Work Orders", function(p){return p.value.numberOpenTickets;})
			//.yAxisLabel("Total Number of Work Orders")
			.elasticX(false)
			.elasticY(true)
			.centerBar(true)
			.barPadding(0.05)
			.yAxisPadding('5%')
			.transitionDuration(250)
			.x(d3.time.scale().domain([new Date($scope.config.startingDate.getFullYear(),$scope.config.startingDate.getMonth(),$scope.config.startingDate.getDate() - 4), $scope.config.endingDate])) 
			.xUnits(d3.time.weeks)
			.renderHorizontalGridLines(true)
			.brushOn(false)
			.title(function(d){var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; 
						return "Client: "+$scope.config.clientName+"\nWeek Of: "+months[d.key.getMonth()]+" "+d.key.getDate()+", "+d.key.getFullYear()+
						"\nNumber of Tickets Opened: "+d.value.numberOpenTickets+"\nNumber of Tickets Closed: "+d.value.numberClosedTickets+
						"\nTotal Number of Tickets: "+parseInt(parseInt(d.value.numberClosedTickets)+parseInt(d.value.numberOpenTickets));
						})
			.legend(dc.legend() 					
			    	    .x(425)
						.y(0)
			    	    .itemHeight(13)
			    	    .gap(5)
			)
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
					.on("click", function(d){
						if(d.chart !== undefined){return;}
						stackedColumnWorkOrdersViewControlService.setWeekStart(d.data.key);
						stackedColumnWorkOrdersViewControlService.setWeekEnd(new Date(d.data.key.getFullYear(),d.data.key.getMonth(),d.data.key.getDate()+7));
						stackedColumnWorkOrdersViewControlService.setCalledFrom("drawTimeAxisClientChart");
						$scope.requestWeeklyStationData();
					})
			});
			
			$scope.timeAxisClientChart.xAxis().ticks(getNumberOfTicks());
			
			if($scope.config.openWorkOrderColor !== undefined && $scope.config.closedWorkOrderColor !== undefined){
				$scope.timeAxisClientChart.ordinalColors([$scope.config.closedWorkOrderColor, $scope.config.openWorkOrderColor])
			}
			$scope.timeAxisClientChart.render();
			
			
	};
	$scope.drawStationAxisClientChart = function(){
		$scope.stationAxisClientChart = dc.barChart("#station_axis_client_chart_"+$scope.config.chartId)
			.width(600)
			.height(500)
			.margins({top: 50, right: 60, bottom: 60, left: 60})
			.dimension($scope.clientStationDimension)
			.group($scope.clientStationGroup, "Closed Work Orders")
			.valueAccessor(function(p){return p.value.numberClosedTickets;})
			.stack($scope.clientStationGroup, "Open Work Orders", function(p){return p.value.numberOpenTickets;})
			.yAxisLabel("Total Number of Work Orders")
			.elasticX(true)
			.elasticY(true)
			.centerBar(false)
			.barPadding(0.05)
			.yAxisPadding('5%')
			.transitionDuration(250)
			.x(d3.scale.ordinal().domain([]))
			.xUnits(dc.units.ordinal)
			.renderHorizontalGridLines(true)
			.brushOn(false)
			.title(function(d){return "Client: "+$scope.config.clientName+"\nStation: "+d.key+"\nNumber of Tickets Opened: "+d.value.numberOpenTickets+"\nNumber of Tickets Closed: "
							   +d.value.numberClosedTickets+"\nTotal Number of Tickets: "+parseInt(parseInt(d.value.numberClosedTickets)+parseInt(d.value.numberOpenTickets));
			})
			.legend(dc.legend() 					
		    	    .x(425) 
					.y(0)
		    	    .itemHeight(13)
		    	    .gap(5)
			)
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
					.on("click", function(d){
						$scope.config.stationName = d.data.key;
						stackedColumnWorkOrdersViewControlService.setCalledFrom("drawStationAxisClientChart");
						stackedColumnWorkOrdersViewControlService.setStation(d.data.key);
						$scope.requestAssetViewData();
					})
			});
			
			if($scope.config.openWorkOrderColor !== undefined && $scope.config.closedWorkOrderColor !== undefined){
				$scope.stationAxisClientChart.ordinalColors([$scope.config.closedWorkOrderColor, $scope.config.openWorkOrderColor])
			}
			$scope.stationAxisClientChart.render();
			
	};
	
	$scope.drawWeeklyStationChart = function(){
		$scope.weeklyStationChart = dc.barChart("#weekly_station_chart_"+$scope.config.chartId)
			.width(600)
			.height(500)
			.margins({top: 50, right: 60, bottom: 60, left: 60})
			.dimension($scope.stationWeeklyDimension)
			.group($scope.stationWeeklyGroup, "Closed Work Orders")
			.valueAccessor(function(p){return p.value.numberClosedTickets;})
			.stack($scope.stationWeeklyGroup, "Open Work Orders", function(p){return p.value.numberOpenTickets;})
			.yAxisLabel("Total Number of Work Orders Week of "+parseInt(stackedColumnWorkOrdersViewControlService.getWeekStart().getMonth()+1)+"/"+stackedColumnWorkOrdersViewControlService.getWeekStart().getDate()+"/"+stackedColumnWorkOrdersViewControlService.getWeekStart().getFullYear())
			.elasticX(true)
			.elasticY(true)
			.centerBar(false)
			.barPadding(0.05)
			.yAxisPadding('5%')
			.transitionDuration(250)
			.x(d3.scale.ordinal().domain([]))
			.xUnits(dc.units.ordinal)
			.renderHorizontalGridLines(true)
			.brushOn(false)
			.title(function(d){return "Client: "+$scope.config.clientName+"\nStation: "+d.key+"\nNumber of Tickets Opened: "+d.value.numberOpenTickets+"\nNumber of Tickets Closed: "
							   +d.value.numberClosedTickets+"\nTotal Number of Tickets: "+parseInt(parseInt(d.value.numberClosedTickets)+parseInt(d.value.numberOpenTickets));
			})
			.legend(dc.legend() 					
		    	    .x(425) 
					.y(0)
		    	    .itemHeight(13)
		    	    .gap(5)
			)
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
					.on("click", function(d){
						$scope.config.stationName = d.data.key;
						stackedColumnWorkOrdersViewControlService.setCalledFrom("drawWeeklyStationChart");
						stackedColumnWorkOrdersViewControlService.setStation(d.data.key);
						$scope.requestAssetViewData();
					});
			});
			if($scope.config.openWorkOrderColor !== undefined && $scope.config.closedWorkOrderColor !== undefined){
				$scope.weeklyStationChart.ordinalColors([$scope.config.closedWorkOrderColor, $scope.config.openWorkOrderColor])
			}
			$scope.weeklyStationChart.render()
			;
	};
	$scope.drawAssetViewChart = function(){
		$scope.assetChart = dc.barChart("#asset_chart_"+$scope.config.chartId)
			.width(600)
			.height(500)
			.margins({top: 50, right: 60, bottom: 60, left: 60})
			.dimension($scope.assetDimension)
			.group($scope.assetGroup, "Closed Work Orders")
			.valueAccessor(function(p){return p.value.numberClosedTickets;})
			.stack($scope.assetGroup, "Open Work Orders", function(p){return p.value.numberOpenTickets;})
			.elasticX(true)
			.elasticY(true)
			.centerBar(false)
			.barPadding(0.05)
			.yAxisPadding('5%')
			.transitionDuration(250)
			.x(d3.scale.ordinal().domain([]))
			.xUnits(dc.units.ordinal)
			.renderHorizontalGridLines(true)
			.brushOn(false)
			.title(function(d){return "Client: "+$scope.config.clientName+"\nStation: "+$scope.config.stationName+"\nAsset: "+d.key+"\nNumber of Tickets Opened: "
							   +d.value.numberOpenTickets+"\nNumber of Tickets Closed: "+d.value.numberClosedTickets+"\nTotal Number of Tickets: "+parseInt(d.value.numberOpenTickets + d.value.numberClosedTickets);
			})
			.legend(dc.legend() 					
		    	    .x(425) 
					.y(0)
		    	    .itemHeight(13)
		    	    .gap(5)
			)
			.on('renderlet', function(chart){
				chart.selectAll("g.x text")
					.attr('transform', "rotate(-80)")
					.attr('dx', '-10')
					.attr('dy', '-5')
					.style("text-anchor", "end")
					;
			});
			if($scope.config.openWorkOrderColor !== undefined && $scope.config.closedWorkOrderColor !== undefined){
				$scope.assetChart.ordinalColors([$scope.config.closedWorkOrderColor, $scope.config.openWorkOrderColor])
			}
			if(stackedColumnWorkOrdersViewControlService.getCalledFrom() === "drawWeeklyStationChart"){
				$scope.assetChart.yAxisLabel("Total Number of Work Orders Week of "+parseInt(stackedColumnWorkOrdersViewControlService.getWeekStart().getMonth()+1)+"/"+stackedColumnWorkOrdersViewControlService.getWeekStart().getDate()+"/"+stackedColumnWorkOrdersViewControlService.getWeekStart().getFullYear());
			}
			else{
				$scope.assetChart.yAxisLabel("Total Number of Work Orders by Asset");
			}
			$scope.assetChart.render()
			;
	};
	$scope.openPageConfiguration = function(){

		var modalInstance = $modal.open({
            templateUrl: 'icWidgets/stackedColumnWorkOrdersConfig.html',
            controller: 'stackedColumnWorkOrdersConfigCtrl',
			resolve: {
				config: function(){
					return $scope.config;
				}
			}
        });
		
		modalInstance.result.then(function(config){
			thisController.setConfig(config);
			stackedColumnWorkOrdersViewControlService.setClient($scope.config.clientName);
			stackedColumnWorkOrdersViewControlService.setStartDate($scope.config.startingDate);
			stackedColumnWorkOrdersViewControlService.setEndDate($scope.config.endingDate);
			stackedColumnWorkOrdersViewControlService.setChartId($scope.config.chartId);
			stackedColumnWorkOrdersViewControlService.setCalledFrom("modalOpener");
			stackedColumnWorkOrdersViewControlService.makeRedraw();
		}, 
		function() {
			console.log("failed to receive results from configuration modal");
		});
	};
	$scope.toggleView = function(){
		$scope.stationClientView = !$scope.stationClientView;
		$scope.timeClientView = !$scope.timeClientView;
		if($scope.stationClientView){
			$scope.drawStationAxisClientChart();
		}
		else{
			$scope.drawTimeAxisClientChart();
		}
	};
	$scope.showClientView = function(){
		$scope.assetView = false;
		$scope.weeklyStationView = false;
		if(stackedColumnWorkOrdersViewControlService.getCalledFrom() === "drawTimeAxisClientChart"){
			$scope.stationClientView = false;
			$scope.timeClientView = true;
			$scope.drawTimeAxisClientChart();
		}
		else{
			$scope.timeClientView = false;
			$scope.stationClientView = true;
			$scope.drawStationAxisClientChart();
		}	
	};
	$scope.showFacilityView = function(){
		$scope.assetView = false;
		if(stackedColumnWorkOrdersViewControlService.getCalledFrom() === "drawWeeklyStationChart"){
			$scope.weeklyStationView = true;
			$scope.drawWeeklyStationChart();
		}
		else{
			$scope.weeklyStationView = false;
			$scope.stationClientView = true;
			$scope.drawStationAxisClientChart();
		}
	};
	$scope.$on('renderStackedColumnClientChart', function(){
		if($scope.config.chartId !== stackedColumnWorkOrdersViewControlService.getChartId()){return;}
		$scope.hasOrg = true;
		$scope.weeklyStationView = false;
		$scope.assetView = false;
		$scope.requestClientViewData();
	});
	
	/** this will all become obsolete **
	$scope.$on('organizationSetFacilitySelector', function(){
		var client = facilitySelectorService.getOrganization();
		var start = $scope.config.startingDate;
		var end = $scope.config.endingDate;
		if(start === undefined || end === undefined){
			end  = new Date();
			start = new Date(end.getFullYear(), end.getMonth(), end.getDate()-84);
		}
		
		$scope.config.clientName = client;
		$scope.config.startingDate = start;
		$scope.config.endingDate = end;
		
		stackedColumnWorkOrdersViewControlService.setClient(client);
		stackedColumnWorkOrdersViewControlService.setStartDate(start);
		stackedColumnWorkOrdersViewControlService.setEndDate(end);
		stackedColumnWorkOrdersViewControlService.setCalledFrom("modalOpener");
		
		$scope.hasOrg = true;
		$scope.weeklyStationView = false;
		$scope.assetView = false;
		$scope.requestClientViewData();
	});
	/** end area becoming obsolete **/
	
	$scope.$on('stackedColumnGridView', function(){
		if(stackedColumnWorkOrdersViewControlService.getChartId() === $scope.config.chartId){
			$scope.openWorkOrderGrid();
		}
	});
	
	$scope.openWorkOrderGrid = function(){
		if($scope.gridView){
			$scope.gridView = false;
			$scope.hideGraphs = true;
		}
		else{
			var rectData = [];
			var chartData = [];
			var chart;
			var displayName;
			if($scope.stationClientView){
				chart = d3.select("#station_axis_client_chart_"+$scope.config.chartId);
				displayName = "Station";
			}
			else if($scope.timeClientView){
				chart = d3.select("#time_axis_client_chart_"+$scope.config.chartId);
				displayName = "Week";
				//return;
			}
			else if($scope.weeklyStationView){
				chart = d3.select("#weekly_station_chart_"+$scope.config.chartId);
				displayName = "Station";
			}
			else{
				chart = d3.select("#asset_chart_"+$scope.config.chartId);
				displayName = "Asset";
			}
			var selects = chart.selectAll('rect');
			/*console.log(selects);*/
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
					var row;
					if(displayName === "Week"){
						var date = parseInt(1+rectData[i].key.getMonth())+"/"+rectData[i].key.getDate()+"/"+rectData[i].key.getFullYear();
						row = {'key' : date, "Open" : d3.round(rectData[i].value.numberOpenTickets, 2), "Closed" : d3.round(rectData[i].value.numberClosedTickets, 2), "Total" : d3.round(rectData[i].value.numberOpenTickets + rectData[i].value.numberClosedTickets, 2)};
					}
					else{
						row = {'key' : rectData[i].key, "Open" : d3.round(rectData[i].value.numberOpenTickets, 2), "Closed" : d3.round(rectData[i].value.numberClosedTickets, 2), "Total" : d3.round(rectData[i].value.numberOpenTickets + rectData[i].value.numberClosedTickets, 2)};
					}
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
					             {field: 'key', displayName: displayName},
					             {field: 'Open', aggregationType: uiGridConstants.aggregationTypes.sum},
					             {field: 'Closed', aggregationType: uiGridConstants.aggregationTypes.sum},
					             {field: 'Total', aggregationType: uiGridConstants.aggregationTypes.sum}
					             ]
			};
			$scope.hideGraphs = false;
			$scope.gridView = true;
			console.log("");
		}
	};
	var getNumberOfTicks = function(){
		var start = $scope.config.startingDate;
		var end = $scope.config.endingDate;
		var days = (end-start)/(1000*60*60*24);
		var ticks = Math.ceil(days/7);
		if(ticks < 3){
			$scope.timeAxisClientChart.gap(150);
		}
		else if(ticks < 6){
			$scope.timeAxisClientChart.gap(60);
		}
		if(ticks > 30){ticks = 25; $scope.timeAxisClientChart.elasticX(true);}
		return ticks;
	};
	
	/** this will all become obsolete **
	$scope.$watch('config.clientName', function(){
		if($scope.config.clientName === undefined || $scope.config.clientName === ""){return;}
		else{
			stackedColumnWorkOrdersViewControlService.setCalledFrom("modalOpener");
			stackedColumnWorkOrdersViewControlService.setClient($scope.config.clientName);
			$scope.requestClientViewData();
		}
	}, true);
	$scope.$watch('config.closedWorkOrderColor', function(){
		if(!$scope.inEditor || $scope.config.clientName === "" || $scope.config.clientName === undefined){return;}
		else{
			stackedColumnWorkOrdersViewControlService.setCalledFrom("modalOpener");
			$scope.requestClientViewData();
		}
	}, true);
	$scope.$watch('config.openWorkOrderColor', function(){
		if(!$scope.inEditor || $scope.config.clientName === "" || $scope.config.clientName === undefined){return;}
		else{
			stackedColumnWorkOrdersViewControlService.setCalledFrom("modalOpener");
			$scope.requestClientViewData();
		}
	}, true);
	$scope.$watch('config.dateRange', function(){
		if($scope.config.dateRange === "" || $scope.config.dateRange === undefined){return;}
		else{
			var range = $scope.config.dateRange;
			var dates;
			switch(range){
				case "last twelve weeks":{
					dates = variableWeeksAgo(12);
					break;
				}
				case "last six weeks":{
					dates = variableWeeksAgo(6);
					break;
				}
				case "last six months":{
					dates = variableMonthsAgo(6);
					break;
				}
			}
			stackedColumnWorkOrdersViewControlService.setStartDate(dates.startDate);
			stackedColumnWorkOrdersViewControlService.setEndDate(dates.endDate);
			$scope.config.startingDate = dates.startDate;
			$scope.config.endingDate = dates.endDate;
			if($scope.config.clientName !== undefined && $scope.config.clientName !== "" && $scope.inEditor){
				stackedColumnWorkOrdersViewControlService.setCalledFrom("modalOpener");
				$scope.requestClientViewData();
			}
		}
	}, true);
	/** end area becoming obsolete **/
	
	/** angela new **/
	$scope.$watch('config', function(){
		refreshConfigs();
	}, true);
	$scope.$on('userPrefsChanged',function(){
		refreshConfigs();
	});
	/** end angela new **/
		
	/*$scope.$watch('config', function(nuObj, oldObj){
		
		var nu = nuObj.clientName;
		var old = oldObj.clientName;
		
		if(nu === "" || nu === undefined){return;}
		 
		if($scope.inEditor === false){
			console.log('in editor false if');
			stackedColumnWorkOrdersViewControlService.setCalledFrom("modalOpener");
			stackedColumnWorkOrdersViewControlService.setClient(nu);
			$scope.requestClientViewData();
			return;
			
		}
		if(nuObj.closedWorkOrderColor !== "" && nuObj.closedWorkOrderColor !== undefined && $scope.inEditor === true){
			if($scope.inEditor){
				console.log('in editor true first if');
				stackedColumnWorkOrdersViewControlService.setCalledFrom("modalOpener");
				stackedColumnWorkOrdersViewControlService.setClient(nu);
				$scope.requestClientViewData();
				return;
			}
		}
		if(nuObj.openWorkOrderColor !== "" && nuObj.openWorkOrderColor !== undefined && $scope.inEditor === true){
			if($scope.inEditor){
				console.log('in editor true second if');
				stackedColumnWorkOrdersViewControlService.setCalledFrom("modalOpener");
				stackedColumnWorkOrdersViewControlService.setClient(nu);
				$scope.requestClientViewData();
				return;
			}
		}
		if(nuObj.clientName !== "" && nuObj.clientName !== undefined){
			if($scope.inEditor){
				console.log('in editor true third if');
				stackedColumnWorkOrdersViewControlService.setCalledFrom("modalOpener");
				stackedColumnWorkOrdersViewControlService.setClient(nu);
				$scope.requestClientViewData();
				return;
			}
		}
		
	}, true);*/
	/*$scope.$watch('config.startingDate', function(){
		console.log('start changed');
		console.log($scope.config.startingDate);
		if($scope.config.clientName !== "" && $scope.config.clientName !== undefined){
			stackedColumnWorkOrdersViewControlService.setCalledFrom("modalOpener");
			$scope.requestClientViewData();
		}
	})
	$scope.$watch('config.endingDate', function(){
		console.log('end changed');
		console.log($scope.config.endingDate);
		//stackedColumnWorkOrdersViewControlService.setEndDate(new Date($scope.config.endingDate));
		if($scope.config.clientName !== "" && $scope.config.clientName !== undefined){
			stackedColumnWorkOrdersViewControlService.setCalledFrom("modalOpener");
			$scope.requestClientViewData();
		}
	})*/
	
	$scope.log = function(){
		console.log($scope);
		console.log($scope.config);
	}
	refreshConfigs();
}])

.controller('stackedColumnWorkOrdersModalOpenCtrl', ['$scope', '$modal', 'configService', '$controller', 'stackedColumnWorkOrdersViewControlService', 
                                                    function($scope, $modal, awesome, $controller, stackedColumnWorkOrdersViewControlService){
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});
	angular.extend(thisController, awesome, superController);
	
  	$scope.config = thisController.getConfig();  	
  	
  	$scope.openConfiguration = function() {
		
		var modalInstance = $modal.open({
            templateUrl: 'icWidgets/stackedColumnWorkOrdersConfig.html',
            controller: 'stackedColumnWorkOrdersConfigCtrl',
			resolve: {
				config: function(){
					return $scope.config;
				}
			}
        });
		
		modalInstance.result.then(function(config){
			thisController.setConfig(config);
			//console.log($scope.config);
			stackedColumnWorkOrdersViewControlService.setClient($scope.config.clientName);
			stackedColumnWorkOrdersViewControlService.setStartDate($scope.config.startingDate);
			stackedColumnWorkOrdersViewControlService.setEndDate($scope.config.endingDate);
			stackedColumnWorkOrdersViewControlService.setChartId($scope.config.chartId);
			stackedColumnWorkOrdersViewControlService.setCalledFrom("modalOpener");
			stackedColumnWorkOrdersViewControlService.makeRedraw();
		}, 
		function() {
			console.log("failed to receive results from configuration modal");
		});
	};
}])

.controller('stackedColumnWorkOrdersConfigCtrl', ['$scope', '$modalInstance', 'clientService', 'config', function($scope, $modalInstance, clientService, config){
	$scope.client = config.clientName;
	$scope.startDate = new Date(config.startingDate);
	$scope.endDate = new Date(config.endingDate);
	$scope.closedColor = config.closedWorkOrderColor;
	$scope.openColor = config.openWorkOrderColor;
	
	clientService.getOrganizationList().then(function(clientList){
		$scope.clientNames = clientList;
	});
	
	$scope.setClient = function(clientName){
		
		$scope.client = clientName;
	};
	
	$scope.ok = function(){
		if($scope.startDate === undefined || $scope.endDate === undefined){
			//default to last 12 weeks
			$scope.endDate = new Date();
			$scope.startDate = new Date($scope.endDate.getFullYear(),$scope.endDate.getMonth(), $scope.endDate.getDate() - 84)
		}
			var config = {
					"clientName" : $scope.client,
					"startingDate" : $scope.startDate,
					"endingDate" : $scope.endDate,
					"closedWorkOrderColor" : $scope.closedColor,
					"openWorkOrderColor" : $scope.openColor					
			};
			$modalInstance.close(config);
		};
	$scope.cancel = function(){
		$modalInstance.dismiss('cancel');
	};
}])
