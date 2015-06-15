angular.module('icDash.skysparkChart', [])

.controller('skysparkChartCtrl', ["$scope", "userPrefService", function($scope,userPrefService){
	var vm = this;
	
	angular.extend(vm, userPrefService);
}])

.directive('skysparkChart', ['$http', function($http){
	  var makeGraph = function(element){
		$http({
			url:"http://localhost/api/demo/ext/intellicommand/equipPoints?root=skysparkChart",
			headers:{"Authorization":"Basic c3U6UENJZGV2b3BzKjEyMzQ1Njc4"}, 
			method: "POST",
			contentType: "text/zinc",
			data: "ver:\"2.0\""+"\n"+
				"expr"+"\n"+
				"\"read(navName == \\\""+sessionStorage.asset+"\\\""+
					" and (siteRef->dis == \\\""+sessionStorage.station+"\\\""+
					" or siteRef->station == \\\""+sessionStorage.station+"\\\")).toPoints.hisRead(thisWeek)\"",
			complete: function(r){
				var g = $("#skysparkChart");
				g.empty();
				g.append(r.responseText)
			}
		}).then( function(r){ 
			console.log(r);
			element.empty();
			element.append("<div id='skysparkChart' style='height:1000px; width:100%; position:relative'></div>")
			element.append(r.data)
		});
	  }
	  
	  return{
			restrict: 'E',
			controller: 'skysparkChartCtrl as sky',
			templateUrl: '/intellicommand/views/skysparkChart.html',
			link : function(scope, element, attrs){
				scope.$watch(function(){
					return scope.sky.getUserPrefs("event-page").assetName
				}, function(){
					makeGraph(element)
				})
			}
	  }
}])