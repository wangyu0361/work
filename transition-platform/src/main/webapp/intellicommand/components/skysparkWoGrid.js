angular.module('icDash.skysparkWoGrid', [])

.controller('skysparkWoGridCtrl', ["$scope", "userPrefService", "$modal", function($scope,userPrefService, $modal){
	var vm = this;
	
	vm.validate = function(id, site, equip){
		id = "@"+id;
		site = "@"+site;
		equip = "@"+equip;
		
		$scope.expr = "\"readLink("+equip+").toPoints.hisRead(thisWeek)"
			+"\""
		
		console.log("I want to validate "+id)
		$modal.open({
			template: '<skyspark-chart></skyspark-chart>',
			windowClass: 'ic-modal-window',
			scope: $scope,
		});
	}
	
	angular.extend(vm, userPrefService);
}])

.directive('skysparkWoGrid', ['$http', function($http){
	  var makeGraph = function(element){
		$http({
			url:"http://localhost/api/demo/ext/intellicommand/evalGrid?root=skysparkWoGrid",
			method: "POST",
			contentType: "text/zinc",
			data: "ver:\"2.0\""+"\n"+
				"expr"+"\n"+
				"\"readAll(workOrder"+
					" and (siteRef->dis == \\\""+sessionStorage.station+"\\\""+
					" or siteRef->station == \\\""+sessionStorage.station+"\\\"))"+
					".unique([\\\"woRef\\\"])"+
					"\"",
			complete: function(r){
				var g = $("#skysparkWoGrid");
				g.empty();
				g.append(r.responseText)
			}
		}).then( function(r){ 
			console.log(r);
			element.empty();
			element.append("<div id='skysparkWoGrid' style='height:1000px; width:100%; position:relative; overflow:auto'></div>")
			element.append(r.data)
		});
	  }
	  
	  return{
			restrict: 'E',
			controller: 'skysparkWoGridCtrl as sky',
			templateUrl: '/intellicommand/views/skysparkWoGrid.html',
			link : function(scope, element, attrs){
				scope.$watch(function(){
					return scope.sky.getUserPrefs("event-page").assetName
				}, function(){
					makeGraph(element)
				})
			}
	  }
}])