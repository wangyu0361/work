angular.module('icDash.panel', ['ui.router'])

.directive('panel', ['$modal', function($modal) {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'dashboards/panel.html',
		scope: {
			header: '@header',
			content: '@content',
			controller: '@controller',
			extras: '@extras',
		},
		
		link: function(scope, elem, attr) {
			scope.zoomIn = function() {
				scope.customConfig = angular.element($("[ng-controller='" + scope.controller + "']")).scope().config;
				
				var modalInstance = $modal.open({
					templateUrl: 'dashboards/panelModal.html',
					controller: 'panelModalCtrl',
					size: 'xl',
					resolve: {
						title: function() {return scope.header;},
						content: function() {return scope.content;},
						extras: function() {return scope.extras;},
						customConfig: function() {return scope.customConfig;}
					}
				});
				modalInstance.result.then(function(customConfig) {
					// set custom config back to widget...
				});
			};
		},
	};
}])

.directive('bodyDynamic', function($compile) {
	return {
		restrict: 'A',
		replace: true,
		link: function(scope, element, attr) {
			attr.$observe('bodyDynamic', function(val) {
				var newVal = "<" + val + "></" + val + ">";
				element.html('');
				element.append($compile(newVal)(scope));
			});
		}
	};
})

.directive('headerDynamic', function($compile) {
	return {
		replace: true,
		link: function(scope, element, attr) {
			attr.$observe('headerDynamic', function(val) {
				var myButtons = JSON.parse(val);
				var icon = null;
				for (var i = 0; i < myButtons.length; i++) {
					switch (myButtons[i]) {
						case "Grid View": icon = "th"; break;
						case "Configure": icon = "wrench"; break;
						default: icon = "thumbs-up"; break;
					}
					element.append($compile("<button class='ic-body-panel-button' style='margin-right:6px' title='" + myButtons[i] + "' ng-click='" + icon + "()'><span class='glyphicon glyphicon-" + icon + "'/></button>")(scope));
				}
			});

			scope.wrench = function() {
				console.log("let me throw a wrench in your plans....");
			};
			scope.th = function() {
				console.log("switching to grid view now...");
			}
		}
	};
})

.controller('panelModalCtrl', ['$scope', '$compile', '$modalInstance', 'title', 'content', 'extras', 'customConfig', function($scope, $compile, $modalInstance, title, content, extras, customConfig) {
	$scope.title = title;
	$scope.content = content;
	$scope.extras = extras;
	
	$scope.ok = function() {
		$modalInstance.close();
	};
}]);