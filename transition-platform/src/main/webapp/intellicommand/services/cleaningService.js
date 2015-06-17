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
					case "WLST": {campus = "60 Wall Street"; break;}
					case "JACK": {campus = "Jacksonville"; break;}
					case "CARY": {campus = "Cary"; break;}
					case "PISC": {campus = "Piscataway"; break;}
					case "ATRM": {campus = "Atrium"; break;}
					case "CSQB": {campus = "8CS London"; break;}
					case "PLAN": {campus = "Plano"; break;}
					case "MISS": {campus = "201 Mission"; break;}
					case "CALI": {campus = "580 California"; break;}
					case "HAUN": {campus = "Hamburger University"; break;}
					case "MRL": {campus = "Merck Research Lab"; break;}
					case "UGDB": {campus = "Upper Gwynedd"; break;}
					case "EMEF": {campus = "Emeryville"; break;}
					case "PHNY": {campus = "Pfizer Global Headquarters"; break;}
					case "BRBF": {campus = "BRTC_Beckett Ridge Building"; break;}
					case "CETL": {campus = "BRTC_Corporate Engineering Technical Laboratories"; break;}
					case "BGTC": {campus = "Bethel Global Technical Center"; break;}
					case "GLOB": {campus = "General Offices"; break;}
					case "MBCB": {campus = "Mason Business Center"; break;}
					case "SJIC": {campus = "San Jose Innovation Center"; break;}
					case "SWIC": {campus = "Sharon Woods Innovation Center"; break;}
					case "WHBC": {campus = "Winton Hill Business Center"; break;}
					case "BHEV": {campus = "Riverview"; break;}
					case "NTCS": {campus = "801 S Canal Street"; break;}
					case "ANDO": {campus = "Andover"; break;}
					default: campus = campus;
				};
				return campus;
			},
			
			campusName: function(campus){
				switch(campus) {
					case "60 Wall Street": {campus = "WLST"; break;}
					case "Jacksonville ? Meridian Campus": {campus = "JACK"; break;}
					case "Atrium": {campus = "ATRM"; break;}
					case "Cary": {campus = "CARY"; break;}
					case "8CS London": {campus = "CSQB"; break;}
					case "Plano": {campus = "PLAN"; break;}
					case "201 Mission": {campus = "MISS"; break;}
					case "580 California": {campus = "CALI"; break;}
					case "Hamburger University": {campus = "HAUN"; break;}
					case "Merck Research Laboratory ? Boston": {campus = "MRL"; break;}
					case "Merck Research Lab": {campus = "MRL"; break;}
					case "Upper Gwynedd": {campus = "UGDB"; break;}
					case "Emeryville": {campus = "EMEF"; break;}
					case "Pfizer Global Headquarters": {campus = "PHNY"; break;}
					case "BRTC_Beckett Ridge Building": {campus = "BRBF"; break;}
					case "BRTC_Corporate Engineering Technical Laboratories": {campus = "CETL"; break;}
					case "Bethel Global Technical Center": {campus = "BGTC"; break;}
					case "General Offices": {campus = "GLOB"; break;}
					case "Mason Business Center": {campus = "MBCB"; break;}
					case "San Jose Innovation Center": {campus = "SJIC"; break;}
					case "Sharon Woods Innovation Center": {campus = "SWIC"; break;}
					case "Winton Hill Business Center": {campus = "WHBC"; break;}
					case "Piscataway": {campus = "PISC"; break;}
					case "Riverview": {campus = "BHEV"; break;}
					case "801 S Canal Street": {campus = "NTCS"; break;}
					case "Andover": {campus = "ANDO"; break;}
					default: campus = campus;
				};
				return campus;
			},
			
			stationAcroToOrganization: function(acro){
				switch(acro) {
				case "WLST": {acro = "Deutsche Bank"; break;}
				case "CARY": {acro = "Deutsche Bank"; break;}
				case "PISC": {acro = "Deutsche Bank"; break;}
				case "HAUN": {acro = "McDonalds"; break;}
				case "HYLO": {acro = "McDonalds"; break;}
				
				default: acro = acro;
			};
			return acro;
			},
			
			stationNameToOrganization: function(acro){

var campus = acro;
				switch(campus) {
				case "60 Wall Street": {campus = "WLST"; break;}
				case "Jacksonville ? Meridian Campus": {campus = "JACK"; break;}
				case "Atrium": {campus = "ATRM"; break;}
				case "Cary": {campus = "CARY"; break;}
				case "8CS London": {campus = "CSQB"; break;}
				case "Plano": {campus = "PLAN"; break;}
				case "201 Mission": {campus = "MISS"; break;}
				case "580 California": {campus = "CALI"; break;}
				case "Hamburger University": {campus = "HAUN"; break;}
				case "Merck Research Laboratory ? Boston": {campus = "MRL"; break;}
				case "Merck Research Lab": {campus = "MRL"; break;}
				case "Upper Gwynedd": {campus = "UGDB"; break;}
				case "Emeryville": {campus = "EMEF"; break;}
				case "Pfizer Global Headquarters": {campus = "PHNY"; break;}
				case "BRTC_Beckett Ridge Building": {campus = "BRBF"; break;}
				case "BRTC_Corporate Engineering Technical Laboratories": {campus = "CETL"; break;}
				case "Bethel Global Technical Center": {campus = "BGTC"; break;}
				case "General Offices": {campus = "GLOB"; break;}
				case "Mason Business Center": {campus = "MBCB"; break;}
				case "San Jose Innovation Center": {campus = "SJIC"; break;}
				case "Sharon Woods Innovation Center": {campus = "SWIC"; break;}
				case "Winton Hill Business Center": {campus = "WHBC"; break;}
				case "Piscataway": {campus = "PISC"; break;}
				case "Riverview": {campus = "BHEV"; break;}
				case "801 S Canal Street": {campus = "NTCS"; break;}
				case "Andover": {campus = "ANDO"; break;}
				default: campus = campus;
			};
				acro = campus;
				
				
				switch(acro) {
				
				case "WLST": {acro = "Deutsche Bank"; break;}
				case "CARY": {acro = "Deutsche Bank"; break;}
				case "PISC": {acro = "Deutsche Bank"; break;}
				case "HAUN": {acro = "McDonalds"; break;}
				case "HYLO": {acro = "McDonalds"; break;}
				case "MRL": {acro = "Merck"; break;}
				case "UGDB": {acro = "Merck"; break;}
				default: acro = acro;
			};
			return acro;
			}
	    };
});