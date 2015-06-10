angular.module('icDash.loginPage', ['ui.router'])

.controller('loginPageCtrl', ['$scope', '$state', function($scope, $state){	  
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
		$.ajax({
			url:'http://10.239.3.132:8111/db/query',
			data: JSON.stringify({"userName":user}),
			type:'POST',
			headers: {"Collection": "userPref"},
			/** why on earth does it not listen to the data being passed in?!*/
			dataType: 'json',
			success: function(response) {
				console.log(response.result);
				sessionStorage.setItem("userName", response.result[0].userName);
				
				var myPrefs = response.result[0].userPrefs;
				
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