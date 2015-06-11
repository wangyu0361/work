'use strict';

angular.module('icDash.agedWorkOrders', ['ui.router'])

/***angular.module('myApp.agedWorkOrders', ['ngRoute', 'ui.grid', 'ui.grid.autoResize', 
                                        'myApp.dashboard', 'myApp.panelComponent', 
                                        'myApp.popout', 'ui.bootstrap',
    									'myApp.pciService', // Config service
    									'myApp.clientService', // Client service
    									'myApp.dashboardTransitionService', // Dashboard transition service
    									'myApp.facilitySelector', // Facility selector service
    									'myApp.calendar',
    									'myApp.ticketImpulse'])
***
.run(['directiveService', function(directiveService){
	directiveService.addFullComponent({
		tag: function(){return 'aged-work-orders';},
		configTag: function(){return 'aged-work-orders-config'},
		gridTag: function(){return 'aged-work-orders-grid'},
		tagHtml: function(){"<aged-work-orders></aged-work-orders>";},
		directiveName: function(){return 'agedWorkOrders';},
		namespace: function(){'agedWorkOrders'},
		heading: function(){return 'aged-work-name';},
		paletteImage: function(){return 'clock.png';}
	});
}])
***/
.directive('agedWorkOrders', [function(){
	  return{
		  restrict: 'E',
			controller: 'agedWorkOrdersMainCtrl',
			templateUrl: 'icWidgets/agedWorkOrders.html',
	  }
}])
.directive('agedWorkOrdersConfig',[function(){
	  return{
		  restrict:'E',
		  controller: 'agedWorkOrdersModalOpener',
		  templateUrl: 'icWidgets/algoConfig.html'
	  }
}])
.directive('agedWorkOrdersGrid', [function(){
	return{
		restrict: 'E',
		controller: 'agedWorkOrdersGridCtrl',
		templateUrl: 'icWidgets/gridView.html'
	}
}])
.directive('agedWorkName', [function(){
	return{
		template: "Aged Work Orders"
	};
}])

.factory('agedWorkOrdersDataService', ['$http', '$rootScope', function($http, $rootScope){
		
	var _serviceObject = {};
	var _clientName;
	var _clientCrossfilterData;
	var _clientCrossFilterData;
	var _clientDimension;
	var _stationDimension;
	var _stationGroup;
	var _clientGroup;
	var _chartId;
	var _success;
	
	var _getSuccess = function(){
		return _success;
	}
	var _getChartId = function(){
		return _chartId;
	};
	var _setChartId = function(id){
		_chartId = id;
	};
	var _makeRedraw = function(){
		$rootScope.$broadcast('redrawAgedWorkOrdersCharts');
	};
	var _setClientName = function(name){
		_clientName = name;
	}
	var _getClientName = function(){
		return _clientName;
	}
	var _getClientCrossFilterData = function(){
		return _clientCrossFilterData;
	};
	var _getClientDimension = function(){
		return _clientDimension;
	};
	var _getClientGroup = function(){
		return _clientGroup;
	};
	var _getStationDimension = function(){
		return _stationDimension;
	};
	var _getStationGroup = function(){
		return _stationGroup;
	};
	var _getClientData = function(configObj){
		if(configObj.clientName !== "" && configObj.clientName != undefined){
			_clientName = configObj.clientName;
		}
		var requestString;
		var mongoUrl = "https://galaxy2021temp.pcsgalaxy.net:9453/db/query";
		//var mongoUrl = "https://galaxy2021temp.pcsgalaxy.net:9453/db/query";
		
		var client = configObj.clientName;
		requestString = "{\"status\" : \"Open\", \"client\" : \""+client+"\"}"
		var config = {
				method: 'POST',
				//headers: {'Collection' : 'events'},
				headers: {'Collection' : 'events'},
				url: mongoUrl,
				data: requestString
		};
		return $http(config)
			.success(function(response){
				if(response.result === null){
					_success = false;
					return;
				}else{
					_success = true;
				}
				var today = new Date();
				angular.forEach(response.result, function(data){
					var createdTime = new Date(data.createdTime);
					var daysOpen = (today - createdTime)/(1000*60*60*24);
					if(daysOpen < 30){
						data.age = "Less Than 30 Days";
					}
					else if(daysOpen < 60){
						data.age = "Between 30 and 60 Days";
					}
					else if(daysOpen < 90){
						data.age = "Between 60 and 90 Days";
					}
					else{
						data.age = "More Than 90 Days";
					}
				});
				_clientCrossFilterData = crossfilter(response.result);
				_clientDimension = _clientCrossFilterData.dimension(function(d){
					return d.age;
				});
				_stationDimension = _clientCrossFilterData.dimension(function(d){
					return d.stationName;
				});
				_clientGroup = _clientDimension.group().reduceCount();
				_stationGroup = _stationDimension.group().reduceCount();
			})
			.error(function(){
				//console.log("Error retrieving data from the database");
			});
	};
	_serviceObject = {
			getClientName : _getClientName,
			getChartId : _getChartId,
			setChartId : _setChartId,
			makeRedraw : _makeRedraw,
			getClientData : _getClientData,
			getClientCrossFilterData : _getClientCrossFilterData,
			getClientDimension : _getClientDimension,
			getClientGroup : _getClientGroup,
			getStationDimension : _getStationDimension,
			getStationGroup : _getStationGroup,
			getSuccess : _getSuccess
	};
	return _serviceObject;	
}])
.controller('agedWorkOrdersGridCtrl', ['$scope', '$rootScope', '$controller', 
                                       'configService', 'agedWorkOrdersDataService',
                                       function($scope, $rootScope, $controller, awesome, agedWorkOrdersDataService){
	
	$scope.openWorkOrderGrid = function(){
		var thisController = this;
		var superController = $controller('baseWidgetCtrl', {
			"$scope" : $scope
		});
		
		angular.extend(thisController, awesome, superController);
		$scope.config = thisController.getConfig();
		agedWorkOrdersDataService.setChartId($scope.config.chartId);
		if($scope.config.clientName !== undefined){
			$rootScope.$broadcast('gridView');
		}
	};
}])

