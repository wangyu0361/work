'use strict';
//TODO: make color gradient a better color scheme
//TODO: in transitions, color should gradually change instead of immediately
//TODO: make treemap fit within the panel
//I stopped at line 290

angular.module('icDash.treemapAsset', ['ui.router'])

/**angular.module('myApp.treemapAsset', ['ngRoute','ui.bootstrap','myApp.pciService','myApp.facilitySelector','myApp.dashboard','colorpicker.module','myApp.panelComponent', 'myApp.calendar'])
.run(['directiveService', function(directiveService){
	directiveService.addFullComponent({
		tag: function(){return 'treemap-asset';},
		configTag: function(){return 'treeasset-config';},
		tagHtml: function(){return "<treemap-asset></treemap-asset>";},
		directiveName: function(){return 'treemapAsset';},
		namespace: function(){return 'treemapAsset'},
		heading: function(){return 'treemap-asset-name';},
		paletteImage: function(){return 'treemap.png';}
	});
}])**/
.directive('treemapAssetName', [function(){
	return{
		template: "Treemap Asset"
	};
}])
/** angela removed some dependencies **
.controller('treemapAssetCtrl', ['$scope','$rootScope', '$modal', '$location', '$route','$timeout','PCIdbService','$window','configService', '$controller','noReloadUrl','facilitySelectorService', 'userPrefService',
                                 function($scope,$rootScope, $modal, $location, $route,$timeout,dbService,$window,configService,$controller,noReloadUrl,facilitySelectorService, userPrefService) {

**/
.controller('treemapAssetCtrl', ['$scope','$rootScope', '$modal', '$location', '$timeout','PCIdbService','$window','configService', '$controller','userPrefService',
                                 function($scope,$rootScope, $modal, $location, $timeout,dbService,$window,configService,$controller, userPrefService) {


	$scope = $scope.$new();
	
	
	/** angela removed/updated this section **
	var thisController = this;


	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});

	angular.extend(thisController, configService, superController);

	$scope.treemapConfig = thisController.getConfig();

	//console.log($scope.treemapConfig);

	var defaultConfig = {
			"startDate"	:undefined,
			"endDate"		:undefined,
			"chartStart"		:undefined,
			"chartEnd"			:undefined,
			"colorLow"			:undefined,
			"colorHigh"         :undefined,
			"dateRange" 		:undefined,
			"facilityName" 		:"MRL",
	}

	for(var key in defaultConfig){
		if($scope.treemapConfig.hasOwnProperty(key) === false){
			$scope.treemapConfig[key] = defaultConfig[key];
		}
	}
	/** end section angela removed/updated **/

	/** angela's new section **/
	// Choose settings that this widget cares about
	var defaultConfig = {
			"startDate" : undefined,
			"endDate" : undefined,
			"chartStart" : undefined,
			"chartEnd" : undefined,
			"colorLow" : undefined,
			"colorHigh" : undefined,
			"dateRange" : undefined,
			"facilityName" : "MRL",
	}
	var currentConfig = defaultConfig;
	
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});

	angular.extend(thisController, configService, superController);
	$scope.config = thisController.getConfig();
	// End choose settings that this widget cares about
	
	var refreshConfigs = function() {
		console.log("TREEMAP ASSET updating!");
		
		var myPrefs = userPrefService.getUserPrefs("treemap-asset");
		
		/* Use default config to determine which preferences should be used in the widget
			Order of preferences: 
			1) User preferences (myPrefs)
			2) XUI configurations ($scope.config)
			3) default configurations by widget (defaultConfig)
		*/
		for (var key in defaultConfig) {
			if (myPrefs[key] !== "" && myPrefs[key] !== undefined) {
				currentConfig[key] = myPrefs[key];
			} else if ($scope.config[key] !== "" && $scope.config[key] !== undefined) {
				currentConfig[key] = $scope.config[key];
			} else {
				currentConfig[key] = defaultConfig[key];
			}
		}

		$scope.treemapConfig = currentConfig;	
		$scope.runQuery();
	}
	/** end angela's new section **/


	var config = {
			method:'POST',
			headers: {'Collection': 'events'},
			url:"https://galaxy2021temp.pcsgalaxy.net:9453/db/query",
			data:"{}"
	};
	dbService.getData(config).then(function(response){



		if($scope.treemapConfig.startDate===undefined || $scope.treemapConfig.endDate===undefined){
			//$scope.setDateRange("All");
			currentConfig.startDate = $scope.startDate;
			currentConfig.endDate = $scope.endDate;
		}
		else{
			//console.log($scope.treemapConfig.startDate);
			//console.log(Date.parse($scope.treemapConfig.startDate));
			//console.log($scope.startDate);
			$scope.startDate = new Date(Date.parse($scope.treemapConfig.startDate));

			$scope.endDate =  new Date(Date.parse($scope.treemapConfig.endDate));
		}
		$scope.runQuery();

	});

	var generateUID = function(widgetName){
		var time = new Date().getUTCMilliseconds();
		var rngesus = Math.floor((Math.random() * 1000) + 1);
		var uid = widgetName+":"+time+":"+rngesus;
		$scope.thisUID = uid;
		return uid;
	}

	$scope.debug = function () {
		console.log($scope);

		//colorProcess();
	};

	var getAssetList = function(assetType){
		var categories2 = [];
		var assetCount = 0;
		for(var thisObject in $scope.responseData.data.result){
			var alreadyThere2 = false;

			var thisAsset = $scope.responseData.data.result[thisObject].asset;
			var thisAssetType = $scope.responseData.data.result[thisObject].assetType;
			var thisPotentialSaving = Math.round($scope.responseData.data.result[thisObject].potentialSaving);
			//console.log(thisPotentialSaving);
			if(thisAssetType === assetType){
				for(var checking2 in categories2){

					if((categories2[checking2])[0]===thisAsset){
						alreadyThere2=true;
					}
				}

				if(alreadyThere2===false)
				{
					var thisAssetArray2 = [];
					thisAssetArray2[0]=thisAsset;
					thisAssetArray2[1]=1;
					thisAssetArray2[2]=thisPotentialSaving;
					categories2[assetCount]=thisAssetArray2;
					assetCount=assetCount+1;
				}
				else{
					for(var e in categories2){

						if((categories2[e])[0]===thisAsset){
							(categories2[e])[1]=((categories2[e])[1])+1;
							(categories2[e])[2] += thisPotentialSaving.valueOf();

						}
					}

				}
			}
		}

		return categories2;
	};

	$scope.refresh = function(){
		if($scope.isDashboarded()){
			$scope.change($scope.panelWidth-60,$scope.panelHeight-50);
		}
		else{
			$scope.change($scope.truePanelWidth,$scope.truePanelHeight);
		}
	}

	var processData = function(){
		var categories = [];


		var assetTypeCount = 0;

		for(var thisObject in $scope.responseData.data.result){
			//console.log($scope.queryData.data.result[thisObject].assetType);
			var thisAssetType = $scope.responseData.data.result[thisObject].assetType;

			var alreadyThere = false;

			var name=thisAssetType;


			for(var checking in categories){
				if((categories[checking])[0]===thisAssetType){
					alreadyThere=true;
				}
			}

			if(alreadyThere===false)
			{
				var thisAssetArray = [];
				thisAssetArray[0]=thisAssetType;

				categories[assetTypeCount]=thisAssetArray;
				assetTypeCount=assetTypeCount+1;
			}
			else{

				for(var a in categories){

					if((categories[a])[0]===thisAssetType){
						(categories[a])[1]=getAssetList(thisAssetType);

					}
				}
			}



		}
		//console.log(categories);
		$scope.categories = categories;

		return categories;
	}

	var constructChildren = function(thisArray){
		var concatString = "";
		for(var eachAsset in thisArray[1]){
			var thisAssetName = ((thisArray[1])[eachAsset])[0];
			var thisAssetCount = ((thisArray[1])[eachAsset])[1];
			var thisPotentialSaving = ((thisArray[1])[eachAsset])[2];
			concatString = concatString+'{"name": "'+thisAssetName+'","amount": '+thisPotentialSaving+',"count":'+thisAssetCount+'}';
			if(eachAsset < thisArray[1].length-1){
				concatString = concatString+",";
			}
		}
		return concatString;
	}

	var constructObject = function(){
		var categories = processData();

		var objectStringHead = '{"name": "Work Order Value","children": [';
		//var objectStringBody = '{"name": "AHUs", "size": 1,"color":1}, {"name": "VAVs", "size": 1333,"color":1}, {"name": "Plants", "size": 12,"color":1},{"name": "Compressors", "size": 7134,"color":1},{"name": "CoolingTowers", "size": 423,"color":1}, {"name": "HeatExchangers", "size": 7351,"color":1}, {"name": "Meters", "size": 5,"color":1}';
		var objectStringBody = "";
		var objectStringTail = ']}';
		for(var c=0;c<categories.length;c++){
			//console.log(categories[c]);
			var thisCount = 0;
			for(var d=0;d<categories[c][1].length;d++){
				thisCount = thisCount+categories[c][1][d][1];
			}
//			console.log(thisCount);
			objectStringBody = objectStringBody+'{"name": "'+(categories[c])[0]+'", "children": ['+constructChildren(categories[c])+'],"count":'+thisCount+'}';
			if(c<categories.length-1){objectStringBody = objectStringBody+',';}
		}


		$scope.testingTreemap = JSON.parse(objectStringHead+objectStringBody+objectStringTail);

		$scope.treemapObject = {

				'name': 'optimization',
				'children': [
				             {'name': 'AHUs', 'size': 1,'color':1},
				             {'name': 'VAVs', 'size': 1333,'color':1},
				             {'name': 'Plants', 'size': 12,'color':1},
				             {'name': 'Compressors', 'size': 7134,'color':1},
				             {'name': 'CoolingTowers', 'size': 423,'color':1},
				             {'name': 'HeatExchangers', 'size': 7351,'color':1},
				             {'name': 'Meters', 'size': 5,'color':1}
				             ]
		}
	}						 


	$scope.testColor1 = 'rgba(5,0,255,1)';
	$scope.testColor2 = 'rgba(4,51,226,1)';
	$scope.testColor3 = 'rgba(3,102,198,1)';
	$scope.testColor4 = 'rgba(2,153,169,1)';
	$scope.testColor5 = 'rgba(1,204,141,1)';
	$scope.testColor6 = 'rgba(0,255,112,1)';


	function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
	function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
	function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
	function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

	var parseRGBA = function(rgbaString,desiredColor){

		rgbaString = rgbaString.substring(rgbaString.indexOf("(")+1,rgbaString.indexOf(")"));
		var rgbaArray = rgbaString.split(",");
//		console.log(rgbaArray);

		switch(desiredColor){
		case "red": return rgbaArray[0]; break;
		case "green": return rgbaArray[1]; break;
		case "blue": return rgbaArray[2]; break;
		case "alpha": return rgbaArray[3]; break;
		}
//		return color
	}

	var constructRGBA = function(red,green,blue,alpha){
		var rgbaArray = 'rgba('+red+','+green+','+blue+','+alpha+')';
		return rgbaArray;
	}

	var colorProcess = function(){
		var startColor = $scope.$$childHead.colorSelect[0];
		var endColor = $scope.$$childHead.colorSelect[1];
//		console.log(parseRGBA(startColor,"red"));
	}



	//var color = d3.scale.category10();
	var color = function(count){

		//calculate difference in range, assuming you get a minimum number and a maximum number
		var range = $scope.rangeHigh-$scope.rangeLow;

		var colorLow;
		var colorHigh;
		colorLow = $scope.treemapConfig.colorLow;
		colorHigh = $scope.treemapConfig.colorHigh;

		/*var lowRed = parseRGBA(colorLow,"red");
	var highRed = parseRGBA(colorHigh,"red");
	var lowBlue = parseRGBA(colorLow,"blue");
	var highBlue = parseRGBA(colorHigh,"blue");
	var lowGreen = parseRGBA(colorLow,"green");
	var highGreen = parseRGBA(colorHigh,"green");
	var lowAlpha = parseRGBA(colorLow,"alpha");
	var highAlpha = parseRGBA(colorHigh,"alpha");*/
		var lowRed = hexToR(colorLow);
		var highRed = hexToR(colorHigh);
		var lowBlue = hexToB(colorLow);
		var highBlue = hexToB(colorHigh);
		var lowGreen = hexToG(colorLow);
		var highGreen = hexToG(colorHigh);
		var lowAlpha = 1;
		var highAlpha = 1;

		var percentileColor = (count-$scope.rangeLow)/range;

		var redRange = highRed-lowRed;
		//console.log(redRange*percentileColor);
		//console.log((redRange*percentileColor)+parseInt(lowRed));
		var thisRed = parseInt((redRange*percentileColor)+parseInt(lowRed));

		var greenRange = highGreen-lowGreen;
		var thisGreen = parseInt((greenRange*percentileColor)+parseInt(lowGreen));

		var blueRange = highBlue-lowBlue;
		var thisBlue = parseInt((blueRange*percentileColor)+parseInt(lowBlue));

		var alphaRange = highAlpha-lowAlpha;
		var thisAlpha = (alphaRange*percentileColor)+parseFloat(lowAlpha);

		var thisColor = constructRGBA(thisRed,thisGreen,thisBlue,thisAlpha);
		//console.log(thisColor);
		//console.log(percentileColor);
		//console.log(thisRed);
		//console.log(redRange);
		//console.log(lowRed);
		return thisColor;
	}


	$scope.change = function(width,height){
		//console.log(width+"::this is what's drawn:"+height);
		wholeTreemap(width,height);
		$scope.drawChart();
	}

//	MC: The following line declares 5 variables. The 4th one creates an alias for a number formatting function. The 5th one has no value.
//	MC: Strange that he's hardcoded the width and height in here since they also appear in the CSS.
	var wholeTreemap = function(width,height){


		var svgArray = d3.selectAll("svg");
		for(var a=0;a<svgArray.length;a++){
			console.log(svgArray[a]);
			for(var b=0;b<svgArray[a].length;b++){
console.log(svgArray[a][b].attributes);
try{
				if(svgArray[a][b].attributes[2].nodeValue===$scope.thisUID){


					svgArray[a][b].remove();
				}
}catch(error){}
			}

		}


//		d3.select("svg").remove();  
		//console.log($scope.facilityName);
		$scope.treeWidth = width;
		$scope.treeHeight = height;
		if($scope.treeWidth===undefined || $scope.treeWidth===0){$scope.treeWidth = 1500;}
		if($scope.treeHeight===undefined || $scope.treeHeight===0){$scope.treeHeight = 300;}

		var margin = {top: 50, right: 0, bottom: 0, left: 0},
		width = $scope.treeWidth,
		height = $scope.treeHeight - margin.top - margin.bottom,
		formatNumber = d3.format(",.1f"),		// MC: I want one decimal place. See https://github.com/mbostock/d3/wiki/Formatting#d3_format
		transitioning;

		window.onresize = function (){
			//console.log(window.innerWidth+":::"+window.innerHeight);
			//$scope.change($scope.windowWidth,$scope.windowHeight-200);
			//$scope.treeHeight = window.innerHeight;
			//$scope.treeWidth = window.innerWidth;

			//margin.width = $scope.treeWidth,
			//height = $scope.treeHeight - margin.top - margin.bottom;
		}


//		MC: Here he creates the X and Y scales, which are 1:1 and linear, ie. no scaling applied.

		var x = d3.scale.linear()
		.domain([0, width])
		.range([0, width]);

		var y = d3.scale.linear()
		.domain([0, height])
		.range([0, height]);

//		MC: Create the tree layout with built-in d3 methods.

		var treemap = d3.layout.treemap()
		.children(function(d, depth) { return depth ? null : d._children; })  // Each node in the tree has a 'depth' property. 0 is the root. Not sure about the rest.
		.sort(function(a, b) { return a.amount - b.amount; })	// I think this forces sorting in ascending order. See https://github.com/mbostock/d3/wiki/Treemap-Layout
		.ratio(height / width * 0.5 * (1 + Math.sqrt(5)))  // No idea what this does yet. Can't see any API doc on it so maybe a custom property.
		.round(false)  // No rounding to exact pixel boundzaries for anti-aliasing. Perhaps try with this set to 'true'.
		.value(function(d) { return d.amount; });

		//get chart and do stuff to it
		var chart = d3.select("#chart")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.bottom + margin.top);
		//console.log(chart);
		//chart.childNodes=[];
//		MC: Create the canvas with the appropriate margins. Creates a top-level group inside the canvas to contain all the elements.
//		MC: 'append' adds a new node as a child of the current node, just before the closing tag.

		var svg = d3.select("#chart").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.bottom + margin.top)
		.attr("widgetID",generateUID("treemapAsset"))
		.style("margin-left", -margin.left + "px")
		.style("margin.right", -margin.right + "px")
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.style("shape-rendering", "crispEdges");  // MC: An SVG style property to make it look as nice as possible. See http://www.w3.org/TR/SVG/painting.html#ShapeRenderingProperty

		$scope.savedNode = svg;
