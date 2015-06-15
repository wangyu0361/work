angular.module('icDash.facilitySelector', ['ui.router', 'angularBootstrapNavTree'])
/**angular.module('myApp.facilitySelector', ['ngRoute', 'myApp.dashboard', 'myApp.panelComponent', 'myApp.popout', 'myApp.pciService', 'angularBootstrapNavTree'])
**.run(['directiveService', function(directiveService){
	directiveService.addSideBarComponent({
		tag: function(){return 'facility-selector';},
		configTag: function(){return 'facility-selector';},
		tagHtml: function(){return "<facility-selector></facility-selector>";},
		directiveName: function(){return 'facilitySelector';},
		namespace: function(){return 'facilitySelector'},
		paletteImage: function(){return 'report.png';}
	});
}])**/
.factory('facilitySelectorService', ['$rootScope', 'userPrefService', function($rootScope, userPrefService){

	var _facilityNames;
	var _assetType;
	var _point;
	var _asset;
	var _organization;
	var _facility;
	var _building;

	var _setOrganization = function(organization,broadcast){
		_organization = organization;	
		//console.log("organization set to "+organization);
		if(broadcast===true){userPrefService.updateUserPrefs({"organization": organization});}		
	}

	var _getOrganization = function(){
		return _organization;
	}

	var _setBuilding = function(building,broadcast){
		_building = building;	
		//console.log("building set to "+building);
		if(broadcast===true){userPrefService.updateUserPrefs({"facility": building});}		
	}

	var _getBuilding = function(){
		return _building;
	}

	var _setAssetType = function(assetType,broadcast){
		_assetType = assetType;	
		//console.log("assettype set to "+assetType);
		if(broadcast===true){userPrefService.updateUserPrefs({"assetType": assetType});}	
	}

	var _getAssetType = function(){
		return _assetType;
	}

	var _setAsset = function(asset,broadcast){
		_asset = asset;	
		//console.log("asset set to "+asset);
		if(broadcast===true){userPrefService.updateUserPrefs({"asset": asset});}	
	}

	var _getAsset = function(){
		return _asset;
	}

	var _setPoint = function(point,broadcast){
		_point = point;	
		//console.log("point set to "+point);
		if(broadcast===true){userPrefService.updateUserPrefs({"point": point});}	
	}

	var _getPoint = function(){
		return _point;
	}

	var _setFacilityNames = function(facilityNames,broadcast){
		_facilityNames = facilityNames;
		//console.log("facilitynames set to "+facilityNames);
		if(broadcast===true){userPrefService.updateUserPrefs({"facility": facilityNames});}
	}

	var _getFacilityNames = function(){
		return _facilityNames;
	}

	var _setFacility = function(facility,broadcast){
		_facility = facility;
		//console.log("facility set to "+facility);
		/*** we need this to eventually set the actual facility name not station name..... */
		if(broadcast===true){userPrefService.updateUserPrefs({"station": facility});}
	}

	var _getFacility = function(){
		return _facility;
	}

	var _serviceObj = {
			getOrganization : _getOrganization,
			setOrganization: _setOrganization,
			getAssetType: _getAssetType,
			setAssetType: _setAssetType,
			getAsset: _getAsset,
			setAsset: _setAsset,
			getBuilding: _getBuilding,
			setBuilding: _setBuilding,
			getPoint: _getPoint,
			setPoint: _setPoint,
			getFacilityNames : _getFacilityNames,
			setFacilityNames : _setFacilityNames,
			getFacility : _getFacility,
			setFacility : _setFacility,
	};	
	return _serviceObj;
}])

