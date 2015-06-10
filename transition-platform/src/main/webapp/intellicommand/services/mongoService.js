// mongoService.js

'use strict';

angular.module('icDash.mongoService', ['ui.router'])

.factory('mongoService', ['$http', function($http) {
    return {
		queryDb: function(query, collection){
			var config = {
				method:'POST',
				headers: {'Collection': collection},
				url:"http://10.239.3.132:8111/db/query",
				data: JSON.stringify(query)
			};
			var promise = $http(config);
			return promise.then(function(response) {
				return response.data.result;
			}, function() {
				//console.log('fail to query from database');
			});
		},
		
		
		/*updateDb: function(update, collection){
			var config = {
				method:'POST',
				headers: {'Collection': collection},
				url:"http://10.239.3.132:8111/db/update",
/*************** TODO figure out how to actually update the database!!! *******************
				data: JSON.stringify(update)
			};
			var promise = $http(config);
			return promise.then(function(response) {
				return response.data.result;
			}, function() {
				//console.log('fail to update the database');
			});
		}*/
    };
}]);