// Angela's code; equipmentTickets.js

'use strict';

angular.module('icDash.facilitySelectorExpander', ['ui.router'])


.controller('facilitySelectorExpanderCtrl', ['$scope', function($scope) {
	$scope.view = "small";
	$scope.largeDets = {header: "Data Selector", dirName: "<facility-details/>"};
	
	$scope.expand = function() {
		document.getElementById("dashSidebar").className = "col-sm-3 no-space";
		document.getElementById("dashMain").className = "col-sm-9 col-sm-offset-3 no-no-space";
		/** this will let me affect overflow options if needed.... $("*").find("#widgetPanelBody").css("overflow", "auto"); */
		$scope.view = "large";
		$(window).trigger("resize");
	}
	$scope.shrink = function() {
		document.getElementById("dashSidebar").className = "col-sm-1-2 no-space";
		document.getElementById("dashMain").className = "col-sm-2-2 no-no-space";
		/** this will let me affect overflow options if needed.... $("*").find("#widgetPanelBody").css("overflow", ""); */
		$scope.view = "small";
		$(window).trigger("resize");
	}
}])

.directive('facilitySelectorExpander', function() {
	return {
		restrict: 'E',
		controller: 'facilitySelectorExpanderCtrl',
		templateUrl: 'icWidgets/facilitySelectorExpander.html'
	};
});