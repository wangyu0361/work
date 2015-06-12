'use strict';

/*angular.module('myApp.workOrderCycleTime', ['ngRoute', 'ui.grid', 'ui.grid.autoResize',
                                            'myApp.dashboard', 'myApp.panelComponent', 
                                            'myApp.popout', 'myApp.pciService', 'ui.bootstrap', 
                                            'myApp.ticketImpulse', 
                                            'myApp.dashboardTransitionService', 'myApp.facilitySelector',
                                            'myApp.calendar', 'myApp.clientService'])*/
angular.module('icDash.workOrderCycleTime', ['ui.router', 'ui.grid', 'ui.grid.autoResize',
                                            
                                            'icDash.pciService', 'ui.bootstrap', 
                                            'icDash.dashboardTransitionService', 'icDash.facilitySelector',
                                            'icDash.calendar', 'icDash.clientService'])
/*.run(['directiveService', function(directiveService){
	directiveService.addFullComponent({
		tag: function(){return 'work-order-cycle-time';},
		configTag: function(){return 'work-order-cycle-time-config'},
		gridTag: function(){return 'work-order-cycle-time-grid';},
		tagHtml: function(){"<work-order-cycle-time></work-order-cycle-time>";},
		directiveName: function(){return 'workOrderCycleTime';},
		namespace: function(){'workorder'},
		heading: function(){return 'work-order-cycle-time-name'},
		paletteImage: function(){return 'clock.png';}
	});
}])*/
.directive('workOrderCycleTimeGrid', [function(){
	return{
		restrict: 'E',
		controller: 'workOrderCycleTimeGridCtrl',
		templateUrl: 'intellicommand/views/gridView.html'
	}
}])
.directive('workOrderCycleTimeConfig',[function(){
	  return{
		  restrict:'E',
		  controller: 'workOrderCycleTimeModalOpener',
		  templateUrl: '/intellicommand/views/algoConfig.html'
	  }
}])
.directive('workOrderCycleTime', [function(){
	return {
		restrict: 'E',
		controller: 'workOrderCycleTimeCtrl',
		templateUrl: '/intellicommand/views/workOrderCycleTime.html',
	}
	
}])
.directive('workOrderCycleTimeName', function(){
	return{
		template: "Work Order Cycle Time"
	};
})

.factory('workOrderCycleTimeDataService', ['$http', 'workOrderCycleTimeSharedProperties', function($http, workOrderCycleTimeSharedProperties){
	
	var serviceObject = {};
	var _getWorkOrderData = function(configObj){
		var organization = "";
		
		if(workOrderCycleTimeSharedProperties.getStartDate() === undefined || workOrderCycleTimeSharedProperties.getEndDate() === undefined){
			var today = new Date();
			var someTimeBefore = new Date(today.getFullYear()-1, today.getMonth(), today.getDate());
		}
		else{
			var today =  new Date(workOrderCycleTimeSharedProperties.getEndDate());
			var someTimeBefore = new Date(workOrderCycleTimeSharedProperties.getStartDate());
		}
		if(workOrderCycleTimeSharedProperties.getOrganization() != null){
			organization = workOrderCycleTimeSharedProperties.getOrganization();
		}
		//var mongoUrl = "http://10.239.3.132:8111/db/query";
		/*var mongoUrl = "http://10.239.3.132:8111/db/query";
		var requestString = "{\"createdTime\" : {\"$gt\" : { \"$date\": \""+someTimeBefore.toJSON()+"\" }, \"$lt\": { \"$date\": \""+today.toJSON()+"\" }}, \"client\" : \""+organization+"\"}";
		var config = {
				method: 'POST',
				//headers: {'Collection' : 'events'},
				headers: {'Collection' : 'events'},
				url: mongoUrl,
				data: requestString
		};*/
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
	}
	serviceObject = {
			getWorkOrderData : _getWorkOrderData
	}
	return serviceObject;
}])

