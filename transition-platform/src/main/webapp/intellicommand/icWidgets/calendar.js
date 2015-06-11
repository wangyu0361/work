angular.module('icDash.calendar', [])
.factory('dateRangeService', [ function () {
	var _getRange = function(selection){
		var date = {
			'startDate' : '',
			'endDate' : ''
		};
			
		switch(selection) {
			case "All":
				var sDate = new Date();
				sDate.setTime(0);
				date.startDate = sDate;
				date.endDate = new Date();
				break;
			case "Last 24 Hours":
				var sDate = new Date();
				sDate.setDate(sDate.getDate()-1);
				date.startDate = sDate;
				date.endDate = new Date();
				break;
			case "Last 7 Days":
				var sDate = new Date();
				sDate.setDate(sDate.getDate()-7);
				date.startDate = sDate;
				date.endDate = new Date();
				break;
			 case "Last 12 Months":
				var sDate = new Date();
				sDate.setFullYear(sDate.getFullYear()-1);
				date.startDate = sDate;
				date.endDate = new Date();
				break;
			case "Today":
			default:
				var sDate = new Date();
				sDate.setMinutes(0);
				sDate.setHours(0);
				sDate.setSeconds(0);
				sDate.setMilliseconds(0);
				date.startDate = sDate;
				date.endDate = new Date();
				break;
			case "This Week":
				var sDate = new Date();
				sDate.setDate(sDate.getDate()-sDate.getDay());
				sDate.setMinutes(0);
				sDate.setHours(0);
				sDate.setSeconds(0);
				sDate.setMilliseconds(0);
				date.startDate = sDate;
				date.endDate = new Date();
				break;
			case "This Month":
				var sDate = new Date();
				sDate.setDate(1);
				sDate.setMinutes(0);
				sDate.setHours(0);
				sDate.setSeconds(0);
				sDate.setMilliseconds(0);
				date.startDate = sDate;
				date.endDate = new Date();
				break;
			case "This Year":
				var sDate = new Date();
				sDate.setMonth(0);
				sDate.setDate(1);
				sDate.setMinutes(0);
				sDate.setHours(0);
				sDate.setSeconds(0);
				sDate.setMilliseconds(0);
				date.startDate = sDate;
				date.endDate = new Date();
				break;
			case "This Quarter":
				var sDate = new Date();
				sDate.setMonth(Math.floor(sDate.getMonth()/3)*3);
				sDate.setDate(1);
				sDate.setMinutes(0);
				sDate.setHours(0);
				sDate.setSeconds(0);
				sDate.setMilliseconds(0);
				date.startDate = sDate;
				date.endDate = new Date();
				break;
			case "Last Full Day":
				var sDate = new Date();

				sDate.setDate(sDate.getDate()-1);
				sDate.setMinutes(0);
				sDate.setHours(0);
				sDate.setSeconds(0);
				sDate.setMilliseconds(0);
				date.startDate = sDate;

				var eDate = new Date();
				eDate.setMinutes(0);
				eDate.setHours(0);
				eDate.setSeconds(0);
				eDate.setMilliseconds(0);
				date.endDate = eDate;
				break;
			case "Last Full Week":
				var sDate = new Date();

				sDate.setDate(sDate.getDate()-sDate.getDay()-7);
				sDate.setMinutes(0);
				sDate.setHours(0);
				sDate.setSeconds(0);
				sDate.setMilliseconds(0);
				date.startDate = sDate;

				var eDate = new Date();
				eDate.setDate(eDate.getDate()-eDate.getDay());
				eDate.setMinutes(0);
				eDate.setHours(0);
				eDate.setSeconds(0);
				eDate.setMilliseconds(0);
				date.endDate = eDate;

				break;
			case "Last Full Month":
				var sDate = new Date();
				sDate.setMonth(sDate.getMonth()-1);
				sDate.setDate(1);
				sDate.setMinutes(0);
				sDate.setHours(0);
				sDate.setSeconds(0);
				sDate.setMilliseconds(0);
				date.startDate = sDate;

				var eDate = new Date();

				eDate.setDate(1);
				eDate.setMinutes(0);
				eDate.setHours(0);
				eDate.setSeconds(0);
				eDate.setMilliseconds(0);
				date.endDate = eDate;
				break;
			case "Last Full Year":
				var sDate = new Date();
				sDate.setFullYear(sDate.getFullYear()-1);
				sDate.setMonth(0);
				sDate.setDate(1);
				sDate.setMinutes(0);
				sDate.setHours(0);
				sDate.setSeconds(0);
				sDate.setMilliseconds(0);
				date.startDate = sDate;

				var eDate = new Date();
				eDate.setMonth(0);
				eDate.setDate(1);
				eDate.setMinutes(0);
				eDate.setHours(0);
				eDate.setSeconds(0);
				eDate.setMilliseconds(0);
				date.endDate = eDate;
				break;
			case "Last Full Quarter":
				var sDate = new Date();
				sDate.setFullYear(sDate.getFullYear()-1);
				sDate.setMonth((Math.floor(sDate.getMonth()/3)-1)*3);
				sDate.setDate(1);
				sDate.setMinutes(0);
				sDate.setHours(0);
				sDate.setSeconds(0);
				sDate.setMilliseconds(0);
				date.startDate = sDate;

				var eDate = new Date();
				eDate.setMonth(Math.floor(eDate.getMonth()/3)*3);
				eDate.setDate(1);
				eDate.setMinutes(0);
				eDate.setHours(0);
				eDate.setSeconds(0);
				eDate.setMilliseconds(0);
				date.endDate = eDate;
				break;
		}
		return date;
	};
	var _getRangeFromThen = function (selection, inputDate) {
		/**********************************************************************************
		* TODO: write a function to get dateRanges from inputDate, instead of from today. *
		* Probably make _getRange call _getRangeFromThen(selection, ***new Date()***)     *
		**********************************************************************************/
	};
	
	return {
		getRange : _getRange
	};
}])
.directive('myCalendar', function(){
	return{
		restrict: "E",
		scope:{
			name:"=" // allows the name of the chart to be assigned.  this name is the new scope variable created once a date is selected
		},
		templateUrl : "/intellicommand/views/calendar.html",
		/*link: {
			pre: function preLink (scope, iElem, iAttrs, controller) {
				scope.name = Number(new Date(scope.name));	//this numifys the date so it works well, and looks pretty
			}
		},*/
		controller: function  ($scope) {
			$scope.today = function() {
				$scope.dt = new Date();
			};

			$scope.today();

			$scope.clear = function () {
				$scope.dt = null;
			};

			$scope.open = function($event) {
				$event.preventDefault();
				$event.stopPropagation();

				if($scope.opened === true){
					$scope.opened = false;
				}
				else {
					$scope.opened = true;
				};
			};

			$scope.log = function(){
				console.log($scope);
			}

			$scope.minDate = null;
			$scope.maxDate = Date.now();

			$scope.dateOptions = {
					formatYear: 'yyyy',
					startingDay: 0,
					showWeeks: false,
			};

			$scope.format = 'yyyy-MM-dd';
		}
	}
})
.directive('pciDateRange', ["dateRangeService", function (dateRangeService) {
	return {
		restrict: "E",
		scope: {
			startDate:"=", 
			endDate: "=",
			todayButton: "@",
			lastFullWeekButton: "@"
		},
		templateUrl: "views/pciDateRange.html",
		compile : function (element, attrs) {
			/************************************
			* View-altering Attribute Observers *
			************************************/
			var tBObserver = attrs.$observe('todayButton', function (iValue) {
				attrs.todayButton = (iValue === "true") ? true : false;
				tBObserver();
			});
			var lFWObserver = attrs.$observe('lastFullWeekButton', function (iValue) {
				attrs.lastFullWeekButton = (iValue === "true") ? true : false;
				lFWObserver();
			});
			var sDObserver = attrs.$observe('startDate', function (iValue) {
				attrs.startDate = Number(iValue);
				sDObserver();
			});
			var eDObserver = attrs.$observe('endDate', function (iValue) {
				attrs.endDate = Number(iValue);
				eDObserver();
			});
		},
		controller: function ($scope) {
			$scope.setToday = function () {
				var dateRange = dateRangeService.getRange("Today");
				$scope.startDate = Number(dateRange.startDate);
				$scope.endDate = Number(dateRange.endDate);
			};
			$scope.setLastFullWeek = function () {
				var dateRange = dateRangeService.getRange("Last Full Week");
				$scope.startDate = Number(dateRange.startDate);
				$scope.endDate = Number(dateRange.endDate);
			};
		}
	}
}])
;