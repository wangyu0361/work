angular.module('icDash.loginPage', ['ui.router'])

.controller('loginPageCtrl', ['$scope', '$state', 'SkySparkAPI', function($scope, $state, ssAPI){	  
	$scope.login = function(user) {
		// Need to actually check the DB for credentials here...
		if(validateUser((user.name).toLowerCase(), user.pwd)) {
			setCookie(user.name, 14);
			setSessionStorage(user.name);
		} else {
			document.getElementById("invalid").style.display = "inherit";
		}
	$state.go('^.dashes.home');		
	};
	
	$scope.showForgotCreds = function() {document.getElementById("forgotCreds").className = "modalDialogActive";}
	$scope.showRequestAcct = function() {document.getElementById("requestAcct").className = "modalDialogActive";}
	$scope.closeModal = function(view) {document.getElementById(view).className = "modalDialogHidden";}
	$scope.submitForgotCreds = function() {
		// Need to actually send them new credentials...
		var form = document.forgotCredsForm;
		console.log("Forgotten credentials. Please check email: " + form.email.value + " in the database and email with login info");
		document.getElementById("forgotCreds").className = "modalDialogHidden";
	}
	$scope.submitRequestAcct = function() {
		var form = document.requestAcctForm;
		// Need to actually send someone this request...
		console.log("Requesting account. Customer info:\nName: "+form.name.value + 
			"\nEmail Address: "+form.email.value + 
			"\nPhone Number: "+form.phone.value + 
			"\nTitle: "+form.title.value + 
			"\nCompany: "+form.company.value + 
			"\nFacility: "+form.facility.value);
		document.getElementById("requestAcct").className = "modalDialogHidden";
	}
	
	function validateUser(user, password) {
		// replace this with a real database call...
		var acceptableLogins = {angela: 12345, jlldemo: "jllDemo"};
		
		return true; // put this here for now so people can keep working without credentials...
		//if (acceptableLogins[user] == password) return true; else return false;
	}
	function setCookie(userName, expirationDays) {
		var d = new Date();
		d.setTime(d.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
		var expires = "expires=" + d.toUTCString();
		document.cookie = "icUser=" + userName + "; " + expires;
	}
	function setSessionStorage(user) {
		
		/** for switching over to skyspark eventually... **
		sessionStorage.setItem("userName", user);
		
		var stations = [];
		var orgs = [];
		ssAPI.getStations().then(
			function(results) {
				for (var i = 0; i < results.length; i++) {
					if (results[i].users) {
						siteUsers = JSON.parse(results[i].users);
						if (_.contains(siteUsers, user)) {
							orgs.push(results[i].organization);
							stations.push(results[i].station);
						}
					}
				}
				
				stations = _.uniq(stations);
				orgs = _.uniq(orgs);
				console.log("all stations for user " + user + ": " + stations);
				console.log("all orgs for user " + user + ": " + orgs);
				sessionStorage.setItem("userLimits.organization", orgs);
				sessionStorage.setItem("userLimits.facility", stations);
			},
			function(error){reject(error);}
		)
		/** end area used to switch to skyspark... **/
		
		$.ajax({
			url:'https://galaxy2021temp.pcsgalaxy.net:9453/db/query',
			data: JSON.stringify({"userName":user}),
			type:'POST',
			headers: {"Collection": "userPref"},
			/** why on earth does it not listen to the data being passed in?!*/
			dataType: 'json',
			success: function(response) {
				console.log(response.result);
				sessionStorage.setItem("userName", response.result[1].userName);
				
				var myPrefs = response.result[1].userPrefs;
				
				// Use the db response to populate sessionStorage for the user
				$.each(myPrefs,function(key, myValue){
					if (typeof myValue === "object") {
						$.each(myValue, function(key2, nextValue){
							var myKey = key.concat(".",key2);
							sessionStorage.setItem(myKey, nextValue);
						});
					} else {
						sessionStorage.setItem(key, myValue);
					}
				});
			}
		});
	}
}]);