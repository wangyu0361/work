'use strict';

angular.module('icDash.eventPage', ['ui.router'])

/**angular.module('myApp.eventPage', ['ngRoute', 'myApp.multiAxisChart', 'ui.grid', 'ui.grid.edit', 'ui.grid.autoResize', 'ui.grid.exporter', 'ui.grid.selection','myApp.dashboard',
'myApp.pciService', 'myApp.ticketImpulse', 'ui.bootstrap', 'myApp.panelComponent', 'myApp.popout', 'myApp.dateSlider', 'myApp.facilitySelector', 'myApp.cleaningService','myApp.pciAccordion'])
**
  .run(['directiveService', function(directiveService){
	directiveService.addFullComponent({
		tag: function(){return 'event-page';},
		configTag: function(){return 'event-config';},
		tagHtml: function(){return "<event-page></event-page>";},
		directiveName: function(){return 'eventPage';},
		namespace: function(){return 'eventPg'},
		heading: function(){return 'event-page-name';},
		paletteImage: function(){return 'report.png';}
		});
  }])**/
  .directive('eventPageName', [function(){
	return{
		template: "Event Page"
	};
}])
  .directive('eventPage', [function(){
	  return{
		  restrict:'E',
		  templateUrl : 'icWidgets/eventPage.html',
	  }
  }])
  /** angela removed things **
  .controller('eventPageCtrl',['$scope','$http','$location','$window','$controller','$timeout','eventPageService','chartIdService', 'configService','objectTools','cleaningService','accordionService','BMSRecordsAPI','AssetsAPI','userPrefService',"SkySparkAPI",
     function($scope, $http, $location, $window, $controller,$timeout, epServ,chartIdService, configService,objectTools,cleaningService,accordionService,BMSRecordsAPI,AssetsAPI, userPrefService,SkySparkAPI) {
**/
	 
