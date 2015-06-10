'use strict';

angular.module('icDash.dateRangeService', ['ui.router'])

.factory('dateRangeService', [function(){
	var _serviceObject = {};
	
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
	_serviceObject = {
			variableMonthsAgo : _variableMonthsAgo,
			variableDaysAgo : _variableDaysAgo,
			variableWeeksAgo : _variableWeeksAgo,
			currentMonth : _currentMonth,
			previousMonth : _previousMonth,
			previousSixMonths : _previousSixMonths,
			lastYear : _lastYear,
			lastFullCalendarYear : _lastFullCalendarYear,
			lifetime : _lifetime
	};
	return _serviceObject;
}])
