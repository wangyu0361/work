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
		templateUrl: '/intellicommand/views/stackedColumnWorkOrders.html'
	}
}])

.directive('stackedColumnWorkOrdersConfig', [function(){
	return{
		restrict: 'E',
		controller: 'stackedColumnWorkOrdersModalOpenCtrl',
		templateUrl: '/intellicommand/views/algoConfig.html'
	}
}])
.directive('stackedColumnWorkOrdersGrid', [function(){
	return{
		restrict: 'E',
		controller: 'stackedColumnWorkOrdersGridCtrl',
		templateUrl: '/intellicommand/views/gridView.html'
	};
}])
.directive('stackedColumnName', [function(){
	return{
		template: "Work Order Count"
	};
}])

.factory('stackedColumnWorkOrdersDataService', ['$http', 'stackedColumnWorkOrdersViewControlService', 'dateRangeService', function($http, stackedColumnWorkOrdersViewControlService, dateRangeService){
	
	var _serviceObj = {}
	var _stationDimension;
	var _stationGroup;
	var _crossFilterData;
	var _dates;
	var _ticks;
	
	var _getTicks = function(){
		return _ticks;
	}
	var _getDates = function(){
		return _dates;
	};
	var _calcDateRange = function(range){
		//this method should return a sky spark date range when given a date range string
		var dates;
		switch(range){
			case "last twelve weeks":{
				dates = dateRangeService.variableWeeksAgo(12);
				_ticks = 12;
				break;
			}
			case "last six weeks":{
				dates = dateRangeService.variableWeeksAgo(6);
				_ticks = 6;
				break;
			}
			case "last six months":{
				dates = dateRangeService.variableMonthsAgo(6);
				_ticks = 30;
				break;
			}
			default :{
				dates = dateRangeService.variableMonthsAgo(6);
				_ticks = 30;
			}
		}
		_dates = dates;
		var start = dates.startDate;
		var end = dates.endDate;
		
		var endYear = end.getFullYear();
		var endMonth = end.getMonth().toString().length == 2 ? end.getMonth().toString() : "0"+end.getMonth().toString();
		var endDate = end.getDate().toString().length == 2 ? end.getDate().toString() : "0"+end.getDate().toString();
		var startYear = start.getFullYear();
		var startMonth = start.getMonth().toString().length == 2 ? start.getMonth().toString() : "0"+start.getMonth().toString();
		var startDate = start.getDate().toString().length == 2 ? start.getDate().toString() : "0"+start.getDate().toString();
		
		var createdRange =  startYear+"-"+startMonth+"-"+startDate+".."+endYear+"-"+endMonth+"-"+endDate;
		
		return createdRange;
	}
	
	
	var _getWorkOrdersForStation = function(_configObj){
		var createdRange = _calcDateRange(_configObj.dateRange);
		var _url = 'https://galaxy2021temp.pcsgalaxy.net:9453/api/galaxy/eval?eventFilter("'+
		_configObj.stationName+
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
		return $http.get(_url, _config);
	}
		
	_serviceObj = {
			getWorkOrdersForStation : _getWorkOrdersForStation,
			getDates: _getDates,
			getTicks: _getTicks
	};
	return _serviceObj;
}])

.factory('stackedColumnWorkOrdersViewControlService', ['$rootScope', function($rootScope){
	var _serviceObj = {};
	return _serviceObj;
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
		$rootScope.$broadcast('stackedColumnGridView');		
	}
}])


