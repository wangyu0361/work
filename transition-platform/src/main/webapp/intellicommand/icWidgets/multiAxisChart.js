'use strict';

angular.module('icDash.multiAxisChart', ['ui.bootstrap'])
.directive('multiAxisCompositeChart', [ function(){
	  return{
		  restrict:'E',
		  scope:{
			  height:"=",  // any integer
			  charts:"=", // an array of subcharts, capable of being used in a dc.compositeChart
			  axis:"=",  // an array of axis objects.  an axis object is:
					  /* {
						   * label:text - axis label
						   * units: boolean - true to include units on the label
						   * pointsOnAxis: array containing the string name of points on this axis
						   * autoAxis: boolean - true to automatically generate the high and low value of the axis
						   * domainHigh: integer - only used if autoAxis === false
						   * domainLow: integer - only used if autoAxis === false
					   * }
					   */
			  start:"=?", // chart start date object
			  end:"=?",	// chart end date object
		  },
		  template : "<div class='col-sm-12 col-md-12 col-lg-12 col-xl-12' id='{{chartId}}' ng-model=name resize></div>",
		  controller: 'multiAxisCompositeChartController',
	  }
  }])
  .controller('multiAxisCompositeChartController', ['$scope','$timeout','chartIdService','objectTools',function($scope,$timeout,chartIdService,objectTools){	  
	  var numberOfTicks;
	  var chartWidth;
	  var handle = null;
	  var origYAxis;
	  var origHeight;
	  var marginLeft = 0,
  	  	  marginRight = 150
  	  ;

	  var allPoints = [];
	  var multipliers = [];

	  $scope.chartId = chartIdService.getNewId();
	  
	  var chartInstance = undefined;
	  
	  $scope.storedAxis = [];
	  $scope.barHeight = 1;
	  
	  $scope.logScope = function(){
		  console.log($scope);
	  }
	  
	  var customTimeFormat = d3.time.format.multi([
                              [".%L", function(d) { return d.getMilliseconds(); }],
                              [":%S", function(d) { return d.getSeconds(); }],
                              ["%I:%M", function(d) { return d.getMinutes(); }],
                              ["%I:%M %p", function(d) { return d.getHours(); }],
                              ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
                              ["%b %d", function(d) { return d.getDate() != 1; }],
                              ["%b '%y", function(d) { return d.getMonth(); }],
                              ["%Y", function() { return true; }]
                            ]);
	  
	  function calculateAllPoints(){
		  if($scope.charts === undefined){return;}
		  allPoints = [];
		  for(var i = 0; i < $scope.charts.length; i++){
			  allPoints.push($scope.charts[i]._groupName)
		  }
	  }

	  function _drawChart(){		 // graph the points
		  calculateAllPoints();
		  handle = null;
		  if($scope.charts === undefined || $scope.charts.length === 0){
			  return;
		  }
		 
		  if($scope.start === undefined || $scope.end === undefined){
			  $scope.start = new Date(+(new Date())-(1000*60*60*24*180));
			  $scope.end = new Date();
		  }
		  
		  var _start = new Date($scope.start);	// deals with the possibility of dates brought in as strings
		  var _end = new Date($scope.end);		
		  
		  var myDomain = d3.time.scale().domain([_start, _end]);
		  
		  if(chartWidth === undefined){
				 chartWidth = .95*$scope.panelWidth;
		  }
		  
		  var yAxisPoints = allPoints.slice(0);
		  
		  for(var i = 0; i < $scope.axis.length; i++){
			  yAxisPoints = removeMatches(yAxisPoints,$scope.axis[i].pointsOnAxis);
		  }
		  
		  for(var i = 0; i < yAxisPoints.length; i++){
			  $scope.barHeight = getMax(yAxisPoints[i],$scope.barHeight)
		  }
		  		  
		  chartInstance = dc.compositeChart("#"+$scope.chartId)
		 		.width(chartWidth)
		 		.height($scope.height)
		 		.x(myDomain)
		 		.elasticY(true)
		 		.elasticX(false)
		 		.shareColors(true)
		 		.renderHorizontalGridLines(false)
		 		.shareTitle(false)
		 		.renderTitle(true)
		 		.brushOn(false)
		 		.mouseZoomable(false)
		 		.compose($scope.charts)
		 		.legend(
		 			dc.legend() 					
		 				.y(25)
		 				.itemHeight(13)
		 				.gap(5)
		    		)
		  ;

		  chartInstance.legend().x(function(){
			 						return  +(chartWidth-2*chartInstance.legend().itemWidth());
				 				  }()
		  );		  
		  
		  chartInstance.margins().left = marginLeft;
		  chartInstance.margins().right = marginRight;
		  
		  chartInstance.xAxis().tickFormat(function(v){return customTimeFormat(v);})
	 	  
		  if(numberOfTicks === undefined){
			 var axisWidth = chartWidth - (marginRight + marginRight);
			 
			 numberOfTicks = axisWidth/60;
		  }
		 		  		  
		  chartInstance.xAxis().ticks(numberOfTicks);
		  
		  for(var i = 0; i < $scope.storedAxis.length; i++){
			  var axis = $scope.storedAxis[i];
			  if(axis.autoAxis === false){
				 chartInstance.y(origYAxis);
				 break;
			  }
		  }
		 
		  chartInstance.render();
		  
		  chartInstance.on('preRender',function(chart,filter){
			  $scope.finished = false;
			  
		  })
		  
		  chartInstance.on('postRedraw',function(chart,filter){
			  redrawAllAxis().then(function(){
				  idTagLines();
				  redrawCharts(); 
			  })
			  
		  })
		  
		  chartInstance.on('postRender', function(chart, filter){
			  for(var i = 0; i < $scope.axis.length; i++){
				  addAxisObject($scope.axis[i]);
			  }
			  
			  redrawAllAxis().then(function(){
				  
				  
				  if(marginRight !== chart.margins().right){
					  _drawChart();
					  return;
				  }
				 
				  idTagLines();	 
				  redrawCharts();
				  
				  $scope.$emit("chartFinished",[true,chartInstance]);
			  })
		  })
	 }
	  
	 function redrawCharts(){
		 removeOldLineCopies();
		 visualLink();
	 }
	  
	 function getMaxNumberOfTicks(axisElement){
		 var ticks = axisElement.selectAll("g.tick text")[0];
			 			 
		 var totalWidth = 0;
			 
		 for(var i = 0; i < ticks.length; i++){
			 totalWidth += ticks[i].scrollWidth;
		 }
			 
		 var averageWidth = 2*(totalWidth/ticks.length);

		 var axisWidth = axisElement.node().getBBox().width;
			 
		 return Math.round(axisWidth / averageWidth);
	 }
  
	 function gotoDrawChart(){
		 $scope.$emit("chartFinished",false)
		 if(handle !== null){
			 $timeout.cancel(handle);
			 handle = null;
		 }
		 handle = $timeout(
					 function(){
						 $scope.barHeight = 1;
						 $scope.storedAxis = []; 
						 multipliers = [];
						 _drawChart();
					 }
					 ,500
		 		  );
	 }
	 
	 var getMax = function(myFilter,max){ // also add getting max modifications here
		 var _currentMax = 0;
		 
		 var getMaxEntry = function(entries){
			 var _currentMax_ = 0;
			 
			 for(var i = 0; i < entries.length; i++){
				 if(typeof(entries[i] === "object")){
					 if(entries[i].value.hasOwnProperty("avg") && _currentMax_ < entries[i].value.avg){
						 _currentMax_ = entries[i].value.avg
					 }
				 }else{
					 if(entries[i].value > _currentMax_){
						 _currentMax = entries[i].value;
					 }
				 }
			 }
			 
			 return _currentMax_;
		 }
		 
		 for(var i = 0; i < $scope.charts.length; i++){
			 if($scope.charts[i]._groupName === myFilter){
				 if($scope.charts[i].data().length === 0){continue;}
				 var allEntries = $scope.charts[i]
				 	.data()[0]
				 	.group
				 	.top(Infinity)
				 ;
				 
				 var _searchedMax = getMaxEntry(allEntries);
				 
				 if(_searchedMax > _currentMax) {_currentMax = _searchedMax;}
			 }
		 }

		 if(_currentMax > max){
			 return _currentMax;
		 }else{
			 return max; 
		 }
	 }
	 
	 function addAxisObject(axisConfig){
		 for(var i = 0; i < $scope.storedAxis.length; i++){
			 if(objectTools.isEqual($scope.storedAxis[i].pointsOnAxis,axisConfig.pointsOnAxis)){
				 return;
			 }
		 }

		 var maxVal = 0;
		 var legendStart = chartInstance.legend().x();
		 var totalAxisWidth = 0;
		 var high,
	     	 low
	     ;		
		 
		 for(var i = 0; i < axisConfig.pointsOnAxis.length; i++){
			 maxVal = getMax(axisConfig.pointsOnAxis[i],maxVal);
		 }
		 
		 var unitString = $scope.titleUnits === true ? 
			 function(){
		 			var unit = $scope.pointsUsed[pointsOnAxis[0]].units;
		 
		 			if(unit === undefined){
		 				unit = "n/a";
		 			}
		 
		 			for(var i = 0; i < pointsOnAxis.length; i++){
		 				if($scope.pointsUsed[pointsOnAxis[i]].units !== unit){
		 					unit = "multiple";
		 					break;
		 				}
		 			}
		 			return "("+unit+")";
	 		 }() 
	 		 : ""
		 ;
		 			 		
		 if(axisConfig.autoAxis == true){
			 high = maxVal;
			 low = 0;
		 }else{
			 if(isNaN(axisConfig.domainHigh) == true || isNaN(axisConfig.domainLow)==true){
				 alert("non-numeric domain high and low");
				 return;
			 }

			 high = axisConfig.domainHigh;
			 low = axisConfig.domainLow;
		 }
		 			 
		 var setMultiplier = function(myFilter){
			 multipliers[myFilter] = axisConfig.autoAxis ? maxVal : maxVal/high;
			 if(multipliers[myFilter] === 0){multipliers[myFilter] = 1;}
		 }
		 
		 var adjustChart = function(point){
			 for(var i = 0; i < $scope.charts.length; i++){
				 if($scope.charts[i]._groupName === point){
					 var data = $scope.charts[i]._group().top(Infinity);
					 
					 for(var j = 0; j < data.length; j++){
						 if(typeof(data[j].value) === "object" && data[j].value.hasOwnProperty("avg")){ // TODO make sure any complex objects are modified here
							 data[j].value.avg *= $scope.barHeight/multipliers[point];
						 }else{
							 data[j].value *= $scope.barHeight/(multipliers[point]); //TODO this is where my math problem is
						 }
					 }
				 }
			 }
		 }
		 
		 for(var i = 0; i < axisConfig.pointsOnAxis.length; i++){
			 if(multipliers[axisConfig.pointsOnAxis[i]] === undefined || multipliers[axisConfig.pointsOnAxis[i]] === 1){
				 setMultiplier(axisConfig.pointsOnAxis[i]);
				 adjustChart(axisConfig.pointsOnAxis[i]);
			 }
		 }
		 
		 for(var i = 0; i < $scope.storedAxis.length; i++){
			 totalAxisWidth += getElementBox($scope.storedAxis[i].id).width;
			 totalAxisWidth += getElementBox($scope.storedAxis[i].id+"label").height;
		 }

		 var thisId = $scope.chartId+"axis"+$scope.storedAxis.length;
		 var lastPoint = $scope.storedAxis.length > 0 ? $scope.storedAxis[$scope.storedAxis.length-1] : undefined;
		 
		 var label = axisConfig.label,
		 	 autoAxis = axisConfig.autoAxis,
		 	 pointsOnAxis = axisConfig.pointsOnAxis.slice(0);
		 	 autoAxis = axisConfig.autoAxis
		 ;
		 	 
		 var axisObject = {
				 "axisX":0,
				 "domainHigh":high,
				 "domainLow":low,
				 "id":thisId,
				 "label":label,
				 "units":unitString,
				 "labelX":0,
				 "pointsOnAxis":pointsOnAxis,
				 "autoAxis":autoAxis
		 }

		 drawAxis(axisObject).then( // no translation is accounted for so the axis will draw once at zero.  this is only to get an actual width measurement. 
			 function(){
				 var labelWidth = getElementBox(thisId+"label").height;
				 
				 var labelX = lastPoint === undefined ? 
						 legendStart - labelWidth - 5
						 :lastPoint.axisX - labelWidth - 5
				 ;

				 var axisWidth = getElementBox(thisId).width;
				 var axisX = labelX - axisWidth;
				 
				 axisObject.axisX = axisX;
				 axisObject.labelX = labelX;
				 
				 $scope.storedAxis.push(axisObject);
				 
				 getRightMargin();
			 }
		)
	 }
	 
	 function getElementBox(name){
		 return chartInstance.svg().select("#"+name).node().getBBox();
	 }
	 
	 function getRightMargin(){  // creates the margin of the composite chart and all the subcharts to be 5 pixels to the left of the last created axis (legend if none created)
		 var lastPoint = $scope.storedAxis.length === 0 ? undefined : $scope.storedAxis[$scope.storedAxis.length-1];
		 var translateX = lastPoint === undefined ? chartInstance.legend().x() : lastPoint.axisX;
		 			 
		 marginRight = chartWidth - translateX;
	 }
	 
	 function redrawAllAxis(){
		 return new Promise(function(resolve){
			 var max = $scope.storedAxis.length;
			 var counter = 0;
			 
			 if($scope.storedAxis.length === 0){resolve(true);}
			 
			 for(var i = 0; i < max; i++){
				 drawAxis($scope.storedAxis[i]).then(
					 function(){
						 counter++;
						 if(counter === max){
							 resolve(true);
						 }
					 }
				 )
			 } 
		 })
		 
	 }
	 
	 function idTagLines(){
		 var svg = chartInstance.svg();
		 var svgChildren = svg.node().childNodes;

		 var lines = svg.selectAll("path.line")[0];
		 for(var i = 0; i < lines.length; i++){
			 var line = lines[i];
			 var lineParent = line.parentNode;
			 
			 var superParent = lineParent.parentNode.parentNode;
			 
			 var toolTip;
			 
			 for(var j = 0; j < superParent.childNodes.length; j++){
				 if(superParent.childNodes[j].className.baseVal === "dc-tooltip-list"){
					 toolTip = superParent.childNodes[j];
				 }
			 }
			 
			 var color = line.getAttribute("stroke");
			 var legendItem = svg.select(".dc-legend-item [fill='"+color+"']").node();
			 var siblings = legendItem.parentNode.childNodes;
			 
			 var text = "";
			 for(var j = 0; j < siblings.length; j++){
				 if(siblings[j].nodeName == "text"){
					 text = siblings[j].innerHTML;
				 }
			 }
			 
			 if(text !== ""){
				 var id = "line_"+text;
				 toolTip.parentNode.parentNode.setAttribute("id",id);
				 toolTip.parentNode.parentNode.setAttribute("hidden","true");
				 var dots = toolTip.childNodes[0].childNodes;

				 for(var j = 0; j < dots.length; j++){
					 dots[j].setAttribute("style","fill-opacity:1;stroke-opacity:1;");
					 dots[j].setAttribute("r","2");
				 }
			 }
			 else{
				 console.log("empty text");
			 }
		 }
	 }
	 
	 function removeMatches(array1,array2){
		 var a1Copy = array1.slice(0);
		 var a2Copy = array2.slice(0);
		 for(var i = 0; i < a1Copy.length; i++){
			 for(var j = 0; j < a2Copy.length; j++){
				 if(a1Copy[i] === a2Copy[j]){
					 a1Copy.splice(i,1);
					 i--;
				 }
			 }
		 }
		 
		 return a1Copy;
	 }
	 
	 function visualLink(){
		 var svg = chartInstance.svg();
		 
		 var pointsAssociated = allPoints.slice(0);

		 var axis = [];
		 
		 function getAxisBox(axis){
			 var box = svg.select("#"+axis.getAttribute("id")+"Box");
			 
			 if(box.node() === null){
				 box = createAxisBox(axis);
				 
			 }
			 return box.node();
		 }
		 
		 function createAxisBox(axis){
			 var width = axis.getBBox().width;
			 var height = axis.getBBox().height;
			 var transform = axis.getAttribute("transform");
			 var x = d3.transform(transform).translate[0];
			 var id;
			 if(axis.className.baseVal === "axis y"){
				 x -= width;
				 id = $scope.chartId+"yAxisBox";
				 axis.setAttribute("id",$scope.chartId+"yAxis");
			 }else{
				 id = axis.id+"Box"
			 }
			 
			 var y = d3.transform(transform).translate[1];
			 
			 var rectangle = svg.append("rect")
			 						.attr("x",x)
			 						.attr("y",y)
			 						.attr("height",height)
			 						.attr("width",width)
			 						.attr("fill","rgba(255,255,0,.000001)") // transparent yellow
			 						.attr("id",id)
			 ;
			 
			 return rectangle;
		 }
		 
		 var yAxis = svg.select('.y.axis').node();
		 
		 axis[0] = {
				 "axis":yAxis,
				 "box":getAxisBox(yAxis)
		 }
		 
		 for(var i = 0; i < $scope.storedAxis.length; i++){
			 var thisAxis = svg.select("#"+$scope.storedAxis[i].id).node();
			 axis[i+1] = {
					 "axis":thisAxis,
					 "box":getAxisBox(thisAxis)
			 }
			 pointsAssociated = removeMatches(pointsAssociated,$scope.storedAxis[i].pointsOnAxis);			
		 }

		 addBoxMouseover(axis,pointsAssociated);
		 addLineMouseover();	
		 addLegendMouseEvents(); 	
		 fixToolTipValues(removeMatches(allPoints,pointsAssociated)); // forward all the non-y axis points for tooltip modification
	 }

	 function findSpecificLine(lineElem){			 
		 if(lineElem.className.baseVal.indexOf("line") >=0 && lineElem.parentNode.className.baseVal === "stack _0"){
			 return lineElem;
		 }
		 else{
			 for(var i = 0; i < lineElem.childNodes.length; i++){
				 return findSpecificLine(lineElem.childNodes[i]);
			 }
		 }
	 }
	 
	 function getMyLine(point){
		 var svg = chartInstance.svg();
		 var myElems = svg.selectAll("#line_"+point)[0];
		 
		 for(var k = 0; k < myElems.length; k++){
			 if(myElems[k].parentNode === svg.node()){
				 return myElems[k];
			 }
		 }
	 }
	 
	 function addClassToPoints(points,newClass){
		 var svg = chartInstance.svg();
		 for(var j = 0; j < points.length; j++){						// set highlight for good lines
			 var myLine = getMyLine(points[j])
			 
			 var tooltip  = d3.select(myLine).select("g.dc-tooltip-list").node();
			 
			 if(tooltip === null){continue;}
			 
			 tooltip.setAttribute("hidden","true");
			 
			 myLine = findSpecificLine(myLine);
			 
			 var currentClass = myLine.getAttribute("class");
			 
			 myLine.setAttribute("class",currentClass+" "+newClass);
		 }
	 }
	 
	 function removeClassFromPoints(points,oldClass){
		 var svg = chartInstance.svg();
		 for(var j = 0; j < points.length; j++){
			 var myLine = getMyLine(points[j])
			 
			 var tooltip  = d3.select(myLine).select("g.dc-tooltip-list").node();
			 
			 if(tooltip === null){continue;}
			 
			 tooltip.removeAttribute("hidden");
			 
			 myLine = findSpecificLine(myLine);

			 var currentClass = myLine.getAttribute("class");
			 
			 var index = currentClass.indexOf(" "+oldClass);
			 
			 var front = currentClass.substring(0,index);
			 var end = currentClass.substring(index+oldClass.length+1,currentClass.length);
			 
			 myLine.setAttribute("class",front+end);
		 }
	 }
	 
	 function addAttributeToAxisLine(axis,attr,className){
		 var children = axis.childNodes;

		 for(var j = 0; j < children.length; j++){ // set mouseover for the axis
			 if(children[j].nodeName == "path"){
				 var currentClass = children[j].getAttribute(attr);
				 
				 if(currentClass === null){currentClass = "";}
				 children[j].setAttribute(attr,currentClass+" "+className);
			 }
		 }
	 }
	 
	 function removeAttributeFromAxisLine(axis,attr,oldClass){
		 var children = axis.childNodes;
		 
		 for(var j = 0; j < children.length; j++){ // remove mouseover for axis
			 if(children[j].nodeName == "path"){
				 var currentClass = children[j].getAttribute(attr);
				 if(oldClass === undefined){
					 children[j].removeAttribute(attr);
				 }else{
					 var index = currentClass.indexOf(" "+oldClass);
					 
					 var front = currentClass.substring(0,index);
					 var end = currentClass.substring(index+oldClass.length+1,currentClass.length);
					 
					 children[j].setAttribute(attr, front+end);
				 }
			 }
		 }
	 }
	 
	 function addBoxMouseover(axis,pointsAssociated){
		 for(var i = 0; i < axis.length; i++){
			 axis[i].box.onmouseover = function(){
				 var svg = chartInstance.svg();
				 var myId = this.getAttribute("id");
				 var axisId = myId.substring(0,myId.indexOf("Box"));
				 var myAxis = svg.select("#"+axisId).node();
				 
				 addAttributeToAxisLine(myAxis,"class","highlight");
				 
				 var myPoints = myId.indexOf("yAxisBox") > -1 ? pointsAssociated // determine lines
						 : function(){
							 for(var j = 0; j < $scope.storedAxis.length; j++){
								 if(axisId === $scope.storedAxis[j].id){
									 return $scope.storedAxis[j].pointsOnAxis;
								 }
							 }
							 return "inconceivable";
						 }()
				 ;
				 
				 addClassToPoints(myPoints,"highlight");
				 
				 var otherPoints = removeMatches(allPoints,myPoints);
				 
				 addClassToPoints(otherPoints,"fadeout");
				 
			 };
			 axis[i].box.onmouseout = function(){
				 var svg = chartInstance.svg();
				 var myId = this.getAttribute("id");
				 var axisId = myId.substring(0,myId.indexOf("Box"));
				 var myAxis = svg.select("#"+axisId).node();
				 
				 removeAttributeFromAxisLine(myAxis,"class","highlight");
				 var myPoints = myId.indexOf("yAxisBox") > -1 ? pointsAssociated // remove mouseover for lines
						 : function(){
							 for(var j = 0; j < $scope.storedAxis.length; j++){
								 if(axisId === $scope.storedAxis[j].id){
									 return $scope.storedAxis[j].pointsOnAxis;
								 }
							 }
							 return "inconceivable";
						 }()
				 ;
				 
				 removeClassFromPoints(myPoints,"highlight");
				 
				 var otherPoints = removeMatches(allPoints,myPoints);
				 
				 removeClassFromPoints(otherPoints,"fadeout");
			 };
		 }
	 }
	 
	 function pointOnAxis(pointName){
		 var id = $scope.chartId+"yAxis";  //default to the yAxis;
		 
		 for(var i = 0; i < $scope.storedAxis.length; i++){
			 var axis = $scope.storedAxis[i];
			 
			 for(var j = 0; j < axis.pointsOnAxis.length; j++){
				 if(pointName === axis.pointsOnAxis[j]){
					 id = $scope.storedAxis[i].id;
				 }
			 }
		 }
		 
		 return id;
	 }
	
	 function addLineMouseover(){
		 var svg = chartInstance.svg();
		 
		 for(var i = 0; i < allPoints.length; i++){
			 var pointName = allPoints[i];
			 var myLine = getMyLine(pointName);
			 
			 if(myLine === undefined){continue;}
			 
			 var myAxisId = function(){
				 var id = $scope.chartId+"yAxis";  //default to the yAxis;
				 
				 for(var j = 0; j < $scope.storedAxis.length; j++){
					 var axis = $scope.storedAxis[j];
					 
					 for(var k = 0; k < axis.pointsOnAxis.length; k++){
						 if(pointName === axis.pointsOnAxis[k]){
							 return $scope.storedAxis[j].id;
						 }
					 }
				 }
				 
				 return id;
			 }();
			 				 
			 var myLegendItem = function(){
				 var legendItems = svg.selectAll("g.dc-legend-item")[0];
				 
				 for(var j = 0; j < legendItems.length; j++){
					 if(legendItems[j].textContent === pointName){
						 return legendItems[j];
					 }
				 }
			 }();
			 
			 var myColor = function(){
				 for(var j = 0; j < myLegendItem.childNodes.length; j++){
					 var node = myLegendItem.childNodes[j];
					 
					 if(node.getAttribute("fill") !== null && node.getAttribute("fill") !== undefined){
						 return node.getAttribute("fill");
					 }
				 }
			 }();
			 
			 var myAxis = svg.select("#"+myAxisId).node();
			 
			 var setMouseover = function(thisLine, thisAxis,color){
				 thisLine.onmouseover = function(){
					 addAttributeToAxisLine(thisAxis,"class","highlight");
					 thisAxis.setAttribute("style","stroke:"+color);
					 addAttributeToAxisLine(thisAxis,"style","stroke:"+color)
				 }
				 
				 thisLine.onmouseout = function(){
					 removeAttributeFromAxisLine(thisAxis,"class","highlight");
					 thisAxis.removeAttribute("style");
					 removeAttributeFromAxisLine(thisAxis,"style",undefined)
				 }
			 }

			 setMouseover(myLine, myAxis,myColor);
		 }
	 }
	 
	 function addLegendMouseEvents(){
		 var svg = chartInstance.svg();
		 
		 var legendItems = svg.selectAll("g.dc-legend-item")[0];
		 
		 var hideShowElem = function(elem){
			 if(elem !== undefined){
				 if(elem.getAttribute("hidden") === null ){
					 elem.setAttribute("hidden","true");
				 }else{
					 elem.removeAttribute("hidden");
				 }
			 }
		 }
		 
		 var mouseOvers = function(dcItem){
			 var id = dcItem.textContent;

			 var line = getMyLine(id);
			 var points = [];
			 points.push(id);
			 var otherPoints = removeMatches(allPoints,points);
			 
			 if(id === "Tickets"){
				 points = [];
				 otherPoints = allPoints;
				 line = null;
			 }
			 
			 dcItem.onmouseover = function(){
				 if(line !== null){
					 angular.element(line).trigger("onmouseover");
				 }
				 addClassToPoints(points,"highlight")
				 addClassToPoints(otherPoints,"fadeout");
			 }

			 dcItem.onmouseout = function(){
				 if(line !== null){
					 angular.element(line).trigger("onmouseout");
				 }
				 removeClassFromPoints(points,"highlight");
				 removeClassFromPoints(otherPoints,"fadeout");
			 }
			 
			 dcItem.onclick = function(){
				 if(line !== null){
					hideShowElem(line);
				 }else{
					 var children = svg.node().childNodes;
					 
					 for(var j = 0; j < children.length; j++){
						 if(children[j].nodeName === "rect" && children[j].childNodes.length === 1){
							 hideShowElem(children[j]);
						 }
					 }
				 }
			 }
		 }
		 
		 for(var i = 0; i < legendItems.length; i++){
			 mouseOvers(legendItems[i]);
		 }
	 }
	 
	 function fixToolTipValues(points){
		 var svg = chartInstance.svg();
		 
		 var adjustTitles = function(title,multiplier){
			 var html = title.innerHTML;
			 var index = html.lastIndexOf(":");
			 var val = html.substring(index+2);
			 			 
			 var newVal = d3.round(parseFloat(val)*multiplier,2);
			 
			 title.innerHTML = html.substring(0,index+2) + newVal;
		 }
		 
		 for(var i = 0; i < points.length; i++){
			 var multiplier = multipliers[points[i]]/$scope.barHeight;
			 var line = getMyLine(points[i]);
			 var myTitles = d3.select(line).selectAll("title")[0];
			 
			 if(myTitles === undefined){continue;}
			 
			 for(var j = 0; j < myTitles.length; j++){
				 adjustTitles(myTitles[j],multiplier);
			 }
		 }
	 }

	 function drawAxis(axisObject){
		 return new Promise(function(resolve){
			 var svg = chartInstance.svg();
			 var height = svg[0][0].clientHeight/2;
			 
			 var axisScale = d3.scale.linear()
				.domain([axisObject.domainHigh,axisObject.domainLow])
				.range([0,chartInstance.height()-40])
			 ;

			 var axis = d3.svg.axis()
					.scale(axisScale)
					.orient("right")
			 ;
			 
			 svg.select("#"+axisObject.id).remove();
			 svg.select("#"+axisObject.id+"label").remove()
			 
			 svg.append("text")
			 	.attr("class","y label")
			 	.attr("text-anchor","middle")
			 	.attr("y",-6)
			 	.attr("dy","0em")
			 	.attr("transform","translate("+axisObject.labelX+","+ height +") rotate(90)")
			 	.attr("id",axisObject.id+"label")
			 	.text(axisObject.label+axisObject.units)
			 ;
			 
			 svg.append("g")
		     	.attr("class","axis")
		     	.attr("transform","translate("+axisObject.axisX+",10)")
		     	.attr("id",axisObject.id)
		     .call(axis); 
			 
			 resolve(true);
		 })
		 
	 }
	 
	 function removeOldLineCopies(){
		 var svg = chartInstance.svg();
		 for(var j = 0; j < allPoints.length; j++){
			 var tips = svg.selectAll("#line_"+allPoints[j])[0];
			 
			 for(var k = 0; k < tips.length; k++){
				 if(tips[k].parentNode === svg.node()){
					 tips[k].remove();
					 tips.splice(k,1);
					 k--;
				 }
			 }

			 if(tips[0] !== undefined){
				 var clone = tips[0].cloneNode(true);
				 clone.removeAttribute("hidden");
				 chartInstance.svg().node().appendChild(clone);
			 }
		 }
	 }
	 
	 function setNumberOfTicks(){
		 var maxTicks = getMaxNumberOfTicks(chartInstance.svg().select(".axis.x"));
		 var currentTicks = chartInstance.xAxis().ticks();

		 if(numberOfTicks !== maxTicks){
			 numberOfTicks = maxTicks;
		 }
	 }
	 
	 function marginCheck(){
		  if(d3.select("g.y.axis").node().getBBox().width === 0){
			  $timeout(marginCheck,100);return;
		  }
		  
		  origYAxis = chartInstance.y();
		  origHeight = 0;
		  for(var i = 0; i < $scope.charts.length; i++){
			  origHeight = getMax($scope.charts[i]._groupName,origHeight)
		  }
		  
		  marginLeft = chartInstance.svg().select(".axis.y").node().getBBox().width + 5
		  _drawChart();
	 }

	 $scope.$on('redraw',function(){
		 if(marginLeft === 0){ // this process causes the chart to be drawn, cleared, then drawn again.  looks clunky
			 marginCheck();
			 return;
		 }
		 redrawCharts();
	 });
	 
	 $scope.$watch(
		"panelWidth",
		function(newVal,oldVal){
			if(oldVal*1.1 < newVal || newVal < oldVal*.9){
				chartWidth = undefined;
				gotoDrawChart();
			}
		}
	 );
	 
	 $scope.$watch(
		"height",
		function(newVal,oldVal){
			if(oldVal !== newVal){
				gotoDrawChart();
			}
		}
	 );
	 
	 $scope.$watch(
		"charts",
		function(newVal,oldVal){
			if(oldVal !== newVal){
				gotoDrawChart();
			}
		}
	 );

	 $scope.$watch(
		"axis",
		function(newVal,oldVal){
			if(objectTools.isEqual(oldVal,newVal) === false){
				gotoDrawChart();
			}
			
		}
	 );
	 
	 $scope.$watch(
		"start",
		function(newVal,oldVal){
			if(oldVal !== newVal){
				gotoDrawChart();
			}
		}
	 );
	 
	 $scope.$watch(
		"end",
		function(newVal,oldVal){
			if(oldVal !== newVal){
				gotoDrawChart();
			}
		}
	 );
	  
  }])
	.factory('legendScaleGenerator', [function() {
		/****************
		* This function assists in the creation of a readable legend, 
		* which is not obfuscated by small chart dimensions.
		*
		* legend scaler needs height, width, margin detail and legend count.
		* returns the dc.legend object
		****************/
		var _legendScaler = function (dimensions, margins, count) {
			
				var returnObject = {
					itemHeight: 12,
					gap: 5,
					legendX:  dimensions.width - margins.right + 25
				};
				
				returnObject.legendHeight = (returnObject.gap + returnObject.itemHeight)*count - returnObject.gap; //minus one padding cuz that's how it's done.
				
				if (returnObject.legendHeight > dimensions.height) {
					var scaleNumber = Math.floor(dimensions.height/count);
					switch (scaleNumber) {	//changes the gap and item height to git new height
						case 16:
							returnObject.gap = 4;
							returnObject.itemHeight = 12;
							break;
						case 15:
							returnObject.gap = 3;
							returnObject.itemHeight = 12;
							break;
						case 14:
							returnObject.gap = 3;
							returnObject.itemHeight = 11;
							break;
						case 13:
							returnObject.gap = 3;
							returnObject.itemHeight = 10;
							break;
						case 12:
							returnObject.gap = 2;
							returnObject.itemHeight = 10;
							break;
						case 11:
							returnObject.gap = 2;
							returnObject.itemHeight = 9;
							break;
						case 10:
							returnObject.gap = 2;
							returnObject.itemHeight = 8;
							break;
						case 9:
							returnObject.gap = 1;
							returnObject.itemHeight = 8;
							break;
						default:
							if(scaleNumber >= 17) {
								returnObject.gap = 5;
								returnObject.itemHeight = 12;
							}
							else{
								//report outwardly that the legend will not fit!
								console.log("Chart too small! Legend won't fit!");
								returnObject.gap = 1;
								returnObject.itemHeight = 8;
							}
							break;
					}
															//gap + item height
					returnObject.legendHeight = (returnObject.gap + returnObject.itemHeight)*count - returnObject.gap; //minus one padding cuz that's how it's done.
				}
				else {
				}
				return dc.legend().x(returnObject.legendX).y(0).gap(returnObject.gap).itemHeight(returnObject.itemHeight);
			};
			return _legendScaler;
	}])
  // TODO get the top and bottom of the data (line 81)
  //TODO actually delete the correct point
  //TODO fix left hand resizing based on numbers
  //TODO expand the multi-axis chart to deal with the new tooltipping/functionalit regarding rect.bars
  //TODO clean up code
  
  