/** angela removed things... **
.controller('facilitySelectorCtrl', ['$scope','$rootScope', '$location', '$route','PCIdbService','configService','$window', '$controller','facilitySelectorService','$timeout','userPrefService','cleaningService',
                                     function($scope,$rootScope, $location, $route,dbService,configService,$window,$controller,facilitySelectorService,$timeout, userPrefService,cleaningService) {
**/
.controller('facilitySelectorCtrl', ['$scope','$rootScope', '$location', 'PCIdbService','configService','$window', '$controller','facilitySelectorService','$timeout','userPrefService','cleaningService',
    function($scope,$rootScope, $location, dbService,configService,$window,$controller,facilitySelectorService,$timeout, userPrefService,cleaningService) {
	/** angela is replacing all of this stuff **
	//config stuff
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});

	angular.extend(thisController, configService, superController);
	$scope.facilitySelectorConfig = thisController.getConfig();

	var defaultConfig = {
			"organizationName" 		:"Merck",
			"facilityName" 		:"MRL",
	}

	for(var key in defaultConfig){
		if($scope.facilitySelectorConfig.hasOwnProperty(key) === false){
			$scope.facilitySelectorConfig[key] = defaultConfig[key];
		}
	}
	/** end area angela replaced **/


	/** angela's replacement */
	// Choose settings that this widget cares about
	var defaultConfig = {
			organizationName: null,
			facilityName: null,
	};
	var currentConfig = defaultConfig;

	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});
	angular.extend(thisController, configService, superController);
	$scope.facilitySelectorConfig = thisController.getConfig();
	// End choose settings that this widget cares about

	var refreshConfigs = function() {
		//console.log("FACILITY SELECTOR updating. New settings:");

		var myPrefs = userPrefService.getUserPrefs("facility-selector");

		/* Use default config to determine which preferences should be used in the widget
			Order of preferences: 
			1) User preferences (myPrefs)
			2) XUI configurations ($scope.config)
			3) default configurations by widget (defaultConfig)
		 */
		for (var key in defaultConfig) {
			if (myPrefs[key] !== "" && myPrefs[key] !== undefined) {
				currentConfig[key] = myPrefs[key];
			} else if ($scope.facilitySelectorConfig[key] !== "" && $scope.facilitySelectorConfig[key] !== undefined) {
				currentConfig[key] = $scope.facilitySelectorConfig[key];
			} else {
				currentConfig[key] = defaultConfig[key];
			}
			//console.log(key, currentConfig[key]);
		}
		pullData2();

	}
	/** end angela's replacement section */


	//capture the controller's 'this' context
	var vm = this;

	var switchExpand = function(branch){
		//console.log(branch);



		if(branch.expanded === true){
			branch.expanded = false;
		}
		else if(branch.expanded ===false){
			branch.expanded = true;
		}

	}

	//this is the select function that is run every time a thing is clicked. it broadcasts the thing that is clicked and sets all the parents and grandparents and soforth to the service.
	var genericSelectFunction = function(branch){
		console.log(branch);
		//switchExpand(branch);

		var ser = facilitySelectorService;
		switch(branch.type){
		case 'organization': ser.setOrganization(branch.label,true);
		break;
		case 'facility': ser.setFacility(branch.label,true); 
		var org = searchScopeWithUid($scope.my_data,branch.parent_uid,0,10);
		//branch.children = fetchChildrenFromController(vm.my_data, branch.label, branch.type);
		//fetchChildrenFromController2(vm.my_data,branch);
		if(org!==null){
			genericSet(org.type,org.label,false);
		}
		break;
		case 'building': ser.setBuilding(branch.label,true); 
		var facility = searchScopeWithUid($scope.my_data,branch.parent_uid,0,10);
		if(facility!==null){
			//branch.children = fetchChildrenFromController(vm.my_data, branch.label, branch.type);
			//fetchChildrenFromController2(vm.my_data,branch);
			genericSet(facility.type,facility.label,false);
			var org = searchScopeWithUid($scope.my_data,facility.parent_uid,0,10);
			if(org!==null){
				genericSet(org.type,org.label,false);
			}
		}
		break;
		case 'assetType': ser.setAssetType(branch.label,true); 
		var building = searchScopeWithUid($scope.my_data,branch.parent_uid,0,10);
		if(building!==null){
			//branch.children = fetchChildrenFromController(vm.my_data, branch.label, branch.type);
			//fetchChildrenFromController2(vm.my_data,branch);
			genericSet(building.type,building.label,false);
			var facility = searchScopeWithUid($scope.my_data,building.parent_uid,0,10);
			if(facility!==null){
				genericSet(facility.type,facility.label,false);
				var org = searchScopeWithUid($scope.my_data,facility.parent_uid,0,10);
				if(org!==null){
					genericSet(org.type,org.label,false);
				}
			}
		}
		//TODO: Testing
		//console.log(building);
		querySkySpark(branch,building.siteRef,null);
		break;
		case 'asset': ser.setAsset(branch.label,true); 
		var assType = searchScopeWithUid($scope.my_data,branch.parent_uid,0,10);
		if(assType!==null){
			//branch.children = fetchChildrenFromController(vm.my_data, branch.label, branch.type);
			fetchChildrenFromController2(vm.my_data,branch);
			genericSet(assType.type,assType.label,false);
			var building = searchScopeWithUid($scope.my_data,assType.parent_uid,0,10);
			if(building!==null){
				genericSet(building.type,building.label,false);
				var facility = searchScopeWithUid($scope.my_data,building.parent_uid,0,10);
				if(facility!==null){
					genericSet(facility.type,facility.label,false);
					var org = searchScopeWithUid($scope.my_data,facility.parent_uid,0,10);
					if(org!==null){
						genericSet(org.type,org.label,false);
					}
				}
			}
		}
		//TODO: Testing
		//console.log(building);

		querySkySpark(branch,branch.siteRef,branch.equipRef);
		break;
		case 'point': ser.setPoint(branch.label,true);
		var asset = searchScopeWithUid($scope.my_data,branch.parent_uid,0,10);
		if(asset!==null){
			//branch.children = fetchChildrenFromController(vm.my_data, branch.label, branch.type);
			fetchChildrenFromController2(vm.my_data,branch);
			genericSet(asset.type,asset.label,false);
			var assType = searchScopeWithUid($scope.my_data,asset.parent_uid,0,10);
			if(assType!==null){
				genericSet(assType.type,assType.label,false);
				var building = searchScopeWithUid($scope.my_data,assType.parent_uid,0,10);
				if(building!==null){
					genericSet(building.type,building.label,false);
					var facility = searchScopeWithUid($scope.my_data,building.parent_uid,0,10);
					if(facility!==null){
						genericSet(facility.type,facility.label,false);
						var org = searchScopeWithUid($scope.my_data,facility.parent_uid,0,10);
						if(org!==null){
							genericSet(org.type,org.label,false);
						}
					}
				}
			}
		}
		break;
		}
	}

	var fetchChildrenFromController = function(node, label, type){
		//console.log('searching....');
		//console.log(node);
		//console.log(label);
		//console.log(type);

		//If an array of nodes is passed in...
		if(node.length && node.length > 0){
			//console.log('array');
			for(var i = 0; i < node.length; i++){
				var value = node[i];
				var children = fetchChildrenFromController(value, label, type);

				if(children){
					return children;
				}
			};
		}

		if(node.label  && node.type && node.label === label && node.type === type){
			//console.log('found!');

			return vm.getTopLevelData(JSON.parse(JSON.stringify(node.children)), [node.children[0].type]);
		}
		else{	
			for(var i = 0; node.children && node.children.length && i < node.children.length; i++){
				var value = node.children[i];
				var children = fetchChildrenFromController(value, label, type);

				if(children){
					//console.log('found!');
					//console.log(children);
					return vm.getTopLevelData(JSON.parse(JSON.stringify(children)), [children[0].type]);
				}
			};
		}

		return false;
	}
	var parentArray = [];

	var fetchChildrenFromController2 = function(controllerData,branch){
		//console.log(branch.children);
		if(branch.children!==undefined){


			if(branch.children.length!==0 && branch.expanded===false){
				branch.children = [];
			}
			else{
				//console.log(controllerData);
				parentArray = [];
				getToTheTop($scope.my_data,branch);
				//console.log(parentArray);
				parentArray.reverse();
				//console.log(parentArray);
				var thisParent = controllerData;


				for(var a=0;a<parentArray.length;a++){
					//console.log(thisParent);

					var thisTemp = checkWhichIsMine(thisParent,parentArray[a]);
					//console.log(thisTemp);
					thisParent = thisTemp;

					/*if(thisParent===null){
				return null;
			}*/
				}
				var parentCopy = JSON.parse(JSON.stringify(thisParent))
				for(var a=0;a<parentCopy.length;a++){
					parentCopy[a].children = [];
				}
				//console.log(branch);
				//console.log(parentCopy);
				branch.children = parentCopy;
			}
		}
	}

	var checkWhichIsMine = function(controllerData,reference){
		for(var b=0;controllerData.length;b++){
			//console.log(controllerData[b]);
			//console.log(reference);
			if(controllerData[b].label===reference){

				//this is the node we want.
				return controllerData[b].children;
			}
		}
		return null;
	}

	var getToTheTop = function(controllerData,branch){
		parentArray.push(branch.label);
		if(branch.parent_uid!==undefined){
			var parentBranch = searchScopeWithUid(controllerData,branch.parent_uid,0,10);
			if(parentBranch!==null){
				getToTheTop(controllerData,parentBranch);
			}
		}
	}

	vm.getTopLevelData = function(dataArray, acceptableTypeArray){
		dataArray = dataArray || [];
		acceptableTypeArray = acceptableTypeArray || [];

		var typeAccepted = function(){
			var accepted = false;

			for(var i = 0; i < acceptableTypeArray.length; i++){
				if(dataArray[0].type === acceptableTypeArray[i]){
					accepted = true;
				}
			}

			return accepted;
		}

		if(dataArray.length > 0 && typeAccepted()){

			angular.forEach(dataArray, function(value, key){
				value.children = vm.getTopLevelData(value.children, acceptableTypeArray);
			})

			return dataArray;
		}
		else{
			angular.forEach(dataArray, function(value, key){
				value.children = [];
			})
			return [];
		}
	}

//	function that returns the proper service setting function depending on the string input
	var genericSet = function(type,label,broadcast){
		var ser = facilitySelectorService;
		switch(type){
		case 'organization':
			ser.setOrganization(label,broadcast);
			break;
		case 'facility':
			ser.setFacility(label,broadcast);
			ser.setFacilityNames(label,broadcast);
			break;
		case 'building':
			ser.setBuilding(label,broadcast);
			break;
		case 'assetType':
			ser.setAssetType(label,broadcast);
			break;
		case 'asset':
			ser.setAsset(label,broadcast);
			break;
		case 'point':
			ser.setPoint(label,broadcast);
			break;
		}
	}

//	function that goes through the rootscope and returns the scope that has the passed uid. This one was :(
	var searchScopeWithUid = function(startingArray,uid,depth,allowedDepth){
		//console.log(startingArray);
		for(var a=0;a<startingArray.length;a++){

			var startingScope = startingArray[a];
			var result;

			if(startingScope.uid!==undefined){
				if(startingScope.uid===uid){
					return startingScope;
				}
			}
			if(depth<=allowedDepth && startingScope.children.length!==0){
				result =  searchScopeWithUid(startingScope.children,uid,depth+1,allowedDepth);
			}
			if(result!==null && result!==undefined){
				return result;
			}
		}
		return null;
	}

//	sets the on click for each clickable node
	$scope.my_tree_handler = genericSelectFunction;

//	prints scope and related information
	$scope.debug = function () {
		console.log($scope);

		//console.log("facility"+facilitySelectorService.getFacility());
		//console.log("Organization"+facilitySelectorService.getOrganization());
		//console.log("AssetType"+facilitySelectorService.getAssetType());
		//console.log("Asset"+facilitySelectorService.getAsset());
		//console.log("Point"+facilitySelectorService.getPoint());
	};	 

//	intialize data as loading before the data is populated from the server
	var allTheThings = [
	                    {label:"loading"}
	                    ];
//	Bind my_data to the var array allTheThings
	$scope.my_data = allTheThings;

//	forces the pullData function to run when everything is loaded
	$timeout(function() {
		//refreshConfigs();
		//$scope.my_data = my_data;
	},0)			 

//	..shrug?
	$scope.my_tree = tree = {};

//	pushes the totalHierarchy field of data to the collection. Is used after getting data from the csv. Probably can be removed. Probably.
	$scope.pushData = function(){
		//console.log($scope.totalHierarchy);
		var config = {
				method:'POST',
				headers: {'Collection': 'totalHierarchy'},
				url:"https://galaxy2021temp.pcsgalaxy.net:9453/db/save",
				data:''+$scope.totalHierarchy+''
		};
		dbService.getData(config);

	}
//	TODO: use user information to get the array of organizations and facilities that are accessible by this user.

	var thisOrganizations = ["Deutsche Bank"];//currentConfig.organization;

	var my_data = [];

//	pulls Data from the totalHierarchy collection and sets the result to my_data
	pullData = function(){
		/** angela moved this into the pull data function...*/
		var thisOrganizations = [currentConfig.organizationName];

		//console.log($scope.totalHierarchy);
		var config = {
				method:'POST',
				headers: {'Collection': 'totalHierarchy'},
				url:"https://galaxy2021temp.pcsgalaxy.net:9453/db/query",
				data:'{}'
		};
		dbService.getData(config).then(function(response){
			//only get mrl data here
			my_data = [];
			//console.log(my_data);

			for(var a=0;a<response.data.result.length;a++){
				//console.log(response.data.result[a]);
				for(var b=0;b<thisOrganizations.length;b++){
					if(response.data.result[a].label===thisOrganizations[b]){

						//$scope.my_data.push(response.data.result[a]);
						my_data.push(response.data.result[a]);
						//console.log('done pushing to my_data');
						//console.log(my_data);
						//console.log($scope.my_data);
					}
				}
			}

			//only put a 'scraped' (reduced, only top level objects) data structure on the $scope. Add full data structure to 'this' context of the controller so that other functions can make use of it.
			var scrapedData = vm.getTopLevelData(JSON.parse( JSON.stringify( my_data ) ), ["organization", "facility"]);
			vm.my_data = my_data;

			//console.log('data after scraping : ');
			//console.log(scrapedData);
			//console.log(vm.my_data);
			$scope.my_data = scrapedData;

			//console.log(my_data);
			//$scope.my_data = response.data.result;
		});

	}

	var checkTotalHierarchy = function(arg,totalHierarchy){
		for(var a=0;a<totalHierarchy.length;a++){
			if(totalHierarchy[a].label===arg){
				return totalHierarchy[a];
			}
		}
		return null;
	}

	var newCopy = function(arg){
		return JSON.parse(JSON.stringify(arg));
	}


	var querySkySpark = function(branch,siteRef,equipRef){
		if(branch.expanded===true){
			var parentName = branch.label;
			var targetType = branch.type;
			switch(targetType){
			case 'organization':
				break;
			case 'facility':

				break;
			case 'building':

				break;
			case 'assetType':
				querySkySparkEquip(branch,siteRef);
				break;
			case 'asset':
				querySkySparkPoint(branch,siteRef,equipRef);
				break;
			case 'point':

				break;
			}
		}
		else{
			branch.children = [];
		}
	}

	var querySkySparkEquip= function(branch,siteRef){
		var thisId = siteRef
		//console.log(siteRef);
		config = {
				method:'POST',
				headers: {'Authorization': 'Basic ZGV2OjEyMzQ1','Accept':'application/json','Content-Type':'text/zinc'},
				url:"https://galaxy2021temp.pcsgalaxy.net:9453/api/galaxy/read",
				data:'ver:"2.0"\nfilter,limit\n"equip and '+convertAssetTypeNaming(branch.label)+' and siteRef=='+thisId+'",200000',

		};
		dbService.getData(config).then(function(response){
			//console.log(response);
			//create totalhierarchy object for the response
			var thisArray = [];
			for(var a=0;a<response.data.rows.length;a++){

				var thisObject = {};
				var thisData = response.data.rows[a];
				thisObject.label = thisData.navName;
				thisObject.type = "asset";
				thisObject.siteRef = siteRef;
				thisObject.equipRef = thisData.id;
				thisArray.push(newCopy(thisObject));

			}
			//console.log(thisArray);

			branch.children = newCopy(thisArray);

		})
	}

	var convertAssetTypeNaming = function(arg){
		switch(arg){
		case 'AHUs':
			return "ahu";
			break;
		case 'VAVs':
			return "vav";
			break;
		case 'Pumps':
			return "pump";
			break;
		case 'Chillers':
			return "chiller";
			break;
		case 'Meters':
			return "meter";
			break;
		case 'CoolingTowers':
			return "coolingTower";
			break;
		case 'Unlabeled/General AssetType':
			return null;
			break;
		}
	}

	var querySkySparkPoint= function(branch,siteRef,equipRef){
		equipRef = equipRef.substring(0,equipRef.indexOf(" "));
		//console.log(siteRef);
		var assetType = convertAssetTypeNaming(branch.type);
		if(assetType!==null){

			config = {
					method:'POST',
					headers: {'Authorization': 'Basic ZGV2OjEyMzQ1','Accept':'application/json','Content-Type':'text/zinc'},
					url:"https://galaxy2021temp.pcsgalaxy.net:9453/api/galaxy/read",
					data:'ver:"2.0"\nfilter,limit\n"point and equipRef=='+equipRef+' and not ahu and not vav and not pump and not coolingTower and not meter and not chiller",200000',

			};
		}
		else{
			config = {
					method:'POST',
					headers: {'Authorization': 'Basic ZGV2OjEyMzQ1','Accept':'application/json','Content-Type':'text/zinc'},
					url:"https://galaxy2021temp.pcsgalaxy.net:9453/api/galaxy/read",
					data:'ver:"2.0"\nfilter,limit\n"point and equipRef=='+equipRef+' and '+assetType+'",200000',

			};
		}
		dbService.getData(config).then(function(response){
			//console.log(response);
			//create totalhierarchy object for the response
			var thisArray = [];
			for(var a=0;a<response.data.rows.length;a++){

				var thisObject = {};
				var thisData = response.data.rows[a];
				thisObject.label = thisData.navName;
				thisObject.type = "point";
				thisObject.siteRef = siteRef;

				thisObject.equipRef = equipRef
				thisArray.push(newCopy(thisObject));

			}
			//console.log(thisArray);

			branch.children = newCopy(thisArray);

		})
	}

	/*var querySkySparkOrg = function(parentName){
		var config = {
				method:'GET',
				headers: {'Authorization': 'Basic ZGV2OjEyMzQ1','Accept':'application/json'},
				url:"https://galaxy2021temp.pcsgalaxy.net:9453/api/galaxy/read?filter=site",
				data:'{}',
				withCredentials:'true'
		};
		dbService.getData(config).then(function(response){
			var siteArray = response.data.rows
			var totalHierarchy = [];
			//organization level
			for(var a=0;a<siteArray.length;a++){
				thisOrg = siteArray[a].organization;

				var hierarchy = checkTotalHierarchy(thisOrg,totalHierarchy)
				if(hierarchy!=null){

				}
				else{
					var thisObject = {};
					thisObject.label = thisOrg;
					totalHierarchy.push(thisObject);
				}
			}
		}
		)
	}*/

	var determineAssetType = function(response,b){
		var thisAssetType;
		if(response.data.rows[b].ahu!==undefined){
			thisAssetType = "AHU";

		}
		else if(response.data.rows[b].vav!==undefined){
			thisAssetType = "VAV";

		}
		else if(response.data.rows[b].pump!==undefined){
			thisAssetType = "Pump";

		}
		else if(response.data.rows[b].chiller!==undefined){
			thisAssetType = "Chiller";

		}
		else if(response.data.rows[b].coolingTower!==undefined){
			thisAssetType = "CoolingTower";

		}
		else if(response.data.rows[b].meter!==undefined){
			thisAssetType = "Meter";

		}
		else if(response.data.rows[b].heatExchanger!==undefined){
			thisAssetType = "Heat Exchanger";

		}
		else if(response.data.rows[b].compressor!==undefined){
			thisAssetType = "Compressor";

		}
		else{
			thisAssetType = "Unlabeled/General Asset Type"
		}
		return thisAssetType;
	}

	//This is a different pull data used to get information from skyspark and parse it into the correct format
	var pullData2 = function(){
		var thisOrganizations = [currentConfig.organizationName];
		//var thisOrganizations = ["Deutsche Bank"];
		var config = {
				method:'GET',
				headers: {'Authorization': 'Basic ZGV2OjEyMzQ1','Accept':'application/json'},
				url:"https://galaxy2021temp.pcsgalaxy.net:9453/api/galaxy/read?filter=site",
				data:'{}',
		};
		dbService.getData(config).then(function(response){
			var siteArray = response.data.rows
			var totalHierarchy = [];
			//organization level
			for(var a=0;a<siteArray.length;a++){
//console.log(thisOrganizations);
				thisOrg = siteArray[a].organization;
				if(thisOrganizations.indexOf(thisOrg)!==-1){
					var hierarchy = checkTotalHierarchy(thisOrg,totalHierarchy)
					if(hierarchy!=null){

					}
					else{
						var thisObject = {};
						thisObject.label = thisOrg;
						thisObject.type="organization";
						totalHierarchy.push(thisObject);
					}
				}
			}

			//station level
			for(var a=0;a<siteArray.length;a++){

				thisOrg = siteArray[a].organization;
				thisStation = cleaningService.campusFullName(siteArray[a].station);
				thisBuilding = siteArray[a].dis;
				//console.log(thisStation);
				if(thisStation===undefined){
					thisStation="Unlabeled/General Station";
				}
				if(thisBuilding===undefined){
					thisBuilding="Unlabeled/General Building";
				}
				if(thisOrg===undefined){
					thisOrg="Unlabeled/General Organization";
				}

				for(var b=0;b<totalHierarchy.length;b++){
					if(totalHierarchy[b].label===thisOrg){
						organizationLevel = totalHierarchy[b];
						if(organizationLevel.children===undefined){
							organizationLevel.children=[];
						}
						var thisObject = {};
						thisObject.label = thisStation;
						thisObject.type="facility";
						if(checkTotalHierarchy(thisObject.label,organizationLevel.children)===null){
							organizationLevel.children.push(thisObject);
						}
						break;
					}
				}

			}

			//building level
			for(var a=0;a<siteArray.length;a++){

				thisOrg = siteArray[a].organization;
				thisStation = cleaningService.campusFullName(siteArray[a].station);
				thisBuilding = siteArray[a].dis;
				if(thisStation===undefined){
					thisStation="Unlabeled/General Station";
				}
				if(thisBuilding===undefined){
					thisBuilding="Unlabeled/General Building";
				}
				if(thisOrg===undefined){
					thisOrg="Unlabeled/General Organization";
				}
				var thisId = siteArray[a].id.substring(0,siteArray[a].id.indexOf(" "));

				breakpoint:
					for(var b=0;b<totalHierarchy.length;b++){
						var organizationLevel = totalHierarchy[b];
						if(organizationLevel.label===thisOrg){
							for(var c=0;c<organizationLevel.children.length;c++){
								var stationLevel = organizationLevel.children[c];
								var thisObject = {};
								if(stationLevel.label===thisStation){
									if(stationLevel.children===undefined){
										stationLevel.children=[];
									}
									thisObject.label = thisBuilding;
									thisObject.type = "building";
									thisObject.siteRef = thisId; 
									if(checkTotalHierarchy(thisObject.label,stationLevel.children)===null){
										stationLevel.children.push(newCopy(thisObject));
									}
									for(var e=0;e<stationLevel.children.length;e++){
										//console.log(stationLevel.children[e]);
										var buildingLevel = stationLevel.children[e];
										if(buildingLevel.children===undefined){
											buildingLevel.children = [];
										}
										var assetTypeOptions = ["AHUs","VAVs","Chillers","Meters","CoolingTowers","Pumps","Unlabeled/General AssetType"];

										for(var f=0;f<assetTypeOptions.length;f++){
											thisObject = {};
											thisObject.label = assetTypeOptions[f];
											thisObject.type = "assetType";

											if(checkTotalHierarchy(thisObject.label,buildingLevel.children)===null){
												buildingLevel.children.push(newCopy(thisObject));
											}
										}
									}
									//console.log(thisObject.label);
									break breakpoint;
								}
							}
						}
					}
			}

			$scope.my_data = newCopy(totalHierarchy);;
			vm.my_data = $scope.my_data;
		});
	}

	//pullData2();
//	pulls Data from the totalHierarchy collection and sets the result to my_data
	pullDataAndFilter = function(){
		my_data = [];
		//console.log($scope.totalHierarchy);
		var config = {
				method:'POST',
				headers: {'Collection': 'totalHierarchy'},
				url:"https://galaxy2021temp.pcsgalaxy.net:9453/db/query",
				data:'{}'
		};
		dbService.getData(config).then(function(response){
			//only get mrl data here


			for(var a=0;a<response.data.result.length;a++){
				//console.log(response.data.result[a]);
				for(var b=0;b<thisOrganizations.length;b++){
					if(response.data.result[a].label===thisOrganizations[b]){

						//$scope.my_data.push(response.data.result[a]);
						my_data.push(response.data.result[a]);

						//console.log($scope.my_data);
					}
				}
			}

			$scope.my_data = checkForTag(my_data);

			//console.log(my_data);
			//$scope.my_data = response.data.result;
		});

	}


	var checkForTag = function(checkArray){
		//console.log(checkArray);
		var newArray = []; 


		for(var a=0;a<checkArray.length;a++){
			var newObject = checkArray[a];
			if(checkArray[a].children===undefined){
				//console.log("at bottom");
				//at bottom
				//check tag and add it if present
				if(checkArray[a].tag!==undefined){
					if(checkArray[a].tag===$scope.filterTag){

						//found the filtertag
						//newArray.push(checkArray[a]);
						newObject = checkArray[a];
						newArray.push(newObject);
						//newObject.children = newArray;
					}
					else{
						//didnt find the filter tag
						//checkArray.splice(a,1);
						//a--;
					}
				}
				else{
					//didnt find the filter tag
					//checkArray.splice(a,1);
					//a--;
				}
			}
			else{
				if(checkArray[a].children.length===0){
					//console.log("at bottom");
					//at bottom
					//check tag and add it if present
					if(checkArray[a].tag!==undefined){
						if(checkArray[a].tag===$scope.filterTag){

							//found the filtertag
							//newArray.push(checkArray[a]);
							newObject = checkArray[a];
							newArray.push(newObject);
							//newObject.children = newArray;
						}
						else{
							//didnt find the filter tag
							//checkArray.splice(a,1);
							//a--;
						}
					}
					else{
						//didnt find the filter tag
						//checkArray.splice(a,1);
						//a--;
					}
				}
				else{
					//console.log("not at bottom");
					//not at bottom. keep going down
					newObject.children = checkForTag(checkArray[a].children);
					newArray.push(newObject);
				}
			}


		}
		//console.log(newArray);
		return newArray;
	}



	$scope.applyFilter = function(){

		if($scope.filterTag==="" || $scope.filterTag===undefined){
			//console.log("i am blank");
			//$scope.my_data = $scope.savedData;
			refreshConfigs();
			$scope.my_data = my_data;
		}
		else{
			//console.log(my_data);
			pullDataAndFilter();
			/*$scope.my_data = my_data;
		var thisArray = checkForTag($scope.my_data);
		$scope.my_data = thisArray;*/
		}
	}

	/*$scope.$watch(
	   //This function returns the value being watched. It is called for each turn of the $digest loop
	   function () {
		        return {
		            'savedData':$scope.savedData
		        };
		    },
	  // This is the change listener, called when the value returned from the above function changes
	  function(newValue, oldValue) {
		    	//console.log($scope);
		    	console.log(newValue);
		    	console.log(oldValue);

	  },true
	);*/

	/*$scope.$watch(
			   //This function returns the value being watched. It is called for each turn of the $digest loop
			   function () {
				        return {
				            'filterTag':$scope.filterTag
				        };
				    },
			  // This is the change listener, called when the value returned from the above function changes
			  function(newValue, oldValue) {
				    	console.log($scope);
				    	console.log(newValue);
				    	console.log(oldValue);

			  },true
			);*/

	/*	$scope.$watch(
			//This function returns the value being watched. It is called for each turn of the $digest loop
			function () {
				return {
					'facilitySelectorOrganizationName':$scope.facilitySelectorConfig.organizationName,
					'facilitySelectorFacilityName':$scope.facilitySelectorConfig.facilityName,
				};
			},
			// This is the change listener, called when the value returned from the above function changes
			function(newValue, oldValue) {
				console.log("facility selector scope triggered.");
				console.log(newValue);
				console.log(oldValue);
				thisOrganizations = [];
				thisOrganizations.push($scope.facilitySelectorConfig.organizationName);
				pullData();
			},true
	);*/

	refreshConfigs();

}])
.directive('facilitySelector', [ function() {
	return {
		restrict: 'E',
		templateUrl : 'icWidgets/facilitySelector.html'
	}
}]);