.controller('stackedColumnWorkOrdersCtrl', ['$scope', 'stackedColumnWorkOrdersDataService', 'stackedColumnWorkOrdersViewControlService', 
                                            'chartIdService', '$modal', 'configService', '$controller','facilitySelectorService', 'uiGridConstants', 'userPrefService', function($scope, dataService, 
                                           stackedColumnWorkOrdersViewControlService, chartIdService, $modal, awesome, $controller, facilitySelectorService, uiGridConstants, userPrefService){
	
	$scope.gridView = false;
	$scope.rendering = false;
	$scope.showWeeklyStation = true;
	$scope.showAsset = false;
	
	/** angela's replacement */
	// Choose settings that this widget cares about
	var defaultConfig = {
		//"clientName" : undefined,
		"stationName" : "HAUN",
		//"startingDate" : "",
		//"endingDate" : "",
		"chartId" : chartIdService.getNewId(),
		"closedWorkOrderColor" : "#B22222",
		"openWorkOrderColor" : "#3CB371",
		"dateRange" : "last six months"
	};
		
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});
	angular.extend(thisController, awesome, superController);
	$scope.config = thisController.getConfig();
	// End choose settings that this widget cares about
	
	var refreshConfigs = function() {
		var myPrefs = userPrefService.getUserPrefs("stacked-column-work-orders");
		for (var key in defaultConfig) {
			if (myPrefs[key] !== "" && myPrefs[key] !== undefined && myPrefs[key] !== "null" && myPrefs[key] !== null) {
				$scope.config[key] = myPrefs[key];
			} else {
				$scope.config[key] = defaultConfig[key];
			}
		}
		//console.log($scope.config.stationName);
		if($scope.config.stationName !== undefined && $scope.config.stationName !== "" && $scope.config.stationName !== "null" && $scope.config.stationName !== null && !$scope.rendering){
			$scope.rendering = true;
			$scope.collapseClientChart = true;
			drawStationChart();
		}
	}
	var makeWeeklyAssetChart = function(bar){
		
		var openObject = bar.data.value.openAssets;
		var closedObject = bar.data.value.closedAssets;
		var total = bar.y;
		var workOrders = [];
		for(var key in openObject){
			workOrders.push({"asset" : key, "tickets" : openObject[key], "open" : "true"});
		}
		for(var key in closedObject){
			workOrders.push({"asset" : key, "tickets" : closedObject[key], "open" : "false"});
		}
		
		var crossFilterData = crossfilter(workOrders);
		var weeklyAssetDimension = crossFilterData.dimension(function(d){
			return d.asset;
		});
		var weeklyAssetGroup = weeklyAssetDimension.group().reduce(
				function(p, v){
					if(v.open !== "true"){
						p.numberClosedTickets = v.tickets;
					}
					else{
						p.numberOpenTickets = v.tickets;
					}
					return p;
				}, 
				function(p, v){
					if(v.open !== "true"){
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
						numberClosedTickets : 0,
					};
				}	
			);
		
		var all = weeklyAssetGroup.all();
	
		var sort = all.sort(function(b,a){
			return (a.value.numberOpenTickets + a.value.numberClosedTickets) - (b.value.numberOpenTickets + b.value.numberClosedTickets);
		});
		
		var ticks = sort[0].value.numberClosedTickets + sort[0].value.numberOpenTickets;
		if(ticks > 5){ticks = Math.round(ticks/2);};
		
		var targetDate = bar.data.key;
		var week = (targetDate.getMonth()+1)+"/"+targetDate.getDate()+"/"+targetDate.getFullYear();
		
		var weeklyAssetChart = dc.barChart('#weekly_asset_'+$scope.config.chartId)
			.width(690)
			.height(200)
			.margins({top: 20, right: 20, bottom: 70, left: 30})
			.dimension(weeklyAssetDimension)
			.group(weeklyAssetGroup, 'Closed Work Orders')
			.valueAccessor(function(p){return p.value.numberClosedTickets;})
			.stack(weeklyAssetGroup, 'Open Work Orders', function(p){return p.value.numberOpenTickets;})
			.barPadding(0.5)
			.yAxisPadding('5%')
			.yAxisLabel('Week: '+week)
			.xAxisLabel('Asset')
			.xAxisPadding(5)
			.transitionDuration(250)
			.elasticX(true)
			.elasticY(true)
			.centerBar(false)
			.barPadding(0.25)
			.yAxisPadding('5%')
			.transitionDuration(250)
			.x(d3.scale.ordinal().domain([]))
			.xUnits(dc.units.ordinal)
			.renderHorizontalGridLines(true)
			.brushOn(false)
			.ordinalColors([$scope.config.openWorkOrderColor, $scope.config.closedWorkOrderColor])
			.title(function(d){
					return "Station: "+$scope.config.stationName+"\nAsset: "+d.key+"\nNumber of Tickets Opened: "
							   +d.value.numberOpenTickets+"\nNumber of Tickets Closed: "+d.value.numberClosedTickets+"\nTotal Number of Tickets: "+parseInt(d.value.numberOpenTickets + d.value.numberClosedTickets);
			})
			/*.legend(dc.legend() 					
		    	    .x(350) 
					.y(0)
		    	    .itemHeight(13)
		    	    .gap(5)
			)*/
			.renderlet(function(chart){
					chart.selectAll("g.x text")
						.attr('transform', "rotate(-80)")
						.attr('dx', '-10')
						.attr('dy', '-5')
						.style("text-anchor", "end")
						;
				})
			weeklyAssetChart.yAxis().ticks(ticks);
			weeklyAssetChart.render()
		;
	}
	var drawStationChart = function(){
		//console.log('draw func', $scope.config.stationName);
		dataService.getWorkOrdersForStation($scope.config).then(function(response){
			var workOrders = d3.csv.parse(response.data);
			
			var crossFilterWorkOrders = crossfilter(workOrders);
			
			var stationDimension = crossFilterWorkOrders.dimension(function(d){
				return d3.time.week(new Date( d.createdTime.slice(0,d.createdTime.indexOf(" ") ) ) ) 
			});
			var assetDimension = crossFilterWorkOrders.dimension(function(d){
				return d.asset;
			})
			var assetGroup = assetDimension.group().reduce(
					function(p, v){
						if(v.open !== "true"){
							p.numberClosedTickets += 1;
						}
						else{
							p.numberOpenTickets += 1;
						}
						return p;
					}, 
					function(p, v){
						if(v.open !== "true"){
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
							numberClosedTickets : 0,
						};
					}	
				);	
			var stationGroup = stationDimension.group().reduce(
					function(p, v){
						var asset = v.asset;
						if(v.open !== "true"){
							p.numberClosedTickets += 1;
							if(p.closedAssets[asset] === undefined){
								p.closedAssets[asset] = 1;
							}
							else{
								p.closedAssets[asset] += 1;
							}
						}
						else{
							p.numberOpenTickets += 1;
							if(p.openAssets[asset] === undefined){
								p.openAssets[asset] = 1;
							}
							else{
								p.openAssets[asset] += 1;
							}
						}
						
						return p;
					}, 
					function(p, v){
						if(v.open !== "true"){
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
							numberClosedTickets : 0,
							openAssets: {},
							closedAssets: {}
						};
					}	
				);	
			
			var all = stationGroup.all();
			var length = all.length;
			if(all.length === 0){$scope.rendering = false; return;}
			var sort = all.sort(function(b,a){
				return (a.value.numberOpenTickets + a.value.numberClosedTickets) - (b.value.numberOpenTickets + b.value.numberClosedTickets);
			});
			
			var ticks = sort[0].value.numberClosedTickets + sort[0].value.numberOpenTickets;
			if(ticks > 5){ticks = Math.round(ticks/2);}
			
			var assAll = assetGroup.all();
			var assSort = assAll.sort(function(b,a){
				return (a.value.numberOpenTickets + a.value.numberClosedTickets) - (b.value.numberOpenTickets + b.value.numberClosedTickets);
			})
			var assTicks = assSort[0].value.numberClosedTickets + assSort[0].value.numberOpenTickets;
			
			var weeklyBarChart = dc.barChart('#weekly_station_chart_'+$scope.config.chartId)
				.width(690)
				.height(275)
				.margins({top: 40, right: 30, bottom: 60, left: 30})
				.dimension(stationDimension)
				.group(stationGroup, "Closed Work Orders")
				.valueAccessor(function(p){return p.value.numberClosedTickets;})
				.stack(stationGroup, "Open Work Orders", function(p){return p.value.numberOpenTickets;})
				.elasticX(true)
				.elasticY(true)
				.centerBar(true)
				.barPadding(0.25)
				.yAxisPadding('5%')
				.xAxisPadding(5)
				.yAxisLabel('Weekly Count')
				.transitionDuration(250)
				.xUnits(d3.time.weeks)
				.x(d3.time.scale().domain([])) 
				.renderHorizontalGridLines(true)
				.brushOn(false)
				.title(function(d){
					var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
					return "Station: "+$scope.config.stationName+"\nWeek Of: "+months[d.key.getMonth()]+" "+d.key.getDate()+", "+d.key.getFullYear()+"\nNumber of Tickets Opened: "+d.value.numberOpenTickets+"\nNumber of Tickets Closed: "
								   +d.value.numberClosedTickets+"\nTotal Number of Tickets: "+parseInt(parseInt(d.value.numberClosedTickets)+parseInt(d.value.numberOpenTickets));
				})
				.legend(dc.legend() 					
			    	    .x(550) 
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
					chart.selectAll('rect')
						.on('click', function(d){
							makeWeeklyAssetChart(d);
						})
				})
				.ordinalColors([$scope.config.openWorkOrderColor, $scope.config.closedWorkOrderColor])
				.on('postRender', function(chart){
					var recs =chart.selectAll('rect')
					makeWeeklyAssetChart(recs[0][0].__data__);
				});
				weeklyBarChart.yAxis().ticks(ticks);
				weeklyBarChart.xAxis().ticks(dataService.getTicks());
				
				weeklyBarChart.render()
			;
			var assetChart = dc.barChart('#asset_chart_'+$scope.config.chartId)
				.width(690)
				.height(275)
				.margins({top: 40, right: 30, bottom: 60, left: 30})
				.dimension(assetDimension)
				.group(assetGroup, 'Closed Work Orders')
				.valueAccessor(function(p){return p.value.numberClosedTickets;})
				.stack(assetGroup, 'Open Work Orders', function(p){return p.value.numberOpenTickets;})
				.barPadding(0.5)
				.yAxisPadding('5%')
				.xAxisPadding(5)
				.transitionDuration(250)
				.elasticX(true)
				.elasticY(true)
				.centerBar(false)
				.barPadding(0.25)
				.yAxisPadding('5%')
				.yAxisLabel('Count By Asset')
				.transitionDuration(250)
				.x(d3.scale.ordinal().domain([]))
				.xUnits(dc.units.ordinal)
				.renderHorizontalGridLines(true)
				.brushOn(false)
				.title(function(d){
						return "Station: "+$scope.config.stationName+"\nAsset: "+d.key+"\nNumber of Tickets Opened: "
								   +d.value.numberOpenTickets+"\nNumber of Tickets Closed: "+d.value.numberClosedTickets+"\nTotal Number of Tickets: "+parseInt(d.value.numberOpenTickets + d.value.numberClosedTickets);
				})
				.legend(dc.legend() 					
			    	    .x(550) 
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
					chart.selectAll('rect')
						.on('click', function(d){
						
						})
				})
				.ordinalColors([$scope.config.openWorkOrderColor, $scope.config.closedWorkOrderColor])
				assetChart.yAxis().ticks(assTicks);
				
				assetChart.render();
				
			;
			$scope.rendering = false;
		})
		
		
	}
	if(!$scope.rendering){
		refreshConfigs();
	}
	$scope.$watch('config', function(){
		if($scope.rendering){return;}
		//userPrefService.updateUserPrefs($scope.config);
		refreshConfigs();
	}, true)
	$scope.toggleView = function(){
		$scope.showWeeklyStation = !$scope.showWeeklyStation;
		$scope.showAsset = !$scope.showAsset;
		if($scope.showAsset){
			
		}
	}
	$scope.$on('stackedColumnGridView', function(){
		$scope.openWorkOrderGrid();
	});
	$scope.$on('userPrefsChanged',function(){
		var changedConfig = userPrefService.getUserPrefs('stacked-column-work-orders');
		var refresh = false;
		for(var key in changedConfig){
			if($scope.config[key] !== changedConfig[key]){
				if(key === "stationName"){
					refresh = true;
				}
			}
		}
		if(refresh){
			$scope.rendering = false;
			refreshConfigs();
		} 
		
	});
	/*$scope.$on('facilitySetFacilitySelector', function(){
		$scope.config.stationName = facilitySelectorService.getFacility();
		userPrefService.updateUserPrefs($scope.config);
		refreshConfigs();
	});*/

	$scope.openWorkOrderGrid = function(){
		
		var type;
		var chart;
		var chartData = [];
		var rectData = [];


		if($scope.gridView){
			$scope.gridView = false;
		}
		else{

			if($scope.showWeeklyStation){
				chart = d3.select('#weekly_station_chart_'+$scope.config.chartId);
				type = "weekOf";
			}
			else{
				chart = d3.select('#asset_chart_'+$scope.config.chartId);
				type = "asset";
			}
			var rects = chart.selectAll('rect');
			for(var i=0;i<rects[0].length;i++){
				if(rects[0][i].__data__ !== undefined){
					if(rects[0][i].__data__.layer === "Closed Work Orders"){
						rectData.push(rects[0][i].__data__.data);
					}
				}	
			}
			var row = {};
			var keyName;
			var displayName;
			for(var i=0;i<rectData.length;i++){
				if(type === "weekOf"){
					displayName = "Week Of";
					keyName = (rectData[i].key.getMonth()+1)+"/"+rectData[i].key.getDate()+"/"+rectData[i].key.getFullYear();
					row = {"Week Of":keyName, "Work Orders Closed":rectData[i].value.numberClosedTickets,"Work Orders Opened": rectData[i].value.numberOpenTickets, "Total": rectData[i].value.numberClosedTickets +  rectData[i].value.numberOpenTickets};
				}
				else{
					displayName = "Asset";
					keyName = rectData[i].key
					row = {"Asset":keyName, "Work Orders Closed":rectData[i].value.numberClosedTickets,"Work Orders Opened": rectData[i].value.numberOpenTickets, "Total": rectData[i].value.numberClosedTickets +  rectData[i].value.numberOpenTickets};
				}

				chartData.push(row);
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
			};
			$scope.gridView = true;
		}
	}	
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
            templateUrl: '/intellicommand/views/stackedColumnWorkOrdersConfig.html',
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
			//console.log("failed to receive results from configuration modal");
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
