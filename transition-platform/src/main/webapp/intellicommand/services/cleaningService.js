// Angela's code; cleaningService.js

'use strict';

angular.module('icDash.cleaningService', ['ui.router'])

.factory('cleaningService', function() {
    return {
		orgFullName: function(organization){
			switch(organization) {
				case "DEU": {organization = "Deutsche Bank"; break;}
				case "MER": {organization = "Merck"; break;}
				case "PLP": {organization = "Philips"; break;}
				default: organization = organization;
			};
			return organization;
		},
        
		orgName: function(organization){
			switch(organization) {
				case "Deutsche Bank": {organization = "DEU"; break;}
				case "Merck": {organization = "MER"; break;}
				case "Philips": {organization = "PLP"; break;}
				default: organization = organization;
			};
			return organization;
		},
		
		campusFullName: function(campus){
			switch(campus) {
				// Deutsche Bank
				case "WLST": {campus = "60 Wall Street"; break;}
				case "JACK": {campus = "Jacksonville ? Meridian Campus"; break;}
				
				// HSBC
				case "ATRM": {campus = "Atrium"; break;}
				case "CSQB": {campus = "8CS London"; break;}
				
				// LaSalle Investment Management
				case "MISS": {campus = "201 Mission"; break;}
				case "CALI": {campus = "580 California"; break;}
				
				// McDonalds
				case "HAUN": {campus = "Hamburger University"; break;}
				case "HYLO": {campus = "Hyatt Lodge"; break;}
				
				// Merck
				case "MRL": {campus = "Merck Research Lab"; break;}
				case "UGDB": {campus = "Upper Gwynedd"; break;}
				
				// P&G
				case "BRBF": {campus = "BRTC_Beckett Ridge Building"; break;}
				case "CETL": {campus = "BRTC_Corporate Engineering Technical Laboratories"; break;}
				case "BGTC": {campus = "Bethel Global Technical Center"; break;}
				case "GLOB": {campus = "General Offices"; break;}
				case "MBCB": {campus = "Mason Business Center"; break;}
				case "SJIC": {campus = "San Jose Innovation Center"; break;}
				case "SWIC": {campus = "Sharon Woods Innovation Center"; break;}
				case "WHBC": {campus = "Winton Hill Business Center"; break;}
				
				// One-Off
				case "ANDO": {campus = "Andover"; break;} // Philips
				case "PLAN": {campus = "Plano"; break;} // Intuit
				case "EMEF": {campus = "Emeryville"; break;} // Novartis
				case "PHNY": {campus = "Pfizer Global Headquarters"; break;} // Pfizer
				case "BHEV": {campus = "Riverview"; break;} // Whirlpool
				case "NTCS": {campus = "801 S Canal Street"; break;} // Northern Trust
				default: campus = campus;
			};
			return campus;
		},
		
		campusName: function(campus){
			switch(campus) {
				// Deutsche Bank
				case "60 Wall Street": {campus = "WLST"; break;}
				case "Jacksonville ? Meridian Campus": {campus = "JACK"; break;}
				
				// HSBC
				case "Atrium": {campus = "ATRM"; break;}
				case "8CS London": {campus = "CSQB"; break;}
				
				// LaSalle Investment Management
				case "201 Mission": {campus = "MISS"; break;}
				case "580 California": {campus = "CALI"; break;}
				
				// McDonalds
				case "Hamburger University": {campus = "HAUN"; break;}
				case "Hyatt Lodge": {campus = "HYLO"; break;}
				
				// Merck
				case "Merck Research Laboratory ? Boston": {campus = "MRL"; break;}
				case "Upper Gwynedd": {campus = "UGDB"; break;}
				
				// P&G
				case "BRTC_Beckett Ridge Building": {campus = "BRBF"; break;}
				case "BRTC_Corporate Engineering Technical Laboratories": {campus = "CETL"; break;}
				case "Bethel Global Technical Center": {campus = "BGTC"; break;}
				case "General Offices": {campus = "GLOB"; break;}
				case "Mason Business Center": {campus = "MBCB"; break;}
				case "San Jose Innovation Center": {campus = "SJIC"; break;}
				case "Sharon Woods Innovation Center": {campus = "SWIC"; break;}
				case "Winton Hill Business Center": {campus = "WHBC"; break;}
				
				// One-Off
				case "Andover": {campus = "ANDO"; break;} // Philips
				case "Plano": {campus = "PLAN"; break;} // Intuit
				case "Emeryville": {campus = "EMEF"; break;} // Novartis
				case "Pfizer Global Headquarters": {campus = "PHNY"; break;} // Pfizer
				case "Riverview": {campus = "BHEV"; break;} // Whirlpool
				case "801 S Canal Street": {campus = "NTCS"; break;} // Northern Trust
				default: campus = campus;
			};
			return campus;
		}
    };
});