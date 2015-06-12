angular.module('icDash.skysparkService', [])

.factory('SkySparkAPI',['$http',function($http){
	var _skySparkIp = "https://galaxy2021temp.pcsgalaxy.net:9453/api/galaxy/";

	var _readFromId = function(_id){
		var _req = {
				method:"POST",
				url:_skySparkIp+"read/",
				headers:{
					"Content-Type":"text/zinc;charset=utf-8",
					"Authorization":"Basic ZGV2OjEyMzQ1",
					"Accept":"text/csv"
				},
				data:"ver:\"2.0\"\n"+
					"id\n"+
					_id
		}
		return _actuallyRequest(_req);
	}

	var _getEquipOnStation = function(_station){
		var _req = {
				method:"POST",
				url:_skySparkIp+"read/",
				headers:{
					"Content-Type":"text/zinc;charset=utf-8",
					"Authorization":"Basic ZGV2OjEyMzQ1",
					"Accept":"text/csv"
				},
				data:"ver:\"2.0\""+"\n"+
					"filter"+"\n"+
					"\"equip and siteRef->station==\\\""+_station+"\\\"\""
		}
		return _actuallyRequest(_req);
	}
	
	var _getStations = function(){
		var _req = {
				method:"POST",
				url:_skySparkIp+"read/",
				headers:{
					"Content-Type":"text/zinc;charset=utf-8",
					"Authorization":"Basic ZGV2OjEyMzQ1",
					"Accept":"text/csv"
				},
				data:"ver:\"2.0\""+"\n"+
					"filter"+"\n"+
					"\"site\""
		}
		return _actuallyRequest(_req);
	}
	
	var _getStationByAbbr = function(_station){
		var _req = {
				method:"POST",
				url:_skySparkIp+"read/",
				headers:{
					"Content-Type":"text/zinc;charset=utf-8",
					"Authorization":"Basic ZGV2OjEyMzQ1",
					"Accept":"text/csv"
				},
				data:"ver:\"2.0\""+"\n"+
					"filter"+"\n"+
					"\"site and station==\\\""+_station+"\\\"\""
		}
		
		return _actuallyRequest(_req);
	}
	
	var _getPointsOnEquipId = function(_equip){
		var _req = {
				method:"POST",
				url:_skySparkIp+"read",
				headers:{
					"Content-Type":"text/zinc;charset=utf-8",
					"Authorization":"Basic ZGV2OjEyMzQ1",
					"Accept":"text/csv"
				},
				data:"ver:\"2.0\""+"\n"+
					"filter"+"\n"+
					"\"point and equipRef=="+_equip+"\""
		}
		
		return _actuallyRequest(_req);
		
	}
	
	var _getHistoryForId = function(_id,_start,_end){
		
		var sparkDayFormat = d3.time.format("%Y-%m-%d");

		_start = _start === undefined ? "2000-01-01" : sparkDayFormat(new Date(_start));
		_end = _end === undefined ? sparkDayFormat(new Date()) : sparkDayFormat(new Date(_end));
		
		var date = ",\""+_start+","+_end+"\"";
		
		var _data = typeof(_id)=== "string" ? _id+date : function(){
			var _ids = "";
			
			for(var i = 0; i < _id.length-1; i++){
				_ids+= _id[i]+date+"\n";
			}
			_ids+=_id[_id.length-1]+date;
			return _ids;
		}();
		
		var _req = {
				method:"POST",
				url:_skySparkIp+"hisRead/",
				headers:{
					"Content-Type":"text/zinc;charset=utf-8",
					"Authorization":"Basic ZGV2OjEyMzQ1",
					"Accept":"text/csv"
				},
				data:"ver:\"2.0\""+"\n"+
					"id,range"+"\n"+
					_data
		}
		
		return _actuallyRequest(_req);
	}
	
	var _getByEquipAndSiteNamesAndTags = function(_equip,_site,_tags){ // Generic catch all, conveniece method for equipName and stationName, tags can be a single string or an array of filter strings
		var _data = "\"id"; // contains id as a guaranteed call, so not have to deal with special exceptions around spaces and and

		if(_equip !== undefined){_data += " and equipRef->navName==\\\""+_equip+"\\\""}
		if(_site !== undefined){_data += " and siteRef->station==\\\""+_site+"\\\""}
		
		if(_tags !== undefined){
			if(typeof(_tags) === "string"){_data += " and "+_tags+"";}
			else{
				for(var i = 0; i < _tags.length; i++){
					_data+= " and "+_tags[i];
				}
				
			}
		}
		_data+="\"";
		
		var _req = {
				method:"POST",
				url:_skySparkIp+"read/",
				headers:{
					"Content-Type":"text/zinc;charset=utf-8",
					"Authorization":"Basic ZGV2OjEyMzQ1",
					"Accept":"text/csv"
				},
				data:"ver:\"2.0\""+"\n"+
					"filter"+"\n"+
					_data
		}
		
		return _actuallyRequest(_req);
	}
	
	
	var _getEventsByDate = function(_facility,_createdDateRange,_updatedDateRange,_status){// dates can be a single date object or an array containing [start date object, end date object]
		var sparkDayFormat = d3.time.format("%Y-%m-%d");
		var _data = "\"eventFilter(";

		if(_facility !== undefined){_data += "\\\""+_facility+"\\\","}
		if(_createdDateRange !== undefined){_data += _createdDateRange === null ? 
				null+"," 
				: _createdDateRange.hasOwnProperty("length") === true ? 
						sparkDayFormat(new Date(_createdDateRange[0]))+".."+sparkDayFormat(new Date(_createdDateRange[1])) 
						: sparkDayFormat(new Date(_createdDateRange))+"..2999-01-01,";} 
		if(_updatedDateRange !== undefined){_data += _updatedDateRange === null ? 
				null+"," 
				: _updatedDateRange.hasOwnProperty("length") === true ? 
						sparkDayFormat(new Date(_updatedDateRange[0]))+".."+sparkDayFormat(new Date(_updatedDateRange[1])) 
						: sparkDayFormat(new Date(_updatedDateRange))+"..2999-01-01,";}
		if(_status !== undefined){_data += _updatedDateRange+")"}
		else{_data += "null)"}
		_data+="\"";
		
		var _req = {
				method:"POST",
				url:_skySparkIp+"eval/",
				headers:{
					"Content-Type":"text/zinc;charset=utf-8",
					"Authorization":"Basic ZGV2OjEyMzQ1",
					"Accept":"text/csv"
				},
				data:"ver:\"2.0\""+"\n"+
					"expr"+"\n"+
					_data
		}

		return _actuallyRequest(_req);
	}
	
	
	var _actuallyRequest = function(_req){
		var start = new Date();
		return new Promise(function(resolve,reject){
			$http(_req)
				.success(function(data,status,something,config){
					var info = d3.csv.parse(data);
					if(info === undefined || info === null || info.length === 0){reject(info);}
					else{resolve(info);}
				})
				.error(function(data,status,something,config){console.log("error",data,status,something,config);reject({});})
			;
		})
	}
	
	var serviceObject = {
		getEquipOnStation:_getEquipOnStation,
		readFromId:_readFromId,
		getPointsOnEquipId:_getPointsOnEquipId,
		getStations:_getStations,
		getStationByAbbr:_getStationByAbbr,
		getHistoryForId:_getHistoryForId, // leave start/end undefined for all history for the ids, id can be a single string or an array of strings
		getByEquipAndSiteNamesAndTags:_getByEquipAndSiteNamesAndTags,
		getEventsByDate:_getEventsByDate,
		actuallyRequest:_actuallyRequest,
		ip:_skySparkIp
	}
	
	return serviceObject; 
}])