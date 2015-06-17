'use strict';

angular.module('icDash.energyProfile', ['ui.router'])

/**angular.module('myApp.energyProfile', ['ngRoute', 'myApp.dashboard', 'myApp.pciService', 'ui.bootstrap', 'myApp.panelComponent', 'myApp.popout', 'myApp.dateSlider',
'myApp.facilitySelector', 'myApp.ticketImpulse', 'myApp.facilitySelector'])

**
.run(['directiveService', function(directiveService){
	directiveService.addFullComponent({
		tag: function(){return 'energy-profile';},
		configTag: function(){return 'energy-profile-config';},
		tagHtml: function(){return '<energy-profile></energy-profile>';},
		directiveName: function(){return 'energyProfile'},
		namespace: function(){return 'energy';},
		heading: function(){return 'energy-profile-name';},
		paletteImage: function(){return 'energyProfile.png';}
	});
}])
**/
.directive('energyProfile', [function(){
	return {
		restrict: 'E',
		controller: 'energyProfileCtrl',
		templateUrl: 'icWidgets/energyProfile.html'
	};
}])

.directive('energyProfileName', [function(){
	return{
		template: "Energy Profile"
	};
}])

.directive('energyProfileConfig',[function(){
	  return{
		  restrict:'E',
		  controller: 'energyProfileModalOpener',
		  templateUrl: 'icWidgets/algoConfig.html'
	  }
}])

