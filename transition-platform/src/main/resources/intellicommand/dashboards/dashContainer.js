// Angela's code; equipmentTickets.js

'use strict';

angular.module('icDash.dashContainer', ['ui.router'])

.controller('dashCtrl', ['$scope', '$state', function($scope, $state) {
	$scope.orgImg = "Pacific Controls";
	$scope.pageTitle = "loading";
	
	function updateTheTime() {
		var now = new Date();
		var dayNames = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
		var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		var hour = now.getHours(); //0-23
		var amPmShift = "";
		var min = "";
		var mins = now.getMinutes();
		
		// hours are 0-23
		if (hour <= 11) {
		  amPmShift = "AM";
		}else {
			if (hour > 12) hour -= 12;
			amPmShift = "PM";
		}
		
		// minutes are 0-59
		if (mins < 10)  min = "0" + (mins); else min = mins;
		
		$scope.updatedDateTime = dayNames[now.getDay()] + ", " + monthNames[now.getMonth()] + " " + now.getDate() + ", " + now.getFullYear() + " " + hour + ":" + min + amPmShift;
		if ($scope.currentYear != now.getFullYear) $scope.currentYear = now.getFullYear();
		
		setTimeout(updateTheTime, 60000); // update every 60 seconds
	}
	
	$scope.logOut = function() {
		var userName = document.cookie;
		document.cookie = "icUser="+userName+";expires=Thu, 01 Jan 1970 00:00:01 GMT";
		sessionStorage.clear();
		$state.go('^.^.login');
	};
	
	function evaluatePageSize() {
		/* This adds the appropriate margin to the bottom of the body components to ensure
		they do not get covered up by the footer when a scroll bar is present. If no scroll
		bar is needed, it removes excess margin to avoid a useless scroll bar. Function runs
		on load and every page resize after	*/
		var totalHeight = $(window).height();
		var headerHeight = $("header").children().outerHeight();
		var sidebarHeight = $("#dashMain").outerHeight() - parseInt(window.getComputedStyle(document.getElementById("dashMain")).marginBottom, 10);
		var mainDashHeight = $("#dashSidebar").outerHeight() - parseInt(window.getComputedStyle(document.getElementById("dashSidebar")).marginBottom, 10);
		var footerHeight = $("footer").children().outerHeight();
		
		document.getElementById("mainContent").style.marginTop = headerHeight + 2 + "px";
		
		if ((headerHeight + Math.max(sidebarHeight, mainDashHeight) + footerHeight) > totalHeight) {
			document.getElementById("dashSidebar").style.marginBottom = footerHeight + "px";
			document.getElementById("dashMain").style.marginBottom = footerHeight + "px";
		} else {
			document.getElementById("dashSidebar").style.marginBottom = "0px";
			document.getElementById("dashMain").style.marginBottom = "0px";
		}
	};
	
	$scope.$on('userPrefsChanged',function(){
		if (sessionStorage.getItem("organization")) $scope.orgImg = sessionStorage.getItem("organization"); else $scope.logOut();
		if (sessionStorage.getItem("facility")) $scope.pageTitle = sessionStorage.getItem("facility"); else $scope.logOut();
	});
	
	$scope.orgImg = sessionStorage.getItem("facility");
	
	$(window).resize(function() {evaluatePageSize();});
	$(document).ready(function() {
		if (sessionStorage.getItem("organization")) $scope.orgImg = sessionStorage.getItem("organization"); else $scope.logOut();
		if (sessionStorage.getItem("facility")) $scope.pageTitle = sessionStorage.getItem("facility"); else $scope.logOut();
		setTimeout(function() {evaluatePageSize();}, 10);
	});
	
	$scope.currentYear = new Date().getFullYear();
	updateTheTime();
}]);