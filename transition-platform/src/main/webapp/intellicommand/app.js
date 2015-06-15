angular.module('icDash', ['ui.router',
  // External dependencies
  'calHeatmap',
  'colorpicker.module', // for treemap
  'ui.bootstrap',
  'ui.grid',
  'ui.grid.edit',
  'ui.grid.exporter',
  'ui.grid.selection',
  'ui.grid.resizeColumns',
  'ui.grid.autoResize',
  
  // Services
  'icDash.assetService',
  'icDash.clientService',
  'icDash.cleaningService',
  'icDash.dashboardTransitionService',
  'icDash.dateRangeService',
  'icDash.mongoService',
  'icDash.pciService',
  'icDash.skysparkService',
  'icDash.bmsRecordsAPIService',
  'icDash.assetAPIService',
  
  // Dashboard layout
  'icDash.dashContainer',
  'icDash.panel',
  'icDash.loginPage',
  'icDash.viewIcons',
  
  // IC widgets
  'icDash.agedWorkOrders',
  'icDash.algorithms',
  'icDash.energyProfile',
  'icDash.eventPage',
  'icDash.equipment',
  'icDash.equipmentTickets',
  'icDash.facilitySelector',
  'icDash.facilitySelectorExpander',
  'icDash.fullFacilityDetails',
  'icDash.heatmap',
  'icDash.stackedColumnWorkOrders',
  'icDash.treemapAsset',
  'icDash.workOrderCycleTime',
  'icDash.workOrderGrid',
  'icDash.multiAxisChart',
  'icDash.calendar',
  'icDash.dateSlider',
  'icDash.skysparkChart',
  'icDash.ahuChart',
  'icDash.dataTable',
])

.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/login');

  $stateProvider
    .state('dashes', {
      url: '/',
      views: {
        '': {
          templateUrl: 'dashboards/dashContainer.html',
        },
        'selector@dashes': {
          templateUrl: 'icWidgets/facilitySelectorExpander.html'
		  
        }
      }
    })
  .state('dashes.home', {
    url: 'home',
    views: {
      '': {
        templateUrl: 'dashboards/oneColumn.html',
        controller: function($scope, $modal) {
          $scope.widgets = [{
            header: "Facility Details",
            dirName: "full-facility-details",
			controller: "fullFacilityDetailsCtrl"
          }];
        }
      },
    },
  })
    .state('dashes.energy', {
      url: 'energy',
      views: {
        '': {
          templateUrl: 'dashboards/twoColumn.html',
          controller: function($scope) {
            $scope.widgets = [{
             header: "Energy Profile",
              dirName: "energy-profile",
			  controller: "energyProfileCtrl"
           }, {
             header: "Energy Spectrum",
              dirName: "energy-spectrum",
			  //controller: "heatmapCtrl as heat"
        }];
          }
        },
      },
    })
    .state('dashes.equip', {
      url: 'equipment',
      views: {
        '': {
          templateUrl: 'dashboards/twoColumn.html',
          controller: function($scope) {
            $scope.widgets = [{
              header: "Treemap Asset",
              dirName: "treemap-asset",
			  controller: "treemapAssetCtrl"
            }, {
              header: "Equipment Overview",
              dirName: "equipment",
			  controller: "equipmentCtrl"
            }];
          }
        },
      },
    })
    .state('dashes.wo1', {
      url: 'workOrder1',
      views: {
        '': {
          templateUrl: 'dashboards/twoColumnByColumn.html',
          controller: function($scope) {
            $scope.widgets = [{
              header: "Work Order Grid",
              dirName: "work-order-grid",
			  controller: "workOrderGridCtrl"
            }, {
              header: "Event Page",
              dirName: "event-page",
			  controller: "eventPageCtrl",
			  extras: {"Configure" : "work-order-grid"}
            }, {
              header: "Open Tickets by Asset",
              dirName: "equipment-tickets",
			  controller: "equipmentTicketsCtrl",
            }];
          }
        },
      },
    })
    .state('dashes.wo2', {
      url: 'workOrder2',
      views: {
        '': {
          templateUrl: 'dashboards/twoColumn.html',
          controller: function($scope) {
            $scope.widgets = [{
              header: "Aged Work Orders",
              dirName: "aged-work-orders",
			  controller: "agedWorkOrdersMainCtrl",
			  //extras: {"Grid View" : "aged-work-orders-grid"}
            }, {
              header: "Work Order Cycle Time",
              dirName: "work-order-cycle-time",
			  controller: "workOrderCycleTimeCtrl",
            }, {
              header: "Algorithms Overview",
              dirName: "algorithms",
			  controller: "algorithmsCtrl"
            }, {
              header: "Work Order Count",
              dirName: "stacked-column-work-orders",
			  controller: "stackedColumnWorkOrdersCtrl"
            }];
          }
        },
      },
    })
    .state('dashes.wo3', {
      url: 'workOrder3',
      views: {
        '': {
          templateUrl: 'dashboards/oneColumn.html',
          controller: function($scope) {
            $scope.widgets = [{
              header: "Skyspark Points By Asset",
              dirName: "skyspark-chart",
			  //controller: "skysparkWoGridCtrl'",
			  //extras: ["Grid View", "Configure"]
            }];
          }
        },
      },
    })
	
.state("ahuChart",{
    	url:'/equipChart',
    	views:{
    		'':{
    			templateUrl:'views/ahuChart.html'
    		}
    	}
    })
  .state('login', {
    url: '/login',
    views: {
      '': {
        templateUrl: 'dashboards/login.html'
      },
    }
  });
});
