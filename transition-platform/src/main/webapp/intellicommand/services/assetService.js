// Angela's code

'use strict';

angular.module('icDash.assetService', ['ui.router', 'icDash.cleaningService','icDash.pciService'])

.factory('assetService', ['skySparkService','cleaningService','SkySparkAPI', function(skySparkService,cleaningService,SkySparkAPI) {
	var parseOutId = function(arg){
		console.log(arg);
		return arg.substring(arg.indexOf(" ",arg.length+1));
	}
	
	var parseOutStationAcro = function(arg){
		return arg.substring(arg.indexOf(" ")+1);
	}
	
	var parseOutStationCode = function(woRef){
		console.log(woRef);
		console.log(woRef.substring(1,4));
		return woRef.substring(1,4);
		
	}
    return {
    	
    	
    	
		// Object with all information about required facilities
		getFacilities: function(clientName, facilityNames){
			if (typeof facilityNames == "object") {
				console.log("here");
				var promise = skySparkService.queryDb("site and organization==\\\""+clientName+"\\\"");
			}else {
				var promise = skySparkService.queryDb("site and organization==\\\""+clientName+"\\\" and dis==\\\""+facilityNames+"\\\"");
			}
			return promise.then(function(results) {
				console.log(results);
				var facilityList = _.map(results, function(x) {
					return {
						organization: x.organization, // ex: Merck
						facilityName: x.dis, // ex: Upper Gywnedd
						stationName: x.station, //ex: MRL
						address: x.geoAddr, // ex: 33 Ave Louis Pasteur
						city: x.geoCity, // ex: Boston
						state: x.geoState, // ex: MA
						zipCode: x.zipCode, // ex: 12345
						country: x.geoCountry, // ex: US
						squareFootage: Number(x.area), // ex: 123,000
						buildingType: x.buildingType, // ex: Commercial
						liveDate: x.liveDate, // ex: Thu Jan 01 22:06:19 EST 2015
						keyAssets: x.keyAssets /** obviously this needs to come from somewhere **/
					};
				});
				return facilityList;
			}, function() {
				//console.log('fail to query facility data from database');
			});
		},
		
		// Object with information about a specific asset
		getAsset: function(stationName, assetName){
			//var promise = skySparkService.queryDb("equip and navName==\\\""+assetName+"\\\" and siteRef->station==\\\""+cleaningService.campusName(stationName)+"\\\"");
			console.log("getAsset is called");
			console.log(stationName);
			console.log(assetName);
			var stationAcro = cleaningService.campusName(stationName);
			if(assetName===null){
				
				//var promise = skySparkService.queryDb("equip and siteRef->station==\\\""+cleaningService.campusName(stationName)+"\\\"");
				
				//var promise = SkySparkAPI.getEquipOnStation(cleaningService.campusName(stationName));
				var req = {
						method:"POST",
						url:"https://galaxy2021temp.pcsgalaxy.net:9453/api/galaxy/eval/",
						headers:{
							"Content-Type":"text/zinc;charset=utf-8",
							"Accept":"text/csv"
						},
						data:"ver:\"2.0\""+"\n"+
							"expr"+"\n"+
							"\"queryEquipment(\\\""+stationAcro+"\\\",\\\""+assetName+"\\\")\""
				}
			}
			else{
				//var promise = skySparkService.queryDb("equip and navName==\\\""+assetName+"\\\" and siteRef->station==\\\""+cleaningService.campusName(stationName)+"\\\"");
				//var promise = skySparkService.queryDb("equip and siteRef->station==\\\"HAUN\\\" and navName==\\\"VAV2106\\\"");
				var req = {
						method:"POST",
						url:"https://galaxy2021temp.pcsgalaxy.net:9453/api/galaxy/eval/",
						headers:{
							"Content-Type":"text/zinc;charset=utf-8",
							"Accept":"text/csv"
						},
						data:"ver:\"2.0\""+"\n"+
							"expr"+"\n"+
							"\"queryEquipment(\\\""+stationAcro+"\\\",\\\""+assetName+"\\\")\""
				}
			}
			var promise = SkySparkAPI.actuallyRequest(req);
			return promise.then(function(results) {
				//console.log(results);
				console.log(results);
				if (results === undefined || results[0] === undefined || stationName == "" || assetName == "") { // If the database times out, just return instead of throwing errors
					return;
				}
				var campusFullName = results[0].siteRef.substring(results[0].siteRef.indexOf(" ")+1,results[0].siteRef.length); // ex: 60 Wall Street
				//TODO:move this to a function in skyspark instead of a hardcoded thing in cleaning service
				//var orgFullName = results[0].clientName; // ex: Deutsche Bank
				//var orgFullName = "McDonalds";
				var orgFullName = results[0].organization;
				
				var determineAssetType = function(result){
					var thisAssetType;
					if(result.ahu!==undefined){
						thisAssetType = "AHU";

					}
					else if(result.vav!==undefined){
						thisAssetType = "VAV";

					}
					else if(result.pump!==undefined){
						thisAssetType = "Pump";

					}
					else if(result.chiller!==undefined){
						thisAssetType = "Chiller";

					}
					else if(result.coolingTower!==undefined){
						thisAssetType = "CoolingTower";

					}
					else if(result.meter!==undefined){
						thisAssetType = "Meter";

					}
					else if(result.heatExchanger!==undefined){
						thisAssetType = "Heat Exchanger";

					}
					else if(result.compressor!==undefined){
						thisAssetType = "Compressor";

					}
					else{
						thisAssetType = "Unlabeled/General Asset Type"
					}
					return thisAssetType;
				}
				var assetType = determineAssetType(results[0]);
				
				
				
				/******* This section needs "location" updated in the results once it is in the database ****/
				return {"name": assetName, "type": assetType, "stationName": stationName, "campusFullName": campusFullName, "orgFullName": orgFullName, "location": "Building 1 Roof"};
					// ex: {"name": AHU1, "type": ahu, "stationName": WLST, "campusFullName": 60 Wall Street, "orgFullName": Deutsche Bank, "location": "Building 1 Roof"}
				/******* This section needs "location" updated in the results once it is in the database ****/
			}, function() {
				//console.log('fail to query asset data from database');
			});
		},
		
		// Return object of all terminal units with associated assets
		getTerminalUnits: function(orgFullName, campusFullName){
			var promise = skySparkService.queryDb({"clientName": orgFullName, "projectName": campusFullName}, "facilities");
	        return promise.then(function(results) {
	            /******* New function to be used once there are terminal units in the database ***********/
				/*
				var terminalUnits = [];
				_.forEach(results, function(n) {
					_.forEach(n, function(x) {
						terminalUnits.push(x);
					});
				});
				*/
				/******* End new function to be used once there are terminal units in the database ********/
				
				/******* Temporary hard coded results until there are terminal units in the database ******/
				var terminalUnits = [
					{parent: "AHU1", unitName: "VAV_1"}, {parent: "AHU2", unitName: "VAV_2"}, {parent: "AHU3", unitName: "VAV_3"}, {parent: "AHU4", unitName: "VAV_4"}, {parent: "AHU4", unitName: "VAV_5"},
					{parent: "AHU4", unitName: "VAV_6"}, {parent: "AHU1", unitName: "VAV_7"}, {parent: "AHU2", unitName: "VAV_8"}, {parent: "AHU3", unitName: "VAV_9"}, {parent: "AHU4", unitName: "VAV_10"},
					{parent: "AHU3", unitName: "VAV_11"}, {parent: "AHU4", unitName: "VAV_12"}, {parent: "AHU4", unitName: "VAV_13"}, {parent: "AHU4", unitName: "VAV_14"}, {parent: "AHU1", unitName: "VAV_15"},
					{parent: "AHU2", unitName: "FPB_1"}, {parent: "AHU3", unitName: "FPB_2"}, {parent: "AHU4", unitName: "FPB_3"}, {parent: "AHU2", unitName: "FPB_4"}, {parent: "AHU2", unitName: "FPB_5"},
					{parent: "AHU3", unitName: "FPB_6"}, {parent: "AHU3", unitName: "FPB_7"}, {parent: "AHU1", unitName: "FPB_8"}, {parent: "AHU2", unitName: "FPB_9"}, {parent: "AHU3", unitName: "FPB_10"},
					{parent: "AHU4", unitName: "FPB_11"}, {parent: "AHU2", unitName: "FPB_12"}, {parent: "AHU3", unitName: "FPB_13"}, {parent: "AHU1", unitName: "FPB_14"}, {parent: "AHU2", unitName: "FPB_15"},
					{parent: "AHU3", unitName: "FCU_1"}, {parent: "AHU4", unitName: "FCU_2"}, {parent: "AHU2", unitName: "FCU_3"}, {parent: "AHU1", unitName: "FCU_4"}, {parent: "AHU2", unitName: "FCU_5"},
					{parent: "AHU3", unitName: "FCU_6"}, {parent: "AHU4", unitName: "FCU_7"}, {parent: "AHU1", unitName: "FCU_8"}, {parent: "AHU2", unitName: "FCU_9"}, {parent: "AHU3", unitName: "FCU_10"},
					{parent: "AHU4", unitName: "FCU_11"}, {parent: "AHU1", unitName: "FCU_12"}, {parent: "AHU1", unitName: "FCU_13"}, {parent: "AHU1", unitName: "FCU_14"}, {parent: "AHU1", unitName: "FCU_15"}
				];
				/******* End temporary hard coded results until there are terminal units in the database ***/
				
	            return (terminalUnits);
	        }, function() {
				//console.log('fail to query terminal units data from database');
	        });
	    },
	
        // Return all open events for a given station and asset
		getEvents: function(stationName, assetName){
			console.log("getEvents is called");
			console.log(stationName);
			console.log(assetName);
			
			//var promise = skySparkService.queryDb("workOrder and siteRef->station==\""+cleaningService.campusName(stationName)+"\" and equipRef->navName==\""+assetName+"\"");
            //var promise = SkySparkAPI.getByEquipAndSiteNamesAndTags(assetName,cleaningService.campusName(stationName),"workOrder");
			//var promise = skySparkService.queryDb("workOrder and siteRef->station==\\\"HAUN\\\" and equipRef->navName==\\\"VAV2106\\\"");
			var promise = skySparkService.queryDb("workOrder and siteRef->station==\\\""+cleaningService.campusName(stationName)+"\\\" and equipRef->navName==\\\""+assetName+"\\\"");
			return promise.then(function(results) {
            	console.log(results);
            	//var placeholder = {};
            	//if(results.length===0){results.push(placeholder);}
				
				var newResults = _.map(results, function(x) {
					var tempDates = [];
					_.forEach(x.updatedTime, function(y) {
						_.forEach(y, function(z) {
							tempDates.push(Date(z));
						});
					});
					console.log(x);
					console.log(Date(x.updatedTime));
					if(x.woValue===undefined){x.woValue=0;}
                    return { 
                    	
						pciEventId: x.woRef.substring(0,x.woRef.indexOf(" ")), // ex: DEU-12345
						campusFullName: stationName, // ex: 60 Wall Street
						assetName: assetName, // ex: AHU1
						anomaly: x.signature, // ex: Sensor out of Range
						createdTime: Date(x.createdTime), // ex: Thu Jan 01 22:06:19 EST 2015
						stationName: cleaningService.campusName(stationName), // ex: WLST
						orgName: parseOutStationCode(x.woRef), // ex: DEU
						waste: 7.59, // ex: 7.59//TODO: events in skyspark do not currently have waste
						potentialSaving: x.woValue, // ex: 726.54 TODO: events in skyspark do not currently have waste
						updatedTime: [Date(x.updatedTime)], // ex: [Fri Jan 02 22:06:19 EST 2015,Sun Jan 04 22:06:19 EST 2015]
		            };
                });
				return newResults;
            }, function() {
				//console.log('fail to query event data from database');
            });
        },
	    
	    getImages: function(organizationName,facilityName){
	    	
	    }
	    
    };
}]);