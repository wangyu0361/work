angular.module('icDash.dateSlider', [])
.directive('dateSliderChart',[function(){
     return{
         restrict:'E',
         scope:{
             chart:"=",
             editChart:"=",
             dynamicDimensions:"=",
             startEndDates:"=",
             startTime:"=?",
             endTime:"=?"
         },
         template: "<div class='col-sm-12 col-md-12 col-lg-12 col-xl-12' id={{chartId}}></div>",
         controller:"dateSliderCtrl",
                     
     }
  }])
  .controller('dateSliderCtrl',['$scope','chartIdService','objectTools',function($scope,chartIdService,objectTools){      
       $scope.logScope = function(){
           console.log($scope);
       }
       
       if(typeof($scope.editChart) !== "boolean"){
           return;
       }
       if(typeof($scope.startEndDates) !== "boolean"){
           return;
       }
       
       $scope.startTime = $scope.startTime === undefined ? undefined : $scope.startTime;
       $scope.endTime = $scope.endTime === undefined ? undefined : $scope.endTime;
       $scope.chartId = chartIdService.getNewId();
       
       var lastGroupNames = [];
 
       var lastBrush = null;
       
       function chart(){    
           var superGroup = [];
           
           var chartInfo = function(chart){
               return {
                   "data":chart.group().top(Infinity)
               }
           }
           
           var groupNames = [];
           
           if($scope.chart.dimension() !== undefined){
               superGroup.push(chartInfo($scope.chart));
               groupNames.push($scope.chart._groupName);
           }else{
               for(var i = 0; i < $scope.chart.children().length; i++){
                   superGroup.push(chartInfo($scope.chart.children()[i]));
                   groupNames.push($scope.chart.children()[i]._groupName);
               }
           }
           
           var superDuperGroup = [];
           
           var getElements = function(array){
               for(var i = 0; i < array.length; i++){
                   superDuperGroup.push(array[i]);
               }
           }
           
           for(var i = 0; i < superGroup.length; i++){
               getElements(superGroup[i].data);
           }
           
           if(objectTools.isEqual(groupNames,lastGroupNames) === false){
               lastGroupNames = groupNames;
               lastBrush = null;
           }
                       
           var dimension = crossfilter(superDuperGroup).dimension(function(d){return d3.time.day(new Date(d.key));});
           var group = dimension.group().reduceSum(function(d){if(isNaN(d.value) === false){return d.value}else{return 0;}});
           
           //TODO if the new start time and end time don't match the old start time and end time, assume it's a brand new chart
                               
           var timeChart = dc.barChart("#"+$scope.chartId)
                 .width($scope.chart.width())
                 .height(80)
                 .group(group)
                 .dimension(dimension)
                 .centerBar(true)
                 .gap(1)
                 .x(d3.time.scale().domain([new Date(dimension.bottom(1)[0].key),new Date(dimension.top(1)[0].key)]))
                 .brushOn(true)
                 .renderlet(function(chart){
                	 chart.selectAll("g.x text")
						.attr('transform', "rotate(-60)")
						.attr('dx', '-8')
						.attr('dy', '-5')
						.style("text-anchor", "end")
					;
                 })
                 .transitionDuration(1)
                 .centerBar(true)
           ;
           timeChart.yAxis().ticks(0);
           
           timeChart.margins().right = $scope.chart.margins().right === undefined ? 0 : $scope.chart.margins().right;
           timeChart.margins().left = $scope.chart.margins().left === undefined ? 100 : $scope.chart.margins().left;
           timeChart.margins().bottom = 50;
           timeChart.render();            
           
           timeChart.brush().on('brushend',function(){
               var start = new Date(timeChart.brush().extent()[0]);
               var end = new Date(timeChart.brush().extent()[1]);
               
               if($scope.startEndDates === true){ // provides a change to start/end date to keep calendar functionality
                   $scope.startTime = start;
                   $scope.endTime = end;
                   $scope.$emit('dateSliderDateChange',[start,end]);
               }
               if($scope.editChart === true){ // manually resets the chart's x to not handle start/end logic
                   if($scope.dynamicDimensions === true){
                       $scope.startTime = start;
                       $scope.endTime = end;
                       $scope.chart
                             .x(d3.time.scale().domain([start,end]))
                             .render();
                   }else{
                       $scope.chart
                         .x(d3.time.scale().domain([start,end]))
                         .render();
                     
                   }
                   
               }
               
               lastBrush = timeChart.brush();
           })
           
           timeChart.on("postRender",function(charts,filter){
        	   var yAxisNode = timeChart.svg().select("g.axis.y").node() 
               yAxisNode.parentNode.removeChild(yAxisNode);
               
               if(lastBrush !== null){
                   timeChart.brush().extent([$scope.startTime,$scope.endTime]);
                   timeChart.svg().select(".brush").call(timeChart.brush())
               }
           })
       }
       
       $scope.$watch(
           'chart',
           function(newVal,oldVal){
               if(newVal !== undefined){
                   chart();
               }
           },true
       )
      }
  ])  
  
  //TODO edit the original dimension or group, this will cause all areas outside of the slider to become zero
;


