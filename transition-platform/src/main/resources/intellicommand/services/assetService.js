// Angela's code

'use strict';

angular.module('icDash.assetService', ['ui.router'])

.factory('assetService', ['mongoService', function(mongoService) {
    return {
		// Object with all information about required facilities
		getFacilities: function(clientName, facilityNames){
			if (typeof facilityNames == "object") {
				console.log("here");
				var promise = mongoService.queryDb({"clientName": clientName}, "facilities");
			}else {
				var promise = mongoService.queryDb({"clientName": clientName, "projectName": facilityNames}, "facilities");
			}
			return promise.then(function(results) {
				var facilityList = _.map(results, function(x) {
					return {
						organization: x.clientName, // ex: Merck
						facilityName: x.projectName, // ex: Upper Gywnedd
						stationName: x.stationName, //ex: MRL
						address: x.facilityAddress, // ex: 33 Ave Louis Pasteur
						city: x.city, // ex: Boston
						state: x.state, // ex: MA
						zipCode: x.zipCode, // ex: 12345
						country: x.country, // ex: US
						squareFootage: Number(x.squareFootage), // ex: 123,000
						buildingType: x.buildingType, // ex: Commercial
						liveDate: x.liveDate, // ex: Thu Jan 01 22:06:19 EST 2015
						keyAssets: 547 /** obviously this needs to come from somewhere **/
					};
				});
				return facilityList;
			}, function() {
				//console.log('fail to query facility data from database');
			});
		},
		
		// Object with information about a specific asset
		getAsset: function(stationName, assetName){
			var promise = mongoService.queryDb({"stationName": stationName}, "facilities");
			return promise.then(function(results) {
				if (results === undefined || results[0] === undefined || stationName == "" || assetName == "") { // If the database times out, just return instead of throwing errors
					return;
				}
				var campusFullName = results[0].projectName; // ex: 60 Wall Street
				var orgFullName = results[0].clientName; // ex: Deutsche Bank
				
				// given a record with "asset": {"ahus":["AHU1", ...], "otherThings":["ABC1", ...], ...}
				// and given the assetId "AHU1", find "ahu"
				var assets = results[0].asset; // assets is a dictionary; we need to find the matching kvp
				
				/******* Append terminal unit information manually until it is added to the database ********/
				assets.terminalUnits = { 
				/*** comment this section out because Mongo has VAVs already added at the top level...
					"vavs": [
						{parent: "AHU1", unitName: "VAV_1"},
						{parent: "AHU2", unitName: "VAV_2"},
						{parent: "AHU3", unitName: "VAV_3"},
						{parent: "AHU4", unitName: "VAV_4"},
						{parent: "AHU4", unitName: "VAV_5"},
						{parent: "AHU4", unitName: "VAV_6"},
						{parent: "AHU1", unitName: "VAV_7"},
						{parent: "AHU2", unitName: "VAV_8"},
						{parent: "AHU3", unitName: "VAV_9"},
						{parent: "AHU4", unitName: "VAV_10"},
						{parent: "AHU3", unitName: "VAV_11"},
						{parent: "AHU4", unitName: "VAV_12"},
						{parent: "AHU4", unitName: "VAV_13"},
						{parent: "AHU4", unitName: "VAV_14"},
						{parent: "AHU1", unitName: "VAV_15"}, 
					],
				***/
					"cavs": [
						{parent: "AHU3", unitName: "CAV_1"},
						{parent: "AHU4", unitName: "CAV_2"},
						{parent: "AHU2", unitName: "CAV_3"},
						{parent: "AHU1", unitName: "CAV_4"},
						{parent: "AHU2", unitName: "CAV_5"},
						{parent: "AHU3", unitName: "CAV_6"},
						{parent: "AHU4", unitName: "CAV_7"},
						{parent: "AHU1", unitName: "CAV_8"},
						{parent: "AHU2", unitName: "CAV_9"},
						{parent: "AHU3", unitName: "CAV_10"},
						{parent: "AHU4", unitName: "CAV_11"},
						{parent: "AHU1", unitName: "CAV_12"},
						{parent: "AHU1", unitName: "CAV_13"},
						{parent: "AHU1", unitName: "CAV_14"},
						{parent: "AHU1", unitName: "CAV_15"}, 
					],
					"fcus": [
						{parent: "AHU3", unitName: "FCU_1"},
						{parent: "AHU4", unitName: "FCU_2"},
						{parent: "AHU2", unitName: "FCU_3"},
						{parent: "AHU1", unitName: "FCU_4"},
						{parent: "AHU2", unitName: "FCU_5"},
						{parent: "AHU3", unitName: "FCU_6"},
						{parent: "AHU4", unitName: "FCU_7"},
						{parent: "AHU1", unitName: "FCU_8"},
						{parent: "AHU2", unitName: "FCU_9"},
						{parent: "AHU3", unitName: "FCU_10"},
						{parent: "AHU4", unitName: "FCU_11"},
						{parent: "AHU1", unitName: "FCU_12"},
						{parent: "AHU1", unitName: "FCU_13"},
						{parent: "AHU1", unitName: "FCU_14"},
						{parent: "AHU1", unitName: "FCU_15"}, 
					],
					"fpbs": [
						{parent: "AHU2", unitName: "FPB_1"},
						{parent: "AHU3", unitName: "FPB_2"},
						{parent: "AHU4", unitName: "FPB_3"},
						{parent: "AHU2", unitName: "FPB_4"},
						{parent: "AHU2", unitName: "FPB_5"},
						{parent: "AHU3", unitName: "FPB_6"},
						{parent: "AHU3", unitName: "FPB_7"},
						{parent: "AHU1", unitName: "FPB_8"},
						{parent: "AHU2", unitName: "FPB_9"},
						{parent: "AHU3", unitName: "FPB_10"},
						{parent: "AHU4", unitName: "FPB_11"},
						{parent: "AHU2", unitName: "FPB_12"},
						{parent: "AHU3", unitName: "FPB_13"},
						{parent: "AHU1", unitName: "FPB_14"},
						{parent: "AHU2", unitName: "FPB_15"}, 
					]
				};
				/******* End append terminal unit information manually until it is added to the database ****/
				
				/***** since the database has been completely messed up.... let's call everything an AHU for now ****
				// Flattens the whole terminal unit object to single arrays by asset type like the rest of the database,
				// then deletes the original terminal units object from the array before moving on
				_.forEach(assets.terminalUnits, function(n, key) {assets[key] = _.pluck(n, "unitName");});
				delete assets.terminalUnits;

				var assetPairs = _.pairs(assets); // assetPairs is an array of pairs of keys and values
				var assetPair = _.find(assetPairs, function(kvp) { return _.contains(kvp[1], assetName) }); // get the matching pair
				var assetTypePlural = assetPair[0]; // choose the key from the pair
				var assetType = assetTypePlural.substring(0, assetTypePlural.length-1); //remove the 's' from the end
				/*******end area removed because of messed up database **************/
				var assetType = "ahu";
				
				
				
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
			var promise = mongoService.queryDb({"clientName": orgFullName, "projectName": campusFullName}, "facilities");
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
            
			var promise = mongoService.queryDb({"stationName": stationName, "asset": assetName, "status":{"$ne":"Closed"}}, "events");
            return promise.then(function(results) {
				if (results === undefined || stationName == "" || assetName == "") { // If the database times out, just return instead of throwing errors
					//console.log('assetService.getEvents: database timed out or failed to retrieve data');
					return;
				}
				var newResults = _.map(results, function(x) {
					var tempDates = [];
					_.forEach(x.updatedTime, function(y) {
						_.forEach(y, function(z) {
							tempDates.push(Date(z));
						});
					});
					
                    return { 
						pciEventId: x.eventID, // ex: DEU-12345
						campusFullName: x.facility, // ex: 60 Wall Street
						assetName: x.asset, // ex: AHU1
						anomaly: x.anomaly, // ex: Sensor out of Range
						createdTime: Date(x.createdTime.$date), // ex: Thu Jan 01 22:06:19 EST 2015
						stationName: x.stationName, // ex: WLST
						orgName: x.organization, // ex: DEU
						waste: x.waste, // ex: 7.59
						potentialSaving: x.potentialSaving, // ex: 726.54
						updatedTime: tempDates, // ex: [Fri Jan 02 22:06:19 EST 2015,Sun Jan 04 22:06:19 EST 2015]
		            };
                });
				return newResults;
            }, function() {
				//console.log('fail to query event data from database');
            });
        }
    };
}]);