'use strict';

angular.module('icDash.equipment', ['ui.router'])

/**angular.module('myApp.equipment', ['ngRoute', 'ui.grid', 'ui.grid.autoResize','myApp.dashboard', 'myApp.panelComponent', 'myApp.popout', 'myApp.pciService',
'ui.bootstrap', 'myApp.ticketImpulse', 'myApp.clientService', 'myApp.dashboardTransitionService', 'myApp.facilitySelector', 'myApp.calendar', 'colorpicker.module'])
**
.run(['directiveService', function(directiveService){
	directiveService.addFullComponent({
		tag: function(){return 'equipment';},
		configTag: function(){return 'equipment-config';},
		gridTag: function(){return 'equipment-grid'},
		tagHtml: function(){return "<equipment></equipment>";},
		directiveName: function(){return 'equipment';},
		namespace: function(){return 'equipment'},
		heading: function(){return 'equipment-name'},
		paletteImage: function(){return 'pictures/pareto.png';}
		});
}])**/
.directive('equipment', [function(){
	  return{
		  restrict: 'E',
			controller: 'equipmentCtrl',
			templateUrl: 'icWidgets/equipment.html',
	  }
}])
.directive('equipmentConfig',[function(){
	  return{
		  restrict:'E',
		  controller: 'equipmentModalOpenCtrl',
		  templateUrl: 'icWidgets/algoConfig.html'
	  }
}])
.directive('equipmentGrid', [function(){
	return {
		restrict: 'E',
		controller: 'equipmentGridCtrl',
		templateUrl: 'icWidgets/gridView.html'
	}
}])
.directive('equipmentName', [function(){
	return{
		template: "Equipment Overview"
	};
}])

.factory('equipmentDataService', ['$http', 'equipmentViewControlService', function($http, equipmentViewControlService){
	var _serviceObject = {};
	var _getEventData = function(){
		//var mongoUrl = "https://galaxy2021temp.pcsgalaxy.net:9453/db/query";
		var mongoUrl = "https://galaxy2021temp.pcsgalaxy.net:9453/db/query";
		
		var client = equipmentViewControlService.getClientName();		
		var stationName = equipmentViewControlService.getStationName();
		var startDate = equipmentViewControlService.getStartingDate();
		var endDate = equipmentViewControlService.getEndingDate();
		
		/*console.log(startDate);
		console.log(endDate);*/
		
		if(($.type(startDate === "string") && startDate !== "" && startDate !== undefined) || ($.type(endDate === "string") && endDate !== "" && endDate !== undefined)){
			//console.log("went here for some dumb reason");
			startDate = new Date(startDate);
			endDate = new Date(endDate);
		}
		
		var requestString;
		
		if((startDate === undefined || startDate === "") && (endDate === undefined || endDate === "")){
			requestString = "{\"client\" : \""+client+"\"}";
		}
		else if(startDate === undefined || startDate === ""){
			startDate = new Date(2005, 1, 1);
			endDate = new Date(endDate);
			requestString = "{\"createdTime\" : {\"$gt\" : { \"$date\": \""+startDate.toJSON()+"\" }, \"$lt\": { \"$date\": \""+endDate.toJSON()+"\" }}, \"client\" : \""+client+"\"}";
		}
		else if(endDate === undefined || endDate === ""){
			endDate = new Date();
			startDate = new Date(startDate);
			requestString = "{\"createdTime\" : {\"$gt\" : { \"$date\": \""+startDate.toJSON()+"\" }, \"$lt\": { \"$date\": \""+endDate.toJSON()+"\" }}, \"client\" : \""+client+"\"}";
		}
		else{
			startDate = new Date(startDate);
			endDate = new Date(endDate);
			requestString = "{\"createdTime\" : {\"$gt\" : { \"$date\": \""+startDate.toJSON()+"\" }, \"$lt\": { \"$date\": \""+endDate.toJSON()+"\" }}, \"client\" : \""+client+"\"}";
		}	
		//console.log(requestString);
		var config = {
			method: 'POST',
			//headers: {'Collection' : 'events'},
			headers: {'Collection' : 'events'},
			url: mongoUrl,
			data: requestString
		};
		return $http(config);
	};
	_serviceObject = {
		getEventData : _getEventData
	}
	return _serviceObject;
}])
.controller('equipmentGridCtrl', ['$scope', '$rootScope', '$controller', 
                                       'configService', 'equipmentViewControlService',
                                       function($scope, $rootScope, $controller, awesome, equipmentViewControlService){
	
	$scope.openWorkOrderGrid = function(){
		var thisController = this;
		var superController = $controller('baseWidgetCtrl', {
			"$scope" : $scope
		});
		
		angular.extend(thisController, awesome, superController);
		$scope.config = thisController.getConfig();
		equipmentViewControlService.setChartId($scope.config.chartId);
		if($scope.config.clientName !== undefined){
			$rootScope.$broadcast('equipmentGridView');
		}
	};
}])
.factory('equipmentViewControlService', ['$rootScope', function($rootScope){
	var _serviceObject = {};
	var _chartId;
	var _clientName;
	var _stationName;
	var _startingDate;
	var _endingDate;
	var _redraw = false;
	
	var _setChartId = function(id){
		_chartId = id;
	}
	
	var _getChartId = function(){
		return _chartId;
	}
	
	var _setClientName = function(client){
		_clientName = client;
	};
	var _getClientName = function(){
		return _clientName;
	}
	var _setStationName = function(station){
		_stationName = station;
	};
	var _getStationName = function(){
		return _stationName;
	};
	var _setStartingDate = function(start){
		_startingDate = start;
	};
	var _getStartingDate = function(){
		return _startingDate;
	};
	var _setEndingDate = function(end){
		_endingDate = end;
	};
	var _getEndingDate = function(){
		return _endingDate;
	};
	var _makeRedraw = function(){
		_redraw = !_redraw;
		$rootScope.$broadcast('renderEquipmentChart');
	};
	_serviceObject = {
		setChartId : _setChartId,
		getChartId : _getChartId,
		setClientName : _setClientName,
		getClientName : _getClientName,
		setStationName : _setStationName,
		getStationName : _getStationName,
		setStartingDate : _setStartingDate,
		getStartingDate : _getStartingDate,
		setEndingDate : _setEndingDate,
		getEndingDate : _getEndingDate,
		makeRedraw : _makeRedraw
	};
	return _serviceObject;
}])