.factory('energyProfileDataService',  ['$q', '$rootScope','$http', 'BMSRecordsAPI', function($q, $rootScope, $http, records){
	var servObj = {};
	var _actualAndExpected = [];
	var _crossFilterData = [];
	var _meterNames = [];
	var _energyData = [];
	var _highDate;
	var _lowDate;
	var _config;
	var _goAway = false;
	
	var _setConfig = function(config){
		_config = config;
	}
	var _getConfig = function(){
		return _config;
	};
	var _setCrossFilterData = function(cross){
		_crossFilterData = cross;
	};
	var _getCrossFilterData = function(){
		return _crossFilterData;
	};
	var _setMeterNames = function(names){
		_meterNames = names;
	};
	var _allDone = function(){
		$rootScope.$broadcast('energyProfileReady');
	};
	var _setHighDate = function(date){
		_highDate = date;
	};
	var _getHighDate = function(){
		return _highDate;
	};
	var _setLowDate = function(date){
		_lowDate = date;
	};
	var _getLowDate = function(){
		return _lowDate;
	};
	var _setGoAway = function(scram){
		_goAway = scram;
	}
	var _makeRedraw = function(){
		$rootScope.$broadcast('redrawEnergyProfile');
	}
	var _variableMonthsAgo = function(number){
		var end = new Date();
		var start = new Date(end.getFullYear(), end.getMonth()-number, end.getDate());
		return {"startDate" : start, "endDate" : end};
	};
	var _variableWeeksAgo = function(number){
		var days = number * 7;
		var end = new Date();
		var start = new Date(end.getFullYear(), end.getMonth(), end.getDate()-days);
		return {"startDate" : start, "endDate" : end};
	};
	var _variableDaysAgo = function(number){
		var end = new Date();
		var start = new Date(end.getFullYear(), end.getMonth(), end.getDate()-number);
		return {"startDate" : start, "endDate" : end};
	};
	var _currentMonth = function(){
		var end = new Date();
		var start = new Date(end.getFullYear(), end.getMonth(), 1);
		return {"startDate" : start, "endDate" : end};
	};
	var _previousMonth = function(){
		var today = new Date();
		var end = new Date(today.getFullYear(), today.getMonth(), 0);
		var start = new Date(end.getFullYear(), end.getMonth(), 1);
		return {"startDate" : start, "endDate" : end};
	};
	var _previousSixMonths = function(){
		var today = new Date();
		var end = new Date(today.getFullYear(), today.getMonth(), 1);
		var start = new Date(end.getFullYear(), end.getMonth()-6, 1);
		return {"startDate" : start, "endDate" : end};
	};
	var _lastYear = function(){
		var end = new Date();
		var start = new Date(end.getFullYear()-1, end.getMonth(), end.getDate());
		return {"startDate" : start, "endDate" : end};
	};
	var _lastFullCalendarYear = function(){
		var today = new Date();
		var end = new Date(today.getFullYear(), 0, 1);
		var start = new Date(end.getFullYear()-1, 0, 1);
		return {"startDate" : start, "endDate" : end};
	};
	var _lifetime = function(){
		var start = new Date(2005, 1, 1);
		var end = new Date();
		return {"startDate" : start, "endDate" : end};
	}
	
	var _setDateRange = function(range){
		var dates;
		switch(range){
		case range = "last four weeks": {dates = _variableWeeksAgo(4);break;}
		case range = "last six weeks" : {dates = _variableWeeksAgo(6);break;}
		case range = "last eight weeks" : {dates = _variableWeeksAgo(8);break;}
		case range = "last four months" : {dates = _variableMonthsAgo(4);break;}
		case range = "previous month" : {dates = _previousMonth();break;}
		case range = "last six months" : {dates = _variableMonthsAgo(6);break;}
		case range = "last 12 months" : {dates = _variableMonthsAgo(12);break;}
		}
		return dates;
	}
	//TODO Modify the function in sky spark to return all of the sites energy points if the siteMEter tag is not on any meters.
	var _queryMeterNames = function(configOb){
		//console.log('queryMeterNames', configOb);
		if(_goAway === true){return;}
		_goAway = true;
		_setMeterNames([]);
		var _config = {
				method: "GET",
				headers:{
					"Content-Type":"text/zinc;charset=utf-8",
					"Authorization":"Basic ZGV2OjEyMzQ1",
					"Accept":"text/csv"
				},
				url: 'https://galaxy2021temp.pcsgalaxy.net:9453/api/galaxy/eval?getSiteMeter("'+
					configOb.stationName+'")'
		}
		//console.log(_config.url);
		$http.get(_config.url,_config)
					.then(function(response){
						var meterPoints = d3.csv.parse(response.data);
						var meterNames = [];
						var totalized;
						for(var i=0;i<meterPoints.length;i++){
							if(meterPoints[i].energy !== ""){
								//here is where you'd want to look for the hisTotalized tag.  Mark the data such that the timestamps are handled appropriately 
								
								totalized = meterPoints[i].hisTotalized !== "" ? true : false;
								var id = meterPoints[i].id.slice(0, meterPoints[i].id.indexOf(" "));
								meterNames.push({"id": id, "totalized" : totalized});
							}
						}
						if(meterNames.length !== 0){
							_setMeterNames(meterNames);
							_getEnergyData(configOb);
						}
						else{
							$rootScope.$broadcast('energyProfileBadRequest'); 
							return;
						}
					});
	};
	var _getEnergyData = function(config){
		var _energyData = [];
		var _length = _meterNames.length;
		var _count = 0;
		var dates = _setDateRange(config.dateRange);
		//console.log('factory, dates: ',dates);
		_setHighDate(dates.endDate);
		_setLowDate(dates.startDate);
		var _makeRequest = function(){
			records.groupRecordsDailyForHistoryId(_meterNames[_count].id, dates.startDate.getTime(), dates.endDate.getTime()).then(function(data){
				_energyData.push({"data" : data, "totalized" : _meterNames[_count].totalized});
				_count += 1;
				if(_count < _length){
					_makeRequest();
				}
				else{
					//console.log('energy data', _energyData);
					_sumTimestampsDaily(_energyData, config);
				}
			});
		};
		if(_count === 0){
			_makeRequest();
		}
	};
	var _addExpectedValues = function(groupedData, config){
/*		
 * 		below is method of forcing request to be serial		
 * 
 * 		var _length = groupedData.length;
		var _count = 0;
		var _makeExpRequest = function(){
			var time = groupedData[_count].key.getTime();
			records.getExpectedConsumptionForDay(config.clientName, config.stationName, time, 60).then(function(data){
				groupedData[_count].expected = data.content.expected;
				groupedData[_count].savings = groupedData[_count].expected - groupedData[_count].value;
				if(_count === 0){
					groupedData[_count].cumulative = groupedData[_count].savings;
				}else{
					groupedData[_count].cumulative = groupedData[_count-1].cumulative + groupedData[_count].savings;
				}
				_count += 1;
				if(_count < _length){
					_makeExpRequest();
				}
				else{
					_setCrossFilterData(groupedData);
					_allDone();
				}
			})
		};
		if(_count === 0 ){
			_makeExpRequest();
		}*/
		var _length = groupedData.length;
		var promises = [];
		for(var i=0;i<_length;i++){
			var time = groupedData[i].key.getTime();
			promises.push(records.getExpectedConsumptionForDay(config.stationName, time, 60));
		}
		$q.all(promises).then(function(data){
			for(var i=0;i<_length;i++){
				groupedData[i].expected = data[i].content.expected;
				groupedData[i].savings = groupedData[i].expected - groupedData[i].value;
				if(i === 0){
					groupedData[i].cumulative = groupedData[i].savings;
				}else{
					groupedData[i].cumulative = groupedData[i-1].cumulative + groupedData[i].savings;
				}
			}
			_setCrossFilterData(groupedData);
			_allDone();
		})
	};
	var _sumTimestampsDaily = function(energyData, config){
		
		var length = energyData.length;
		var allMeterConsumption = [];
		
		for(var i=0;i<length;i++){
			var data = energyData[i].data;
			if(!energyData[i].totalized){
				for(var key in data){
					if(key.toString() === "name"){continue;}
					var dailyTotal = 0;
					var differenceArray = [];
					var dailyHis = data[key];
					for(var key in dailyHis){
						//dailyHis[key];
						if(dailyHis[key] === 0){
							continue;
						}
						differenceArray.push(dailyHis[key]);
					}
					if(differenceArray.length < 2){continue;}
					dailyTotal = parseFloat(differenceArray[differenceArray.length -1]) - parseFloat(differenceArray[0]);
					if(dailyTotal < 0){continue;}
					var date = new Date(key);
					var keyDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
					allMeterConsumption.push({"date" : keyDate, "actual" : dailyTotal, "name" : data.name});
				}//end inner for
			}
			else{
				for(var key in data){
					if(key.toString() === "name"){continue;}
					var dailyTotal = 0;
					var dailyHis = data[key];
					for(var key in dailyHis){
						if(dailyHis[key] > 0 && dailyHis[key] < 1000){
							dailyTotal  += parseFloat(dailyHis[key]);
						}
					}
					var date = new Date(key);
					var keyDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
					allMeterConsumption.push({"date" : keyDate, "actual" : dailyTotal, "name" : data.name});
				}
			}
		}//end outer for
		
		allMeterConsumption.sort(function(a,b){
			return a.date - b.date;
		})
		//console.log(allMeterConsumption);
		/*_setHighDate(allMeterConsumption[0].date);
		_setLowDate(allMeterConsumption[allMeterConsumption.length-1].date);*/
		
		var crossMeters = crossfilter(allMeterConsumption);
		var meterDimension = crossMeters.dimension(function(d){
			return d3.time.day(d.date);
		});
		var meterGroup = meterDimension.group().reduceSum(function(d){
			if(isNaN(d.actual)===false){
				return d.actual;
			}
		})
		var groupedMeterConsumption = meterGroup.all();
		_addExpectedValues(groupedMeterConsumption, config);
	};

	servObj = {
			getCrossFilterData : _getCrossFilterData,
			setCrossFilterData : _setCrossFilterData,
			queryMeterNames : _queryMeterNames,
			getEnergyData : _getEnergyData,
			setLowDate : _setLowDate,
			setHighDate : _setHighDate,
			getLowDate : _getLowDate,
			getHighDate : _getHighDate,
			sumTimestampsDaily : _sumTimestampsDaily,
			addExpectedValues : _addExpectedValues,
			makeRedraw : _makeRedraw,
			setGoAway : _setGoAway
	}
	return servObj;
}])