/*** angela removed dashTransition sections! *
.controller('agedWorkOrdersMainCtrl', ['$scope', 'agedWorkOrdersDataService', 'chartIdService', '$modal', 
                                       'configService', 'dashTransition', '$controller', 'facilitySelectorService', 'userPrefService',
                                       function($scope, agedWorkOrdersDataService, chartIdService, $modal, 
                                    		   	awesome, dashTransition, $controller, facilitySelectorService, userPrefService){
	***/
	
.controller('agedWorkOrdersMainCtrl', ['$scope', 'agedWorkOrdersDataService', 'chartIdService', '$modal', 
                                       'configService', '$controller', 'userPrefService',
                                       function($scope, agedWorkOrdersDataService, chartIdService, $modal, 
                                    		   	awesome, $controller, userPrefService){
												
	$scope.collapseClientChart = true;
	$scope.gridView = false;
	$scope.noData = false;
	
	/** angela is replacing all of this stuff **
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});
	
	angular.extend(thisController, awesome, superController);
	$scope.config = thisController.getConfig();
	
	var defaultConfig = {
			"clientName" : "",
			"stationName" : "",
			"chartId" : "",
			"chartColor" : "#B22222",
			"colorHigh" : "#3CB371",
			"colorLow" : "#000000"
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
		"clientName" : "",
		"stationName" : "",
		"chartId" : "",
		"chartColor" : "#B22222",
		"colorHigh" : "#3CB371",
		"colorLow" : "#000000"
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
		console.log("AGED WORK ORDERS updating!");
		var myPrefs = userPrefService.getUserPrefs("aged-work-orders");
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
		
		if (currentConfig.clientName !== "" && currentConfig.clientName !== undefined) $scope.hasOrg = true;
		$scope.config = currentConfig;
		drawCharts();
	}
	/** end angela's replacement section */
	
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
	
	if($scope.config.chartId === undefined || $scope.config.chartId === ""){
		$scope.config.chartId = chartIdService.getNewId();
	}
	if($scope.config.clientName === undefined || $scope.config.clientName === ""){
		$scope.hasOrg = false;
	}
	else{
		$scope.hasOrg = true;
	}
	var getMyColors = function(number){
		var colorInterpolate = d3.interpolateRgb($scope.config.colorHigh, $scope.config.colorLow);
		var colorArray = [];
		for(var i=0;i<number;i++){
			colorArray.push(colorInterpolate(i/number));
		}
		//console.log(colorArray);
		return colorArray;
	}
	var chartRender = function(){
		$scope.client = agedWorkOrdersDataService.getClientName();
		var clientDimension = agedWorkOrdersDataService.getClientDimension();
		if(clientDimension === undefined){return;}
		var clientGroup = agedWorkOrdersDataService.getClientGroup();
		
		var stationDimension = agedWorkOrdersDataService.getStationDimension();
		var stationGroup = agedWorkOrdersDataService.getStationGroup();
		var numberStations = stationGroup.all().length;
		
		var colorArray = getMyColors(numberStations);
		
		var clientBarChart = dc.barChart("#client_barChart_"+$scope.config.chartId)
		
			.height(400)
			.width(300)
			.margins({top: 30, right: 10, bottom: 120, left: 75})
			.dimension(clientDimension)
			.group(clientGroup)
			.colors([$scope.config.chartColor])
			//.yAxisLabel('Number Of Work Open Orders by Age') 
			.elasticX(false)
			.elasticY(true)
			.barPadding(0.15)
			.yAxisPadding('5%')
			.centerBar(false)
			.gap(10)
			.x(d3.scale.ordinal().domain([]))
			.xUnits(dc.units.ordinal)
			.renderHorizontalGridLines(true)
			.brushOn(false)
			.transitionDuration(300)
			.title(function(d){return "Organization: "+$scope.client+"\nNumber of Open Work Orders: "+d.value+"\nAmount of Time Open: "+d.key})
			.on("renderlet", function(chart){
				chart.selectAll("rect")
					.on("click", function(d){
						console.log();
					});
			})
			.on("renderlet", function(chart){
				chart.selectAll("g.x text")
					.attr('transform', "rotate(-60)")
					.attr('dx', '-10')
					.attr('dy', '-5')
					.style("text-anchor", "end")
				;
			})
			.render();
			
		$scope.collapseClientChart = false;
		//console.log('here', colorArray);
		var stationPieChart = dc.pieChart("#station_pieChart_"+$scope.config.chartId)
			
			.width(200)
			.height(200)
			.ordinalColors(colorArray)
			.dimension(stationDimension)
			.group(stationGroup)
			.radius(60)
			.innerRadius(10)
			.title(function(d){return "Click to filter bar chart by events at "+d.key+"\nTotal Open Work Orders at "+d.key+": "+d.value;})
			.on("renderlet", function(chart){
				chart.selectAll('g.pie-slice') //yeah, this actually works :-)
				.on('mouseup', function(d){
					$scope.config.stationName = d.data.key;
				});
			})
			.render();
	};
	var drawCharts = function(){
		agedWorkOrdersDataService.getClientData($scope.config).then(function(){
			if(agedWorkOrdersDataService.getSuccess() === false){
				$scope.noData = true;
				$scope.collapseClientChart = true;
				$scope.gridView = false;
				return;
			}
			else{
				$scope.noData = false;
			}
				chartRender();	
		});
	}
	$scope.openPageConfiguration = function(){
		if(angular.element(document.getElementById("editorHere")).hasClass('xui-css-dockparent')){return;}
		var modalInstance = $modal.open({
			templateUrl: 'icWidgets/agedWorkOrdersConfig.html',
			controller: 'agedWorkOrdersConfigCtrl',
			resolve: {
				config: function(){
					return $scope.config;
				}
			}
		});
		modalInstance.result.then(function(config){
			thisController.setConfig(config);
			$scope.gridView = false;
			$scope.hasOrg = true;
			drawCharts();
		}, function(){
			//console.log("Failed to retrieve results from configuration modal");
		})
	};
	
	$scope.$on('redrawAgedWorkOrdersCharts', function(){
		if(agedWorkOrdersDataService.getChartId() === $scope.config.chartId){
			$scope.gridView = false;
			$scope.hasOrg = true;
			drawCharts();
		}
	});
	
	/** this will become obsolete *
	$scope.$on('organizationSetFacilitySelector', function(){
		if($scope.config.clientName === facilitySelectorService.getOrganization()){return;}
		else{
				$scope.gridView = false;
				$scope.hasOrg = true;
				$scope.config.clientName = facilitySelectorService.getOrganization();			
		}
	});
	/** end area becoming obsolete */
	
	$scope.$on('gridView', function(){
		if($scope.config.chartId === agedWorkOrdersDataService.getChartId()){
			$scope.openWorkOrderGrid();
		}
	});
	
	/** this area will become obsolete *
	$scope.$watch('config', function(nuObj, oldObj){
		
		var nu = nuObj.clientName;
		var old = oldObj.clientName;
		
		if(nuObj.colorHigh !== undefined && nuObj.colorHigh !== ""){
			//console.log('colorHigh', nuObj.colorHigh);
			if($scope.inEditor){
				chartRender();
			}
		}
		if(nuObj.colorLow !== undefined && nuObj.colorLow !== ""){
			//console.log('colorLow', nuObj.colorLow);
			if($scope.inEditor){
				chartRender();
			}
		}
		if(nuObj.chartColor !== undefined && nuObj.chartColor !== ""){
			//console.log('colorLow', nuObj.colorLow);
			if($scope.inEditor){
				chartRender();
			}
		}
		if(nu === old){return;}
		
		
		if(nuObj.clientName !== undefined && nuObj.clientName !== ""){
				$scope.gridView = false;
				$scope.hasOrg = true;
				drawCharts();
		}		
	}, true)
	/** end area becoming obsolete */
/*	$scope.onRowClick = {
			showMessage: function(row){
				dashTransition.newTab("#/workOrderGrid", {
					"clientName" : $scope.config.clientName,
					"stationName" : $scope.config.stationName,
					"endingDate" : undefined,
					"startingDate" : undefined,
					"assetName" : undefined,
					"status" : "Open"
					}
				)
			},
			openTicketingDashboard : function(row){
				
				
				/*var dashString = JSON.stringify(
						{
						"ctl_workordergrid1":{"tag":"","desc":"","dataBinder":"","dataField":"","autoTips":true,"className":"","disableClickEffect":false,"disableHoverEffect":false,"disableTips":false,"disabled":false,"defaultFocus":false,"hoverPop":"","hoverPopType":"outer","dock":"none","dockIgnore":false,"dockOrder":1,"showEffects":"","hideEffects":"","dockFloat":false,"dockMinW":0,"dockMinH":0,"tips":"","rotate":0,"left":0,"top":0,"width":800,"height":400,"right":800,"bottom":200,"renderer":null,"zIndex":1,"tabindex":1,"position":"relative","visibility":"","display":"","selectable":false,"clientName":$scope.config.clientName,"stationName":$scope.config.stationName,"assetName":"","status":"Open","caller":"agedWorkOrders","anomalyType":"","parentAlias":"canvas","classKey":"xui.UI.WorkOrderGrid"},
						"ctl_eventpage1":{"tag":"","desc":"","dataBinder":"","dataField":"","autoTips":true,"className":"","disableClickEffect":false,"disableHoverEffect":false,"disableTips":false,"disabled":false,"defaultFocus":false,"hoverPop":"","hoverPopType":"outer","dock":"none","dockIgnore":false,"dockOrder":1,"showEffects":"","hideEffects":"","dockFloat":false,"dockMinW":0,"dockMinH":0,"tips":"","rotate":0,"left":620,"top":0,"width":"auto","height":400,"right":"auto","bottom":"auto","renderer":null,"zIndex":1,"tabindex":1,"position":"static","visibility":"","display":"","selectable":false,"workOrderNumber":"","stationName":"","assetName":"","anomalyType":"","chartStart":"2014-03-11T15:52:00.948Z","chartEnd":"2015-03-11T15:52:00.948Z","axis":{"label":"","autoAxis":true,"pointsOnAxis":[{"pointName":"","stationName":"","assetName":""}]},"allPoints":"","parentAlias":"canvas","classKey":"xui.UI.EventPage"},
						"ctl_equipmenttickets1":{"tag":"","desc":"","dataBinder":"","dataField":"","autoTips":true,"className":"","disableClickEffect":false,"disableHoverEffect":false,"disableTips":false,"disabled":false,"defaultFocus":false,"hoverPop":"","hoverPopType":"outer","dock":"center","dockIgnore":false,"dockOrder":1,"showEffects":"","hideEffects":"","dockFloat":false,"dockMinW":0,"dockMinH":0,"tips":"","rotate":0,"left":0,"top":505,"width":600,"height":200,"right":"auto","bottom":"auto","renderer":null,"zIndex":1,"tabindex":1,"position":"static","visibility":"","display":"","selectable":false,"parentAlias":"canvas","classKey":"xui.UI.EquipmentTickets"}
					}
				);
				$.ajax({
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
				});
			}
	
	};
*/	
	$scope.openWorkOrderGrid = function(){
		if($scope.gridView === true){
			$scope.gridView = false;
			$scope.collapseClientChart = !$scope.collapseClientChart;
			return;
		}
		var rectData = [];
		var chart = d3.select("#client_barChart_"+$scope.config.chartId)
		var selects = chart.selectAll('rect');
		var rectLength = selects[0].length;
		for(var i=0;i<rectLength;i++){
			if(selects[0][i].__data__ !== undefined){
				rectData.push(selects[0][i].__data__.data);
			}
		}
		var chartData = {
				"organization" : agedWorkOrdersDataService.getClientName(),
				"lessThanThirty" : 0,
				"betweenThirtyAndSixty" : 0,
				"lessThanNinety" : 0,
				"moreThanNinety" : 0
		};
		var rectDataLength = rectData.length;
		for(var i=0;i<rectDataLength;i++){
			var key = rectData[i].key;
			var value = rectData[i].value;
			switch(key){
			case "Less Than 30 Days" : {chartData.lessThanThirty = value; break;}
			case "Between 30 and 60 Days" : {chartData.betweenThirtyAndSixty = value; break;}
			case "Between 60 and 90 Days" : {chartData.lessThanNinety = value; break;}
			case "More Than 90 Days" : {chartData.moreThanNinety = value; break;}
			}
		}
		$scope.chartData = [chartData];
		$scope.collapseClientChart = !$scope.collapseClientChart;
		
		$scope.gridOptions = {
				onRegisterApi: function(gridApi){
					$scope.gridApi = gridApi;
				},
				rowTemplate: '<div style = "cursor:pointer" ng-click="getExternalScopes().openTicketingDashboard(row.entity)"  ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
				enableRowHeaderSelection: false,
				multiSelect: false,
				enableGridMenu: true,
				data: 'chartData',
				columnDefs: [
				             {field: 'organization', displayName: 'Client'},
				             {field: 'lessThanThirty', displayName: '< 30 Days'},
				             {field: 'betweenThirtyAndSixty', displayName: '30-60 Days'},
				             {field: 'lessThanNinety', displayName: '60-90 Days'},
				             {field: 'moreThanNinety', displayName: '> 90 Days'}
				             ]
		};
		$scope.gridView = true;					
	};
	if($scope.hasOrg){
		drawCharts();
	}
	
	refreshConfigs();
}])