.factory('workOrderCycleTimeSharedProperties', ['$rootScope', function($rootScope){
	var _organization;
	var _redraw = false;
	var _chartId;
	var _startDate;
	var _endDate;
	
	var _setEndDate = function(date){
		_endDate = date;
	}
	var _getEndDate = function(){
		return _endDate;
	}
	var _setStartDate = function(date){
		_startDate = date;
	}
	var _getStartDate = function(){
		return _startDate;
	}
	
	
	var _makeRedraw = function(){
		_redraw = !_redraw;
		$rootScope.$broadcast('renderWorkOrderCycleTimeChart');
	}
	var _setChartId = function(id){
		_chartId = id;
	}
	var _getChartId = function(){
		return _chartId;
	}
	var _setOrganization = function(organization){
		_organization = organization;		
	}
	var _getOrganization = function(){
		return _organization;
	}
	var _serviceObj = {
			setStartDate : _setStartDate,
			getStartDate : _getStartDate,
			setEndDate : _setEndDate,
			getEndDate : _getEndDate,
			makeRedraw : _makeRedraw,
			setChartId : _setChartId,
			getChartId : _getChartId,
			getOrganization : _getOrganization,
			setOrganization : _setOrganization,
	};
	return _serviceObj;
}])
.controller('workOrderCycleTimeGridCtrl', ['$scope', '$rootScope', '$controller', 'configService', 'workOrderCycleTimeSharedProperties', 
                                       function($scope, $rootScope, $controller, awesome, workOrderCycleTimeSharedProperties){
	$scope.openWorkOrderGrid = function(){
		var thisController = this;
		var superController = $controller('baseWidgetCtrl', {
			"$scope" : $scope
		});
		
		angular.extend(thisController, awesome, superController);
		$scope.config = thisController.getConfig();
		workOrderCycleTimeSharedProperties.setChartId($scope.config.chartId);
		$rootScope.$broadcast('workOrderCycleTimeGridView');
	}
}])
.controller('workOrderCycleTimeModalOpener', ['$scope', '$modal', 'configService', '$controller', 'workOrderCycleTimeSharedProperties', function($scope, $modal, awesome, $controller, workOrderCycleTimeSharedProperties){
	
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});
	
	angular.extend(thisController, awesome, superController);
	$scope.config = thisController.getConfig();
	
	$scope.openConfiguration = function(){
		var modalInstance = $modal.open({
            templateUrl: '/intellicommand/views/workOrderCycleTimeConfig.html',
            controller: 'workOrderCycleTimeConfigCtrl',
			resolve: {
				config: function(){
					return $scope.config;
				}
			}
        });
		modalInstance.result.then(function(config){
			thisController.setConfig(config);
			workOrderCycleTimeSharedProperties.setOrganization($scope.config.stationName);
			workOrderCycleTimeSharedProperties.setChartId($scope.config.chartId);
			workOrderCycleTimeSharedProperties.setStartDate($scope.config.startingDate);
			workOrderCycleTimeSharedProperties.setEndDate($scope.config.endingDate);
			workOrderCycleTimeSharedProperties.makeRedraw();
		}, function(){
		
		});
	}
}])

.controller('workOrderCycleTimeConfigCtrl', ['$scope', '$modalInstance','clientService', 'config', function($scope, $modalInstance, clientService, config){
	$scope.organization = config.stationName;
	$scope.startDate = config.startingDate;
	$scope.endDate = config.endingDate;
	$scope.weekly = config.weekly;
		
	
	clientService.getOrganizationList().then(function(allClients){
		$scope.organizationNames = allClients;
	})
	$scope.changeOrganization = function(org){
		$scope.organization = org;
	}
	$scope.ok = function(){
		var config = {
				"stationName": $scope.organization,
				"startingDate": $scope.startDate,
				"endingDate": $scope.endDate,
				"colorHigh" : "#3CB371",
				"colorLow" : "#000000",
				"barChartColor" : "#B22222",
				"weekly" : $scope.weekly
		};
		$modalInstance.close(config);
	}
	$scope.cancel = function(){
		$modalInstance.dismiss('cancel');
	}
	$scope.makeDefault = function(){
		$scope.endDate = undefined;
		$scope.startDate = undefined;
	}
	
}])

