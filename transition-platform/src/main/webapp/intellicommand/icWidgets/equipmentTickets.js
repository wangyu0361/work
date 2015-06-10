// Angela's code; equipmentTickets.js

'use strict';

angular.module('icDash.equipmentTickets', ['ui.router'])

.controller('equipmentTicketsCtrl', ['$scope', '$q', '$controller', '$window',
'assetService', 'configService', 'userPrefService',
function($scope, $q, $controller, $window, assetService, configService, userPrefService) {
	
	$scope.view="loading";
	var maxHeight = 300; // Max height the widget can be without forcing a scroll bar to keep the dashboard under control.
	
	// Choose settings that this widget cares about
	var defaultConfig = {
		stationName: null,
		assetName: null,
		chartColor: "pink",
	};
	var currentConfig = defaultConfig;
	
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});
	angular.extend(thisController, configService, superController);
	$scope.config = thisController.getConfig();
	// End choose settings that this widget cares about
	
	var refreshConfigs = function() {
		console.log("EQUIPMENT TICKETS updating!");
		
		var myPrefs = userPrefService.getUserPrefs("equipment-tickets");
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
		$scope.config = currentConfig;
		populateData(currentConfig.stationName, currentConfig.assetName);
	}
	
	var populateData = function(stationName, assetName) {
		$scope.view = "loading";
		$scope.asset = null;
		$scope.events = null;
		
		var assetPromise = assetService.getAsset(stationName, assetName);
		assetPromise.then(function(asset) {
			$scope.asset = asset;
			if ($scope.asset.type == undefined) $scope.asset.type = "AHU";
		}, function() {
			$scope.view = "failed";
		});
		
		var eventsPromise = assetService.getEvents(stationName, assetName);
		eventsPromise.then(function(events) {
			$scope.events = events;
		}, function() {
			$scope.view = "failed";
		});
		
		var complete = $q.all([assetPromise, eventsPromise]);
		complete.then(function(success){ // If you have legit results from both promises, load the page
			if ($scope.asset == undefined || $scope.events == undefined) {
				$scope.view = "failed";
			} else {
				$scope.view = "loaded";
			}
		});
	};
	
	$scope.$on('userPrefsChanged',function(){
		refreshConfigs();
	});
	$scope.setTicket = function(ticketId) {
		console.log(ticketId);
		//userPrefService.updateUserPrefs({"workOrderNumber": ticketId});
	}
	
	refreshConfigs();
}])

.directive('equipmentTickets', function() {
	return {
		restrict: 'E',
		controller: 'equipmentTicketsCtrl',
		templateUrl: 'icWidgets/equipmentTickets.html'
	};
})

