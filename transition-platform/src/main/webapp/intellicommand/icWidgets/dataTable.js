angular.module('icDash.dataTable', ['ui.router'])
  .directive('genericDataTable', [function(){
	  return{
		  restrict:'E',
		  scope:{
			  info:"=",
			  cols:"="
		  },
		  template : "<div ui-grid='gridOptions'></div>",
		  controller:'genericDataTableCtrl'
	  }
  }])
  .controller('genericDataTableCtrl',['$scope',function($scope){
	  var pos = $scope.gridOptions.columnDefs.map(function (e) { return e.field; }).indexOf('yourFieldName');
	  
	  $scope.gridOptions = $scope.anomalySummary = {		// anomaly summary ui-grid object
				 enableSorting:ftrue,
				 enableFiltering:true,
				 multiSelect:false,
				 data:"info",
				 rowTemplate: '<div ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>',
	 };
	  
	  console.log($scope);
	  
  }])