.controller('energyProfileCtrl', ['$scope', 'energyProfileDataService', 'chartIdService',
                                  'configService', '$controller', 'BMSRecordsAPI', 'objectTools',
                                  '$timeout', 'facilitySelectorService','userPrefService',
                                  function($scope, energyProfileDataService, idService, awesome,
                                		   $controller, records, obTool, $timeout, select, userPrefService){
	$scope.id = idService.getNewId();
	$scope.rendered = false;
	$scope.editorDone = false;
	$scope.badRequest = false;
	
	/** angela replacing this *
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});
	
	angular.extend(thisController, awesome, superController);
	
	var defaultConfig = {
			"stationName" : "MRL",
			"clientName" : "Merck",
			"dateRange" : "last eight weeks",
			"actualColor" : "#FF0000",
			"expectedColor" : "#0000FF",
			"savingsColor" : "#008000",
			"cumColor" : "D3D3D3"
	}
	$scope.config = thisController.getConfig();
    for(var key in defaultConfig){
		 if($scope.config.hasOwnProperty(key) === false){
	  		$scope.config[key] = defaultConfig[key];
	  	}
	}
	/** end area angela is replacing **/
	
	
	/** angela's new section **/
	// Choose settings that this widget cares about
	var defaultConfig = {
			"stationName" : "HAUN",
			//"clientName" : "McDonalds",
			"dateRange" : "last six weeks",
			"actualColor" : "#FF0000",
			"expectedColor" : "#0000FF",
			"savingsColor" : "#008000",
			"cumColor" : "D3D3D3",
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
		//console.log('refresh configs');
		
		var myPrefs = userPrefService.getUserPrefs("energy-profile");
		for (var key in defaultConfig) {
			
			if (myPrefs[key] !== "" && myPrefs[key] !== undefined && myPrefs[key] !== null) {
				$scope.config[key] = myPrefs[key];
			} else {
				$scope.config[key] = defaultConfig[key];
			}
		}
		
		$scope.config.actualColor = "#FF0000";
		
		if($scope.config.stationName === "" || $scope.config.clientName === ""){return;}
		
		//$scope.badRequest = false;
		energyProfileDataService.queryMeterNames($scope.config);
		
	}
	/** end angela's new section **/
	
    var inEditor;
    var actualChart;
    var expectedChart;
    var savingsChart;
    var cumulativeChart;
    var crossFilterData;
    var months;
    var weeks;
    var days;
    var sliderScope;
    
   
    if(angular.element(document.getElementById("editorHere")).hasClass('xui-css-dockparent')){
		inEditor = true;
	}
	else{
		inEditor = false;
	}
   
    var reDimension = function(dim, daysBetween){
		if($scope.adjustedDimension !== undefined){
			$scope.adjustedDimension.remove();
		}
    	var adjustedDimension;
		var xUnits;
		var numberTicks;
		switch(dim){
			case dim = "month" : {
				adjustedDimension = crossFilterData.dimension(function(d){
					return d3.time.month(d.key);
				})
				xUnits = d3.time.months;
				numberTicks = Math.round(daysBetween/30);
				months = true;
				days = false;
				weeks = false;
				break;
			}
			case dim = "day" : {
				adjustedDimension = crossFilterData.dimension(function(d){
					return d3.time.day(d.key);
				})
				xUnits = d3.time.days;
				numberTicks = Math.round(daysBetween);
				months = false;
				weeks = false;
				days = true;
				break;
			}
			case dim = "week" : {
				adjustedDimension = crossFilterData.dimension(function(d){
					return d3.time.week(d.key);
				})
				xUnits = d3.time.weeks;
				numberTicks = Math.round(daysBetween/7);
				months = false;
				days = false;
				weeks = true;
				break;
			}
		}
		$scope.adjustedDimension = adjustedDimension;		
		var adjustedActualGroup  = adjustedDimension.group().reduceSum(function(d){
			return d.value;
		});
		var adjustedExpectedGroup = adjustedDimension.group().reduceSum(function(d){
			return d.expected;
		});
		var adjustedSavingsGroup = adjustedDimension.group().reduceSum(function(d){
			return d.savings;
		});
		actualChart
			.dimension(adjustedDimension)
			.group(adjustedActualGroup, "Actual Consumption");
		expectedChart
			.dimension(adjustedDimension)
			.group(adjustedExpectedGroup, "Expected Consumption");
		savingsChart
			.dimension(adjustedDimension)
			.group(adjustedSavingsGroup, "Savings/Waste")
			.barPadding(.75).render();
		$scope.energyProfile
			.xUnits(xUnits)
			.xAxis().ticks(numberTicks);		
	};
	var makeCompositeChart = function(){
		$scope.rendered = false;
		months = false;
		weeks = true;
		
		var xUnits = d3.time.weeks;
		if(energyProfileDataService.getHighDate()-energyProfileDataService.getLowDate() >= 182.5*24*3600*1000){
			months = true;
			weeks = false;
			xUnits = d3.time.months;
		}
		
		var chartData = energyProfileDataService.getCrossFilterData();
		crossFilterData = crossfilter(chartData);
		var actualDimension = crossFilterData.dimension(function(d){
			return months ? d3.time.month(d.key) : d3.time.week(d.key);
		});

		var savingsDimension = crossFilterData.dimension(function(d){
			return months ? d3.time.month(d.key) : d3.time.week(d.key);
		});
		var expectedDimension = crossFilterData.dimension(function(d){
			return months ? d3.time.month(d.key) : d3.time.week(d.key);
		});
		var cumulativeDimension = crossFilterData.dimension(function(d){
			return d3.time.day(d.key);
		});

		var end = cumulativeDimension.top(1)[0].key;
		var start = cumulativeDimension.bottom(1)[0].key;
		/*var end = energyProfileDataService.getHighDate();
		var start = energyProfileDataService.getLowDate();*/
		
		$scope.range = (start.getMonth()+ 1)+"/"+(start.getDate())+"/"+(start.getFullYear())+" to "+(end.getMonth()+ 1)+"/"+(end.getDate())+"/"+(end.getFullYear())
		var actualGroup = actualDimension.group().reduceSum(function(d){
			if(isNaN(d.value)===false){
				return d.value;
			}
		});
		var expectedGroup = expectedDimension.group().reduceSum(function(d){
			if(isNaN(d.expected)===false){
				return d.expected;
			}
		});
		var savingsGroup = savingsDimension.group().reduceSum(function(d){
			if(isNaN(d.savings)===false){
				return d.savings;
			}
		});
		var cumulativeGroup = cumulativeDimension.group().reduceSum(function(d){
			if(isNaN(d.cumulative)===false){
				return d.cumulative;
			}
		});

		var savingsSorted = savingsGroup.all().sort(function(a,b){
			return b.value-a.value;
		});

		var ticks = savingsSorted.length;
		var energyProfileName = "#energy_profile";
		$scope.energyProfile = dc.compositeChart(energyProfileName);
			
		actualChart = dc.lineChart($scope.energyProfile)
			.dimension(actualDimension)
			.group(actualGroup, "Actual Consumption")
			.renderDataPoints({radius:2, fillOpacity: 1, strokeOpacity: 1})
			.hidableStacks(false)
			.interpolate('cardinal')
			.tension(0.7)
			.colors($scope.config.actualColor)
			.title(function(d){
	        	var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
				
	       		var title;	 
	       			if(months){
	       				title = "Actual Consumption: "+d3.round(d.value, 2)+"\nDate: "+monthNames[d.key.getMonth()]+", "+d.key.getFullYear();
	       			} 
	       			else if(weeks){
	       				title = "Actual Consumption: "+d3.round(d.value, 2)+"\nWeek Of: "+monthNames[d.key.getMonth()]+" "+d.key.getDate()+", "+d.key.getFullYear();
	       			}
	       			else{
	       				title = "Actual Consumption: "+d3.round(d.value, 2)+"\nDate: "+monthNames[d.key.getMonth()]+" "+d.key.getDate()+", "+d.key.getFullYear();
	       			}
	       			return title;
	        });
			
		expectedChart = dc.lineChart($scope.energyProfile)
			.dimension(expectedDimension)
			.group(expectedGroup, "Expected Consumption")
			.renderDataPoints({radius:2, fillOpacity: 1, strokeOpacity: 1})
			.hidableStacks(false)
			.interpolate('cardinal')
			.tension(0.7)
			.colors($scope.config.expectedColor)
			.title(function(d){
	        	var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	        	var title;	 
       			if(months){
       				title = "Expected Consumption: "+d3.round(d.value, 2)+"\nDate: "+monthNames[d.key.getMonth()]+", "+d.key.getFullYear();
       			} 
       			else if(weeks){
       				title = "Expected Consumption: "+d3.round(d.value, 2)+"\nWeek Of: "+monthNames[d.key.getMonth()]+" "+d.key.getDate()+", "+d.key.getFullYear();
       			}
       			else{
       				title = "Expected Consumption: "+d3.round(d.value, 2)+"\nDate: "+monthNames[d.key.getMonth()]+" "+d.key.getDate()+", "+d.key.getFullYear();
       			}
       			return title;
	        });
		
		savingsChart = dc.barChart($scope.energyProfile)
			.dimension(savingsDimension)
			.group(savingsGroup, "Savings/Waste")
			.colors($scope.config.savingsColor)
			.centerBar(true)
			.useRightYAxis(true)
			.elasticY('10%')
			.yAxisPadding('10%')
			.barPadding(0.3)
	        .hidableStacks(false)
	        .alwaysUseRounding(true)
	        .title(function(d){
	        	var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	        	var title;	 
       			if(months){
       				title = "Savings/Waste: "+d3.round(d.value, 2)+"\nDate: "+monthNames[d.key.getMonth()]+", "+d.key.getFullYear();
       			} 
       			else if(weeks){
       				title = "Savings/Waste: "+d3.round(d.value, 2)+"\nWeek Of: "+monthNames[d.key.getMonth()]+" "+d.key.getDate()+", "+d.key.getFullYear();
       			}
       			else{
       				title = "Savings/Waste: "+d3.round(d.value, 2)+"\nDate: "+monthNames[d.key.getMonth()]+" "+d.key.getDate()+", "+d.key.getFullYear();
       			}
       			return title;
	        });
		
		cumulativeChart = dc.lineChart($scope.energyProfile)
			.dimension(cumulativeDimension)
			.group(cumulativeGroup, "Cumulative Savings/Waste")
			.colors($scope.config.cumColor)
			.renderArea(true)
			.title(function(d){
				var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
				return "Cumulative Savings/Waste: "+d3.round(d.value, 2)+"\nDay: "+monthNames[d.key.getMonth()]+" "+d.key.getDate()+", "+d.key.getFullYear();
			})
			.useRightYAxis(true)
			.elasticY('10%')
			.yAxisPadding('10%')
			.interpolate('cardinal')
			.tension(0.7)
			.hidableStacks(false)
			.renderDataPoints({radius:1, fillOpacity: 1, strokeOpacity: 1})
		
		$scope.energyProfile
			.height(400)
			.width(690)
			.legend(dc.legend().x(500).y(0))
			.margins({top: 80, left: 65, right: 80, bottom: 75})
			.x(d3.time.scale().domain([start, end]))
			.xUnits(xUnits)
			.elasticX(false)
			.yAxisPadding('10%')
			.transitionDuration(400)
			.elasticY(true)
			.shareTitle(false)
			.brushOn(false)
			.on('preRender', function(){
				if(!$scope.rendered){
					$scope.energyProfile
						.xAxis()
						.ticks(ticks);
						return;
				}
				if(angular.element($('date-slider-chart')) !== []){
					sliderScope = angular.element($('date-slider-chart')).inheritedData().$isolateScope;
				}else{return;}
				if(sliderScope.startTime !== undefined && sliderScope.endTime !== undefined){
					var days = (sliderScope.endTime - sliderScope.startTime)/(1000*3600*24);
					var dim = "month";
					if(days < 18){
						dim = "day";
					}
					else if(days < 182.5){
						dim = "week";
					}
					reDimension(dim, days);
				}
				else{
					$scope.energyProfile
						.xAxis()
						.ticks(ticks);
				}
			})
			.renderHorizontalGridLines(true)
			.renderVerticalGridLines(true)
			.xAxisLabel("Time")
			.yAxisLabel("Consumption")
			.rightYAxisLabel("Savings/Waste")
			.compose([cumulativeChart, savingsChart, actualChart, expectedChart]) 
			.renderlet(function(chart){
			//.on('renderlet', function(chart){
					chart.selectAll("g.x text")
						.attr('transform', "rotate(-80)")
						.attr('dx', '-10')
						.attr('dy', '-5')
						.style("text-anchor", "end")
					;
			 })
			.render();
		$scope.rendered = true;
		$scope.badRequest = false;
		energyProfileDataService.setGoAway(false);
	}
	/** this will all become obsolete ** this all worked better...
	$scope.$watch('config', function(nuOb, olOb){
		if(!inEditor){			
			if(obTool.isEqual(nuOb,olOb)){return;}
			if($scope.done){return;}
			
			$scope.props = [];
			
			for(var key in nuOb){
				if(nuOb[key] === olOb[key]){
					$scope.props.push(nuOb[key]);
				}
			}
			if($scope.props.length === 6){
				if(angular.element($('date-slider-chart')).length != 0){
					$scope.done = true;
				}
				$scope.rendered = false;
				energyProfileDataService.queryMeterNames($scope.config);
			}
		}
	}, true)*/
	$scope.$watch('config.dateRange', function(nuProp,olProp){
		if(nuProp == olProp){return;}
		if(inEditor && ($scope.rendered||$scope.badRequest)){
			$scope.rendered = false;
			$scope.badRequest = false;
			$scope.editorDone = false;
			energyProfileDataService.setGoAway(false);
			energyProfileDataService.queryMeterNames($scope.config);
		}
		
	}, false);
	$scope.$watch('config.stationName', function(nuProp,olProp){
		//if(nuProp == olProp){return;}
		if(inEditor && ($scope.rendered||$scope.badRequest)){
			$scope.rendered = false;
			$scope.badRequest = false;
			$scope.editorDone = false;
			energyProfileDataService.setGoAway(false);
			energyProfileDataService.queryMeterNames($scope.config);
		}
		
	}, false);
	/*$scope.$watch('config.clientName', function(nuProp,olProp){
		if(nuProp == olProp){return;}
		if(inEditor && ($scope.rendered||$scope.badRequest)){
			$scope.rendered = false;
			$scope.badRequest = false;
			energyProfileDataService.queryMeterNames($scope.config);
		}
		
	}, false);*/
	$scope.$watch('config.cumColor', function(nuProp,olProp){
		if(nuProp == olProp){return;}
		if($scope.rendered && inEditor){
			makeCompositeChart();
		}
	}, true);
	$scope.$watch('config.savingsColor', function(nuProp,olProp){
		if(nuProp == olProp){return;}
		if($scope.rendered && inEditor){
			makeCompositeChart();
		}
	}, true);
	$scope.$watch('config.actualColor', function(nuProp,olProp){
		if(nuProp == olProp){return;}
		if($scope.rendered && inEditor){
			makeCompositeChart();
		}
	}, true);
	$scope.$watch('config.expectedColor', function(nuProp,olProp){
		if(nuProp == olProp){return;}
		if($scope.rendered && inEditor){
			makeCompositeChart();
		}
	}, true);
	/** end section that will be obsolete */
	
	$scope.$on('energyProfileReady', function(){
		makeCompositeChart();
	})
	$scope.$on('redrawEnergyProfile', function(){
		$scope.rendered = false;
		energyProfileDataService.queryMeterNames($scope.config);
	})
	$scope.$on('energyProfileBadRequest', function(){
		var forceThis = function(){$scope.$apply();}
		$scope.badRequest = true;
		$scope.rendered = false;
		$timeout(forceThis,0);
	})
	
	/** angela new 
	 * no good**/
		/*$scope.$watch('config', function(){
			refreshConfigs();
		}, true);*/
	
	/** this could be used if the widget supported organization-wide
	$(window).bind("storage", function(e, changeType) {
		console.log("HERE LOOK!");
		if (changeType == "organization") {
			currentConfig.stationName = null;
			currentConfig.organizationName = sessionStorage.getItem("organization");
			console.log(currentConfig);
			energyProfileDataService.queryMeterNames(currentConfig);
		} else {
			refreshConfigs();
		}
	});*/

	$scope.$on('userPrefsChanged',function(){
		var changedConfig = userPrefService.getUserPrefs('energy-profile');
		var refresh = false;
		for(var key in changedConfig){
			if($scope.config[key] !== changedConfig[key]){
				if(key === "stationName"){
					//console.log(key, 'changed, should request');
					refresh = true;
				}
			}
		}
		if(refresh){
			energyProfileDataService.setGoAway(false);
			$scope.rendered = false;
			$scope.badRequest = false;
			refreshConfigs();
		}
		
	});
	/** end angela new **/

	if($scope.editorDone === false){
		refreshConfigs();
	}
	
}])

.controller('energyProfileModalOpener', ['$scope', '$controller', '$modal', 'configService', 'energyProfileDataService', function($scope, $controller, $modal, awesome, energyProfileDataService){
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});
		
	angular.extend(thisController, awesome, superController);
	
  	$scope.config = thisController.getConfig();  	
	
  	$scope.openConfiguration = function(){
  		if(angular.element(document.getElementById("editorHere")).hasClass("xui-css-dockparent")){return;}
		var modalInstance = $modal.open({
            templateUrl: 'icWidgets/energyProfileModal.html',
            controller: 'energyProfileConfigCtrl',
			resolve: {
				config: function(){
					return $scope.config;
				}
			}
        });
		
		modalInstance.result.then(function(config){
			thisController.setConfig(config);
			energyProfileDataService.makeRedraw();
		})
  	};
}])

.controller('energyProfileConfigCtrl', ['config', '$modalInstance', '$scope', function(config, $modalInstance, $scope){

	$scope.dateRange = config.dateRange;
	$scope.ok = function(){
		$modalInstance.close(config);
	};
	$scope.cancel = function(){
		$modalInstance.dismiss();
	};
	$scope.setRange = function(range){
		$scope.dateRange = range;
		config.dateRange = range;
	}
}])