.controller('workOrderCycleTimeCtrl', ['$scope', '$modal', 'workOrderCycleTimeDataService', 'workOrderCycleTimeSharedProperties', 'chartIdService', '$controller', 'facilitySelectorService', 'configService', 'dateRangeService','userPrefService',
                                       function($scope, $modal, workOrderCycleTimeDataService, workOrderCycleTimeSharedProperties, chartIdService, $controller, facilitySelectorService, awesome,  dateRangeService, userPrefService){
	
	var variableMonthsAgo = function(number){
		var end = new Date();
		var start = new Date(end.getFullYear(), end.getMonth()-number, end.getDate());
		return {"startDate" : start, "endDate" : end};
	}
	var variableWeeksAgo = function(number){
		var days = number * 7;
		var end = new Date();
		var start = new Date(end.getFullYear(), end.getMonth(), end.getDate()-days);
		return {"startDate" : start, "endDate" : end};
	}
	$scope.rendering = false;
	$scope.gridView = false;
	$scope.hasOrg = false;
	$scope.chartId = chartIdService.getNewId();
	$scope.facilityChartId = chartIdService.getNewId();
	$scope.assetChartId = chartIdService.getNewId();
	
	/** angela is replacing all of this stuff **
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});
	angular.extend(thisController, awesome, superController, dateRangeService);
	$scope.config = thisController.getConfig();
	var defaultConfig = {
			"clientName" : undefined,
			"startingDate" : undefined,
			"endingDate" : undefined,
			"dateRange" : "",
			"colorHigh" : "#3CB371",
			"colorLow" : "#B22222",
			"barChartColor" : "#B22222",
			"weekly" : false,
			"chartId" :  $scope.chartId,
			"facilityChartId" : $scope.facilityChartId,
			"assetChartId" : $scope.assetChartId
			
			
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
		"stationName" : "MRL",
		"startingDate" : "",//variableMonthsAgo(12).startDate,
		"endingDate" : "",//new Date(),
		"dateRange" : "last twelve months",
		//"colorHigh" : "#3CB371",
		//"colorLow" : "#B22222",
		"barChartColor" : "#B22222",
		//"weekly" : false,
		"chartId" :  $scope.chartId,
		"facilityChartId" : $scope.facilityChartId,
		"assetChartId" : $scope.assetChartId
	};
	var currentConfig = defaultConfig;
	
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});
	angular.extend(thisController, awesome, superController, dateRangeService);
	$scope.config = thisController.getConfig();
	// End choose settings that this widget cares about
	
	var refreshConfigs = function() {
		var myPrefs = userPrefService.getUserPrefs("work-order-cycle-time");
		/* Use default config to determine which preferences should be used in the widget
			Order of preferences: 
			1) User preferences (myPrefs)
			2) XUI configurations ($scope.config)
			3) default configurations by widget (defaultConfig)
		*/
		for (var key in defaultConfig) {
			if (myPrefs[key] !== "" && myPrefs[key] !== undefined && myPrefs[key] !== null) {
				$scope.config[key] = myPrefs[key];
			} 
			else {
				$scope.config[key] = defaultConfig[key];
			}
			if(key === "dateRange"){
				var dates;
				var range = $scope.config.dateRange;
				console.log(range);
				switch(range){
					case "last twelve months" : {
						dates = variableMonthsAgo(12);
						break;
					}
					case "last six weeks" : {
						dates = variableWeeksAgo(6);
						break;
					}
					case "last twelve weeks" : {
						dates = variableWeeksAgo(12);
						break;
					}
					case "last six months" : {
						dates = variableMonthsAgo(6);
						break;
					}
				}
				$scope.config.startingDate = dates.startDate;
				$scope.config.endingDate = dates.endDate;
			}
		}
		workOrderCycleTimeSharedProperties.setOrganization($scope.config.stationName);
		if($scope.config.stationName !== undefined && $scope.config.stationName !== "" && $scope.config.stationName !== null){
			if($scope.config.dateRange !== undefined && $scope.config.dateRange !== "" !== $scope.config.dateRange !== null){
				$scope.renderChart();
				$scope.rendering = true;
			}
		}
	}
	/** end angela's replacement section */
	
	
	if(angular.element(document.getElementById("editorHere")).hasClass("xui-css-dockparent")){
		
		$scope.inEditor = true;
	}
	else{
		
		$scope.inEditor = false;
	}
	$scope.inDashboard = true;
	if(thisController.getFullConfig().dashboard === undefined){
		$scope.inDashboard = false;
	}
	
	if($scope.config.startingDate === undefined || $scope.config.endingDate === undefined){
		var today = new Date();
		$scope.startDate = new Date(new Date(today.getFullYear()-1, today.getMonth(), today.getDate()));
		$scope.endDate = today;
	}
	else{
		$scope.startDate = $scope.config.startingDate;
		$scope.endDate = $scope.config.endingDate;
	}

	var getMyColors = function(number){
		var colorInterpolate = d3.interpolateRgb($scope.config.colorHigh, $scope.config.colorLow);
		var colorArray = [];
		for(var i=0;i<number;i++){
			colorArray.push(colorInterpolate(i/number));
		}
		return colorArray;
	}
	$scope.eventData = [];
	
	$scope.drawChartNow = false;
	$scope.showAsset = false;
	$scope.weeklyView = $scope.config.weekly;
	$scope.makeElastic = true;
	
	workOrderCycleTimeSharedProperties.setOrganization($scope.config.stationName);
	
	
	$scope.renderChart = function() { 
		$scope.gridView = false;
		$scope.chartId = $scope.config.chartId;
		$scope.facilityChartId = $scope.config.facilityChartId;
		$scope.assetChartId = $scope.config.assetChartId;
		if($scope.config.stationName === undefined || $scope.config.stationName === ""){return;}
		if($scope.config.startingDate === undefined || $scope.config.endingDate === undefined){
			var today = new Date();
			$scope.startDate = new Date(new Date(today.getFullYear()-1, today.getMonth(), today.getDate()));
			$scope.endDate = today;
		}
		else{
			$scope.startDate = $scope.config.startingDate;
			$scope.endDate = $scope.config.endingDate;
		}
		$scope.drawChartNow = false;
		$scope.showAsset = false;
		
		workOrderCycleTimeDataService.getWorkOrderData($scope.config).success(function(data){
			$scope.bounce = true;
			var result = d3.csv.parse(data);

			if(data === "empty"){
				$scope.hasOrg = true; 
				$scope.showAsset = false; 
				$scope.drawChartNow = false; 
				$scope.invalid = true; 
				$scope.noData = true;
				$scope.rendering = false;
				return;
			}
			$scope.noData = false;
			$scope.eventData = data.result;
			$scope.invalid = false;			
			
			$scope.hasOrg = true;
			angular.forEach(result, function(data){
				var createdTime = new Date(data.createdTime.slice(0,data.createdTime.indexOf(" ")));
				var closedTime = new Date();
				if(data.closureTime){
					closedTime = new Date(data.closureTime.slice(0,data.closureTime.indexOf(" ")));
				}
				data.daysOpen = Math.abs((closedTime - createdTime)/(1000*60*60*24));
				data.madeTime = createdTime;
				data.endTime = closedTime;
			});
			$scope.cycleData = crossfilter(result);
			if(!$scope.bounce || $scope.invalid || $scope.noData){return;}						
			$scope.organizationName = $scope.config.stationName;
			$scope.createAllGroupsAndDimensions();			
			$scope.barChartDimension = $scope.monthDimension;
			if(!$scope.weeklyView){
				$scope.xAxisUnits = d3.time.months;
				$scope.wasteGroup = $scope.monthlyWasteGroup;
			}
			else{
				$scope.xAxisUnits = d3.time.weeks;
				$scope.barChartDimension = $scope.weekDimension;
				$scope.wasteGroup = $scope.weeklyWasteGroup;
			}	
			$scope.organizationName = workOrderCycleTimeSharedProperties.getOrganization();
			$scope.drawBarChart();
			//$scope.drawFacilityChart();
			$scope.drawAssetChart();
			$scope.drawChartNow = true;
		})
		.error(function(){
			
		})
		.finally(function(){
	/*		if(!$scope.bounce || $scope.invalid || $scope.noData){return;}						
			$scope.organizationName = $scope.config.clientName;
			$scope.createAllGroupsAndDimensions();			
			$scope.barChartDimension = $scope.monthDimension;
			if(!$scope.weeklyView){
				$scope.xAxisUnits = d3.time.months;
				$scope.wasteGroup = $scope.monthlyWasteGroup;
			}
			else{
				$scope.xAxisUnits = d3.time.weeks;
				$scope.barChartDimension = $scope.weekDimension;
				$scope.wasteGroup = $scope.weeklyWasteGroup;
			}		
			$scope.drawBarChart();
			$scope.drawFacilityChart();
			$scope.drawAssetChart();
			$scope.drawChartNow = true;*/
		})

	}; // end of render chart function
	$scope.drawBarChart = function(){
		
		$scope.barChart = dc.barChart("#cycle_time_bar_chart_"+$scope.chartId);
		$scope.barChart
			.width(300)
			.height(430)
			.dimension($scope.barChartDimension)
			.colors([$scope.config.barChartColor])
			.group($scope.wasteGroup)
			.valueAccessor(function(p){return p.value.avg;})
			.margins({top: 10, right: 10, bottom: 75, left: 40})
			//.yAxisLabel('Average Days To Close Work Orders')
			.elasticY(true)
			.elasticX(true)
			.xAxisPadding(20)
			
			.centerBar(true)
			.barPadding(0.15)
			.yAxisPadding('5%')
			.x(d3.time.scale().domain([$scope.startDate, $scope.endDate]))
			.xUnits($scope.xAxisUnits)
			.renderHorizontalGridLines(true)
			.renderLabel(true)
			.title(function(p){var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; return "Station: "+$scope.config.stationName+"\nMonth: "+months[p.key.getMonth()]+"\nYear: "+p.key.getFullYear()+"\nAverage Days To Close Work Orders: "+Math.round(p.value.avg*10)/10;})
			.renderTitle(true)
			.brushOn(false)
			.transitionDuration(250)
			.on('preRender', function(){
				var ticks = $scope.wasteGroup.all().length;
				$scope.barChart.xAxis().ticks(ticks);
			})
			.renderlet(function(chart){
							chart.selectAll("g.x text")
							.attr('transform', "rotate(-80)")
							.attr('dx', '-10')
							.attr('dy', '-5')
							.style("text-anchor", "end")
							;
						})
		;	
		$scope.barChart.render();	
		$scope.rendering = false;	
	}
	/*$scope.drawFacilityChart = function(){	
		$scope.facilityPieChart = dc.pieChart("#cycle_time_facility_pie_chart_"+$scope.facilityChartId)
			.width(225)
			.height(150)
			.legend(dc.legend().x(5).y(0).itemHeight(10).gap(10))
			.dimension($scope.facilityDimension)
			.group($scope.facilityWasteGroup)
			.ordinalColors(getMyColors($scope.facilityWasteGroup.all().length))
			.valueAccessor(function(p){return p.value.avg;})
			.title(function(p){return "Facility: "+p.key+"\nAverage Days To Close Work Orders: "+Math.round(p.value.avg*10)/10;})
			.radius(60)
			.innerRadius(10)
			.minAngleForLabel(1.5)
			.render();
	}*/
	
	$scope.drawAssetChart = function(){	
			$scope.assetPieChart = dc.barChart("#cycle_time_asset_chart_"+$scope.assetChartId)
				.width(370)
				.height(350)
				.margins({top: 10, right: 10, bottom: 75, left: 40})
				//.legend(dc.legend().x(1).y(0).itemHeight(10).gap(8))
				.dimension($scope.assetDimension)
				.group($scope.assetWasteGroup)
				.colors([$scope.config.barChartColor])
				.elasticY(true)
				.barPadding(0.05)
				.yAxisPadding('5%')
				.valueAccessor(function(p){return p.value.avg;})
				.x(d3.scale.ordinal().domain([]))
				.xUnits(dc.units.ordinal)
				.title(function(p){return "Asset: "+p.key+"\nAverage Days To Close Work Orders: "+Math.round(p.value.avg*10)/10;})
				.renderlet(function(chart){
					chart.selectAll("g.x text")
						.attr('transform', "rotate(-80)")
						.attr('dx', '-10')
						.attr('dy', '-5')
						.style("text-anchor", "end")
					;
				})	
				.render();
			$scope.showAsset = true;
	}
	$scope.createAllGroupsAndDimensions = function(){
		
		//define all dimensions
		$scope.monthDimension = $scope.cycleData.dimension(function(d){
			if(d.endTime !== undefined){
				return d3.time.month(d.endTime);
			}
		});
		$scope.organizationDimension = $scope.cycleData.dimension(function(d){
			return d.sitRef;
		});		
		$scope.weekDimension = $scope.cycleData.dimension(function(d){
			if(d.endTime !== undefined){
				return d3.time.week(d.endTime);
			};
		});
		/*$scope.facilityDimension = $scope.cycleData.dimension(function(d){
			return d.stationName;
		});*/
		$scope.assetDimension = $scope.cycleData.dimension(function(d){
			return d.asset;
		});
		$scope.monthlyWasteGroup = $scope.monthDimension.group().reduce(
				function(p,d){
					p.count += 1;
					p.sum += d.daysOpen;
					if(p.count == 0){
						p.avg = 0;
					}
					else{
						p.avg = p.sum / p.count;
					}
					return p;
				},
				function(p,d){
					p.count -= 1;
					p.sum -= d.daysOpen;
					if(p.count == 0){
						p.avg = 0;
					}
					else{
						p.avg = p.sum / p.count;
					}
					return p;
				},
				function(){
					return {
						count:0 ,
						sum: 0,
						avg: 0
					};
				}
		);
		
		$scope.weeklyWasteGroup = $scope.weekDimension.group().reduce(
				function(p,d){
					p.count += 1;
					p.sum += d.daysOpen;
					if(p.count == 0){
						p.avg = 0;
					}
					else{
						p.avg = p.sum / p.count;
					}
					return p;
				},
				function(p,d){
					p.count -= 1;
					p.sum -= d.daysOpen;
					if(p.count == 0){
						p.avg = 0;
					}
					else{
						p.avg = p.sum / p.count;
					}
					return p;
				},
				function(){
					return {
						count:0 ,
						sum: 0,
						avg: 0
					};
				}
		);
		
		$scope.orgWasteGroup = $scope.organizationDimension.group().reduce(
				function(p,d){
					p.count += 1;
					p.sum += d.daysOpen;
					if(p.count == 0){
						p.avg = 0;
					}
					else{
						p.avg = p.sum / p.count;
					}
					return p;
				},
				function(p,d){
					p.count -= 1;
					p.sum -= d.daysOpen;
					if(p.count == 0){
						p.avg = 0;
					}
					else{
						p.avg = p.sum / p.count;
					}
					return p;
				},
				function(){
					return {
						count: 0,
						sum: 0,
						avg: 0
					};
				}
		);

		/*$scope.facilityWasteGroup = $scope.facilityDimension.group().reduce(
				function(p,d){
					p.count += 1;
					p.sum += d.daysOpen;
					if(p.count == 0){
						p.avg = 0;
					}
					else{
						p.avg = p.sum / p.count;
					}
					return p;
				},
				function(p,d){
					p.count -= 1;
					p.sum -= d.daysOpen;
					if(p.count == 0){
						p.avg = 0;
					}
					else{
						p.avg = p.sum / p.count;
					}
					return p;
				},
				function(){
					return {
						count: 0,
						sum: 0,
						avg: 0
					};
				}
		);*/
		
		$scope.assetWasteGroup = $scope.assetDimension.group().reduce(
				function(p,d){
					p.count += 1;
					p.sum += d.daysOpen;
					p.avg = p.sum / p.count;
					return p;
				},
				function(p,d){
					p.count -= 1;
					p.sum -= d.daysOpen;
					if(p.count == 0){
						p.avg = 0;
					}
					else{
						p.avg = p.sum / p.count;
					}
					return p;
				},
				function(){
					return {
						count: 0,
						sum: 0,
						avg: 0
					};
				}
		);
	};
	$scope.openWorkOrderGrid = function(){
		if($scope.gridView === true){
			$scope.gridView = false;
			$scope.drawChartNow = !$scope.drawChartNow;
			return;
		}
		else{
			$scope.drawChartNow = false;
			var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			var rectData = [];
			var chart = d3.select("#cycle_time_bar_chart_"+$scope.config.chartId);
			var selects = chart.selectAll('rect');
			var rectLength = selects[0].length;
			var chartData = [];
			
			for(var i=0;i<rectLength;i++){
				if(selects[0][i].__data__ !== undefined){
					rectData.push(selects[0][i].__data__.data);
				}
			}
			var rectDataLength = rectData.length;
			for(var i=0;i<rectDataLength;i++){
				var chartRow = {"Month" : months[rectData[i].key.getMonth()], "Year" : rectData[i].key.getFullYear(), "# Closed" : rectData[i].value.count, "Avg Days" : d3.round(rectData[i].value.avg, 2)};
				chartData.push(chartRow);
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
					data: 'chartData',
					
			};
			$scope.gridView = true;		
		}
	};
	//TODO investigate Passing the closing date...will have to do an $or query.
	$scope.onRowClick = {
			openTicketingDashboard : function(row){
				var month = row.Month;
				var year = row.Year;
	
				var lastDay;
				
				//30 days have september april june november, all the rest have 31
				switch(month){
				case "September" : {lastDay = 30; break;}
				case "April" : {lastDay = 30; break;}
				case "June" : {lastDay = 30; break;}
				case "November" : {lastDay = 30; break;}
				case "February" : { if(((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)){lastDay = 32;}else{lastDay = 28;} break;}
				default : {lastDay = 31; break;}
				}
				var start = new Date(month+" "+1+" "+year);
				var end = new Date(month+" "+lastDay+" "+year);
				
				var dashString = JSON.stringify(
						{
						"ctl_workordergrid1":{"tag":"","desc":"","dataBinder":"","dataField":"","autoTips":true,"className":"","disableClickEffect":false,"disableHoverEffect":false,"disableTips":false,"disabled":false,"defaultFocus":false,"hoverPop":"","hoverPopType":"outer","dock":"none","dockIgnore":false,"dockOrder":1,"showEffects":"","hideEffects":"","dockFloat":false,"dockMinW":0,"dockMinH":0,"tips":"","rotate":0,"left":0,"top":0,"width":800,"height":400,"right":800,"bottom":200,"renderer":null,"zIndex":1,"tabindex":1,"position":"relative","visibility":"","display":"","selectable":false,"clientName":$scope.config.clientName,"stationName":"","assetName":"","status":"","caller":"workOrderCycleTime", "startingDate": start, "endingDate": end, "anomalyType":"","parentAlias":"canvas","classKey":"xui.UI.WorkOrderGrid"},
						"ctl_eventpage1":{"tag":"","desc":"","dataBinder":"","dataField":"","autoTips":true,"className":"","disableClickEffect":false,"disableHoverEffect":false,"disableTips":false,"disabled":false,"defaultFocus":false,"hoverPop":"","hoverPopType":"outer","dock":"none","dockIgnore":false,"dockOrder":1,"showEffects":"","hideEffects":"","dockFloat":false,"dockMinW":0,"dockMinH":0,"tips":"","rotate":0,"left":620,"top":0,"width":"auto","height":400,"right":"auto","bottom":"auto","renderer":null,"zIndex":1,"tabindex":1,"position":"static","visibility":"","display":"","selectable":false,"workOrderNumber":"","stationName":"","assetName":"","anomalyType":"","chartStart":"2014-03-11T15:52:00.948Z","chartEnd":"2015-03-11T15:52:00.948Z","axis":{"label":"","autoAxis":true,"pointsOnAxis":[{"pointName":"","stationName":"","assetName":""}]},"allPoints":"","parentAlias":"canvas","classKey":"xui.UI.EventPage"},
						"ctl_equipmenttickets1":{"tag":"","desc":"","dataBinder":"","dataField":"","autoTips":true,"className":"","disableClickEffect":false,"disableHoverEffect":false,"disableTips":false,"disabled":false,"defaultFocus":false,"hoverPop":"","hoverPopType":"outer","dock":"center","dockIgnore":false,"dockOrder":1,"showEffects":"","hideEffects":"","dockFloat":false,"dockMinW":0,"dockMinH":0,"tips":"","rotate":0,"left":0,"top":505,"width":600,"height":200,"right":"auto","bottom":"auto","renderer":null,"zIndex":1,"tabindex":1,"position":"static","visibility":"","display":"","selectable":false,"parentAlias":"canvas","classKey":"xui.UI.EquipmentTickets"}
					}
				);
				/*$.ajax({
					url: "/xui",
					type: "post",
					data: dashString,
					headers: {
						"dataObj" : dashString,
						"Content-Type" : "application/json"
					},
					dataType: "html"
						
				}).done(function(data){
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
									"clientName" : $scope.config.,
									"stationName" : $scope.config.stationName,
									"endingDate" : end,
									"startingDate" : start,
									"assetName" : undefined,
									"status" : undefined,
									"caller" : "workOrderCycleTime"
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
	$scope.$on('renderWorkOrderCycleTimeChart', function(){
		$scope.showAsset = false;
		$scope.hasOrg = true;
		if(workOrderCycleTimeSharedProperties.getChartId() === $scope.chartId){
			$scope.weeklyView = $scope.config.weekly;
			
			$scope.renderChart();
		}
	});
	/** this section will become obsolete *
	$scope.$on('organizationSetFacilitySelector', function(){
		$scope.showAsset = false;
		$scope.renderWeeklyView = $scope.config.weekly;
		$scope.hasOrg = true;
		
		var client = facilitySelectorService.getOrganization();
		if($scope.config.clientName === client ){return;}
		$scope.config.clientName = client;
		workOrderCycleTimeSharedProperties.setOrganization(client);
		$scope.renderChart();
	});
	
	$scope.$watch('config', function(nuObj, oldObj){
		var nu = nuObj.clientName;
		var old = oldObj.clientName;
		if(nuObj.startingDate === "" && oldObj.startingDate === undefined || nuObj.endingDate === "" && oldObj.endingDate === undefined){return;}
		
		
		if(nu === "" || nu === undefined){return;}
		
		if($scope.inEditor === false){
			$scope.showAsset = false;
			//$scope.renderWeeklyView = $scope.config.weekly;
			$scope.hasOrg = true;
			workOrderCycleTimeSharedProperties.setOrganization(nu);
			$scope.renderChart();
			return;
		}
		
		if(nuObj.clientName !== "" && nuObj.clientName !== undefined){
			if($scope.inEditor){
				$scope.showAsset = false;
				//$scope.renderWeeklyView = $scope.config.weekly;
				$scope.hasOrg = true;
				workOrderCycleTimeSharedProperties.setOrganization(nu);
				$scope.renderChart();
				return;
			}
		}
	}, true);
	/** end section to become obsolete */
	
	$scope.$watch('config.dateRange', function(){
		
		if($scope.config.dateRange === undefined || $scope.config.dateRange === "" || !$scope.hasOrg){return;}
		
		else{
			var dates;
			var range = $scope.config.dateRange;
			switch(range){
				case "last twelve months" : {
					dates = variableMonthsAgo(12);
					break;
				}
				case "last six weeks" : {
					dates = variableWeeksAgo(6);
					break;
				}
				case "last twelve weeks" : {
					dates = variableWeeksAgo(12);
					break;
				}
				case "last six months" : {
					dates = variableMonthsAgo(6);
					break;
				}
			}
			$scope.startDate = dates.startDate;
			$scope.endDate = dates.endDate;
			$scope.config.startingDate = dates.startDate;
			$scope.config.endingDate = dates.endDate;
			workOrderCycleTimeSharedProperties.setStartDate(dates.startDate);
			workOrderCycleTimeSharedProperties.setEndDate(dates.endDate);
			if($scope.config.stationName !== undefined && $scope.config.stationName !== ""){
				//$scope.showAsset = false;
				userPrefService.updateUserPrefs($scope.config);
				$scope.renderWeeklyView = $scope.config.weekly;
				$scope.hasOrg = true;
				//workOrderCycleTimeSharedProperties.setOrganization(nu);
				//$scope.renderChart();
			}			
		}
	}, true);
	
	$scope.$on('workOrderCycleTimeGridView', function(){
		if($scope.config.chartId === workOrderCycleTimeSharedProperties.getChartId()){
			$scope.openWorkOrderGrid();
		}
	});
	$scope.resetDates = function(){
		workOrderCycleTimeSharedProperties.setOrganization($scope.config.stationName);
		if($scope.config.startingDate === undefined || $scope.config.endingDate === undefined){
			$scope.endDate = new Date();
			$scope.startDate = new Date(new Date($scope.endDate.getFullYear()-1, $scope.endDate.getMonth(), $scope.endDate.getDate()));
		}
		else{
			$scope.startDate = $scope.config.startingDate
		}
		$scope.weeklyView = $scope.config.weekly;
		$scope.makeElastic = true;
		if(!$scope.config.weekly){
			$scope.xAxisUnits = d3.time.months;
			$scope.barChartDimension = $scope.monthDimension;
			$scope.wasteGroup = $scope.monthlyWasteGroup;
		}
		else{
			$scope.xAxisUnits = d3.time.weeks;
			$scope.barChartDimension = $scope.weekDimension;
			$scope.wasteGroup = $scope.weeklyWasteGroup;
		}
		
		
		$scope.drawBarChart();
		//$scope.drawFacilityChart();
		$scope.drawAssetChart();
		
	};
	$scope.renderAssetChart = function(){
		$scope.showAsset = !$scope.showAsset;
	};
	
	$scope.renderWeekly = function(){
		if($scope.weeklyView){
			return;
		}
		$scope.makeElastic = false;
		$scope.weeklyView = true;
		$scope.endDate = new Date();
		$scope.startDate = new Date($scope.endDate.getFullYear(), $scope.endDate.getMonth()-2, $scope.endDate.getDate()); 
		$scope.xAxisUnits = d3.time.weeks;
		$scope.barchartDimension = $scope.weeklyDimension;
		$scope.wasteGroup = $scope.weeklyWasteGroup;
		$scope.drawBarChart();
		//$scope.drawFacilityChart();
		$scope.drawAssetChart();
		
	};
	$scope.previousMonth = function(){
		$scope.startDate = new Date($scope.startDate.getFullYear(), $scope.startDate.getMonth()-1, $scope.startDate.getDate());
		$scope.endDate = new Date($scope.endDate.getFullYear(), $scope.endDate.getMonth()-1, $scope.endDate.getDate());
		$scope.xAxisUnits = d3.time.weeks;
		$scope.drawBarChart();
		//$scope.drawFacilityChart();
		$scope.drawAssetChart();
		
	};
	$scope.nextMonth = function(){
		$scope.startDate = new Date($scope.startDate.getFullYear(), $scope.startDate.getMonth()+1, $scope.startDate.getDate());
		$scope.endDate = new Date($scope.endDate.getFullYear(), $scope.endDate.getMonth()+1, $scope.endDate.getDate());
		$scope.xAxisUnits = d3.time.weeks;
		$scope.drawBarChart();
		//$scope.drawFacilityChart();
		$scope.drawAssetChart();
		
	};
	$scope.openPageConfiguration = function(){
		var modalInstance = $modal.open({
            templateUrl: '/intellicommand/views/workOrderCycleTimeConfig.html',
            controller: 'workOrderCycleTimeConfigCtrl',
			resolve: {
				config: function(){
					return $scope.config;
				}
			}
        });
		modalInstance.result.then(function(config){
			thisController.setConfig(config);
			workOrderCycleTimeSharedProperties.setOrganization($scope.config.stationName);
			workOrderCycleTimeSharedProperties.setChartId($scope.config.chartId);
			workOrderCycleTimeSharedProperties.setStartDate($scope.config.startingDate);
			workOrderCycleTimeSharedProperties.setEndDate($scope.config.endingDate);
			workOrderCycleTimeSharedProperties.makeRedraw();
		}, function(){
		});
	}

	/** angela new **/
		$scope.$watch('config', function(){
			userPrefService.updateUserPrefs($scope.config);
			if($scope.rendering === true){return;}
			refreshConfigs();
		}, true);
		/*$scope.$on('userPrefsChanged',function(){
			refreshConfigs();
		});*/
		/** end angela new **/
		
	//refreshConfigs();
	//$scope.renderChart();
}])






































