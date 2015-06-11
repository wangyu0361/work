angular.module('icDash.skysparkGrid', [])

.controller('skysparkWoGridCtrl', ["$scope", function($scope){
}])
.directive('skysparkWoGrid', [function(){
	  return{
		  restrict: 'E',
			//controller: 'algorithmsCtrl',
			templateUrl: '/intellicommand/views/skysparkWoGrid.html',
	  }
}])