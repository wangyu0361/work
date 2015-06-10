//angular.module('myApp.dashboardTransitionService', ['ngRoute'])
angular.module('icDash.dashboardTransitionService', ['ui.router'])

.factory('dashTransition',['$window','$timeout','directiveService',function($window,$timeout,directiveService){
	var _newTab = function(url,configObject){
		var win = $window.open(url,'_blank')
		win.focus();
		
		var setService = function(){
			if(win.angular === undefined || win.angular.element === undefined || win.d3 === undefined){
				$timeout(setService,1000);
				return;
			}
			
			var parent = win.angular.element(win.d3.select('div.ng-scope').node());
			if(parent.injector() === undefined){
				$timeout(setService,1000);
				return;
			}
			var configService = parent.injector().get('configService');

			if(configService.getConfig() === undefined || Object.keys(configService.getConfig()).length === 0){
				$timeout(setService,1000);
				return;
			}
			
			url.indexOf('dashboard') === -1 
				? configService.setConfig(configObject)
				: function(){configService.setFullConfig(configObject);parent.scope().$apply()}()
			;
			
			return;
		}
		
		setService();
	}
		
	var _inModal = function(directive, configObject){
		var dirObj;
		
		for(var i = 0; i < directiveService.getComponentList().length; i++){
			if(directive === directiveService.getComponentList()[i].directiveName()){
				dirObj = directiveService.getComponentList()[i];
				break;
			}
		}
		
		if(dirObj === undefined){return;}
		
		var dirTag = dirObj.tagHtml();
		
		var instance = $modal.open({
			template:dirTag
		})
		
		$timeout(function(){
			var parent = angular.element(d3.select(instance));
					
			var configService = parent.injector().get('configService');
			configService.setConfig(configObject);
			
		},250)
	}
	
	return {
		newTab : _newTab,
		inModal : _inModal
	}
}])

/*
	see about tying this into the dashboard configuration thing-a-ma-bobber.  perhaps in the setConfig service do a special case for dashboard?  either that or do it standard.
	angular.element(d3.select('[ng-controller="dashboardController as dashboard"]').node()).scope().dashboard.components
*/