angular.module('icDash.assetAPIService', [])

.factory('AssetsAPI',['$http','SkySparkAPI',function($http,ss){	
	
	var _getUniqueAssetNames = function(_facility){
		return new Promise(function(resolve,reject){
			ss.getEquipOnStation(_facility).then(
				function(assets){
					var assetNames = [];
					
					for(var i = 0; i < assets.length; i++){
						assetNames.push(assets[i].navName);
					}
					
					resolve(assetNames)},
				function(error){reject(error)}
			)
		})
	}
	
	var _getAllAssetsByType = function(_facility,_assetType){
		if(_assetType === "AHUs"){_assetType = "ahu"}
		else if(_assetType === "VAVs"){_assetType = "vav"}
		else if(_assetType === "CoolingTowers"){_assetType = "coolingTower"}
		else if(_assetType === "Plants"){_assetType = "chiller"}
		else if(_assetType === "Meters"){_assetType = "meter"}
		
		return new Promise(function(resolve,reject){
			var assets = [];
			
			ss.getByEquipAndSiteNamesAndTags(undefined,_facility,["equipRef->"+_assetType,"point"]).then(
				function(points){
					var assetObj = {};
					
					for(var i = 0; i < points.length; i++){
						var siteName = points[i].siteRef.substring(points[i].siteRef.indexOf(" ")+1);
						var equipId = points[i].equipRef.substring(0,points[i].equipRef.indexOf(" "));
						
						var assetName = points[i].equipRef.substring(points[i].equipRef.indexOf(siteName)+siteName.length+1);
						
						if(assetObj.hasOwnProperty(assetName) == false){
							assetObj[assetName] = {
								assetName:assetName,
								assetType:_assetType,
								assetId: equipId,
								points:[]
							}
						}
						
						assetObj[assetName].points.push({
							pointName:points[i].navName,
							historyId:points[i].id.substring(0,points[i].id.indexOf(" ")),
							pointUnits:points[i].unit,
							historyStatus:points[i].hisStatus,
							pciTag:points[i].navName
						})
					}
					
					
					var assetArray = [];
					for(var obj in assetObj){
						assetArray.push(assetObj[obj]);
					}

					resolve(assetArray);
				},
				function(error){
					reject(error)
				}
			)
		})
		
	}
	
	var _getAllAHUs = function(_facility){
		return _getAllAssetsByType(_facility,"ahu");
	}
	
	var _getAllVAVs = function(_facility){
		return _getAllAssetsByType(_facility,"vav");
	}
	
	var _findAssetByName = function(_facility,_assetName){
		var asset = {assetName:_assetName,points:[]};
		return new Promise(function(resolve,reject){
			ss.getByEquipAndSiteNamesAndTags(_assetName,_facility,"point").then(
				function(rawPoints){
					for(var i = 0; i < rawPoints.length; i++){
						var pt = rawPoints[i];
						var tempObj = {
								pointName:pt.navName,
								historyId:pt.id.substring(0,pt.id.indexOf(" ")),
								pciTag:pt.navName
						};
						
						asset.points.push(tempObj);
					}
					
					resolve(asset)},
				function(error){reject(error)}
			)
		})
	}
	 
	var serviceObject = {
			getUniqueAssetNames	:_getUniqueAssetNames,
			getAllAssetsByType	:_getAllAssetsByType,
			getAllAHUs			:_getAllAHUs,
			getAllVAVs 			:_getAllVAVs,
			findAssetByName		:_findAssetByName
	}
	
	return serviceObject;
}])