//		MC: Creates a 'g' for the header bar which contains the breadcrumbs and enables the user to go back.

		var grandparent = svg.append("g")
		.attr("class", "grandparent");

//		MC: Creates a 'rect' node inside the grandparent.

		grandparent.append("rect")
		.attr("y", -margin.top)	// -20px to force it to appear above the main plotting area.
		.attr("width", width)
		.attr("height", margin.top)
		.style( "stroke", "#000000");

//		MC: Creates a 'text' node inside the grandparent, after the 'rect' node. It's hardcoded 6 pixels down and 6 pixels across from the top left of the container.
//		MC: 'dy' seems to be used to make sure the X and Y position - which aligns with the baseline of the text - is shifted to simulate an X and Y which refer to the top left corner instead.
//		MC: 1em is the current font size, so in theory this shift works as the font gets larger / smaller.

		grandparent.append("text")
		.attr("x",  6)
		.attr("y", 6 - margin.top)
		.attr("dy", ".75em");

//		MC: Loads in the data from 'budget.json'. The call is asynchronous. Once the JSON has loaded, the next 40 or so lines run.

//		d3.json("budget_amount.json", function(root) {		// Loads the JSON into memory as an object. The name 'root' is simply a reminder that the object is a hierarchical.

		$scope.drawChart = function(){
			constructObject();
			var root = $scope.testingTreemap;

			initialize(root);
			accumulate(root);
			layout(root);
			display(root);

			//$scope.$apply();
		}

		function initialize(root) {
			root.x = root.y = 0;	// Root node is drawn in top-left corner...
			root.dx = width;			// ... and fills the SVG area...
			root.dy = height;
			root.depth = 0;
		}

		// Aggregate the values for internal nodes. This is normally done by the21
		// treemap layout, but not here because of our custom implementation [MC: Why custom? Perhaps because it's interactive so not shwoing the full map.].
		// We also take a snapshot of the original children (_children) to avoid
		// the children being overwritten when when layout is computed.

		// MC: Just a fancy IF statement but not too sure what's going on yet. See https://github.com/mbostock/d3/wiki/Treemap-Layout#wiki-children. 'Reduce' is not a d3 method so assume it's a recursive function?

		function accumulate(d) {
			// console.log(d.name + ", " + d.value);

			return (d._children = d.children)
			? d.amount = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
					: d.amount;
		}

		// Compute the treemap layout recursively such that each group of siblings
		// uses the same size (1*1) rather than the dimensions of the parent cell.
		// This optimizes the layout for the current zoom state. Note that a wrapper
		// object is created for the parent node for each group of siblings so that
		// the parent's dimensions are not discarded as we recurse. Since each group
		// of sibling was laid out in 1*1, we must rescale to fit using absolute
		// coordinates. This lets us use a viewport to zoom.
		function layout(d) {
			if (d._children) {
				//console.log($scope.treeHeight);
				treemap.nodes({_children: d._children});		// Runs the treemap layout, returning the array of nodes associated with the specified root node. From: https://github.com/mbostock/d3/wiki/Treemap-Layout
				d._children.forEach(function(c) {
					c.x = d.x + c.x * d.dx;
					c.y = d.y + c.y * d.dy;
					c.dx *= d.dx;
					c.dy *= d.dy;
					c.parent = d;
					layout(c);

				});
			}
		}


		function display(d) {

			var div = d3.select("body").append("div")
			var node = div.datum($scope.testingTreemap).selectAll(".node");
			node.onmouseover = function(d){
				//console.log("onmouseover");
			}

			grandparent
			.datum(d.parent)					// MC: Associate the top bar with the value of the parent of the current node? See https://github.com/mbostock/d3/wiki/Selections#wiki-datum
			.on("click", transition)	// MC: Adds an onclick('transition') listener to the grandparent
			.select("text")							// MC: Go to the TEXT element in the grandparent and...
			.on("mouseover", mouseFunction)
			.text(name(d));

			// MC: Call the name() function and change the text in the TEXT node to the returned value.


			var g1 = svg.insert("g", ".grandparent")	// MC: inserts a new 'g' before the node with class 'grandparent. Call it 'g1'.
			.datum(d)															// MC: Still not sure here but something to do with copying the data from the JSON to the node
			.attr("class", "depth");							// MC: Add the attribute as follows: <g class="depth">...</g>

			var g = g1.selectAll("g")									// MC: Confusingly defines a new collection 'g' which contains all the children in 'g1'.
			.data(d._children)										// MC: Loads the data from the (copy of the) JSON file data.
			.enter().append("g");										// MC: Creates a new 'g' node for each child.



			g.filter(function(d) {return d; })		// MC: Create a new collection, which is a subset of g. Not sure how this works yet but it's only the nodes with children.
			.classed("children", true)									// MC: Assigns each of these node to class="children",
			.on("click", transition);										// MC: and onclick('transition'), which is a function listed below. So only those with children are clickable?

			g.selectAll(".child")																		// MC: Select all the children of 'g'.
			.data(function(d) { return d._children || [d]; })		// MC: || is logical OR
			.enter().append("rect")																// MC: Create a RECT for each of the new nodes
			.attr("class", "child")															// MC: Make <rect class="child">...</rect>
			.call(rect);	
			// MC: Call the rect function listed below. [Why not just write ".rect()" then?]

			g.append("rect")																// MC: After all the children, create a rect with .parent
			.attr("class", "parent")										// MC: It's at the end so that it's clickable and has the title displayed on hover
			.call(rect)
			.append("title")								// MC: SVG TITLE *element* is displayed as a tooltip on hover like the HTML title *attribute*
			.style( "stroke", "#000000")
			.text(function(d) { return "value:"+formatNumber(d.value)+"\ntotal count:"+d.count; });  // MC: The value in this tag is the sum of the values of all the child nodes. Check rounding format if not showing up!

			g.append("text")
			.attr("dy", ".75em")
			.text(function(d) { return d.name; })		// MC: Each RECT (only some?) get the name written on top of it. The text is not nested in the RECT but that's how SVG works, unlike HTML.
			.call(text);



			g.append("text")				// MC: Here is my attempt to get the rounded dollar amount at the centre of each rect.
			.classed("overlaidText",true)
			.text(function(d) { return Math.round(d.value)})// add additional units here
			.call(middletext);

			function testingFunction(d){
				//console.log(d);
				var totalcount = 0;
				for(var a=0;a<d._children.length;a++){
					totalcount = d._children[a]+totalcount;
				}
				return totalcount;
			}

			function mouseFunction(d){
				return "value:"+formatNumber(d.value);
			}

			function transition(d) {
				if (transitioning || !d) return;		// MC: I think this prevents further transitioning if you're in the middle of a transition.
				transitioning = true;
				//console.log(d);
				if(d._children!==undefined){
					var g2 = display(d),
					t1 = g1.transition().duration(750),
					t2 = g2.transition().duration(750);

					// Update the domain only after entering new elements.
					x.domain([d.x, d.x + d.dx]);
					y.domain([d.y, d.y + d.dy]);

					// Enable anti-aliasing during the transition.
					svg.style("shape-rendering", null);

					// Draw child nodes on top of parent nodes.
					svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

					// Fade-in entering text.
					g2.selectAll("text").style("fill-opacity", 0);

					// Transition to the new view.
					t1.selectAll("text").call(text).style("fill-opacity", 0);
					t2.selectAll("text").call(text).style("fill-opacity", 1);
					t2.selectAll(".overlaidText").call(middletext).style("fill-opacity", 1);
					t1.selectAll("rect").call(rect);
					t2.selectAll("rect").call(rect);

					// Remove the old node when the transition is finished.
					t1.remove().each("end", function() {
						svg.style("shape-rendering", "crispEdges");
						transitioning = false;
					});
				}
				else{
					//routing to go to other widgets go here.

					transitioning = false;
					//alert("STILL UNDER CONSTRUCTION. CHECK BACK LATER");
					//console.log(d);
					//dashTransition.newTab("#/eventPage", {

					//						})
				}
			}

			return g;
		}

		function text(text) {
			text.attr("x", function(d) { return x(d.x) + 6; })
			.attr("y", function(d) { return y(d.y) + 6; });
		}

		function middletext(text) {
			text.attr("x", function(d) { return x(d.x + d.dx / 2); })
			.attr("y", function(d) { return y(d.y + d.dy / 2) + 16; });
		}

		function rect(rect) {
			rect.attr("x", function(d) { return x(d.x); })
			.attr("y", function(d) { return y(d.y); })
			.attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
			.attr("height", function(d) { return y(d.y + d.dy) - y(d.y); })
			.attr("rx","5px")
			.style("fill", function(d) {return color(d.count); })
			.style( "stroke", "#000000");

		}

		function name(d) {
			return d.parent ? name(d.parent) + " / " + d.name : d.name;		// MC: Recursive. If there is no parent just return the name attribute of this node, otherwise return the name of the parent node followed by '/' and the name attribute of this node
		}
	}
	$scope.changeView=function(view){

		if($location.path()!=="/dashboard"){
//			noReloadUrl.skipReload(view);
//			$location.path(view);
		}
//		$location.search('maximizeWidgetId', 1);
	}

	var timeFrameList = ["All","Today","This Week","This Month","This Quarter","This Year","Last 24 Hours","Last 7 Days","Last 12 Months","Last Full Day","Last Full Week","Last Full Month","Last Full Quarter","Last Full Year"];
	$scope.timeFrameList = timeFrameList;

	$scope.setDateRange = function(selection){

		if(selection==="All"){
			var sDate = new Date();
			sDate.setTime(0);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		if(selection==="Last 24 Hours"){
			var sDate = new Date();
			sDate.setDate(sDate.getDate()-1);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="Last 7 Days"){
			var sDate = new Date();
			sDate.setDate(sDate.getDate()-7);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="Last 12 Months"){
			var sDate = new Date();
			sDate.setFullYear(sDate.getFullYear()-1);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="Today"){
			var sDate = new Date();
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="This Week"){
			var sDate = new Date();
			sDate.setDate(sDate.getDate()-sDate.getDay());
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="This Month"){
			var sDate = new Date();
			sDate.setDate(1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="This Year"){
			var sDate = new Date();
			sDate.setMonth(0);
			sDate.setDate(1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="This Quarter"){
			var sDate = new Date();
			sDate.setMonth(Math.floor(sDate.getMonth()/3)*3);
			sDate.setDate(1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="Last Full Day"){
			var sDate = new Date();

			sDate.setDate(sDate.getDate()-1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;

			var eDate = new Date();
			eDate.setMinutes(0);
			eDate.setHours(0);
			eDate.setSeconds(0);
			eDate.setMilliseconds(0);
			$scope.endDate = eDate;
		}
		else if(selection==="Last Full Week"){
			var sDate = new Date();

			sDate.setDate(sDate.getDate()-sDate.getDay()-7);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;

			var eDate = new Date();
			eDate.setDate(eDate.getDate()-eDate.getDay());
			eDate.setMinutes(0);
			eDate.setHours(0);
			eDate.setSeconds(0);
			eDate.setMilliseconds(0);
			$scope.endDate = eDate;

		}
		else if(selection==="Last Full Month"){
			var sDate = new Date();
			sDate.setMonth(sDate.getMonth()-1);
			sDate.setDate(1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;

			var eDate = new Date();

			eDate.setDate(1);
			eDate.setMinutes(0);
			eDate.setHours(0);
			eDate.setSeconds(0);
			eDate.setMilliseconds(0);
			$scope.endDate = eDate;
		}
		else if(selection==="Last Full Year"){
			var sDate = new Date();
			sDate.setFullYear(sDate.getFullYear()-1);
			sDate.setMonth(0);
			sDate.setDate(1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;

			var eDate = new Date();
			eDate.setMonth(0);
			eDate.setDate(1);
			eDate.setMinutes(0);
			eDate.setHours(0);
			eDate.setSeconds(0);
			eDate.setMilliseconds(0);
			$scope.endDate = eDate;
		}
		else if(selection==="Last Full Quarter"){
			var sDate = new Date();
			sDate.setFullYear(sDate.getFullYear()-1);
			sDate.setMonth((Math.floor(sDate.getMonth()/3)-1)*3);
			sDate.setDate(1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;

			var eDate = new Date();
			eDate.setMonth(Math.floor(eDate.getMonth()/3)*3);
			eDate.setDate(1);
			eDate.setMinutes(0);
			eDate.setHours(0);
			eDate.setSeconds(0);
			eDate.setMilliseconds(0);
			$scope.endDate = eDate;
		}

	}



	//$scope.activeOrg = "MRL";

	$scope.$on('facilitySetFacilitySelector', function(){
		$scope.facilityName = facilitySelectorService.getFacility();
		//console.log("huh");
		$scope.runQuery();
	});

	$scope.$on('modal.hide',function(){
//		console.log("hide");
	});

	$scope.runQuery = function () {

		if($scope.colorSelect!==undefined && $scope.colorLow!==undefined){
			$scope.colorSelect[0] = $scope.colorLow;
			$scope.colorSelect[1] = $scope.colorHigh;
		}

		// console.log($scope.startDate+":::"+$scope.endDate);
		if($scope.startDate!==undefined && $scope.endDate!==undefined){
			var thisStartDate;
			var thisEndDate;

			thisStartDate = $scope.startDate;
			thisEndDate = $scope.endDate;
			if(thisStartDate.toString().indexOf("GMT")===-1){thisStartDate = new Date(parseInt($scope.startDate))};
			if(thisEndDate.toString().indexOf("GMT")===-1){thisEndDate = new Date(parseInt($scope.endDate))};

			var realStartYear = thisStartDate.getFullYear();
			var realStartDate = thisStartDate.getDate();
			var realStartMonth = thisStartDate.getMonth()+1;
			var realEndYear = thisEndDate.getFullYear();
			var realEndDate = thisEndDate.getDate();
			var realEndMonth =  thisEndDate.getMonth()+1;

console.log($scope.treemapConfig.facilityName);
			var orgQuery = '"stationName":"'+$scope.treemapConfig.facilityName+'"';
			if($scope.treemapConfig.facilityName===(""||undefined)){
				orgQuery="";
				return
			}
			var clientQuery = '"stationName":"'+$scope.activeClient+'"';
			if($scope.treemapConfig.activeClient===(""||undefined)){
				clientQuery="";
			}
			var dateQuery = '"createdTime": {"$gt" : { "$date": "'+realStartYear+'-'+realStartMonth+'-'+realStartDate+'T04:00:00.000Z" }, "$lt": { "$date": "'+realEndYear+'-'+realEndMonth+'-'+realEndDate+'T04:00:00.000Z" }}';
			var bodyString = '{'+dateQuery+','+orgQuery+'}';


			var config = {
					method:'POST',
					headers: {'Collection': 'events'},
					url:"https://galaxy2021temp.pcsgalaxy.net:9453/db/query",
					data:bodyString
			}


			dbService.getData(config).then(function(response){
				if($scope.truePanelWidth===undefined){
					$scope.truePanelWidth = $scope.panelWidth-70;}
				if($scope.truePanelHeight===undefined){
					$scope.truePanelHeight = $scope.panelHeight-30;}
				$scope.responseData = response;
				if($scope.responseData.data.result===null){/*alert("No data found for this time frame.");*/}
				else if($scope.responseData.data.result===undefined){alert("Connection to database lost. Please try again later.");}
				else{
					//console.log($scope.panelHeight);
					//console.log($scope.panelWidth);
					if($scope.isDashboarded()){

						$scope.change($scope.panelWidth-60,$scope.panelHeight-60);
					}
					else{
						//console.log($scope.panelWidth);
						//console.log($scope.panelHeight);
						$scope.change($scope.truePanelWidth,$scope.truePanelHeight);
					}
				}

			});

		}
		if($scope.rangeLow===undefined){
			$scope.rangeLow = 0;
			$scope.rangeHigh = 300;
			var defaultColorArray = [];
			defaultColorArray.push($scope.treemapConfig.colorLow);
			defaultColorArray.push($scope.treemapConfig.colorHigh);
//			$scope.colorSelect.push($scope.testColor1);
			$scope.colorSelect=defaultColorArray;
		}
		if($scope.treemapConfig.rangeLow===undefined){
			$scope.treemapConfig.rangeLow = 0;
			$scope.treemapConfig.rangeHigh = 300;
			$scope.treemapConfig.colorLow=$scope.testColor1;
			$scope.treemapConfig.colorHigh=$scope.testColor5;
		}

	};

	$scope.openConfig = function(size) {


		var modalInstance = $modal.open({
			templateUrl: 'views/treemapAssetNonDashboardConfig.html',
			controller: 'treemapAssetNonDashboardModalInstanceCtrl',
			size: size,
			scope: $scope,
			resolve:{
				defaults : function(){
					return $scope.treemapConfig;
				},
			}
		});

	}

	$scope.isDashboarded = function(){
		//console.log($location.path()==="/dashboard");
		if($location.path()==="/dashboard"){
			return true;
		}
		else{
			return false;
		}
	}
	//console.log($scope.$parent.$parent.$parent.dashboard.configDashboard);
	var isConfigOpen = function(dashboarded){
		//console.log($scope.isDashboarded());
		if(dashboarded){
			try{
				return $scope.$parent.$parent.$parent.dashboard.configDashboard;
			}
			catch(err){}
		}
		else{
			return null;
		}
	}

	var panelWidth = $scope.panelWidth;
	var panelHeight = $scope.panelHeight;
	$scope.storedPanelHeight = panelHeight;


	$scope.retries = 0;

	$scope.$watch(
			//This function returns the value being watched. It is called for each turn of the $digest loop
			function () {
				return {
					'colorLow':$scope.treemapConfig.colorLow,
					'colorHigh':$scope.treemapConfig.colorHigh,
					'rangeLow':$scope.treemapConfig.rangeLow,
					'rangeHigh':$scope.treemapConfig.rangeHigh,
					'startDate':$scope.treemapConfig.startDate,
					'endDate':$scope.treemapConfig.endDate,
					'facilityName':$scope.treemapConfig.facilityName,
				};
			},
			// This is the change listener, called when the value returned from the above function changes
			function(newValue, oldValue) {
				console.log("treemap scope triggered.");
				//console.log(newValue);
				//console.log(oldValue);
				retryFunction(newValue, oldValue);
			},true
	);

	var retryFunction = function(newValue, oldValue){
		//console.log("retry");
		if ( newValue !== oldValue) {
			if($scope.responseData!==undefined){
				//console.log("copying colorLow taking place:"+$scope.treemapConfig.colorLow+" to "+$scope.colorLow);
				$scope.colorLow = $scope.treemapConfig.colorLow;
				//console.log("done. colorLow is now "+$scope.colorLow);
				//console.log("copying colorHigh taking place:"+$scope.treemapConfig.colorHigh+" to "+$scope.colorHigh);
				$scope.colorHigh = $scope.treemapConfig.colorHigh;
				//console.log("done. colorHigh is now "+$scope.colorHigh);
				//console.log("copying rangeLow taking place:"+$scope.treemapConfig.rangeLow+" to "+$scope.rangeLow);
				$scope.rangeLow = $scope.treemapConfig.rangeLow;
				//console.log("done. rangeLow is now "+$scope.rangeLow);
				//console.log("copying rangeHigh taking place:"+$scope.treemapConfig.rangeHigh+" to "+$scope.rangeHigh);
				$scope.rangeHigh = $scope.treemapConfig.rangeHigh;
				//console.log("done. rangeHigh is now "+$scope.rangeHigh);
				//console.log("copying startDate taking place:"+$scope.treemapConfig.startDate+" to "+$scope.startDate);
				$scope.startDate = $scope.treemapConfig.startDate;
				//console.log("done. startDate is now "+$scope.startDate);
				//console.log("copying endDate taking place:"+$scope.treemapConfig.endDate+" to "+$scope.endDate);
				$scope.endDate = $scope.treemapConfig.endDate;
				//console.log("done. endDate is now "+$scope.endDate);
				//console.log("copying facilityName taking place:"+$scope.treemapConfig.facilityName+" to "+$scope.facilityName);
				$scope.facilityName = $scope.treemapConfig.facilityName;
				//console.log("done. facilityName is now "+$scope.facilityName);
				$scope.retries = 0;
				$scope.runQuery();
			}
			else{
				$timeout(function(){
					$scope.retries = $scope.retries+1;
					if($scope.retries>100){
						return;
					}
					retryFunction(newValue,oldValue);
				},200)
			}
			//console.log(newValue.panelWidth+":n::o:"+oldValue.panelWidth);
		}
	}
	//console.log($scope.$parent.$parent.$parent);

	/** angela new **/
	$scope.$watch('config', function(){
		refreshConfigs();
	}, true);
	$scope.$on('userPrefsChanged',function(){
		refreshConfigs();
	});
	/** end angela new **/

	refreshConfigs();


}])
.directive('treeassetConfig',[function(){
	return{
		restrict:'E',
		templateUrl: 'icWidgets/treemapAssetConfig.html'
	}
}])
.controller('treemapAssetConfigCtrl',['$scope','$modal','configService','$controller',function($scope,$modal,awesome,$controller){	  
	var thisController = this;
	var superController = $controller('baseWidgetCtrl', {
		"$scope" : $scope
	});

	angular.extend(thisController, awesome, superController);

	$scope.timeFrameList = ["All","Today","This Week","This Month","This Quarter","This Year","Last 24 Hours","Last 7 Days","Last 12 Months","Last Full Day","Last Full Week","Last Full Month","Last Full Quarter","Last Full Year"];
	$scope.treemapConfig = thisController.getConfig();

	$scope.debug = function(){
		//console.log($scope);
		//console.log("what");

	}

	$scope.openSettings = function(){
		var instance = $modal.open({
			templateUrl:'treemapAssetModal.html',
			controller:'treemapAssetModalInstanceCtrl',
			scope:$scope,
			resolve:{
				defaults : function(){					
					return $scope.treemapConfig;
				},
			}
		});

		instance.result.then(function(config){
			//thisController.debug();
			//console.log("DDDDDDDDDDDDDDDDD:");
			thisController.setConfig(config);
		});
	}
}])
.controller('treemapAssetModalInstanceCtrl',['$scope','$modalInstance', 'defaults',
                                             function($scope,$modalInstance,defaults){
	var thisScope = $scope.$parent;



	if($scope.treemapConfig.startDate!==undefined){
		$scope.startDate = $scope.treemapConfig.startDate;
	}
	if($scope.treemapConfig.endDate!==undefined){
		$scope.endDate = $scope.treemapConfig.endDate;
	}
	if($scope.treemapConfig.rangeLow!==undefined){
		$scope.rangeLow = $scope.treemapConfig.rangeLow;
	}
	if($scope.treemapConfig.rangeHigh!==undefined){
		$scope.rangeHigh = $scope.treemapConfig.rangeHigh;
	}
	var defaultColor = [];
	if($scope.treemapConfig.colorLow!==undefined){
		defaultColor.push($scope.treemapConfig.colorLow);
	}
	if($scope.treemapConfig.colorHigh!==undefined){
		defaultColor.push($scope.treemapConfig.colorHigh);
	}
	$scope.colorSelect = defaultColor;
	$scope.ok = function() {
		//console.log(thisScope);
		var config = {
				"startDate":$scope.startDate,
				"endDate":$scope.endDate,
				"rangeLow":$scope.rangeLow,
				"rangeHigh":$scope.rangeHigh,
				"colorLow":$scope.colorSelect[0],
				"colorHigh":$scope.colorSelect[1]
		}
		//thisScope.startDate = $scope.startDate;
		//thisScope.endDate = $scope.endDate;
		//$scope.activeTimeframe = thisScope.activeTimeframe;
		//thisScope.colorLow = $scope.colorSelect[0];
		//thisScope.colorHigh = $scope.colorSelect[1];
		//thisScope.rangeLow = $scope.rangeLow;
		//thisScope.rangeHigh = $scope.rangeHigh;
//		console.log(thisScope.rangeLow);
		//console.log(thisScope.rangeHigh);
		//thisScope.runQuery();
		$modalInstance.close(config);
	};

	var timeFrameList = ["All","Today","This Week","This Month","This Quarter","This Year","Last 24 Hours","Last 7 Days","Last 12 Months","Last Full Day","Last Full Week","Last Full Month","Last Full Quarter","Last Full Year"];
	$scope.timeFrameList = timeFrameList;


	$scope.setDateRange = function(selection){

		if(selection==="All"){
			var sDate = new Date();
			sDate.setTime(0);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		if(selection==="Last 24 Hours"){
			var sDate = new Date();
			sDate.setDate(sDate.getDate()-1);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="Last 7 Days"){
			var sDate = new Date();
			sDate.setDate(sDate.getDate()-7);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="Last 12 Months"){
			var sDate = new Date();
			sDate.setFullYear(sDate.getFullYear()-1);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="Today"){
			var sDate = new Date();
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="This Week"){
			var sDate = new Date();
			sDate.setDate(sDate.getDate()-sDate.getDay());
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="This Month"){
			var sDate = new Date();
			sDate.setDate(1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="This Year"){
			var sDate = new Date();
			sDate.setMonth(0);
			sDate.setDate(1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="This Quarter"){
			var sDate = new Date();
			sDate.setMonth(Math.floor(sDate.getMonth()/3)*3);
			sDate.setDate(1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="Last Full Day"){
			var sDate = new Date();

			sDate.setDate(sDate.getDate()-1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;

			var eDate = new Date();
			eDate.setMinutes(0);
			eDate.setHours(0);
			eDate.setSeconds(0);
			eDate.setMilliseconds(0);
			$scope.endDate = eDate;
		}
		else if(selection==="Last Full Week"){
			var sDate = new Date();

			sDate.setDate(sDate.getDate()-sDate.getDay()-7);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;

			var eDate = new Date();
			eDate.setDate(eDate.getDate()-eDate.getDay());
			eDate.setMinutes(0);
			eDate.setHours(0);
			eDate.setSeconds(0);
			eDate.setMilliseconds(0);
			$scope.endDate = eDate;

		}
		else if(selection==="Last Full Month"){
			var sDate = new Date();
			sDate.setMonth(sDate.getMonth()-1);
			sDate.setDate(1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;

			var eDate = new Date();

			eDate.setDate(1);
			eDate.setMinutes(0);
			eDate.setHours(0);
			eDate.setSeconds(0);
			eDate.setMilliseconds(0);
			$scope.endDate = eDate;
		}
		else if(selection==="Last Full Year"){
			var sDate = new Date();
			sDate.setFullYear(sDate.getFullYear()-1);
			sDate.setMonth(0);
			sDate.setDate(1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;

			var eDate = new Date();
			eDate.setMonth(0);
			eDate.setDate(1);
			eDate.setMinutes(0);
			eDate.setHours(0);
			eDate.setSeconds(0);
			eDate.setMilliseconds(0);
			$scope.endDate = eDate;
		}
		else if(selection==="Last Full Quarter"){
			var sDate = new Date();
			sDate.setFullYear(sDate.getFullYear()-1);
			sDate.setMonth((Math.floor(sDate.getMonth()/3)-1)*3);
			sDate.setDate(1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;

			var eDate = new Date();
			eDate.setMonth(Math.floor(eDate.getMonth()/3)*3);
			eDate.setDate(1);
			eDate.setMinutes(0);
			eDate.setHours(0);
			eDate.setSeconds(0);
			eDate.setMilliseconds(0);
			$scope.endDate = eDate;
		}

	}

	$scope.isBlank = function(thisString){
		//if($scope._clientName===undefined){$scope._clientName="";}
		//if($scope._projectName===undefined){$scope._projectName="";}
		//if($scope._stationName===undefined){$scope._stationName="";}
		//if($scope._squareFootage===undefined){$scope._squareFootage="";}
		//if($scope._image===undefined){$scope._image="";}
		//console.log($scope.activeOrg+"_"+$scope.activeClient);
		return (thisString==="" || thisString===undefined || thisString==="null") ? true : false;

	}
}]) 
.controller('treemapAssetNonDashboardModalInstanceCtrl',['$scope','$modalInstance', 'defaults',
                                                         function($scope,$modalInstance,defaults){
	var thisScope = $scope.$parent;
	$scope.ok = function() {
		//console.log(thisScope);

		thisScope.startDate = $scope.startDate;
		thisScope.endDate = $scope.endDate;
		$scope.activeTimeframe = thisScope.activeTimeframe;
		thisScope.colorLow = $scope.colorSelect[0];
		thisScope.colorHigh = $scope.colorSelect[1];
		thisScope.rangeLow = $scope.rangeLow;
		thisScope.rangeHigh = $scope.rangeHigh;
		//console.log(thisScope.rangeLow);
		//console.log(thisScope.rangeHigh);
		thisScope.runQuery();
		$modalInstance.close();
	};

	var timeFrameList = ["All","Today","This Week","This Month","This Quarter","This Year","Last 24 Hours","Last 7 Days","Last 12 Months","Last Full Day","Last Full Week","Last Full Month","Last Full Quarter","Last Full Year"];
	$scope.timeFrameList = timeFrameList;


	$scope.setDateRange = function(selection){

		if(selection==="All"){
			var sDate = new Date();
			sDate.setTime(0);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		if(selection==="Last 24 Hours"){
			var sDate = new Date();
			sDate.setDate(sDate.getDate()-1);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="Last 7 Days"){
			var sDate = new Date();
			sDate.setDate(sDate.getDate()-7);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="Last 12 Months"){
			var sDate = new Date();
			sDate.setFullYear(sDate.getFullYear()-1);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="Today"){
			var sDate = new Date();
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="This Week"){
			var sDate = new Date();
			sDate.setDate(sDate.getDate()-sDate.getDay());
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="This Month"){
			var sDate = new Date();
			sDate.setDate(1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="This Year"){
			var sDate = new Date();
			sDate.setMonth(0);
			sDate.setDate(1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="This Quarter"){
			var sDate = new Date();
			sDate.setMonth(Math.floor(sDate.getMonth()/3)*3);
			sDate.setDate(1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;
			$scope.endDate = new Date();
		}
		else if(selection==="Last Full Day"){
			var sDate = new Date();

			sDate.setDate(sDate.getDate()-1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;

			var eDate = new Date();
			eDate.setMinutes(0);
			eDate.setHours(0);
			eDate.setSeconds(0);
			eDate.setMilliseconds(0);
			$scope.endDate = eDate;
		}
		else if(selection==="Last Full Week"){
			var sDate = new Date();

			sDate.setDate(sDate.getDate()-sDate.getDay()-7);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;

			var eDate = new Date();
			eDate.setDate(eDate.getDate()-eDate.getDay());
			eDate.setMinutes(0);
			eDate.setHours(0);
			eDate.setSeconds(0);
			eDate.setMilliseconds(0);
			$scope.endDate = eDate;

		}
		else if(selection==="Last Full Month"){
			var sDate = new Date();
			sDate.setMonth(sDate.getMonth()-1);
			sDate.setDate(1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;

			var eDate = new Date();

			eDate.setDate(1);
			eDate.setMinutes(0);
			eDate.setHours(0);
			eDate.setSeconds(0);
			eDate.setMilliseconds(0);
			$scope.endDate = eDate;
		}
		else if(selection==="Last Full Year"){
			var sDate = new Date();
			sDate.setFullYear(sDate.getFullYear()-1);
			sDate.setMonth(0);
			sDate.setDate(1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;

			var eDate = new Date();
			eDate.setMonth(0);
			eDate.setDate(1);
			eDate.setMinutes(0);
			eDate.setHours(0);
			eDate.setSeconds(0);
			eDate.setMilliseconds(0);
			$scope.endDate = eDate;
		}
		else if(selection==="Last Full Quarter"){
			var sDate = new Date();
			sDate.setFullYear(sDate.getFullYear()-1);
			sDate.setMonth((Math.floor(sDate.getMonth()/3)-1)*3);
			sDate.setDate(1);
			sDate.setMinutes(0);
			sDate.setHours(0);
			sDate.setSeconds(0);
			sDate.setMilliseconds(0);
			$scope.startDate = sDate;

			var eDate = new Date();
			eDate.setMonth(Math.floor(eDate.getMonth()/3)*3);
			eDate.setDate(1);
			eDate.setMinutes(0);
			eDate.setHours(0);
			eDate.setSeconds(0);
			eDate.setMilliseconds(0);
			$scope.endDate = eDate;
		}

	}

	$scope.isBlank = function(thisString){
		//if($scope._clientName===undefined){$scope._clientName="";}
		//if($scope._projectName===undefined){$scope._projectName="";}
		//if($scope._stationName===undefined){$scope._stationName="";}
		//if($scope._squareFootage===undefined){$scope._squareFootage="";}
		//if($scope._image===undefined){$scope._image="";}
		//console.log($scope.activeOrg+"_"+$scope.activeClient);
		return (thisString==="" || thisString===undefined || thisString==="null") ? true : false;

	}
}]) 
.directive('treemapAsset', [ function() {
	return {
		restrict: 'E',
		templateUrl : 'icWidgets/treemapAsset.html'
	}
}]);
