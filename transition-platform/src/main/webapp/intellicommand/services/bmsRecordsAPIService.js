angular.module('icDash.bmsRecordsAPIService', [])

.factory('BMSRecordsAPI',['$http','SkySparkAPI',function($http,ss){	
	
	var _getExpectedConsumptionForDay = function(_station, _time, _zeroDbTemp){
		if(_zeroDbTemp === undefined || _zeroDbTemp === null){_zeroDbTemp = 0;}
		
		var ssFormat = d3.time.format("%Y-%m-%d");
		
		var _url = _time.hasOwnProperty("length") ? 
		  ss.ip+"eval?expr=rangedDailyExpectedConsumption(\""+_station+"\","+ssFormat(new Date(_time[0]))+","+ssFormat(new Date(_time[1]))+","+_zeroDbTemp+")"
		: ss.ip+"eval?expr=dailyExpectedConsumption(\""+_station+"\","+ssFormat(new Date(_time))+","+_zeroDbTemp+")"

		return new Promise(function(resolve,reject){
			var _req = {
					method:"GET",
					url:_url,
					headers:{
						"Content-Type":"text/zinc;charset=utf-8",
						"Authorization":"Basic ZGV2OjEyMzQ1",
						"Accept":"text/csv"
					}
			}
			$http(_req)
				.success(function(val){
					var myVal = d3.csv.parse(val);
					_time.hasOwnProperty("length") ? function(){
						var output = [];
						
						for(var i = 0; i < myVal.length; i++){
							output.push({
								timestamp:new Date(myVal[i].timestamp),
								consumption:parseFloat(myVal[i].consumption)
							})
						}
						resolve({content:{expected:output}})
					}()
					: resolve({content:{expected:parseFloat(myVal[0].val)}});
			}).error(function(error){reject(error)})
		})
	}
	
	var _findEnergyHistoryIds = function(_station){
		return new Promise(function(resolve,reject){
			ss.getByEquipAndSiteNamesAndTags(undefined,_station,["energy","point"]).then(
				function(objs){
					var hisIds = [];
					for(var i = 0; i < objs.length; i++){
						hisIds.push(objs[i].id.substring(0,objs[i].id.indexOf(" ")));
					}
					resolve({_embedded:{strings:hisIds}});
				},
				function(error){reject(error);}
			)
		})
	}
	
	var _findNewestRecordByHistoryId = function(_historyId){
		return new Promise(function(resolve,reject){
			ss.readFromId(_historyId).then(
				function(point){
					if(point.length === 1){
						resolve({
							pointName:point[0].navName,
							historyId:point[0].id.substring(0,point[0].id.indexOf(" ")),
							timestamp:point[0].hisEnd,
							value:parseFloat(point[0].hisEndVal),
							status:point[0].hisStatus,
							units:point[0].unit,
						})
					}else{reject(point);}
				},
				function(error){reject(error);}
			)
		})
	}
	
	var _groupRecordsDailyForHistoryId = function(_historyId,startTime,endTime){
		var dayFormat = d3.time.format("%x")
		
		return new Promise(function(resolve,reject){
			ss.getHistoryForId(_historyId,startTime,endTime).then(
				function(rawHistories){
					var histories = {};
					for(var i = 0; i < rawHistories.length; i++){
						var hist = rawHistories[i];
						var ts = new Date(hist.ts.substring(0,hist.ts.indexOf(" ")));
						var date = dayFormat(ts);

						var tempObj = {};
						tempObj[ts] = parseFloat(hist.val);
						
						if(histories.hasOwnProperty(date) === false){
							histories[date] = {};
						}

						angular.extend(histories[date],tempObj);
					}
					
					resolve(histories);
				},
				function(error){
					reject(error);
				}
			)
		})
	}
	 
	var serviceObject = {
			findEnergyHistoryIds			:_findEnergyHistoryIds,
			findNewestRecordByHistoryId		:_findNewestRecordByHistoryId,
			groupRecordsDailyForHistoryId 	:_groupRecordsDailyForHistoryId,
			getExpectedConsumptionForDay	:_getExpectedConsumptionForDay,
	}
	
	return serviceObject;
}])