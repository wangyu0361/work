'use strict';
 
angular.module('icDash.heatmap', ['ui.router'])

/** angular.module('myApp.heatmap', ['ngRoute', 'calHeatmap', 'myApp.dashboard', 'myApp.panelComponent', 'myApp.popout', 'ui.bootstrap', 'myApp.calendar'])
 **/
 /**
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/heatmap', {
    templateUrl: 'icWidgets/heatmap.html'
  });
}])
**/
/**.run(['directiveService', function(directiveService){
	directiveService.addFullComponent({
		tag: function(){return 'energy-spectrum';},
		configTag: function(){return 'heatmap-config';},
		tagHtml: function(){return "<energy-spectrum></energy-spectrum>";},
		directiveName: function(){return 'energySpectrum';},
		namespace: function(){return 'heat'},
		heading: function(){return 'heatmap-name';},
		paletteImage: function(){return 'usa.png';}
		});
}])**/

.directive('heatmapName', [function(){
	return{
		template: "Energy Spectrum"
	};
}])

.factory('heatmapDataService', ['$http', function($http){
	var _servObj = {};	
	
	var _setUrl = function(Url){
		this.url = Url;

		return _servObj;
	}
	
	var _getUrl = function(){
		
		return this.url;
	}
	
	//get data and format it as cal-heatmap expects 
	//TODO - data obj does not need to be refereshed every time we want to get??? can we re-serve from memory if we dont believe anthing has changed???
	
	//To show up as empty, the timestamp NEEDS to be in the data object as "timestamp":null - UGHHHHHHH ; Phil
	var _getData = function(){
		var caller = this;

		return caller.getSiteTotalConsumption(caller.site, caller.heatmapConfig.start, caller.heatmapConfig.end)
		
	}
	
	//fill the dataset with timestamp:null values up to the last date in calendar config.
	var _fillData = function(){
		var caller = this;
		
		var currentTime = caller.heatmapConfig.start.getTime() / 1000;
		var endTime = caller.heatmapConfig.end.getTime() / 1000
		
		var subDomainDelta = 9999999999999;
		
		if(caller.heatmapConfig.subDomain.indexOf('min') >= 0){
			subDomainDelta = 60;
		}
		else if(caller.heatmapConfig.subDomain.indexOf('hour') >= 0){
			subDomainDelta = 60*60;
		}
		else if(caller.heatmapConfig.subDomain.indexOf('day') >= 0){
			subDomainDelta = 60*60*24;
		}
		else if(caller.heatmapConfig.subDomain.indexOf('month') >= 0){
			//TODO make this dynamic based on month the calendar is in
			subDomainDelta = 60*60*24*30;
		}
		
		//while(currentTime <= caller.calEnd()){
		while(currentTime <= endTime){
			if(!caller.dataObj.hasOwnProperty(currentTime+"") || caller.dataObj[currentTime+""] === undefined ){
				caller.dataObj[currentTime+""] = null;
			}
			
			//move to next minute (should do this based on sub domain instead???)
			currentTime = currentTime + subDomainDelta;
			
		}

	}
	
	var _getMax = function(){
		var caller = this;
		
		return caller.max
	}
	
	var _getMin = function(){
		var caller = this;
		
		return caller.min
		
	}
	
	var _dataAsArray = function(){
		var i = 0;
		var array = [];
		
		for(var timestamp in this.dataObj){
			if(this.dataObj.hasOwnProperty(timestamp)){
				if(this.dataObj[timestamp] != 0 && this.dataObj[timestamp] != null){
					array[i] = this.dataObj[timestamp];
					i++;
				}
			}
		}
		
		return array;
	}
	
	var _addEvents = function(){
		var caller = this;
		var eventsArray = caller.eventSource;
		
		for(var i = 0; i < eventsArray.length; i++){
			var type = eventsArray[i].type;
			var time = eventsArray[i].time;
			var description = eventsArray[i].description;
			
			//there will be an error thrown if the event's date is not in the heatmap as an svg time cell.
			try{
				caller.getTimeCell(new Date(time)).setTitle(description)[type]();
			}
			catch(err){
			}
		}
	}
	
	var _clearData = function(){
		var caller = this;
		
		delete caller.dataObj;
		caller.dataObj = {};
	}
	
	_servObj = {
		addEvents : _addEvents,
		getUrl : _getUrl,
		setUrl: _setUrl,
		getMax : _getMax,
		getMin : _getMin,
		getData : _getData,
		fillData : _fillData,
		clearData : _clearData,
		dataAsArray : _dataAsArray
	}
	
	return _servObj;
	
}])

