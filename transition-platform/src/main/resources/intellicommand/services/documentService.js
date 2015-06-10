// Angela's code; documentService.js

/************************ TODO all 'get' functions need to actually get data from the database, not just fake hard coded data. 'set' function needs to actually update the database ******************************************/

'use strict';

angular.module('myApp.completenessGauge')

.factory('documentService', ['mongoService', function(mongoService) {
    return {
        getDocuments: function(organizationName, facilityList){
			var promise = mongoService.queryDb({"clientName": organizationName, "facility": facilityList}, "Documents");
	        return promise.then(function(results) {
				var newData = [];
				var randomValue = []; // temp only until I have this in the DB
				
				for (var i = 0; i < facilityList.length; i++){
					// until I have the collection in the DB, generate random values for whether the documents are submitted to show the gauge updating on facility selection
					for (var j = 0; j < 16; j++){
						if(Math.random() < 0.5){
							randomValue[j] = 'yes';
						} else randomValue[j] = null;
					}
					newData[i] = {facility: facilityList[i], subinfo: [
						{assetId: 'AHU1', schedule: randomValue[0], drawings: randomValue[1], sop: randomValue[2], mechSpecs: randomValue[3]},
						{assetId: 'AHU2', schedule: randomValue[4], drawings: randomValue[5], sop: randomValue[6], mechSpecs: randomValue[7]},
						{assetId: 'AHU3', schedule: randomValue[8], drawings: randomValue[9], sop: randomValue[10], mechSpecs: randomValue[11]},
						{assetId: 'AHU4', schedule: randomValue[12], drawings: randomValue[13], sop: randomValue[14], mechSpecs: randomValue[15]}
					]};
				};
				
				
				// do we wnat to remove the [] from this eventually since it shold only support 1 organization? or allow support for multiples?
				var allDocuments = [{organization: organizationName, info: newData}];
				
				return(allDocuments);
			}, function() {
				console.log('fail to query schedule data from database');
	        });
	            
			/* this is what it would look like spelled out
	            var allDocuments = [
					{organization:"Deutsche Bank", info: [
						{facility:"60 Wall Street", subinfo: [
							{assetId: 'AHU1', schedule: 'yes', drawings: 'yes', sop: null, mechSpecs: 'yes'},
							{assetId: 'AHU2', schedule: null, drawings: 'yes', sop: null, mechSpecs: null},
							{assetId: 'AHU3', schedule: null, drawings: null, sop: 'yes', mechSpecs: 'yes'},
							{assetId: 'AHU4', schedule: null, drawings: 'yes', sop: null, mechSpecs: 'yes'}
						]},
						{facility:"Jacksonville", subinfo: [
							{assetId: 'AHU1', schedule: 'yes', drawings: 'yes', sop: 'yes', mechSpecs: 'yes'},
							{assetId: 'AHU2', schedule: null, drawings: 'yes', sop: 'yes', mechSpecs: 'yes'},
							{assetId: 'AHU3', schedule: 'yes', drawings: null, sop: 'yes', mechSpecs: 'yes'},
							{assetId: 'AHU4', schedule: null, drawings: 'yes', sop: null, mechSpecs: 'yes'}
						]},
					]},
					{organization:"Merck", info: [
						{facility:"Merck Research Laboratory", subinfo: [
							{assetId: 'AHU1', schedule: null, drawings: null, sop: null, mechSpecs: 'yes'},
							{assetId: 'AHU2', schedule: null, drawings: 'yes', sop: null, mechSpecs: 'yes'},
							{assetId: 'AHU3', schedule: null, drawings: null, sop: null, mechSpecs: 'yes'},
							{assetId: 'AHU4', schedule: null, drawings: 'yes', sop: null, mechSpecs: 'yes'}
						]},
						{facility:"Upper Gwynedd", subinfo: [
							{assetId: 'AHU1', schedule: 'yes', drawings: 'yes', sop: 'yes', mechSpecs: 'yes'},
							{assetId: 'AHU2', schedule: null, drawings: 'yes', sop: 'yes', mechSpecs: 'yes'},
							{assetId: 'AHU3', schedule: null, drawings: null, sop: null, mechSpecs: 'yes'},
							{assetId: 'AHU4', schedule: 'yes', drawings: 'yes', sop: null, mechSpecs: 'yes'}
						]},
					]}
				];
	            
	        */
	    },
		
		getAssetSchedule: function(organization, facility, assetId){
			var promise = mongoService.queryDb({"clientName": organization, "facility": facility, "assetId": assetId}, "Documents");
	        return promise.then(function(results) {
	            var scheduleData = {
					standardSch: [
						{day: "Sunday", runs: false, reducedLoad: true, on: new Date(1970,0,1,11,30,0), off: new Date(1970,0,1,13,0,0)},
						{day: "Monday", runs: true, reducedLoad: false, on: new Date(1970,0,1,9,0,0), off: new Date(1970,0,1,17,0,0)},
						{day: "Tuesday", runs: true, reducedLoad: true, on: new Date(1970,0,1,9,0,0), off: new Date(1970,0,1,17,0,0)},
						{day: "Wednesday", runs: true, reducedLoad: true, on: new Date(1970,0,1,9,0,0), off: new Date(1970,0,1,17,0,0)},
						{day: "Thursday", runs: false, reducedLoad: false, on: new Date(1970,0,1,9,0,0), off: new Date(1970,0,1,18,35,0)},
						{day: "Friday", runs: true, reducedLoad: false, on: new Date(1970,0,1,7,45,0), off: new Date(1970,0,1,17,0,0)},
						{day: "Saturday", runs: true, reducedLoad: false, on: new Date(1970,0,1,9,0,0), off: new Date(1970,0,1,12,0,0)}
					],
					holidaySch: [
						{day: "weekday", runs: false, reducedLoad: false, on: new Date(1970,0,1,0,0,0), off: new Date(1970,0,1,0,0,0)},
						{day: "weekend", runs: true, reducedLoad: false, on: new Date(1970,0,1,11,30,0), off: new Date(1970,0,1,13,0,0)}
					],
					observedHolidays: [
						{day: "New Year's Day (January 1)", observed: true},
						{day: "Martin Luther King Day (3rd Mon in Jan)", observed: false},
						{day: "Presidents' Day (3rd Mon in Feb)", observed: false},
						{day: "Good Friday (Fri, varies)", observed: false},
						{day: "Easter Sunday (Sun, varies)", observed: false},
						{day: "Easter Monday (Mon, varies)", observed: false},
						{day: "Memorial Day (Last Mon in May)", observed: true},
						{day: "Independance Day (July 4)", observed: true},
						{day: "Labor Day (1st Mon in Sept)", observed: true},
						{day: "Columbus Day (2nd Mon in Oct)", observed: false},
						{day: "Veterans' Day (Nov 11)", observed: false},
						{day: "Thanksgiving Day (4th Thurs in Nov)", observed: true},
						{day: "Day after Thanksgiving / Black Friday (Friday after Thanksgiving)", observed: false},
						{day: "Christmas Eve Day (December 24)", observed: false},
						{day: "Christmas Day (December 25)", observed: true},
						{day: "New Year's Eve Day (December 31)", observed: false}
					],
					additionalHolidays:[
						{day: "Pacific Controls Founded", type: "by day", date: null, repeat: ["second", "Friday", "March"]},
						{day: "PCI Opened in USA", type: "exact date", date: new Date(2009,9,1), repeat: [null]},
						{day: "IntelliCommand Launched with JLL", type: "by day", date: null, repeat: ["last", "Saturday", "December"]}
					],
					temporaryOverrides:[
						{reason: "Extreme cold", startDate: new Date(2015,2,10,11,30,0), endDate: new Date(2015,2,11,11,30,0), type: "off", schOn: null, schOff: null},
						{reason: "Just for fun", startDate: new Date(2015,3,15,11,30,0), endDate: new Date(2015,3,18,11,30,0), type: "off", schOn: null, schOff: null}
					],
					weekendStartHoliday: "correct day",
					weekendEndHoliday: "correct day"
				};
	            return (scheduleData);
	        }, function() {
				console.log('fail to query schedule data from database');
	        });
	    },
		
		getAssetDocs: function(organization, facility, asset, category){
			// Format query based on whether an object of assets or a single asset is passed
			if (typeof asset == 'object') { 
				var promise = mongoService.queryDb({"clientName": organization, "facility": facility}, "Documents");
			}
			else {
				var promise = mongoService.queryDb({"clientName": organization, "facility": facility, "assetId": asset}, "Documents");
			}
			
			return promise.then(function(results) {
	            /******** THIS NOW NEEDS TO BE FILTERED BY ASSET (would be in a real db call...) **********************************/
				 var docData = [
					{asset: "AHU1", doc: "clientName.pdf"},
					{asset: "AHU2", doc: "Building B Floor 1 Mechanical Original.pdf"},
					{asset: "AHU3", doc: "Control Drawings.pdf"},
					{asset: "AHU4", doc: "LaCerte Bldg BAS Drawings.pdf"},
					{asset: "AHU1", doc: "clientName.pdf"},
					{asset: "AHU2", doc: "Control Drawings.pdf"},
					{asset: "AHU3", doc: "LaCerte Bldg BAS Drawings.pdf"},
					{asset: "AHU4", doc: "Proyect Intellicommand.pdf"},
					{asset: "AHU1", doc: "clientName.pdf"},
					{asset: "AHU2", doc: "Building B Floor 1 Mechanical Original.pdf"},
					{asset: "AHU3", doc: "Building B Floor 1 Mechanical Original.pdf"},
					{asset: "AHU4", doc: "Proyect Intellicommand.pdf"}
				];
				
				
				return (docData);
	        }, function() {
				console.log('fail to query document data from database');
	        });
	    },

		getAssetMechSpecs: function(organization, facility, assetId){
			var promise = mongoService.queryDb({"clientName": organization, "facility": facility, "assetId": assetId}, "Documents");
	        return promise.then(function(results) {
	            var mechSpecsData = {
					areaServed: "South Wing",
					floorServed: "1st Floor",
					manufacturer: "McQuay",
					modelNum: "SWP070D27AL2MY315151515",
					serialNum: "FB0U001000104",
					ratedHtgCap: 70,
					ratedClgCap: 70,
					ratedHtgCapUnits: "tons",
					ratedClgCapUnits: "tons",
					coolType: "Chilled Water",
					chilledValve: 1,
					hotValve: 1,
					heatingStages: 2,
					coolingStages: 2,
					compressors: 2,
					economizer: true,
					protocol: "BACnet",
					fans: [
							{name: "Supply Fan 1", type: "Supply Fan", speed: "VFD", make: "ABB Automation", modelNum: "ACH401602032", horsePower: 10, ratedCFM: 300},
							{name: "Supply Fan 2", type: "Supply Fan", speed: "Constant Speed", make: "ABB Automation", modelNum: "ACH401602032", horsePower: 10, ratedCFM: 300},
							{name: "Supply Fan 3", type: "Supply Fan", speed: "VFD", make: "ABB Automation", modelNum: "ACH401602032", horsePower: 10, ratedCFM: 300},
							{name: "Supply Fan 4", type: "Supply Fan", speed: "VFD", make: "ABB Automation", modelNum: "ACH401602032", horsePower: 10, ratedCFM: 300},
							{name: "Return Fan 1", type: "Return Fan", speed: "VFD", make: "ABB Automation", modelNum: "ACH401602032", horsePower: 10, ratedCFM: 300},
							{name: "Return Fan 2", type: "Return Fan", speed: "Constant Speed", make: "ABB Automation", modelNum: "ACH401602032", horsePower: 10, ratedCFM: 300},
							{name: "Exhaust Fan 1", type: "Exhaust Fan", speed: "VFD", make: "ABB Automation", modelNum: "ACH401602032", horsePower: 10, ratedCFM: 300},
							{name: "Exhaust Fan 2", type: "Exhaust Fan", speed: "Constant Speed", make: "ABB Automation", modelNum: "ACH401602032", horsePower: 10, ratedCFM: 300}
					]
				};
	            return (mechSpecsData);
	        }, function() {
				console.log('fail to query mechanical spec data from database');
	        });
	    },
		
		setAssetSchedule: function(organization, facility, assetId, scheduleData){
			var promise = mongoService.updateDb({"clientName": organization, "facility": facility, "assetId": assetId}, "Documents");
	        return promise.then(function(results) {
	            var scheduleData = {};
	            return (scheduleData);
	        }, function() {
				console.log('fail to update schedule data in the database');
	        });
	    }
    };
}]);