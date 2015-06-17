angular.module('icDash.skysparkWoGrid', [])

.controller('skysparkWoGridCtrl', ["$scope", "userPrefService", "$modal", function($scope,userPrefService, $modal){
	var vm = this;
	
	vm.validate = function(id, site, equip){
		if(id.indexOf(" ") >=0) id = id.substring(0,id.indexOf(" "))
		if(site.indexOf(" ") >=0) site = site.substring(site.lastIndexOf(" ")+1)
		if(equip.indexOf(" ") >=0) equip = equip.substring(0, equip.indexOf(" "))
		
		$scope.expr = "\"readLink("+equip+").toPoints.hisRead(thisWeek)"
			+"\""
		
		$modal.open({
			template: '<skyspark-chart></skyspark-chart>',
			windowClass: 'ic-modal-window',
			scope: $scope,
		});
	}
	
	vm.equipment = function(id, site, equip){
		if(equip.indexOf(" ") >=0) equip = equip.substring(equip.lastIndexOf(" ")+1)
		if(id.indexOf(" ") >=0) id = id.substring(0,id.indexOf(" "))

		vm.updateUserPrefs({asset:equip});
		
		$modal.open({
			templateUrl: 'dashboards/panelModal.html',
			controller: 'panelModalCtrl',
			windowClass: 'ic-modal-window',
			resolve: {
				title: function() {return "Equipment Tickets for "+id;},
				content: function() {return "<equipment-tickets></equipment-tickets>";},
				extras: function() {return {};},
			}
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
				"\"findSortedWorkOrders(\\\""+sessionStorage.station+"\\\")"+
					"\"",
			complete: function(r){
				var g = $("#skysparkWoGrid");
				g.empty();
				g.append(r.responseText)
			}
		}).then( function(r){ 
			console.log(r);
			element.empty();
			element.append("<div id='skysparkWoGrid' style='height:1250px; width:100%; position:relative; overflow:auto'></div>")
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