.factory('persistHeatmapService', function(){
	var _servObj = {};

	
	return _servObj;
})

.factory('heatmapConfigService', [ function(){
	var _servObj = {};

	var _defaultConfig = function(){
		var dfault = this;
		
		//calc for day range...
		dfault.rangeCalc = function(){
			return Math.ceil((dfault.end.getTime() - dfault.start.getTime()) / 1000 / 60 / 60 / 24);
		}
		
		dfault.domain= 'day';
		dfault.domainMargin = 0;
		dfault.subDomain= 'hour';
		//dfault.range= 365;	//number of domains (days in current implementation)
		dfault.cellSize= 20; //px size of cells
		dfault.cellPadding= 0;	//px between cells
		dfault.cellRadius= 0;	//px of cell radius
		dfault.considerMissingDataAsZero= false;
		dfault.domainGutter= 0; //px padding between dates
		dfault.colLimit= 1; //number of colums per domain
		dfault.legend= [1,2,3,4,5,6,7,8,9,10,11,12,13];	//legend. Remember its like actually the count
												//TODO: make vm change dependant on dataset
		dfault.legendVerticalPosition= "top";
		//dfault.legendHorizontalPosition= "right";
		dfault.legendOrientation= "horizontal";
		dfault.legendMargin= [10, 10, 10, 10];
		dfault.legendColors= {min:'#33CC33', max:'#FF0000', empty:'#ADADAD'};	//colors of legend gradient
		dfault.itemName= ["kWh", "kWh"];
		dfault.subDomainDateFormat= '%c';
		dfault.subDomainTextFormat= function(date, value) {
			/*if (date.getHours() == 8) {
				return 'X';
			}
			else */
			return '';
		};
		dfault.start = new Date(new Date(new Date().getTime()-21*24*3600*1000).toDateString());
		//dfault.start = new Date('2-1-15');
		dfault.end = new Date(new Date(new Date().getTime()+1*24*3600*1000).toDateString());
		dfault.range= dfault.rangeCalc();

		dfault.domainLabelFormat= function(date) {//format of each domain label. "x axis" labels
			var month = 
				["Jan", "Feb", "Mar", "Apr",
				 "May", "Jun", "Jul", "Aug",
				 "Sep", "Oct", "Nov", "Dec"];
			if (date.getDate() % 2 === 0) {
				return date.getDate();
			}
			else {
				return month[date.getMonth()];
			}
		};	
		dfault.label= {
			width: 30,
			position: 'bottom'
			//rotate: 'left' doesn't work if position is bottom!
		};
	
	};

	
	var _getDefaultConfig = function(){

		return new _defaultConfig();
	}
	
	var _calEnd = function(){
		var caller = this;
		
		return caller.heatmapConfig.start.getTime() / 1000 + caller.calRange();
	};
	
	var _calRange = function(){
		var caller = this;
		var multiplier = 0;
		
		if(caller.heatmapConfig.domain.indexOf('hour')>=0){
			multiplier = 60 * 60;
		}
		else if(caller.heatmapConfig.domain.indexOf('day')>=0){
				multiplier = 60 * 60 * 24;
		}
		else if(caller.heatmapConfig.domain.indexOf('week')>=0){
				multiplier = 60 * 60 * 24 * 7;
		}
		else if(caller.heatmapConfig.domain.indexOf('month')>=0){
			//fix this to be dynamic based on month the calendar starts in
			multiplier = 60 * 60 * 24 * 30;
		}
		else if(caller.heatmapConfig.domain.indexOf('year')>=0){
			multiplier = 60 * 60 * 24 * 365;
		}

		return caller.heatmapConfig.range * multiplier;
	};
	
	//take a javascript date, and return the HTML5 cell in the heatmap associated with it
	var _getTimeCell = function(date){
		var caller = this;
		
		//heatmaps week starts on a mondays (it is the +1).This function is added to ALL date objects
		Date.prototype.getWeekNumber = function(){
			//capture original date
			var orig = new Date(+this);
			
			var d = new Date(+this);
			d.setHours(0,0,0);
			d.setDate(d.getDate()+1-(d.getDay()||7));
			
			var myWeek = Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
			
			//sync formatting with cal-heatmap
			if(myWeek < 10){
				myWeek = '0'+myWeek;
			}
			else if(myWeek >= 52 && orig.getDate() < 20){
				myWeek = '00';
			}
			
			return myWeek;
		};
		
		var query = "graph-domain d_"+date.getDate()
			+" dy_"+date.getDay()
			+" w_"+(date.getWeekNumber())
			+" m_"+(date.getMonth()+1)
			+" y_"+date.getFullYear();
		
		var list = document.getElementsByClassName(query);
		
		//currently only works for hours because it iterates through the array of <g> objects by assuming 1 hour = 1 item in a sorted time based aray....
		for(var p = 0; p < list.length; p++){
			//If the current HTML5 element being examined does not reference back to THIS controller, continue iterating through elements
			if(!(angular.element(list[p]).controller('energySpectrum') === caller)){
				
				continue;
			}
			
			var cells = list[p].getElementsByTagName('g');
			var length = cells.length;

			var inputHour = date.getHours();
							
			return new timeCell(cells[inputHour]);
		}
	};
	
	var timeCell = function(svg){
		var tc = this;
		tc.svg = svg;
		
		tc.date = new Date(svg.getElementsByTagName('title')[0].innerHTML
			.substring(svg.getElementsByTagName('title')[0].innerHTML.indexOf('at ')+3));
		
		tc.getX = function(){
			return +angular.element(svg.getElementsByTagName('rect')).attr("x");
		}
		
		tc.getY = function(){
			return +angular.element(svg.getElementsByTagName('rect')).attr("y");
		}
		
		tc.getWidth = function(){
			return +angular.element(svg.getElementsByTagName('rect')).attr("width");
		}
		
		tc.getHeight = function(){
			return+angular.element(svg.getElementsByTagName('rect')).attr("height");
		}
		
		tc.getTitle = function(){
			return svg.getElementsByTagName('title')[0].innerHTML;
		}
		
		tc.setTitle = function(title){
			svg.getElementsByTagName('title')[0].innerHTML = title;
			
			return tc;
		}
		
		tc.getText = function(){
			return svg.getElementsByTagName('text')[0].innerHtml;
		}
		
		tc.setText = function(text){
			svg.getElementsByTagName('text')[0].innerHtml = text;
			
			return tc;
		}
		
		tc.isStart = function(){
			var g = d3.select(svg);
			var caller = angular.element(svg).controller('energySpectrum');
			
			var day = tc.date.getDay()+'';
			var sched = caller.schedules[day];
			
			if(tc.date.getHours() == sched.start.getHours()){
				return true;
			}
		}
		
		tc.isEnd= function(){
			var g = d3.select(svg);
			var caller = angular.element(svg).controller('energySpectrum');
			
			var day = tc.date.getDay()+'';
			var sched = caller.schedules[day];
			
			if(tc.date.getHours() == sched.end.getHours()){
				return true;
			}
		}
		
		tc.shouldDrawSides = function(){
			var g = d3.select(svg);
			var caller = angular.element(svg).controller('energySpectrum');
			
			var day = tc.date.getDay()+'';
			var sched = caller.schedules[day];
			
			//may throw an error if schedule is not defined for the day.
			try{
				if(tc.date.getHours() >= sched.start.getHours() && tc.date.getHours() <= sched.end.getHours()) {
					return true;
				}
				else return false;
			}
			catch(err){
				return false;
			}
		}
		
		tc.drawSides = function(){
			
			var g = d3.select(svg);
			var caller = angular.element(svg).controller('energySpectrum');
			
			var day = tc.date.getDay()+'';
			var sched = caller.schedules[day];
			var startPix = tc.getY();
			var endPix = tc.getY()+tc.getHeight();
			
			if(tc.date.getHours() == sched.start.getHours() && tc.date.getMinutes() <= sched.start.getMinutes()){
				startPix = startPix + tc.getHeight() * sched.start.getMinutes() / 60;
			}
			else if(tc.date.getHours() == sched.end.getHours() && tc.date.getMinutes() <= sched.end.getMinutes()){
				endPix = endPix - tc.getHeight() * (60-sched.end.getMinutes()) / 60;
			}		
			
			//only draw the left line if the previous day @ same time did not draw right...
			//The first day in the heatmap will throw an error because that day - 1 will not exist on the heatmap, so getting time cell will return null.
			try{
				if(!caller.getTimeCell(new Date(tc.date.getTime()-24*60*60*1000)).shouldDrawSides()){
					g.append('line')
					.attr('x1', 0-caller.heatmapConfig.cellPadding)
					.attr('x2', 0-caller.heatmapConfig.cellPadding)
					.attr('y1', startPix)
					.attr('y2', endPix)
					.attr('style', 'stroke:rgb(0,0,0);stroke-width:8');
				}
			}
			catch(err){
				g.append('line')
				.attr('x1', 0-caller.heatmapConfig.cellPadding)
				.attr('x2', 0-caller.heatmapConfig.cellPadding)
				.attr('y1', startPix)
				.attr('y2', endPix)
				.attr('style', 'stroke:rgb(0,0,0);stroke-width:8');
			}
			
			try{
				if(!caller.getTimeCell(new Date(tc.date.getTime()+24*60*60*1000)).shouldDrawSides()){
					g.append('line')
					.attr('x1', 0+(+tc.getWidth())+caller.heatmapConfig.cellPadding)
					.attr('x2', 0+(+tc.getWidth())+caller.heatmapConfig.cellPadding)
					.attr('y1', startPix)
					.attr('y2', endPix)
					.attr('style', 'stroke:rgb(0,0,0);stroke-width:8');
				}
			}
			catch(err){
				g.append('line')
				.attr('x1', 0+(+tc.getWidth())+caller.heatmapConfig.cellPadding)
				.attr('x2', 0+(+tc.getWidth())+caller.heatmapConfig.cellPadding)
				.attr('y1', startPix)
				.attr('y2', endPix)
				.attr('style', 'stroke:rgb(0,0,0);stroke-width:8');
			}
			
			//fill gaps (next/previous day is start or end
			try{
				var nextTc = caller.getTimeCell(new Date(tc.date.getTime()+24*60*60*1000));
				
				if(nextTc.isEnd() && !tc.isEnd()){
				
					var nextDay = nextTc.date.getDay()+'';
					var nextSched = caller.schedules[nextDay];
					var nextStartPix = nextTc.getY();
					var nextEndPix = nextTc.getY()+nextTc.getHeight();
					
					if(nextTc.date.getHours() == nextSched.start.getHours() && nextTc.date.getMinutes() <= nextSched.start.getMinutes()){
						nextStartPix = nextStartPix + nextTc.getHeight() * nextSched.start.getMinutes() / 60;
					}
					else if(nextTc.date.getHours() == nextSched.end.getHours() && nextTc.date.getMinutes() <= nextSched.end.getMinutes()){
						nextEndPix = nextEndPix - nextTc.getHeight() * (60-nextSched.end.getMinutes()) / 60;
					}		
				
					g.append('line')
					.attr('x1', tc.getWidth()+caller.heatmapConfig.cellPadding)
					.attr('x2', tc.getWidth()+caller.heatmapConfig.cellPadding)
					.attr('y1', nextEndPix)
					.attr('y2', tc.getY()+tc.getHeight())
					.attr('style', 'stroke:rgb(0,0,0);stroke-width:8');
					
				}
			}catch(err){}
			
			try{
				var nextTc = caller.getTimeCell(new Date(tc.date.getTime()+24*60*60*1000));
				
				if(nextTc.isStart() && !tc.isStart()){
				
					var nextDay = nextTc.date.getDay()+'';
					var nextSched = caller.schedules[nextDay];
					var nextStartPix = nextTc.getY();
					var nextEndPix = nextTc.getY()+nextTc.getHeight();
					
					if(nextTc.date.getHours() == nextSched.start.getHours() && nextTc.date.getMinutes() <= nextSched.start.getMinutes()){
						nextStartPix = nextStartPix + nextTc.getHeight() * nextSched.start.getMinutes() / 60;
					}
					else if(nextTc.date.getHours() == nextSched.end.getHours() && nextTc.date.getMinutes() <= nextSched.end.getMinutes()){
						nextEndPix = nextEndPix - nextTc.getHeight() * (60-nextSched.end.getMinutes()) / 60;
					}		
				
					g.append('line')
					.attr('x1', tc.getWidth()+caller.heatmapConfig.cellPadding)
					.attr('x2', tc.getWidth()+caller.heatmapConfig.cellPadding)
					.attr('y1', tc.getY())
					.attr('y2', nextStartPix)
					.attr('style', 'stroke:rgb(0,0,0);stroke-width:8');
					
				}
			}catch(err){}
			
			try{
				var nextTc = caller.getTimeCell(new Date(tc.date.getTime()-24*60*60*1000));
				
				if(nextTc.isEnd() && !tc.isEnd()){
				
					var nextDay = nextTc.date.getDay()+'';
					var nextSched = caller.schedules[nextDay];
					var nextStartPix = nextTc.getY();
					var nextEndPix = nextTc.getY()+nextTc.getHeight();
					
					if(nextTc.date.getHours() == nextSched.start.getHours() && nextTc.date.getMinutes() <= nextSched.start.getMinutes()){
						nextStartPix = nextStartPix + nextTc.getHeight() * nextSched.start.getMinutes() / 60;
					}
					else if(nextTc.date.getHours() == nextSched.end.getHours() && nextTc.date.getMinutes() <= nextSched.end.getMinutes()){
						nextEndPix = nextEndPix - nextTc.getHeight() * (60-nextSched.end.getMinutes()) / 60;
					}		
				
					g.append('line')
					.attr('x1', 0-caller.heatmapConfig.cellPadding)
					.attr('x2', 0-caller.heatmapConfig.cellPadding)
					.attr('y1', nextEndPix)
					.attr('y2', tc.getY()+tc.getHeight())
					.attr('style', 'stroke:rgb(0,0,0);stroke-width:8');
					
				}
			}catch(err){}
			
			try{
				var nextTc = caller.getTimeCell(new Date(tc.date.getTime()-24*60*60*1000));
				
				if(nextTc.isStart() && !tc.isStart()){
				
					var nextDay = nextTc.date.getDay()+'';
					var nextSched = caller.schedules[nextDay];
					var nextStartPix = nextTc.getY();
					var nextEndPix = nextTc.getY()+nextTc.getHeight();
					
					if(nextTc.date.getHours() == nextSched.start.getHours() && nextTc.date.getMinutes() <= nextSched.start.getMinutes()){
						nextStartPix = nextStartPix + nextTc.getHeight() * nextSched.start.getMinutes() / 60;
					}
					else if(nextTc.date.getHours() == nextSched.end.getHours() && nextTc.date.getMinutes() <= nextSched.end.getMinutes()){
						nextEndPix = nextEndPix - nextTc.getHeight() * (60-nextSched.end.getMinutes()) / 60;
					}		
				
					g.append('line')
					.attr('x1', 0-caller.heatmapConfig.cellPadding)
					.attr('x2', 0-caller.heatmapConfig.cellPadding)
					.attr('y1', tc.getY())
					.attr('y2', nextStartPix)
					.attr('style', 'stroke:rgb(0,0,0);stroke-width:8');
					
				}
			}catch(err){}
			
			
		}
		
		tc.drawOcc = function(){
			var g = d3.select(svg);
			var caller = angular.element(svg).controller('energySpectrum');
			var sched = caller.schedules[tc.date.getDay()+''];
			
			//iterate through all svg elements (rectangles) and draw occ lines on either side
			d3.selectAll(angular.element(svg).parent()[0].childNodes).each(function(){
				var nutc = new timeCell(this);
				var day = nutc.date.getDay()+'';
				var sched = caller.schedules[day];
				
				if(nutc.shouldDrawSides()){ 
					nutc.drawSides();
				}
			});
			
			var startPix = tc.getY();
			
			if(tc.date.getHours() == sched.start.getHours() && tc.date.getMinutes() <= sched.start.getMinutes()){
				startPix = startPix + tc.getHeight() * sched.start.getMinutes() / 60;
			}
			
			g.append('line')
			.attr('x1', 0-caller.heatmapConfig.cellPadding)
			.attr('x2', 0+(+tc.getWidth())+caller.heatmapConfig.cellPadding)
			.attr('y1', startPix)
			.attr('y2', startPix)
			.attr('style', 'stroke:rgb(0,0,0);stroke-width:4');		
			
			//connect line for tomorrow when time today is start of schedule and tomorrow is start of schedule
			try{
				var nextTc = caller.getTimeCell(new Date(tc.date.getTime()+24*60*60*1000));
				var nextDay = nextTc.date.getDay()+'';
				var nextSched = caller.schedules[nextDay];
				var nextStartPix = nextTc.getY();
				var nextEndPix = nextTc.getY()+nextTc.getHeight();
				
				if(nextTc.isStart()){
					
					if(nextTc.date.getHours() == nextSched.start.getHours() && nextTc.date.getMinutes() <= nextSched.start.getMinutes()){
						nextStartPix = nextStartPix + nextTc.getHeight() * nextSched.start.getMinutes() / 60;
					}
					else if(nextTc.date.getHours() == nextSched.end.getHours() && nextTc.date.getMinutes() <= nextSched.end.getMinutes()){
						nextEndPix = nextEndPix - nextTc.getHeight() * (60-nextSched.end.getMinutes()) / 60;
					}		
				
					g.append('line')
					.attr('x1', tc.getWidth()+caller.heatmapConfig.cellPadding)
					.attr('x2', tc.getWidth()+caller.heatmapConfig.cellPadding)
					.attr('y1', startPix)
					.attr('y2', nextStartPix)
					.attr('style', 'stroke:rgb(0,0,0);stroke-width:8');
				}
			}catch(err){}
		}
		
		
		tc.drawUnocc = function(){
			var g = d3.select(svg);
			var caller = angular.element(svg).controller('energySpectrum');
			var sched = caller.schedules[tc.date.getDay()+''];
			
			var endPix = tc.getY();
			
			if(tc.date.getHours() == sched.end.getHours() && tc.date.getMinutes() <= sched.end.getMinutes()){
				endPix = endPix + tc.getHeight() * sched.end.getMinutes() / 60;
			}		
			
			g.append('line')
			.attr('x1', 0-caller.heatmapConfig.cellPadding)
			.attr('x2', 0+(+tc.getWidth())+caller.heatmapConfig.cellPadding)
			.attr('y1', endPix)
			.attr('y2', endPix)
			.attr('style', 'stroke:rgb(0,0,0);stroke-width:4');
			
			//handle the cases where next/previous day will not want to draw sides because this day is drawing sides. (fill gap)
			//only draw the left line if the previous day @ same time did not draw right...
			//The first day in the heatmap will throw an error because that day - 1 will not exist on the heatmap, so getting time cell will return null.
			try{
				if(caller.getTimeCell(new Date(tc.date.getTime()-24*60*60*1000)).shouldDrawSides()
				&& new Date(tc.date.getTime()-24*60*60*1000).getHours() != sched.end.getHours()){
					g.append('line')
					.attr('x1', 0-caller.heatmapConfig.cellPadding)
					.attr('x2', 0-caller.heatmapConfig.cellPadding)
					.attr('y1', endPix)
					.attr('y2', tc.getY()+tc.getHeight())
					.attr('style', 'stroke:rgb(0,0,0);stroke-width:8');
				}
			}
			catch(err){
				/*
				This was causing an extended line on the first day of the calendar to end the day... not sure why it was put in?
				g.append('line')
				.attr('x1', 0-caller.heatmapConfig.cellPadding)
				.attr('x2', 0-caller.heatmapConfig.cellPadding)
				.attr('y1', endPix)
				.attr('y2', tc.getY()+tc.getHeight())
				.attr('style', 'stroke:rgb(0,0,0);stroke-width:8');
				*/
			}

			//connect line for tomorrow when time today is start of schedule and tomorrow is start of schedule
			try{
				var nextTc = caller.getTimeCell(new Date(tc.date.getTime()+24*60*60*1000));
				var nextDay = nextTc.date.getDay()+'';
				var nextSched = caller.schedules[nextDay];
				var nextStartPix = nextTc.getY();
				var nextEndPix = nextTc.getY()+nextTc.getHeight();
				
				if(nextTc.isEnd()){
					
					if(nextTc.date.getHours() == nextSched.start.getHours() && nextTc.date.getMinutes() <= nextSched.start.getMinutes()){
						nextStartPix = nextStartPix + nextTc.getHeight() * nextSched.start.getMinutes() / 60;
					}
					else if(nextTc.date.getHours() == nextSched.end.getHours() && nextTc.date.getMinutes() <= nextSched.end.getMinutes()){
						nextEndPix = nextEndPix - nextTc.getHeight() * (60-nextSched.end.getMinutes()) / 60;
					}		
					g.append('class')
					.attr
					g.append('line')
					.attr('x1', tc.getWidth()+caller.heatmapConfig.cellPadding)
					.attr('x2', tc.getWidth()+caller.heatmapConfig.cellPadding)
					.attr('y1', endPix)
					.attr('y2', nextEndPix)
					.attr('style', 'stroke:rgb(0,0,0);stroke-width:8');
				}
			}catch(err){}		
	
		}
	
		tc.setEvent = function(){
			var g = d3.select(svg);
			
			//remove the image if it is already there
			g.select("image").remove();
			
			g.append("svg:image")
			.attr("xlink:href", "/intellicommand/usa.png")
			.attr("width", tc.getWidth())
			.attr("height", tc.getHeight())
			.attr("x",tc.getX())
			.attr("y", tc.getY())
			.on("click", function(){
			});
		}
		
		tc.OutOfOccupancy = function(){
			var g = d3.select(svg);
			
			//remove the image if it is already there
			g.select("image").remove();
			
			g.append("svg:image")
			.attr("xlink:href", "/intellicommand/usa.png")
			.attr("width", tc.getWidth())
			.attr("height", tc.getHeight())
			.attr("x",tc.getX())
			.attr("y", tc.getY())
			.on("click", function(){
			});
		}
		
		tc.DatDeviation = function(){
			var g = d3.select(svg);
			
			//remove the image if it is already there
			g.select("image").remove();
			
			g.append("svg:image")
			.attr("xlink:href", "/intellicommand/hotcool.png")
			.attr("width", tc.getWidth())
			.attr("height", tc.getHeight())
			.attr("x",tc.getX())
			.attr("y", tc.getY())
			.on("click", function(){
			});
		}
	}
	
	var _drawOcc = function(){
		var caller = this;
		var startDate = caller.heatmapConfig.start;
		var loopDate = startDate;
		var endDate = new Date(caller.calEnd()*1000);

		while(loopDate.getTime() <= endDate.getTime()){
			var day = loopDate.getDay()+'';
			var sched = caller.schedules[day];

			try{
				var startTime = new Date(loopDate.getTime());
				startTime.setHours(sched.start.getHours());
				startTime.setMinutes(sched.start.getMinutes());
				
				var endTime = new Date(loopDate.getTime());
				endTime.setHours(sched.end.getHours());
				endTime.setMinutes(sched.end.getMinutes());

				
				caller.getTimeCell(startTime).drawOcc();
				caller.getTimeCell(endTime).drawUnocc();
			}
			//should be an error if there is no schedule defined for the day.
			catch(err){

			}
			
			loopDate = new Date(loopDate.getTime() + 24*60*60*1000);
		}
		
	}
	
	_servObj = {
		//init : _init,
		drawOcc : _drawOcc,
		calEnd : _calEnd,
		calRange : _calRange,
		getDefaultConfig : _getDefaultConfig,
		getTimeCell : _getTimeCell
	};
	
	return _servObj;
}])
 
 /** angela removed things... **
.controller('heatmapCtrl', ['$scope', '$location', '$route', 'persistHeatmapService', 'heatmapDataService', 'heatmapConfigService', '$sce', function($scope, $location, $route, persistHeatmapService, heatmapDataService, heatmapConfigService, $sce, directiveService) {
**/
.controller('heatmapCtrl', ['$scope', '$location', 'persistHeatmapService', 'heatmapDataService', 'heatmapConfigService', '$sce', 'configService', '$controller', 'userPrefService', 'SkySparkAPI',
	function($scope, $location, persistHeatmapService, heatmapDataService, heatmapConfigService, $sce, configService, $controller,userPrefService, SkySparkAPI) {

	var vm = this;
	
	var defaultConfig = {
			"stationName" : "HAUN",
			"facilityName": "HAUN",
			"clientName" : "McDonalds",
			"dateRange" : "last six weeks",
			"actualColor" : "#FF0000",
			"expectedColor" : "#0000FF",
			"savingsColor" : "#008000",
			"cumColor" : "D3D3D3",
	}
	var currentConfig = defaultConfig;
	angular.extend(vm, userPrefService)
	angular.extend(vm, SkySparkAPI)
	

	//inject the zoomHeatmapService into the scope.
	//angular.extend(vm, zoomHeatmapService);	
	angular.extend(vm, persistHeatmapService);
	angular.extend(vm, heatmapDataService);
	angular.extend(vm, heatmapConfigService);
	
	//control whether the view needs to be reloaded.
	vm.rendered = false;

	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});

	angular.extend(vm, configService, superController);
	$scope.config = vm.getConfig();
	
	vm.url = "";

	
	//default data source
	vm.dataSource = ''//'https://galaxy2021temp.pcsgalaxy.net:9453/db/BMSRecords/groupRecordsDailyForHistoryId?org=Merck&facility=MRL&historyId=/MRL/kWh_MainBreaker1';
	vm.eventSource = '';
	
	// 0 is Sunday
	vm.schedules = { 
		'0' : { },
		'1' : { start : new Date(new Date(new Date().setHours(8)).setMinutes(0)), 
			end : new Date(new Date(new Date().setHours(22)).setMinutes(0)) },
		'2' : { start : new Date(new Date(new Date().setHours(8)).setMinutes(0)), 
			end : new Date(new Date(new Date().setHours(22)).setMinutes(0)) },
		'3' : { start : new Date(new Date(new Date().setHours(8)).setMinutes(0)), 
			end : new Date(new Date(new Date().setHours(22)).setMinutes(0)) },
		'4' : { start : new Date(new Date(new Date().setHours(8)).setMinutes(0)), 
			end : new Date(new Date(new Date().setHours(22)).setMinutes(0)) },
		'5' : { start : new Date(new Date(new Date().setHours(8)).setMinutes(0)), 
			end : new Date(new Date(new Date().setHours(22)).setMinutes(0)) }
		};
	
	vm.dataObj = {};
	vm.assets = "";
	vm.site = vm.getUserPrefs("event-page").stationName === undefined ? "MRL" : vm.getUserPrefs("event-page").stationName
	
	vm.heatmapConfig = vm.getDefaultConfig();

	vm.heatmapConfig.onClick =  function(date, value){	
		vm.setTimestamp(date);
		
		$location.url('/zoomHeatmap');			
		//$route.reload();
	}
	//for testing retrieving an individual time cell in the heatmap.
	vm.grab = function(){
		var max = 30;
		var min = 10;
		
		var selectDate = new Date(vm.heatmapConfig.start.getTime() 
			+ 1000*60*60*24*(Math.random()*(max-min+1)+min) 
			+ 1000*60*60*14);
		
		var timeCell = vm.getTimeCell(selectDate);
		
		timeCell.setTitle('An event is here!!!');
		timeCell.setText('!!');
		
		timeCell.setEvent();
		
	}
	
	//for testing multiple controllers inheriting the same service singleton
	vm.change = function(){
		var mean = vm.mean;
		var std = vm.std;
		
		vm.heatmapConfig.legend = [
				Math.round(mean - .5 * std), 
				Math.round(mean - .4*std), 
				Math.round(mean - .3*std), 
				Math.round(mean - .2*std), 
				Math.round(mean - .1*std),  
				Math.round(mean),
				Math.round(mean + .1*std), 
				Math.round(mean + .2*std), 
				Math.round(mean + .3*std), 
				Math.round(mean + .4*std), 
				Math.round(mean + .5*std), 
				Math.round(mean + .6*std) 
			];

		vm.rendered = false;
		
		//In one second, reload the heatmap component with the changed configuration.
		window.setTimeout(function(){
			vm.rendered = true;
			//redraw schedules if necessary.
			vm.scheduleSelect();
			$scope.$apply();
		}, 1000);
	}
	
	//draw or  remove schedule lines.
	vm.scheduleSelect = function(){
		if(vm.showLines){
			vm.drawOcc();
		}
		else{
			var heatmaps = document.getElementsByTagName('cal-heatmap');
			
			for(var i = 0; i < heatmaps.length; i++){
				
				//if the heatmap belongs to this controller				
				if(angular.element(heatmaps[i]).controller('energySpectrum') === vm){
					angular.element(heatmaps[i].getElementsByTagName('line')).remove();
				}
			}
		}
	}
	
	$scope.$on('userPrefsChanged',function(){

		if(vm.getUserPrefs("event-page").stationName != vm.site){
			vm.site = vm.getUserPrefs("event-page").stationName;
			vm.getData().then(vm.handleData)
		}
	});
	
	
	//when we change event sets, load the event data into time cells
	$scope.$watch('heat.eventSource', function(){
		vm.addEvents();
	}, true);
	
	$scope.$watch('heat.heatmapConfig', function(){
		vm.heatmapConfig.range = vm.heatmapConfig.rangeCalc();
		
		vm.change();		
	}, true);
	
	vm.handleData = function (dataddd){
		var data = {};
		var tz = dataddd.cols[0].tz
		
		angular.forEach(dataddd.rows, function(val, key) {
			var time = new Date(val.ts.replace(" "+tz,""));
			var value = val.v0 === undefined ? null : val.v0 ;
		
			data[(time.getTime() / 1000)+""] = value;
		})
		
		vm.dataObj = data;
		vm.fillData()
		vm.heatmapConfig.data = vm.dataObj;	
		
		vm.getSiteTotalConsumptionHourlyStatSummary(vm.site, vm.heatmapConfig.start, vm.heatmapConfig.end)
			.then(function (r){
				vm.min = parseFloat(r[0].min)
				vm.max = parseFloat(r[0].max)
				vm.mean = parseFloat(r[0].mean)
				vm.std = parseFloat(r[0].std)
				
				vm.change();
			})
		
	}
	
	vm.getData().then(vm.handleData);
}])

.directive('energySpectrum', [function() {
	return {
		restrict: 'E',
		controller: 'heatmapCtrl as heat',
		templateUrl: 'views/energySpectrum.html',
		link: function(scope, el, atr){

			//there won't be a scope.$parent if this widget is the root scope
			if(scope.$parent){
				scope.$parent.heat = scope.heat;
			}
		}
	}
}])