.directive('equipmentTicketsImpulseChart', ['$window', function($window){
	return{
		restrict:'EA',
		templateUrl: 'icWidgets/equipmentTicketsImpulse.html',
		scope: {
			chartData: '=chartData',
			barColor: '=barColor',
			yLabel: '=yLabel'
		},
		
		link: function(scope, elem, attrs){
			// Start by cleaning up the data to graphable format
			var newData = [];
			var newDateObj = {};
			var tempDate = null;
			for (var i=0; i < scope.chartData.length; i++) {
				// Grab all of the ticket created times and add to new data object
				tempDate = new Date(scope.chartData[i].createdTime);
				newDateObj = {
					date: tempDate.getFullYear() + "-" + (tempDate.getMonth()+1) + "-" + tempDate.getDate(),
					total: 1
				};
				newData.push(newDateObj);
				
				for (var j = 0; j < scope.chartData[i].updatedTime.length; j++) {
					// Grab all of the ticket updated times and add to new data object
					tempDate = new Date(scope.chartData[i].updatedTime[j]);
					newDateObj = {
						date: tempDate.getFullYear() + "-" + (tempDate.getMonth()+1) + "-" + tempDate.getDate(),
						total: 1
					};
					newData.push(newDateObj);
				}
			}
			// Combine similar dates to end up with cleaned up usable data object
			var impulseChartData = _.sortBy(_.map(_.pairs( _.reduce(newData, function(result, obj) {
				if (result[obj.date] === undefined) result[obj.date] = 1; else result[obj.date] += obj.total;
				return result;
			}, [])), function(a) {
				return {date: a[0], total: a[1]};
			}), "date");
			// End cleaning up the data into graphable format
			
			var rawSvg=elem.find('svg');
			var chart = d3.select(rawSvg[0]);
			var height = elem[0].parentElement.clientHeight;
			var width = elem[0].parentElement.clientWidth;
			if (scope.yLabel == "# of Updates") width = width - 20; //20 for padding to center in gray box
			var margin = {top: 20, right: 0, bottom:50, left:40};
			
			var tip = d3.tip()
				.attr("class", "d3-tip")
				.offset([-10, 0])
				.html(function(d) {return d3.time.format("%b %d, %Y")(new Date(d.date)) + "<br><span style='color: red'>" + d.total + "</span> Update(s)";})
				
			var drawImpulseChart = function() {
				var x = d3.time.scale()
					.domain([d3.time.day.offset(new Date(impulseChartData[0].date), -1), d3.time.day.offset(new Date(impulseChartData[impulseChartData.length - 1].date), 1)])
					.rangeRound([0, width - margin.left - margin.right]);
				var y = d3.scale.linear()
					.domain([0, d3.max(impulseChartData, function(d) {return d.total; })])
					.range([height-margin.top-margin.bottom, 0]);

				var xAxis = d3.svg.axis()
					.scale(x)
					.orient("bottom")
					.ticks(function() {
						// number of days graphed converted to days divided by 
						// total available space on screen divided by size of label (70px)
						return d3.time.day.range(x.domain()[0],
							x.domain()[1],
							Math.round(((x.domain()[1] - x.domain()[0]) / (1000*60*60*24))/((width - margin.top - margin.bottom)/90)));
					})
					.tickFormat(d3.time.format("%b %d"))
					.tickSize(0)
					.tickPadding(8);
				var yAxis = d3.svg.axis()
					.scale(y)
					.orient("left")
					.ticks(d3.max(impulseChartData, function(d) {return d.total; }))
					.tickPadding(8);
					
				// Make bars narrower if needed to nicely size the graph
				var barWidth = (x.range()[1] * 1000 * 60 * 60 * 24)/(x.domain()[1]-x.domain()[0]) - 1.5;
				if (barWidth > 20) barWidth = 20;
				
				var chart = d3.select(rawSvg[0])
					.attr("width", width)
					.attr("height", height)
					.append("g")
					.attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
					.style("font-size","10px");

				chart.call(tip);
				
				chart.append("g")
					.attr("transform", "translate(0, " + (height - margin.top - margin.bottom) + ")")
					.attr("class", "x axis")
					.call(xAxis);

				chart.append("g")
					.attr("class", "y axis")
					.call(yAxis);

				chart.append("text")
					.attr("transform", "rotate(-90)")
					.attr("y", 0 - margin.left)
					.attr("x", 0 - (height - margin.top - margin.bottom)/2)
					.attr("dy", "1em")
					.style("text-anchor", "middle")
					.text(scope.yLabel);
					
				chart.append("text")
					.attr("y", 0 - margin.top / 2)
					.attr("x", (width - margin.left - margin.top) / 2)
					.attr("text-anchor", "middle")
					.style("font-size", "1.2em")
					.text("Ticket Creation/Update Times");
					
				chart.selectAll("g.x text")
					.attr("transform", "rotate(-45)")
					.style("text-anchor", "end");
					
				chart.selectAll(".chart")
					.data(impulseChartData)
					.enter().append("rect")
					.attr("class", "bar")
					.attr("x", function(d) {return x(new Date (d.date)); })
					.attr("y", function(d) {return height - margin.top - margin.bottom - (height - margin.top - margin.bottom - y(d.total)) })
					.attr("width", barWidth)
					.attr("height", function(d) {return height - margin.top - margin.bottom - y(d.total) })
					.style("fill", scope.barColor)
					.on("mouseover", function(d) {
						d3.select(this).style("opacity", ".75");
						tip.show(d);
					})
					.on("mouseout", function() {
						d3.select(this).style("opacity", "1");
						tip.hide();
					})
			};
			
			scope.$watch("chartData", function(){
				chart.selectAll("*").remove();
				drawImpulseChart();
			});
			
			scope.$watch("barColor", function(){
				chart.selectAll("*").remove();
				drawImpulseChart();
			});
			
			scope.$watch("yLabel", function(){
				chart.selectAll("*").remove();
				drawImpulseChart();
			});
			
			$(window).resize(function() {
				height = elem[0].parentElement.clientHeight;
				width = elem[0].parentElement.clientWidth;
				if (scope.yLabel == "# of Updates") width = width - 20; //20 for padding to center in gray box
				chart.selectAll("*").remove();
				drawImpulseChart();
			});
			
			drawImpulseChart();
		}
	};
}]);