/** angela removed things **
.controller('equipmentCtrl', ['objectTools', '$scope', 'equipmentDataService', 'equipmentViewControlService', 'chartIdService', 'clientService', '$modal', 'configService', '$controller', 'dashTransition', 'facilitySelectorService', 'uiGridConstants','userPrefService',
	function(tools, $scope, equipmentDataService, equipmentViewControlService, chartIdService, clientService, $modal, awesome, $controller, dashTransition, facilitySelectorService, uiGridConstants, userPrefService){
**/

.controller('equipmentCtrl', ['objectTools', '$scope', 'equipmentDataService', 'equipmentViewControlService', 'chartIdService', 'clientService', '$modal', 'configService', '$controller', 'uiGridConstants','userPrefService',
	function(tools, $scope, equipmentDataService, equipmentViewControlService, chartIdService, clientService, $modal, awesome, $controller, uiGridConstants, userPrefService){

	
	$scope.rendered;
	$scope.hideGraphs = false;	
		$scope.gridView = false;
		
		/** angela removed/updated this section **
		var thisController = this;
		var superController = $controller('baseWidgetCtrl', {
			"$scope" : $scope
		});

		angular.extend(thisController, awesome, superController);
		$scope.config = thisController.getConfig();

		if($scope.config.chartId === undefined){
			$scope.config.chartId = chartIdService.getNewId();
			equipmentViewControlService.setChartId($scope.config.chartId);
			
		}
		
		if($scope.config.clientName === undefined){
			$scope.hasOrg = false;
		}
		else{
			$scope.hasOrg = true;
		}

		$scope.showAssetChart = false;
		if(angular.element(document.getElementById("editorHere")).hasClass("xui-css-dockparent")){
			/*console.log("You are in the editor");*
			$scope.inEditor = true;
		}
		else{
		/*	console.log("you are not in the editor.");*
			$scope.inEditor = false;
		}
		var defaultConfig = {
				"clientName" : "",
				"startingDate" : "",
				"endingDate" : "",
				"chartId" : "",
				"closedWorkOrderColor" : "",
				"openWorkOrderColor" : "",
				"dateRange" : ""
		}
		for(var key in defaultConfig){
			if($scope.config.hasOwnProperty(key) === false){
				$scope.config[key] = defaultConfig[key];
			}
		}
		
		/** end section angela removed/updated **/

	/** angela's new section **/
	// Choose settings that this widget cares about
	var defaultConfig = {
		"clientName" : "",
		"startingDate" : "",
		"endingDate" : "",
		"chartId" : "",
		"closedWorkOrderColor" : "",
		"openWorkOrderColor" : "",
		"dateRange" : "",
	}
	var currentConfig = defaultConfig;
	
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});

	angular.extend(thisController, awesome, superController);
	$scope.config = thisController.getConfig();
	// End choose settings that this widget cares about
	
	var refreshConfigs = function() {
		console.log("EQUIPMENT OVERVIEW updating!");
		
		var myPrefs = userPrefService.getUserPrefs("equipment");
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
	
		if(currentConfig.chartId === undefined || currentConfig.chartId == ""){
			currentConfig.chartId = chartIdService.getNewId();
			equipmentViewControlService.setChartId(currentConfig.chartId);
		}
		if(currentConfig.clientName === undefined || currentConfig.clientName == "") $scope.hasOrg = false; else {$scope.hasOrg = true; equipmentViewControlService.setClientName(currentConfig.clientName);}
		$scope.showAssetChart = false;
		if(angular.element(document.getElementById("editorHere")).hasClass("xui-css-dockparent")) $scope.inEditor = true; else $scope.inEditor = false;
		
		// Update date range
		/**** angela note: shouldn't I do this in user pref service automatically?!*/
		var range = currentConfig.dateRange;
		var dates;
		switch(range){
			case "last month":{
				dates = previousMonth();
				break;
			}
			case "last year":{
				dates = lastYear();
				break;
			}
			case "last six months":{
				dates = previousSixMonths();
				break;
			}
			case "lifetime":{
				dates = lifetime();
				break;
			}
		}
		if(dates !== undefined){
			equipmentViewControlService.setStartingDate(dates.startDate);
			equipmentViewControlService.setEndingDate(dates.endDate);
			currentConfig.startingDate = dates.startDate;
			currentConfig.endingDate = dates.endDate;
		}
		// End update date range
		
		$scope.config = currentConfig;
		$scope.requestData();
	}
	/** end angela's new section **/
		
		
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
		}
		
		
		$scope.requestData = function(){
			equipmentDataService.getEventData()
				.success(function(data){
					//console.log('got event data', data);
					//console.log($scope);
					if(data.result === null){
						$scope.gridView = false;
						$scope.hideGraphs = true;	
						$scope.hasOrg = true;
						$scope.noData = true;
						return;
					}else{
						$scope.noData = false;
					}
					$scope.hasOrg = true;
					$scope.hideGraphs = false;	
					$scope.gridView = false;
					$scope.makeFacilitiesPareto(data.result);
					$scope.defineAllDimensions();
					$scope.defineAllGroups();
					$scope.drawStationChart();
				})
				.error(function(){
					
				})
		};
		
		$scope.defineAllDimensions = function(){
			$scope.stationDimension = $scope.crossData.dimension(function(d){
				return d.stationName;
			});
			$scope.assetDimension = $scope.crossData.dimension(function(d){
				return d.asset;
			});
		};
		
		$scope.defineAllGroups = function(){
			$scope.stationGroup = $scope.stationDimension.group().reduce(
				function(p, v){
					if($scope.showAssetChart){return p;}
					if(v.status === "Closed"){
						p.closedTicketValue += parseFloat(v.potentialSaving);
					}
					else{
						p.openTicketValue += parseFloat(v.potentialSaving);
					}
					p.totalTicketValue = p.openTicketValue + p.closedTicketValue;
					return p;
				},
				function(p, v){
					if($scope.showAssetChart){return p;}
					if(v.status === "Closed"){
						p.closedTicketValue -= parseFloat(v.potentialSaving);
					}
					else{
						p.openTicketValue -= parseFloat(v.potentialSaving);
					}
					p.totalTicketValue = p.openTicketValue + p.closedTicketValue;
					return p;
				},
				function(){
					return{
						closedTicketValue : 0,
						openTicketValue : 0,
						totalTicketValue : 0
					};
				}
			);
			$scope.assetGroup = $scope.assetDimension.group().reduce(
				function(p, v){
					if(v.status === "Closed"){
						p.closedTicketValue += parseFloat(v.potentialSaving);
					}
					else{
						p.openTicketValue += parseFloat(v.potentialSaving);
					}
					p.totalTicketValue = p.openTicketValue + p.closedTicketValue;
					return p;
				},
				function(p, v){
					if(v.status === "Closed"){
						p.closedTicketValue -= parseFloat(v.potentialSaving);
					}
					else{
						p.openTicketValue -= parseFloat(v.potentialSaving);
					}
					p.totalTicketValue = p.openTicketValue + p.closedTicketValue;
					return p;
				},
				function(){
					return{
						closedTicketValue : 0,
						openTicketValue : 0,
						totalTicketValue : 0
					};
				}
			);
		};
		
		$scope.drawStationChart = function(){			
			try{ 
				/*console.log($scope);
				console.log($scope.config);*/
				$scope.stationBarChart = dc.barChart("#station_barchart_"+$scope.config.chartId)
					.width(250)
					.height(350)
					.margins({top: 50, right: 10, bottom: 75, left: 60})
					.dimension($scope.stationDimension)
					.group($scope.stationGroup, "Closed Work Orders")
					.valueAccessor(function(p){return p.value.closedTicketValue;})
					.stack($scope.stationGroup, 'Open Work Orders', function(p){return p.value.openTicketValue;})
					//.yAxisLabel('Total Avoidable Cost By Facility')
					.elasticX(false)
					.elasticY(true)
					.yAxisPadding('5%')
					
					.centerBar(false)
					.barPadding(0.05)
					.transitionDuration(200)
					.x(d3.scale.ordinal().domain($scope.stationChartDomain))
					.xUnits(dc.units.ordinal)
					.renderHorizontalGridLines(true)
					.renderLabel(true)
					.title(function(d){return "Organization: "+$scope.config.clientName+"\nFacility: "+d.key+"\nPotential Avoidable Cost: "+Math.round(d.value.openTicketValue*10)/10+"\nRealized Avoidable Cost: "+Math.round(d.value.closedTicketValue*10)/10+"\nTotal Avoidable Cost: "+Math.round(d.value.totalTicketValue*10)/10;})
					.renderTitle(true)
					.brushOn(false)
					.legend(dc.legend() 					
			    	    .x(0) 
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
						.on("mouseup", function(d){
							$scope.stationName = d.data.key;
						})	
					})
				;
				if($scope.config.openWorkOrderColor !== undefined && $scope.config.closedWorkOrderColor !== undefined){
					$scope.stationBarChart.ordinalColors([$scope.config.closedWorkOrderColor, $scope.config.openWorkOrderColor])
				}
				$scope.stationBarChart					
					.render()
				;
			}
			catch(error){
				//console.log(error);
			}
			var chart = d3.select('#station_bar_chart_'+$scope.config.chartId);
			//console.log('equipment should render',chart[0]);
			if(chart[0] === null){
				$scope.$apply();
				$scope.hasOrg = false;
				$scope.hasOrg = true;
			}
		};
		
		$scope.drawAssetChart = function(){
			$scope.assetValues = [];
			try{
				$scope.assetBarChart = dc.barChart("#asset_barchart_"+$scope.config.chartId)
					.width(300)
					.height(380)
					.margins({top: 50, right: 60, bottom: 75, left: 50})
					.dimension($scope.assetDimension)
					.group($scope.assetGroup, "Closed Work Orders")
					.valueAccessor(function(p){return p.value.closedTicketValue;})
					.stack($scope.assetGroup, 'Open Work Orders', function(p){return p.value.openTicketValue;})
					.yAxisLabel("Avoidable Cost By Asset")
					.elasticX(false)
					.elasticY(true)
					.yAxisPadding('5%')
					.centerBar(false)
					.barPadding(0.05)
					.transitionDuration(200)
					.x(d3.scale.ordinal().domain([]))
					.xUnits(dc.units.ordinal)
					.renderHorizontalGridLines(true)
					.renderLabel(true)
					.title(function(d){$scope.assetValues.push({asset: d.key, total: d.value.totalTicketValue}); return "Asset: "+d.key+"\nPotential Avoidable Cost: "+Math.round(d.value.openTicketValue*10)/10+"\nRealized Avoidable Cost: "+Math.round(d.value.closedTicketValue*10)/10+"\nTotal Avoidable Cost: "+Math.round(d.value.totalTicketValue*10)/10;})
					.renderTitle(true)
					.brushOn(false)
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
								var station = $scope.stationName;
								var asset = d.data.key;
								
					/*			can't do anything until equipment tickets is brought up to date.
					 * 			var equipmentTicketsString = {}
					 * 				$.ajax({
									url: "/xui",
									type: "post",
									data: JSON.stringify(equipmentTicketsString),
									headers: {
										"dataObj" : JSON.stringify(equipmentTicketsString),
										"Content-Type" : "application/json"
									},
									dataType: "html"
										
								}).done(function(data){
									console.log(data);
									var newTab = window.open("", "_blank");
									window.setTimeout(
											function(){
												newTab.document.write(data);
											}, 1000);
								});*/
								/*dashTransition.newTab("#/equipmentTickets/"+station+"/"+asset, {
									
									}
								)*/
							});
							
					});
			}
			catch(error){
				//console.log(error);
			}
			finally{
				$scope.assetBarChart.render();
				var domain = $scope.makeAssetsPareto();
				if($scope.config.openWorkOrderColor !== undefined && $scope.config.closedWorkOrderColor !== undefined){
					$scope.assetBarChart.ordinalColors([$scope.config.closedWorkOrderColor, $scope.config.openWorkOrderColor])
				}
				$scope.assetBarChart
					.x(d3.scale.ordinal().domain(domain))
					;
				$scope.assetBarChart.render();
				
			}
		};
		
		$scope.makeFacilitiesPareto = function(data){
			//console.log(data);
			var stationNames = [];
			var stationNameAndTotal = [];
			var stationChartDomain = [];
			for(var i=0;i<data.length;i++){
				if(stationNames.indexOf(data[i].stationName) === -1){
					stationNames.push(data[i].stationName);
				}
			}
			for(var i=0;i<stationNames.length;i++){
				var total = 0;
					for(var j=0;j<data.length;j++){
						if(stationNames[i] === data[j].stationName){
							total += parseFloat(data[j].potentialSaving);
						}
					}
				stationNameAndTotal.push({stationName : stationNames[i], total : total});	
			}
			stationNameAndTotal.sort(function(a,b){
				return b.total - a.total;
			});
			for(var i=0;i<stationNameAndTotal.length;i++){
				stationChartDomain.push(stationNameAndTotal[i].stationName);
			}
			$scope.stationChartDomain = stationChartDomain;
			$scope.crossData = crossfilter(data);
		};
		
		$scope.makeAssetsPareto = function(){
			var paretoNames = [];
		var assetNames = [];
		var paretoObjects = [];
		for(var i=0;i<$scope.assetValues.length;i++){
			if(assetNames.indexOf($scope.assetValues[i].asset) == -1){
				assetNames.push($scope.assetValues[i].asset);
				if($scope.assetValues[i].total > 1){
					paretoObjects.push($scope.assetValues[i]);
				}
			}
		}
		paretoObjects.sort(function(a,b){
			return b.total - a.total;
		});
		for(var i=0;i<paretoObjects.length;i++){
			paretoNames.push(paretoObjects[i].asset)
		}
		return paretoNames;
		};
		
		$scope.openWorkOrderGrid = function(){
			//$scope.hideGraphs = !$scope.hideGraphs;
			if($scope.gridView === true){
				$scope.gridView = false;
				$scope.hideGraphs = false;
			}
			else{
				var rectData = [];
				var chartData = [];
				var chart = d3.select("#station_barchart_"+$scope.config.chartId);
				var selects = chart.selectAll('rect');
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
						var row = {"stationName" : rectData[i].key, "Potential Avoidable Cost" : d3.round(rectData[i].value.openTicketValue, 2), "Realized Avoidable Cost" : d3.round(rectData[i].value.closedTicketValue, 2), "Total Avoidable Cost" : d3.round(rectData[i].value.totalTicketValue, 2)};
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
						             {field: 'stationName', displayName: 'Station'},
						             {field: 'Potential Avoidable Cost', displayName: 'Potential', aggregationType: uiGridConstants.aggregationTypes.sum},
						             {field: 'Realized Avoidable Cost',  displayName: 'Realized', aggregationType: uiGridConstants.aggregationTypes.sum},
						             {field: 'Total Avoidable Cost', displayName: 'Total', aggregationType: uiGridConstants.aggregationTypes.sum}
						             ]
				};
				$scope.hideGraphs = true;
				$scope.gridView = true;
			}
		};
		$scope.onRowClick = {
				openTicketingDashboard : function(row){
					//console.log(row.stationName);
					var dashString = JSON.stringify(
							{
							"ctl_workordergrid1":{"tag":"","desc":"","dataBinder":"","dataField":"","autoTips":true,"className":"","disableClickEffect":false,"disableHoverEffect":false,"disableTips":false,"disabled":false,"defaultFocus":false,"hoverPop":"","hoverPopType":"outer","dock":"none","dockIgnore":false,"dockOrder":1,"showEffects":"","hideEffects":"","dockFloat":false,"dockMinW":0,"dockMinH":0,"tips":"","rotate":0,"left":0,"top":0,"width":800,"height":400,"right":800,"bottom":200,"renderer":null,"zIndex":1,"tabindex":1,"position":"relative","visibility":"","display":"","selectable":false,"clientName":$scope.config.clientName,"stationName":row.stationName,"assetName":"","status":"","caller":"equipment","anomalyType":"","parentAlias":"canvas","classKey":"xui.UI.WorkOrderGrid"},
							"ctl_eventpage1":{"tag":"","desc":"","dataBinder":"","dataField":"","autoTips":true,"className":"","disableClickEffect":false,"disableHoverEffect":false,"disableTips":false,"disabled":false,"defaultFocus":false,"hoverPop":"","hoverPopType":"outer","dock":"none","dockIgnore":false,"dockOrder":1,"showEffects":"","hideEffects":"","dockFloat":false,"dockMinW":0,"dockMinH":0,"tips":"","rotate":0,"left":620,"top":0,"width":"auto","height":400,"right":"auto","bottom":"auto","renderer":null,"zIndex":1,"tabindex":1,"position":"static","visibility":"","display":"","selectable":false,"workOrderNumber":"","stationName":"","assetName":"","anomalyType":"","chartStart":"2014-03-11T15:52:00.948Z","chartEnd":"2015-03-11T15:52:00.948Z","axis":{"label":"","autoAxis":true,"pointsOnAxis":[{"pointName":"","stationName":"","assetName":""}]},"allPoints":"","parentAlias":"canvas","classKey":"xui.UI.EventPage"},
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
						console.log(data);
						var newTab = window.open("", "_blank");
						window.setTimeout(
								function(){
									newTab.document.write(data);
								}, 100);
					});*/
			/*		dashTransition.newTab('#/dashboard', {
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
										"stationName" : row.stationName,
										"endingDate" : $scope.config.endingDate,
										"startingDate" : $scope.config.startingDate,
										"assetName" : undefined,
										"status" : undefined,
										"caller" : "equipment",
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
		$scope.$on('renderEquipmentChart', function(){
			if(equipmentViewControlService.getChartId() === $scope.config.chartId){
				$scope.showAssetChart = false;
				$scope.requestData();
			}
		});
		
		/** this will become obsolete *
		$scope.$on('organizationSetFacilitySelector', function(){
		/*	console.log("organization changed to "+facilitySelectorService.getOrganization());*
			var client = facilitySelectorService.getOrganization();
			if($scope.config.client !== client){
					//$scope.config.clientName = client;
					//$scope.config.stationName = undefined;
					//$scope.config.startingDate = undefined;
					//$scope.config.endingDate = undefined;
					$scope.showAssetChart = false;
					equipmentViewControlService.setClientName(client);
					$scope.requestData();
				}
				
		});
		/** End this will become obsolete */
		
		$scope.$on('equipmentGridView', function(){
			if($scope.config.chartId === equipmentViewControlService.getChartId()){
				$scope.openWorkOrderGrid();
			}
		});
		
		/** this will all become obsolete *
		$scope.$watch('config', function(nuOb, olOb){
			//console.log(nuOb.clientName);
			if($scope.inEditor){return;}
			if(tools.isEqual(nuOb,olOb)){return;}
			if(nuOb.clientName === undefined || nuOb.clientName === ""){
				return;
			}else{
				$scope.config.clientName = nuOb.clientName;
			}
			
			var props = [];
			
			for(var key in nuOb){
				if(nuOb[key] === olOb[key]){
					//console.log(nuOb[key], "is equal to", olOb[key]);
					props.push(nuOb[key]);
				}
			}
			//console.log($scope.inEditor);
			if(props.length >= 4){
				$scope.gridView = false;
				$scope.hasOrg = true;
				$scope.showAssetChart = false;
				//$scope.done = true;
				equipmentViewControlService.setClientName(nuOb.clientName);
				$scope.requestData();
			}
	/*		var nu = nuObj.clientName;
			var old = oldObj.clientName;
			
			if(nuObj.clientName === undefined || nuObj.clientName === ""){ 
				return;
			}
			
			if(nu === old){
				if($scope.inEditor === false){
					$scope.requestData();
					return;
				}
			}
			console.log(nuObj);
			if(nuObj.closedWorkOrderColor !== "" && nuObj.closedWorkOrderColor !== undefined && $scope.inEditor === true){
				$scope.requestData();
				return;
			}
			if(nuObj.openWorkOrderColor !== "" && nuObj.openWorkOrder !== undefined && $scope.inEditor === true){
				$scope.requestData();
				return;
			}
			
			if(nuObj.clientName !== undefined && nuObj.clientName !== ""){
					$scope.gridView = false;
					$scope.hasOrg = true;
					$scope.showAssetChart = false;
					equipmentViewControlService.setClientName(nu);
					if($scope.inEditor){
						$scope.requestData();
						return;
					}
				}*	
			
		}, true);
		$scope.$watch('config.closedWorkOrderColor', function(){
			if($scope.config.closedWorkOrderColor !== "" && $scope.config.closedWorkOrderColor !== undefined && $scope.inEditor === true){
				if($scope.config.clientName !== undefined && $scope.config.clientName !== ""){
					$scope.requestData();
				}
			}
		},true);
		$scope.$watch('config.openWorkOrderColor', function(){
			if($scope.config.openWorkOrderColor !== "" && $scope.config.openWorkOrderColor !== undefined && $scope.inEditor === true){
				if($scope.config.clientName !== undefined && $scope.config.clientName !== ""){
					$scope.requestData();
				}
			}
		},true);
		$scope.$watch('config.clientName', function(){
			if($scope.config.clientName === undefined || $scope.config.clientName === "" || !$scope.inEditor){
				return;
			}
			else{
				equipmentViewControlService.setClientName($scope.config.clientName)
				$scope.requestData();
			}
		}, true);*/
		$scope.$watch('config.dateRange', function(){
			if($scope.config.dateRange !== undefined && $scope.config.dateRange !== ""){
				//console.log($scope.config.dateRange);
				var range = $scope.config.dateRange;
				var dates;
				switch(range){
					case "last month":{
						dates = previousMonth();
						break;
					}
					case "last year":{
						dates = lastYear();
						break;
					}
					case "last six months":{
						dates = previousSixMonths();
						break;
					}
					case "lifetime":{
						dates = lifetime();
						break;
					}
				}
				//console.log(dateRangeService.currentMonth());
				//console.log(dates);
				if(dates !== undefined){
					equipmentViewControlService.setStartingDate(dates.startDate);
					equipmentViewControlService.setEndingDate(dates.endDate);
					$scope.config.startingDate = dates.startDate;
					$scope.config.endingDate = dates.endDate;
				}
				if($scope.config.clientName !== "" && $scope.config.clientName !== undefined){
					equipmentViewControlService.setStartingDate(dates.startDate);
					equipmentViewControlService.setEndingDate(dates.endDate);
					$scope.config.startingDate = dates.startDate;
					$scope.config.endingDate = dates.endDate;
					if($scope.inEditor){
						$scope.requestData();
					}
				}
			}else{
				return;
			}
		}, true);
		
		/** angela new **/
		$scope.$watch('config', function(){
			refreshConfigs();
		}, true);
		$scope.$on('userPrefsChanged',function(){
			refreshConfigs();
		});
		/** end angela new **/
		
		$scope.showAssetView = function(){
			$scope.showAssetChart = !$scope.showAssetChart;
			if($scope.showAssetChart){
				$scope.drawAssetChart();
			}
		}
		
		$scope.openPageConfiguration = function(){
			var modalInstance = $modal.open({
				templateUrl: 'icWidgets/equipmentConfig.html',
				controller: 'equipmentConfigCtrl',
				resolve: {
					config: function(){
						return $scope.config;
					}
				}
			})
			modalInstance.result.then(function(config){
				thisController.setConfig(config);
				equipmentViewControlService.setClientName($scope.config.clientName);
				equipmentViewControlService.setStartingDate($scope.config.startingDate);
				equipmentViewControlService.setEndingDate($scope.config.endingDate);
				equipmentViewControlService.setChartId($scope.config.chartId);
				$scope.showAssetChart = false;
				equipmentViewControlService.makeRedraw();
			})
		};
		
		/**angela removed this section
		if($scope.config.clientName !== undefined && $scope.config.clientName !== ""){
			$scope.hasOrg = true;
			$scope.requestData();
		}
		else{
			$scope.hasOrg = false;
		}
		*/
		refreshConfigs();
}])

