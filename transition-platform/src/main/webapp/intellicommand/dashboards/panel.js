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
				var myExtras = {};
				//myExtras = scope.extras;
				myExtras.Shrink = null;
				
				var modalInstance = $modal.open({
					templateUrl: 'dashboards/panelModal.html',
					controller: 'panelModalCtrl',
					windowClass: 'ic-modal-window', // allows custom width modal
					resolve: {
						title: function() {return scope.header;},
						content: function() {return scope.content;},
						extras: function() {return myExtras;},
					}
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

.directive('headerDynamic', function($compile, $modal) {
	return {
		replace: true,
		link: function(scope, element, attr) {
			attr.$observe('headerDynamic', function(val) {
				var myButtons = JSON.parse(val);
				console.log(myButtons);
				var icon = null;
				var linkFunct = null;
				
				_.forEach(myButtons, function(val, key) {
					switch (key) {
						case "Grid View": icon = "th"; break;
						case "Configure": icon = "wrench"; break;
						case "Save": icon = "file"; break;
						case "Cancel": icon = "trash"; break;
						case "Shrink": icon = "minus"; break;
						default: icon = "thumbs-up"; break;
					}
					linkFunct = icon + '("' + val + '")';
					element.append($compile("<button class='ic-body-panel-button' style='margin-right:6px' title='" +
						key + "' ng-click='" + linkFunct + "'><span class='glyphicon glyphicon-" + icon + "'/></button>")(scope));
				});
			});

			scope.wrench = function(dirName) { // Configure page
				console.log("let me throw a wrench in your plans....");
				var myHeader = scope.header + " Configuration";
				var myExtras = {"Save": null, "Cancel": null};
				var myDir = "<" + dirName + "></" + dirName + ">";
				console.log(myDir);
				
				var modalInstance = $modal.open({
					templateUrl: 'dashboards/panelModal.html',
					controller: 'panelModalCtrl',
					windowClass: 'ic-modal-window', // allows custom width modal
					resolve: {
						title: function() {return myHeader;},
						content: function() {return dirName;},
						extras: function() {return myExtras;}
					}
				});
			};
			scope.th = function(dirName) { // Grid view
				console.log("switching to grid view now...");
			};
		}
	};
})

.controller('panelModalCtrl', ['$scope', '$compile', '$modalInstance', 'title', 'content', 'extras',
function($scope, $compile, $modalInstance, title, content, extras) {
	
	$scope.title = title;
	$scope.content = content;
	$scope.extras = extras;
	
	$scope.minus = function() {
		$modalInstance.close();
	};
	$scope.trash = function() {
		$modalInstance.close();
	};
	$scope.file = function() {
		$modalInstance.close();
	};
}]);