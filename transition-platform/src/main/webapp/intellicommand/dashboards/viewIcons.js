angular.module('icDash.viewIcons', ['ui.router'])

.directive('viewLoading', function() {
	return {
		template: "<img src='images/loading.gif'>"
	};
})
.directive('viewFailed', function() {
	return {
		template: "<img src='images/failed.png'>"
	};
});