.controller('equipmentModalOpenCtrl', ['$scope', '$modal', 'configService', '$controller', 'equipmentViewControlService', function($scope, $modal, awesome, $controller, equipmentViewControlService){
	
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});
		
	angular.extend(thisController, awesome, superController);
	
  	$scope.config = thisController.getConfig();  	
	$scope.openConfiguration = function(){
		if(angular.element(document.getElementById("editorHere")).hasClass("xui-css-dockparent")){return;}
		var modalInstance = $modal.open({
			templateUrl: 'icWidgets/equipmentConfig.html',
			controller: 'equipmentConfigCtrl',
			resolve: {
				config: function(){
					return $scope.config;
				}
			}
		})
		modalInstance.result.then(function(config){
			thisController.setConfig(config);
			equipmentViewControlService.setClientName($scope.config.clientName);
			equipmentViewControlService.setStartingDate($scope.config.startingDate);
			equipmentViewControlService.setEndingDate($scope.config.endingDate);
			equipmentViewControlService.setChartId($scope.config.chartId);
			$scope.showAssetChart = false;
			equipmentViewControlService.makeRedraw();
		})
	};
}])

.controller('equipmentConfigCtrl', ['$scope', '$modalInstance', 'clientService', 'config', function($scope, $modalInstance, clientService, config){
	
	$scope.clientNames = [];
	$scope.stationNames = [];
	
	$scope.chartId = config.chartId;
	$scope.client = config.clientName;
	$scope.startDate = config.startingDate;
	$scope.endDate = config.endingDate;
	$scope.closedColor = config.closedWorkOrderColor;
	$scope.openColor = config.openWorkOrderColor;
	
	clientService.getAllStations().then(function(list){
		list = _.map(list, function(x) {
			return {
				client: x.orgFullName,
				station: x.stationName
			};
		});
		for(var i=0;i<list.length;i++){
			if($scope.clientNames.indexOf(list[i].client) == -1){
				$scope.clientNames.push(list[i].client);
			}
		}
	},
	function(){
		/*console.log("error");*/
	});
	$scope.changeClient = function(clientName){
		$scope.client = clientName;
	}
	$scope.ok = function(){
		var config = {
				"chartId": $scope.chartId,
				"clientName": $scope.client,	
				"startingDate": $scope.startDate,
				"endingDate": $scope.endDate,
				"closedWorkOrderColor" : $scope.closedColor,
				"openWorkOrderColor" : $scope.openColor,
			};
			$modalInstance.close(config);
	};
	$scope.cancel = function(){
		$modalInstance.dismiss('cancel');
	};
	
}])