.controller('agedWorkOrdersConfigCtrl', ['$scope', '$modalInstance', 'clientService', 'config', function($scope, $modalInstance, clientService, config){
	
	$scope.client = config.clientName;
	$scope.station = config.stationName;
	$scope.barColor = config.barColor;
	$scope.id = config.chartId;
	
	clientService.getOrganizationList().then(function(clients){
		$scope.clientNames = clients;
	})
	$scope.changeClient = function(clientName){
		$scope.client = clientName;
	}
	$scope.ok = function(){
		var configResults = {
				"clientName" : $scope.client,
				"stationName" : $scope.station,
				"chartId" : $scope.id,
				"barColor" : $scope.barColor
		};
		$modalInstance.close(configResults);
	};
	$scope.cancel = function(){
		$modalInstance.dismiss('cancel');
	};
}])

.controller('agedWorkOrdersModalOpener', ['$scope', '$modal', '$controller', 'configService', 'agedWorkOrdersDataService',
                                          function($scope, $modal, $controller, awesome, agedWorkOrdersDataService){
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});
	
	angular.extend(thisController, awesome, superController);
	$scope.config = thisController.getConfig();
	
	$scope.openConfiguration = function(){
		var modalInstance = $modal.open({
            templateUrl: 'icWidgets/agedWorkOrdersConfig.html',
            controller: 'agedWorkOrdersConfigCtrl',
			resolve: {
				config: function(){
					return $scope.config;
				}
			}
        });
		modalInstance.result.then(function(config){ 
			thisController.setConfig(config);
			agedWorkOrdersDataService.setChartId($scope.config.chartId);
			agedWorkOrdersDataService.makeRedraw();
		})
	};
}])