.controller('eventPageCtrl',['$scope','$http','$location','$window','$controller','$timeout','eventPageService','chartIdService', 'configService','objectTools','cleaningService','BMSRecordsAPI','AssetsAPI','userPrefService',"SkySparkAPI",
     function($scope, $http, $location, $window, $controller,$timeout, epServ,chartIdService, configService,objectTools,cleaningService,BMSRecordsAPI,AssetsAPI, userPrefService,SkySparkAPI) {

	 
		/** angela's new section **/
			// Choose settings that this widget cares about
	    var ssDateFormat = d3.time.format("%Y-%m-%d");

	    var defaultStart = ssDateFormat(new Date(+new Date() - 2*2678400000));
	    var defaultEnd = ssDateFormat(new Date());
	    var dataStart = +(new Date(defaultStart));
	    var dataEnd = +(new Date(defaultEnd));

		var defaultConfig = {
				"workOrderNumber" : "",
				"stationName" : "",
				"anomalyType" : "",
				"assetName" : "",
				"chartStart" : defaultStart,
				"chartEnd" : defaultEnd,
				"axis" : [],
				"allPoints" : []
		}
		var currentConfig = defaultConfig;
		var lastConfig = angular.extend({},defaultConfig);
		
		var thisController = this;
		var superController = $controller('baseWidgetCtrl', {
			"$scope" : $scope
		});

		angular.extend(thisController, configService, superController,BMSRecordsAPI,AssetsAPI,SkySparkAPI);
		$scope.config = thisController.getConfig();
		// End choose settings that this widget cares about
		
		var refreshConfigs = function() {
			console.log("EVENT PAGE updating!");
			
			currentConfig = thisController.getConfig();
			
			var myPrefs = userPrefService.getUserPrefs("event-page");
			
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
			thisController.setConfig(currentConfig);
			
			if(lastConfig.stationName !== currentConfig.stationName || lastConfig.assetName !== currentConfig.assetName || lastConfig.anomalyType !== currentConfig.anomalyType){
				lastConfig = angular.extend({},currentConfig);
				$scope.allPointValues = [];
				$scope.dataStart = +(new Date(defaultStart));
				$scope.dataEnd = +(new Date(defaultEnd));
				getAllMyTickets();
			}else if(+(new Date(currentConfig.chartStart)) < dataStart || +(new Date(currentConfig.chartEnd)) > dataEnd){
				getAllMyTickets();
			}else if((+(new Date(currentConfig.chartStart)) > dataStart && +(new Date(currentConfig.chartStart < dataEnd))) || (+(new Date(currentConfig.chartEnd)) > dataStart && +(new Date(currentConfig.chartEnd)) < dataEnd)){
				createSubCharts($scope.allPointValues)
			}
		}
		/** end angela's new section **/
	

	  	 
	  	$scope.downloadChart = function(){
	  		 var html = $scope.chartInstance.svg().node().parentNode.innerHTML;
	  		 
	  		 var imgsrc = 'data:image/svg+xml;base64,'+btoa(html);
	  		 var img = '<img src="'+imgsrc+'">';
	  		 
	  		 var win = $window.open('#/eventPage');
	  		 
	  		 for(var i = 0; i < win.d3.select('body').node().childNodes.length; i++){
	  			 if(win.d3.select('body').node().childNodes[i].nodeName === "BODY"){
	  				 win.d3.select('body').node().childNodes[i].remove();
	  			 }
	  		 }
	  		 
	  		 win.d3.select('body').node();
	  	 }
	  	 
	  	 $scope.onDashboard = !($location.$$path == "/eventPage");			// determine if on the dashboard
	  	 
		 var eventHeader = {'Collection':'events'};
		 var contentHeader = {'Content-Type':'application/json'};
		 var allMyPoints = [];
		 var lastDaysBetween;
		 var myDim;
		 var activeTix = [];
		 var monthDim,
	 	 	 dayDim,
	 	 	 hourDim,
	 	 	 weekDim,
	 	 	 minuteDim
	 	 ;
		 
		 $scope.engage = true;												// display the charts and grids
		 $scope.doMyGraphing = false;			 							// set the loading icon
		 $scope.mySum = [];													// blank anomaly summary
		 $scope.fancyName = function(name){return cleaningService.campusFullName(name)};
				 		 
		 $scope.dcName = chartIdService.getNewId(); 
		 
		 function launchError(errorText){
			 $scope.errorCode = errorText;
			 $scope.doMyGraphing = null;
		 }
		 
		 function getAllMyTickets(){										// queries for all of the identical tickets for the work order summary
			 thisController.getEventsByDate($scope.config.stationName,$scope.config.chartStart,null,null).then(
				 function(success){
					 $scope.allMyTickets = success;
					 if (success.length === 0){$scope.doMyGraphing === null;return;}
					 getInfoFromTickets();
				 },
				 function(error){ 
					 $scope.doMyGraphing = null;
				 }
			 )
		 }
		 
		 function getInfoFromTickets(){											// take the required information from the tickets to make the window overlap and anomaly summary
			 var activeLine = function(tickets){	// gets the information necessary to create the bar chart
					var _array = [];
					
					var getBar = function(entry){						
						var start = new Date(entry.createdTime.substring(0,entry.createdTime.indexOf(" "))) 
					    	
						var end = entry.closureTime === "" ? new Date() : new Date(entry.closureTime.substring(0,entry.createdTime.indexOf(" ")));
						
						var time = new Date(((+start)+(+end))/2);
						var days = getDaysBetween(start,end);
						
						var timeObj = {
								 "time":time,
								 "start":start,
								 "end":end,
								 "ticket":entry
							   } 
						
						console.log(timeObj);
						
						return timeObj;
					}

					for(var i = 0; i < tickets.length; i++){
						_array.push(getBar(tickets[i]));
					}
					
					return _array;
			}
			
			activeTix = activeLine($scope.allMyTickets);
			var first = new Date(),
				last = new Date(0),
				anomaly = null,
				saved = undefined,
				wasted = undefined
			;
			
			for(var i = 0; i < $scope.allMyTickets.length; i++){	// calculate the anomaly summary start/last ticket
				var _item = $scope.allMyTickets[i];
				//saved += +_item.potentialSaving;
				//wasted += +_item.waste;
				
				var _itemCreatedDate = new Date(_item.createdTime);
				
				if(anomaly == null){
					anomaly = _item.signature;
				}
				
				if(+first > +_itemCreatedDate){
					first = _itemCreatedDate;
				}
				
				if(+last < +_itemCreatedDate){
					last = _itemCreatedDate;
				}
			}
			
			//saved = Math.round(saved*100)/100;
			//wasted = Math.round(wasted*100)/100;
			
			if(last === new Date(0)){
				first = "Not In Range";
				last = "Not In Range";
			}
			
			$scope.mySum[0] = {
							   'anomaly':anomaly,
							   'firstDate':first,
							   'lastDate':last,
							   'total':$scope.allMyTickets.length,
							   'totalSaved':saved,
							   'totalWaste':wasted
							  };
			
			
			// receive point list from the database object
			getAllMyPoints();		// move on automatically, because there is no config.allPoints change to trigger the watch
		 }
		 
		 function badPointCheck(point){
			 return (point === undefined || point === null) ? true : false;
		 }
				 
		 function getAllMyPoints(){					//queries for all points in the config.allPoints
			 $scope.doMyGraphing = false;
			 var done = 0;
			 
			 var reformatAPIPoints = function(_pointName,_points,max){
				 for(var dateKey in _points){
					 for(var timeKey in _points[dateKey]){
						 var value = _points[dateKey][timeKey];
						 if(_points[dateKey][timeKey] === "true" || _points[dateKey][timeKey] === true){value = 1;}
						 else if(_points[dateKey][timeKey] === "false" || _points[dateKey][timeKey] === false){value = 0;}
								 
						 var temp = {
								"pointName":_pointName,
								"timestamp":timeKey,
								"value" : +value
						 }
						 $scope.allPointValues.push(temp);
					 }
				 }
				 
				 done++;
				 $scope.doMyGraphing = true;
				 if(done === max){
					 createSubCharts($scope.allPointValues);
				 }
			 }
			 
			 var addAPIPointsToArray = function(_point,max){
				 thisController.groupRecordsDailyForHistoryId(_point.historyId,+(new Date($scope.config.chartStart)),+(new Date($scope.config.chartEnd))).then(
					function(points){
						reformatAPIPoints(_point.pointName,points,max);
					},
					function(error){reformatAPIPoints(_point.pointName,[],max);}
				 )
				 
			 }
			 console.log(currentConfig.stationName, currentConfig.assetName);
			 thisController.findAssetByName(currentConfig.stationName,currentConfig.assetName).then( // find all points which belong to an asset
				function(dbAsset){
					if(dataStart < +(new Date(currentConfig.chartStart))){dataStart = +(new Date(currentConfig.chartStart))}
					if(dataEnd < +(new Date(currentConfig.chartEnd))){dataEnd = +(new Date(currentConfig.chartEnd))}
					$scope.config.allPoints = dbAsset.points.slice(0);
					currentConfig.allPoints = dbAsset.points.slice(0);
					console.log(currentConfig);
					for(var i = 0; i < dbAsset.points.length; i++){
						addAPIPointsToArray(dbAsset.points[i],dbAsset.points.length);
					}
				},
				function(error){console.log("can't get point asset data",error);$scope.doMyGraphing = null;}
			 )
		 }
		 
		 function getDaysBetween(start, end){
		    	return (new Date(end) - new Date(start))/(1000*60*60*24);
		 }
		 		 
		 var customTimeFormat = d3.time.format.multi([	// calendar x scale format
                  [".%L", function(d) { return d.getMilliseconds(); }],
                  [":%S", function(d) { return d.getSeconds(); }],
                  ["%I:%M", function(d) { return d.getMinutes(); }],
                  ["%I:%M %p", function(d) { return d.getHours(); }],
                  ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
                  ["%b %d", function(d) { return d.getDate() != 1; }],
                  ["%b '%y", function(d) { return d.getMonth(); }],
                  ["%Y", function() { return true; }]
                ]);

		 function getMySettings(_daysBetween_){	// handles the rollup based on viewable window
			 var _array = [];
			 var _dim;
			 var _units;
			 
			 if(_daysBetween_ >= 365){
				 _dim = monthDim
				 _units = d3.time.months;
			 }else if(_daysBetween_ >= 180){
				 _dim = weekDim; 
				 _units = d3.time.weeks;
			 }else if(_daysBetween_ >= 7){
				 _dim = dayDim;
				 _units = d3.time.days;
			 }else if(_daysBetween_ >= 1){
				 _dim = hourDim;
				 _units = d3.time.hours;
			 }else{
				 _dim = minuteDim
				 _units = d3.time.minutes;
			 }
			 			 
			 _array[0] = _dim;
			 _array[1] = _units;
			 
			 return _array;
		 }
		 
		 function createSubCharts(_array){		 // graph the points
			 if(_array.length === 0 && activeTix.length === 0){$scope.doMyGraphing = null;}
			 var _ndx = crossfilter(_array);
			 var _ndxTix = crossfilter(activeTix);			 
			 monthDim = _ndx.dimension(function(d){return d3.time.month(new Date(d.timestamp));});
			 weekDim = _ndx.dimension(function(d){return d3.time.week(new Date(d.timestamp));});
			 dayDim = _ndx.dimension(function(d){return d3.time.day(new Date(d.timestamp));});
			 hourDim = _ndx.dimension(function(d){return d3.time.hour(new Date(d.timestamp));});
			 minuteDim = _ndx.dimension(function(d){return d3.time.minute(new Date(d.timestamp));});
			 var ticketDim = _ndxTix.dimension(function(d){return new Date(d.time);});

			 // if the config.chartStart/End are not defined, define them using the existing data
			 currentConfig.chartStart = currentConfig.chartStart !== "" ? currentConfig.chartStart : new Date(dayDim.bottom(1)[0].timestamp); // fix this;
			 currentConfig.chartEnd = currentConfig.chartEnd !== "" ? currentConfig.chartEnd : new Date(dayDim.top(1)[0].timestamp);
			 
			 currentConfig.chartStart = typeof(currentConfig.chartStart) === "string" ? new Date(currentConfig.chartStart) : currentConfig.chartStart;
			 currentConfig.chartEnd = typeof(currentConfig.chartEnd) === "string" ? new Date(currentConfig.chartEnd) : currentConfig.chartEnd;

			 var myDomain = d3.time.scale().domain([currentConfig.chartStart, currentConfig.chartEnd]);
			 
			 var _daysBetween = getDaysBetween(currentConfig.chartStart, currentConfig.chartEnd);
			 
			 lastDaysBetween = _daysBetween;

			 var _mySettings = getMySettings(_daysBetween); 
			 myDim = _mySettings[0];
			 var _myXUnits = _mySettings[1];
			 
			 var _origDim = myDim;
			 
			 var createTicketChart = function(){ // reduces everything to zero so there is a legend item, but nothing displays
				 var _group = ticketDim.group().reduce(
						 function(p,v){return 0;},
						 function(p,v){	return 0; },
						 function(){return 0;}
				 )
				 var varChart = dc.barChart($scope.chartInstance)
					 .dimension(ticketDim)
					 .group(_group,"Tickets")
					 .hidableStacks(false)
					 .centerBar(true)
				 ;

				 return varChart;
			 }
			 			 			 
			 var createCharts = function(myFilter){ // creates the line sub-charts
				var _group = myDim.group().reduce(
					function(p,v){
						if(v.pointName === myFilter){
							var value = function(d){
								if(d.value === true || d.value === "true"){return 1;}
								else if(d.value === false || d.value === "false"){return 0;}
								else{return +Math.round(+d.value);}
							}(v);
	
							++p.count;
							p.sum += value;
							p.avg = (+p.sum)/(+p.count);
						}
						
						return p;
					},
					function(p,v){
						if(v.pointName === myFilter){
							var value = function(d){
								if(d.value === true || d.value === "true"){return 1;}
								else if(d.value === false || d.value === "false"){return 0;}
								else{return +Math.round(+d.value);}
							}(v);
	
							--p.count;
							p.sum -= value;
							p.avg = (p.count == 0) ? 0 : (+p.sum)/(+p.count);
						}
						
						return p;
					},
					function(){
						return {
							sum:0,
							count:0,
							avg:0
						}
					}
				);
				
				if($scope.barHeight < _group.top(1)[0].value){
					$scope.barHeight = _group.top(1)[0].value;
				}
				
				var lineChart = dc.lineChart($scope.chartInstance)
				     .dimension(myDim)
				     .group(_group,myFilter)
				     .defined(function(d){return isNaN(d.data.value)==false;})
				     .hidableStacks(false)
				     .defined(function(d){return isNaN(d.data.value.avg)==false;})
   				     .valueAccessor(function(p){return p.value.avg;})

				 ;

				return lineChart;
			 };
			 
			 var compositeCharts = [];
			 compositeCharts[0] = createTicketChart();
			 for(var i = 0; i < currentConfig.allPoints.length; i++){
				 compositeCharts[i+1] = createCharts(currentConfig.allPoints[i].pointName);
			 }
			 
			 $scope.subCharts = compositeCharts;
		 } 
		 
		 function calculateMyPoints(){ // used to filter out the myPoints data which displays on the bottom ui-grid
			 $scope.myPoints = [];
			 var childCharts = $scope.chartInstance.children();
			 
			 var getVal = function(val){
				 return {
					 "pointName": val.layer,
					 "timestamp":pageFormat(val.x),
					 "value":d3.round(val.y,2)
				 }
			 }
			 
			 for(var i = 0; i < childCharts.length; i++){
				 var chart = childCharts[i].data()[0];
				 if(chart.name === "Tickets"){
					continue;
				 }
				 var vals = chart.values;

				 for(var j = 0; j < vals.length; j++){
					 var point = getVal(vals[j]);
					 if(isNaN(point.value) === false){
						$scope.myPoints.push(point); 
					 }
				 }
			 }
		 }
		 
		 function pageFormat(date){	// format function to allow the html to format the date
			 var form = d3.time.format("%c");
			 return date === "" ? "" : form(date);
		 }
		 
		 $scope.formattedChartStart = pageFormat(new Date(currentConfig.chartStart));
		 $scope.formattedChartEnd = pageFormat(new Date(currentConfig.chartEnd));
		 
		 function createTicketWindows(){
			 var chart = $scope.chartInstance;

			 var xStart = chart.margins().left;
			 var xEnd = chart.width() - chart.margins().right;
			 
			 var startDate = +new Date(currentConfig.chartStart);
			 var endDate = +new Date(currentConfig.chartEnd);
			 var svg = $scope.chartInstance.svg();
			 
			 var calculateX = function(ticketTime){
				 var timeScale = endDate - startDate;
				 var pixelScale = xEnd - xStart;
				 
				 var length = ticketTime - startDate;
				 return (length/timeScale)*pixelScale+xStart;
			 }
			 
			 var doStuff = function(i){
				 var ticket = activeTix[i];
				 var start,
				 	 width,
				 	 top = 10,
				 	 height = 260
				 ;

				 if(ticket.node !== undefined){
					 ticket.toolTip.remove();
					 ticket.node.remove();
				 }
				 
				 if($scope.chartInstance.legendables()[0].hidden == true){
					 return;
				 }
				 
				 var ticketStart = +(new Date(ticket.start));
				 var ticketEnd = +(new Date(ticket.end));
				 
				 //draw conditions:
				 /*
				  * (1)  start is before start and end is after end of window 
				  * (2)  start is within window, end is after end of window
				  * (3)  start is before start, end is within window
				  * (4)  start and end are within the window
				  */
				 
				 if(startDate <= ticketStart && ticketStart <= endDate){ 
					 var start = calculateX(+ticketStart);
					 var end = ticketEnd < endDate && startDate < ticketEnd ? calculateX(ticketEnd): xEnd;	// (4):(2)

					 width = end - start;
				 }else if(ticketStart < startDate && startDate < ticketEnd){
					 var start = xStart;
					 var end = ticketEnd < endDate ? calculateX(ticketEnd) : xEnd							// (3):(1)
					 
					 width = end-start;
				 }
				 
				 if(start !== undefined){
					 var rect = svg.append("rect")
		 				.attr("x",start)
		 				.attr("y",top)
		 				.attr("width",width)
		 				.attr("height",height)
		 				.attr("fill","rgba(31,119,180,0.1)")	// matches the default color used by the composite graph for the tickets
		 			  ;
		 			 var toolTip = rect.append("svg:title")
		 				  .text(function(){
		 					  var myString = "";
		 					  
		 					  for(var key in ticket.ticket){
		 						  myString += key +": " + ticket.ticket[key] + "\n";
		 					  }
		 					  
		 					  return myString;
		 				  })
		 			 ;
		 			 activeTix[i]["node"] = rect;
		 			activeTix[i]["toolTip"] = toolTip;
				 }
			 }

			 for(var i = 0; i < activeTix.length; i++){
				 doStuff(i);
			 }
		 }
		 
		 /** angela new **/
		$scope.$watch('config', function(){
			refreshConfigs();
		}, true);
		$scope.$on('userPrefsChanged',function(){
			refreshConfigs();
		});
		/** end angela new **/
		 		 
		 $scope.$on('chartFinished',function(event,val){
			 if(val[0] === true){
				 $scope.config = currentConfig;
				 $scope.chartInstance = val[1];
				 $scope.chartFinished = true;
				 createTicketWindows();
				 calculateMyPoints();
				 $scope.$broadcast("redraw");
			 }else{
				 $scope.chartFinished = false;
			 }
		 })


		 $scope.anomalySummary = {		// anomaly summary ui-grid object
					 enableSorting:false,
					 enableFiltering:false,
					 multiSelect:false,
					 data:"mySum",
					 rowTemplate: '<div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
					 columnDefs : [
					               {field:'anomaly', displayName: "Anomaly Type"},
					               {field:'firstDate', displayName:"First Instance"},
					               {field:'lastDate', displayName: "Most Recent Instance"},
					               {field:'total', displayName:"# of Occurences"},
					               {field:'totalSaved', displayName: "Total Potential Savings"},
					               {field:'totalWaste', displayName: "Total Waste"}
					              ]
		 };

		 $scope.pointData = {		// filtered point data ui-grid object
				 enableSorting:true,
				 enableFiltering:true,
				 enableRowHeaderSelection: false,
				 multiSelect: false,
				 enableSelectAll: true,
				 data:"myPoints",
				 exporterLinkLabel: 'download csv',
				 rowTemplate: '<div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
				 columnDefs : [{
					 		   field:'pointName', displayName:'Point Name',
				            	   filter : {
				            		   noTerm: false,
				            		   condition:function(searchTerm, cellValue){
				            			   return cellValue==searchTerm;
				            		   },
				            	   }
				               },
				               {field:'timestamp', displayName:"Date"},
				               {field:'value',displayName:'Value'}
				              ],
				 enableGridMenu:true,
				 exporterMenuPdf:false,
				 exporterCsvFilename: 'download.csv',
				 exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
		 };

		 refreshConfigs();
		 
  }])
  .directive('eventConfig',[function(){
	  return{
		  restrict:'E',
		  templateUrl: 'icWidgets/eventPageConfig.html'
	  }
  }])
  .controller('eventPageConfigCtrl',['$scope','$modal','configService','$controller',function($scope,$modal,awesome,$controller){	  
	    var thisController = this;
		var superController = $controller('baseWidgetCtrl', { 
			"$scope" : $scope
		});
		
		angular.extend(thisController, awesome, superController); // inject row/column onto scope
		
	  	$scope.config = thisController.getConfig();
	  		  		  		  	
	  	$scope.openSettings = function(){
	  		var instance = $modal.open({
	  			templateUrl:'eventPageModal.html',
	  			controller:'eventPageModalInstanceCtrl',
	  			resolve:{
	  				defaults : function(){
	  					return $scope.config;
	  				},
	  			}
	  		});
		  
	  		instance.result.then(
	  				function(config){
		  				if(+(new Date($scope.config.chartStart)) !== +(new Date(config.chartStart)) || +(new Date($scope.config.chartEnd)) !== +(new Date(config.chartEnd))){
		  					if(+(new Date($scope.config.chartStart)) > +(new Date(config.chartStart)) || +(new Date($scope.config.chartEnd)) < +(new Date(config.chartEnd))){
		  						config = angular.extend(config,{special:"newData"})
		  					}
		  					else{
		  						config = angular.extend(config,{special:"newWindow"})
		  					}
		  					thisController.setConfig(config);
		  				}else{
		  					thisController.setConfig(config); // TODO actually figure out how to change the configuration in a way that it will get caught and compared
		  				}
	  				},
	  				function(error){
	  					console.log("settings error",error)
	  				}
	  		);
	  	}
  }])
  .controller('eventPageModalInstanceCtrl',['$scope','$modal','$modalInstance', 'defaults','userPrefService',
       function($scope,$modal,$modalInstance,defaults,userPrefService){
	  		var ssDateFormat = d3.time.format("%Y-%m-%d");
	  		var myPrefs = userPrefService.getUserPrefs("event-page");

	  		$scope.workOrderNumber = defaults.workOrderNumber;
	  		$scope.startDate = ssDateFormat(new Date(defaults.chartStart));
	  		$scope.endDate = ssDateFormat(new Date(defaults.chartEnd));
	  		$scope.storedAxis = defaults.axis.slice(0); // take a copy and not modify the original array
	  		$scope.pointsUsed = defaults.allPoints.slice(0);
	  			  	  
	  		$scope.newCollapsed = true;
	  		$scope.editCollapsed = true;
	  		$scope.autoAxis = true;
	  		$scope.titleText = "";
	  		$scope.titleUnits = true;
	  		$scope.selectedAxis = undefined;
	  	  
	  		function removeHash(point){	//	objects read from the HTML have a hashkey for some reason
	  			if(point.hasOwnProperty('$$hashKey')){
	  				delete point.$$hashKey;
	  			}
	  			for(var key in point){
	  				if(typeof(point[key]) === 'object'){
	  					removeHash(point[key]);
	  				}
	  			}
	  		}
	  		
	  		$scope.ok = function(){
	  			var config = {	// supply config object
  		  				"workOrderNumber":$scope.workOrderNumber,
  		  				"chartStart":$scope.startDate,
  		  				"chartEnd":$scope.endDate,
  		  				"axis":$scope.storedAxis,
  						"allPoints":$scope.pointsUsed
	  			}
	  			removeHash(config);
	  			$modalInstance.close(config);
	  		}
	  		
	  		$scope.removeAxis = function(){
	  			for(var i = 0; i < $scope.storedAxis.length; i++){
					if($scope.storedAxis[i].label === $scope.titleText){
						$scope.storedAxis.splice(i,1);
					}
				}
	  			
	  			$scope.newCollapsed = true;
	  			$scope.editCollapsed = true;
	  		}
	  
	  		$scope.addAxis = function(){	// deal with adding/removing points and adding/editing axis
				var pointList = d3.selectAll("#axisPointList")[0];
				var somethingTrue = false;
		  		
				var pointsOnAxis = [];	  
				
				for(var i = 0; i < $scope.storedAxis.length; i++){
					if($scope.storedAxis[i].label === $scope.titleText){
						$scope.storedAxis.splice(i,1);
					}
				}
		  		
				for(var i = 0; i < pointList.length; i++){
					 if(pointList[i].checked==true){
						 pointsOnAxis.push(pointList[i].value);
						 removePointFromPreviousAxis(pointList[i].value);
						 somethingTrue = true;
					 }
				}
				
				if(somethingTrue === false){
					alert("No Points Selected!");
					return;
				}
				
				var label = $scope.titleText == "" ? "Axis "+($scope.storedAxis.length+1) : $scope.titleText;			
								 
				var high = $scope.autoAxis === true ? // should axis upper and lower limits be determined by data?
						undefined 
						: 
						function(){
							if($scope.domainHigh === ""){
								alert("Select an upper bound for the axis");
								return;
							}
							return $scope.domainHigh;
						}()
				;
						
				var low = $scope.autoAxis === true ? 
						undefined
						:
						function(){
							if($scope.domainLow === ""){
								alert("Select a lower bound for the axis");
								return
							}
							return $scope.domainLow;
						}()
				;
				
				var axis = {							// axis model object
						 "label":label,
						 "units":$scope.titleUnits,
						 "pointsOnAxis":pointsOnAxis,
						 "autoAxis":$scope.autoAxis,
						 "domainHigh":high,
						 "domainLow":low,
		  		}
				
				$scope.storedAxis.push(axis);
				$scope.newCollapsed = true;
				$scope.editCollapsed = true;
	  		}
	  		
	  		function removePointFromPreviousAxis(pointName){
	  			for(var i = 0; i < $scope.storedAxis.length; i++){
	  				var points = $scope.storedAxis[i].pointsOnAxis;
	  				
	  				for(var j = 0; j < points.length; j++){
	  					if(points[j] === pointName){
	  						if(points.length === 1){
	  							$scope.storedAxis.splice(i,1);
	  							return;
	  						}
	  						points.splice(j,1);
	  					}
	  				}
	  			}
	  		}	  		
	  
	  		$scope.cancel = function(){
	  			$modalInstance.dismiss('cancel');
	  		}
	  	  
	  		$scope.showNewAxis = function(){
	  			if($scope.newCollapsed === true){ 			// if the new axis menu is closed
	  				if($scope.editCollapsed === false){		// if the edit collapsed menu is open
	  					$scope.editCollapsed = true;			// close it
	  				}
	  				$scope.newCollapsed = false;			// open the new axis menu
	  			}else{										
	  				if($scope.editCollapsed === false){		// if the new axis menu is closed, because edit is opened and no axis is selected
	  					$scope.editCollapsed = true;			// close the edit menu
	  					$scope.selectedAxis = undefined;		// reset the selectedAxis parameter
	  				}else{
	  					$scope.newCollapsed = true;			// otherwise edit menu is closed, so close the new menu
	  				}
	  			}
	  		}
		
	  		$scope.showEditAxis = function(){
	  			if($scope.editCollapsed === true){	// if the edit axis menu is closed, open it and the new axis menu
	  				$scope.editCollapsed = false;
	  			}else{								// if the edit axis menu is open, close it and the new axis menu
	  				$scope.editCollapsed = true;
	  				$scope.selectedAxis = undefined;
	  			}
	  			$scope.newCollapsed = true;
	  		}

	  		$scope.toggleDropdown = function($event) {
	  			$event.preventDefault();
	  			$event.stopPropagation();
	  			$scope.status.isopen = !$scope.status.isopen;
	  		};
		 
	  		$scope.populateSettings = function(axis){	// populate inputs with information from a selected axis for editing
	  			$scope.titleText = axis.label;
	  			$scope.titleUnit = axis.units;
	  			$scope.selectedAxis = axis;
	  			$scope.newCollapsed = false;
	  			
				var pointList = d3.selectAll("#axisPointList")[0];

	  			for(var i = 0; i < axis.pointsOnAxis.length; i++){
	  				var point = axis.pointsOnAxis[i];
	  				for(var j = 0; j < pointList.length; j++){
	  					if(pointList[j].value === point){
	  						pointList[j].checked = true;
	  					}
	  				}
	  			}
	  		}
	  		
	  		$scope.openPointSelect = function(){	// open a new modal responsible for editing points on the chart
		  		var instance = $modal.open({
		  			templateUrl:'pointAdd.html',
		  			controller:'pointAddCtrl',
		  			resolve:{
		  				points : function(){
		  					return $scope.pointsUsed;
		  				},
		  			}
		  		});
			  
		  		instance.result.then(
		  				function(pointList){
		  					$scope.pointsUsed = pointList;
		  				},
		  				function(error){
		  					console.log("error receiving points used",error);
		  				}
		  		);
		  	}
  		}
  ])
  .controller('pointAddCtrl',['$scope','$modalInstance','$http','points','objectTools',function($scope,$modalInstance,$http,points,objectTools){
	  $scope.currentPoints = points;

	  $scope.ok = function(){		  
		  var selectedPoints = $scope.gridApi.selection.getSelectedRows();	// add any user selected rows
		  
		  var realSelectedPoints = [];
		  
		  var getObject = function(row){
			  return {
				  "asset":row.asset,
				  "pointName":row.pointName,
				  "stationName":row.stationName
			  }
		  }
		  
		  for(var i = 0; i < selectedPoints.length; i++){
			  realSelectedPoints.push(getObject(selectedPoints[i]));
		  }
		  
		  var contains = function(array,object){
			  for(var i = 0; i < array.length; i++){
				  if(objectTools.isEqual(array[i],object)){
					  return true;
				  }
			  }
			  return false;
		  }
		  
		  for(var i = 0; i < realSelectedPoints.length; i++){
			  var origPoint = realSelectedPoints[i];
			  
			  if(contains($scope.currentPoints,origPoint) === false){
				  $scope.currentPoints.push(origPoint);
			  }
		  }
		  
		  $modalInstance.close($scope.currentPoints);
	  }
	  
	  $scope.cancel = function(){
		  $modalInstance.dismiss("cancel");
	  }	  
	  
	  $scope.pointData = {	// stores all available points.  in this case coming from a json file containing a list of all points available on our test database
				 enableSorting:true,
				 enableFiltering:true,
				 enableRowHeaderSelection: true,
				 multiSelect: true,
				 enableSelectAll: false,
				 data:"allPoints",
				 exporterLinkLabel: 'download csv',
				 rowTemplate: '<div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
				 columnDefs : [
				               {field:'pointName', displayName:'Point Name'},
				               {field:'asset', displayName:"Asset"},
				               {field:'stationName',displayName:'Station Name'}
				               ],
				 onRegisterApi: function(gridApi){
					 $scope.gridApi = gridApi;
				 }
		 };
	  
	  $scope.removePoint = function(point){	// take a point off of the chart
			var index = 0;
			
			var getIndex = function(point1,point2){	  				
				if(objectTools.isEqual(point1,point2) === true){
					return true;
				}
			}
			
			for(var i = 0; i < $scope.currentPoints.length; i++){
				if(getIndex($scope.currentPoints[i],point)){
					index = i;
					break;
				}
			}
			
			$scope.currentPoints.splice(index,1);
	  }
  }])
;