



var isNetConnected = false;
var isSocketConnected = false;
var socket = -1;


var speedData = 0, rpmData = 0;
var map;

//------------------------------------ CHART (trip page)
var chart, achart, chart1;
var chartInterval;
var series; // speed series
var rpmseries; // rpm series
var angleseries;
var flag = true;

var maxSpeed = 100;
var speedLimit = 40;

var chartNew; var optionsNew;
                

//------------------------------------
 
var speed = 0;
var rpm = 0;
var throttle = 0;

var minTime = 0;
var maxTime = 100;

var carid = 0;
var tripid = 0;
var engine = 0;
var steering = 0;
var gear = 0;
var light = 0
var door = 0;
var turn = 0;
var brake = 0;
var fuel = -1;
var temperature = -1;
var lat = 300.0;
var lon = 300.0;
var timedb = -1;
var timecurr = -1

var oldTrip = 0;
var thisTrip = [];
var playback = [];


// ------------------------------------------------------------- DATABASE 
var db = null;
var uniqueTrips = [];
// ------------------------------------------------------------- 


document.addEventListener("deviceready", function() {
	console.log("PhoneGap ready")
	document.addEventListener("pause", onPause, false);
	document.addEventListener("resume", onResume, false);
	document.addEventListener("online", onOnline, false);
	document.addEventListener("offline", onOffline, false);
	document.addEventListener('touchmove', function(e) { e.preventDefault(); }, false);

	// Tab bar control
	plugins.tabBar.init()
	plugins.navigationBar.init()

	plugins.tabBar.create()
	plugins.navigationBar.create("Black")


	plugins.tabBar.createItem("control", "Control", "www/img/tabbar/house.png", {
		onSelect : function() {
			// hide left button
			plugins.navigationBar.hideLeftButton()
			
			plugins.tabBar.selectItem("control");
			plugins.navigationBar.setTitle("LemonAid")
			window.location.href = "#controlPage";
		}
	})

	plugins.tabBar.createItem("dashboard", "Dashboard", "www/img/tabbar/dashboard.png", {
		onSelect : function() {
			// hide left button
			plugins.navigationBar.hideLeftButton()
			
			plugins.tabBar.selectItem("dashboard");
			plugins.navigationBar.setTitle("Dashboard")
			window.location.href = "#dashboardPage";
		}
	})

	plugins.tabBar.createItem("trip", "Trip", "www/img/tabbar/map.png", {
		onSelect : function() {
			// hide left button
			plugins.navigationBar.hideLeftButton()
			
			plugins.tabBar.selectItem("trip");
			plugins.navigationBar.setTitle("Trip")
			window.location.href = "#tripPage";
		}
	})

	plugins.tabBar.createItem("analysis", "Analysis", "/www/img/tabbar/ekg.png", {
		onSelect : function() {
			plugins.tabBar.selectItem("analysis");
			plugins.navigationBar.setTitle("Analysis")
			
			//show the left button
			plugins.navigationBar.showLeftButton()
			
			window.location.href = "#analysisPage";
		}
	})
	
	tripSide = false;
	plugins.navigationBar.setupLeftButton(
        "Trip Select",
        null,//"barButton:Bookmarks", // or your own file like "/www/stylesheets/images/ajax-loader.png",
        function() {
            //alert("right nav button tapped")
            console.log("left nav button tapped")
            if(tripSide){
            	$('.panel-popover-trip').css('display', 'none');
            	tripSide = false;
            }
            else{
            	$('.panel-popover-trip').css('display', 'block');
            	tripSide = true;
            	
            	// load scripts from analysis JS
            	db.transaction(queryUniqueTripsDB, errorCB);
            }
            
        }
    )
	
	
	settingSide = false;
	plugins.navigationBar.setupRightButton(
        "Settings",
        null,//"barButton:Bookmarks", // or your own file like "/www/stylesheets/images/ajax-loader.png",
        function() {
            //alert("right nav button tapped")
            console.log("right nav button tapped")
            if(settingSide){
            	$('.panel-popover').css('display', 'none');
            	settingSide = false;
            }
            else{
            	$('.panel-popover').css('display', 'block');
            	settingSide = true;
            	
            	
            }
            
        }
    )

	
	//TODO: Report on github --> the size does not fit the screen if status bar is initially hidden

	plugins.tabBar.show()
	plugins.tabBar.showItems("control", "dashboard", "trip", "analysis")
	plugins.tabBar.selectItem("control"); 

	plugins.navigationBar.hideLeftButton()
    //plugins.navigationBar.hideRightButton()

	plugins.navigationBar.showRightButton()

	plugins.navigationBar.setTitle("LemonAid")
    plugins.navigationBar.show()


	// control page ---------------------------------------------
	//createDB();
	
	db = window.openDatabase("Database", "1.0", "Cordova Demo", 999999);


	// dashboard -----------------------------------------------
	animateInterval = null;
	createDashboard();
	
	$(document).bind("kendo:skinChange", function(e) {
		createDashboard();
	});

	initValues();	
	
	
	
	
	
	// trip ------------------------------------------------------
	initializeMap();
	initSlider();
	loadCharts();
	
	// -------------------------------------- 
	//createChart();
	
	connectToSocket();

}, false)


function populateDB(tx) {
     //tx.executeSql('DROP TABLE IF EXISTS DEMO');
     //tx.executeSql('CREATE TABLE IF NOT EXISTS DEMO (id, data)');
     
     tx.executeSql('create table if not exists demo (carid int, tripid int, engine int, speed int, rpm int, throttle int, steering int, gear int, light int, door int, turn int, brake int, fuel int, temperature int, lat real, lon real, timedb text)');
     //tripid = 2 // CHANGE THE TRIP ID HERE //TODO: DELETE THIS
     console.log('****** DEBUG - ' + tripid);
     timedb = new Date().getTime();
     tx.executeSql('insert into demo (carid, tripid, engine, speed, rpm, throttle, steering, gear, light, door, turn, brake, fuel, temperature, lat, lon, timedb) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [carid, tripid, engine, speed, rpm, throttle, steering, gear, light, door, turn, brake, fuel, temperature, lat, lon, timedb]);
     
}



function errorCB(err) {
    //alert("Error processing SQL: "+err.code);
    console.log("Error processing SQL: "+err.code);
}

function successCB() {
    //alert("success!");	//TODO : in the settings panel show db connection
    console.log('row inserted -- success')
    //FIXME: use native alerts
}

// general test query
function queryDB(tx) {
    tx.executeSql('SELECT * FROM DEMO', [], querySuccess, errorCB);
}

// unique trips query
function queryUniqueTripsDB(tx) {
    tx.executeSql('SELECT distinct tripid FROM DEMO', [], querySuccess, errorCB);
}

var tripList = document.getElementById('tlist');

function querySuccess(tx, results) {
	console.log("Returned rows = " + results.rows.length);
	// this will be true since it was a select statement and so rowsAffected was 0
	
	var len = results.rows.length;
	
	// clear current list
	$('#tlist').empty();
	
	console.log("DEMO table: " + len + " rows found.");
    for (var i=0; i<len; i++){
        console.log("Row = " + i + " Trip ID = " + results.rows.item(i).tripid );
		uniqueTrips.push(results.rows.item(i).tripid);
		
		$('#tlist').append('<li>' +
						'<div class="tlistItem" id="'+results.rows.item(i).tripid+'">' +
						'<img class="selectButton" src="./img/UIButtonTypeDetailDisclosure.jpg" />' +
						'<div class="tlistHeader">' +
							'Trip ' + results.rows.item(i).tripid +
						'</div>' +
						'<div class="tlistInfo">' +
							
						'</div>' +
						'</div>' +
						'</li>');
	}
	
	$('.tlistItem').die('mousedown');
	
	//$('#tlist').listview('refresh');
	
	// populate a hashmap for all the unique trip ids
	//db.transaction(queryGetTripData, errorCB);
	
}

var dict = {}

function queryGetTripData(tx) {
	tlen = uniqueTrips.length;
	for(var i=0; i<tlen; i++){
		console.log('-------------------------- getting trip data for trip id: ' + uniqueTrips[i]);
		var id = uniqueTrips[i];
		tx.executeSql('SELECT * FROM DEMO where tripid=:i', [id], querySuccessAllData, errorCB);
	}
}

function querySuccessAllData(tx, results) {
	console.log("Returned rows = " + results.rows.length);
	
	var len = results.rows.length;
	
	console.log("DEMO table: " + len + " rows found.");
    
    var tempData = []
   	var tempTripID = 0
    
    for (var i=0; i<len; i++){	// for all rows -- load the data into a list
    	if(i == 0){
    		tempTripID = results.rows.item(i).tripid;
    		console.log('Trip ID: ' + tempTripID);
    	}
        //console.log("Row = " + i + " Trip ID = " + results.rows.item(i).tripid );
		
		var rowData = {
			caridr      : results.rows.item(i).carid,
			tripidr		: results.rows.item(i).tripid,
			enginer		: results.rows.item(i).engine,
			speedr		: results.rows.item(i).speed,
			rpmr		: results.rows.item(i).rpm,
			throttler	: results.rows.item(i).throttle,
			steeringr	: results.rows.item(i).steering,
			gearr		: results.rows.item(i).gear,
			lightr		: results.rows.item(i).light,
			doorr		: results.rows.item(i).door,
			turnr		: results.rows.item(i).turn,
			braker		: results.rows.item(i).brake,
			fuelr		: results.rows.item(i).fuel,
			temperaturer: results.rows.item(i).temperature,
			latr		: results.rows.item(i).lat,
			lonr		: results.rows.item(i).lon,
			timedbr		: results.rows.item(i).timedb
		}
		
		tempData.push(rowData);	
	}
	
	dict[tempTripID] = tempData;
}

var id;

$(".tlistItem").live('mousedown', function(e) {
	e.preventDefault();
	//alert( $(this).attr('id') );
	id = $(this).attr('id');
	$('.panel-popover-trip').css('display', 'none');
	tripSide = false;
	db = window.openDatabase("Database", "1.0", "Cordova Demo", 999999);
	db.transaction(singleTripData, errorCB);
	
	
});


function singleTripData(tx) {
	tx.executeSql('select * from demo where tripid=:id limit 400', [id], successTrip, errorCB);
}



var selectedTrip = new Array();

var speedAllSeries = new Array();
var rpmAllSeries = new Array();
var angleAllSeries = new Array();

function successTrip(tx, results) {
	console.log('Total rows for selected TRIP: '+ results.rows.length);
	//alert('Total rows: '+ results.rows.length);
	
	var tz = results.rows.length
	
	selectedTrip.length = 0
	var tempRow = {}
	var tempSpeedRow = {}, tempRpmRow = {}, tempAngleRow = {};
	
	for(var i = 0; i < tz; i++){
		tempRow = {
			caridr      : results.rows.item(i).carid,
			tripidr		: results.rows.item(i).tripid,
			enginer		: results.rows.item(i).engine,
			speedr		: results.rows.item(i).speed,
			rpmr		: results.rows.item(i).rpm,
			throttler	: results.rows.item(i).throttle,
			steeringr	: results.rows.item(i).steering,
			gearr		: results.rows.item(i).gear,
			lightr		: results.rows.item(i).light,
			doorr		: results.rows.item(i).door,
			turnr		: results.rows.item(i).turn,
			braker		: results.rows.item(i).brake,
			fuelr		: results.rows.item(i).fuel,
			temperaturer: results.rows.item(i).temperature,
			latr		: results.rows.item(i).lat,
			lonr		: results.rows.item(i).lon,
			timedbr		: results.rows.item(i).timedb
		}
		
		
		selectedTrip.push(tempRow);
		
		
		
	}
	console.log('Will load analysis chart');
	
	//loadAnalysis(selectedTrip); // ---- LOAD ANALYSIS CHART
	createChart(selectedTrip);	


}




function onPause() {
	socket.emit('stopData', function() {
		console.log('request to stop data');
	});

	socket.disconnect();
	socket = -1;
	isSocketConnected = false;

	speedData = 00;
	$("#kmh").data("kendoRadialGauge").value(speedData);
	$('#speedRT').text(speedData);
	
	//FIXME: initialize UI
}

function onResume() {
	connectToSocket();
}

function onOnline() {
	
}

function onOffline() {
	
}

function connectToSocket() {
	 socket = io.connect('http://158.130.107.164:8088');
	//socket = io.connect('http://192.168.1.6:8088');

	socket.emit('getNewData', function() {
		console.log('Requesting new data');
	});

	var run = 1

	socket.on('newData', function(data) {
		isSocketConnected = true;
		
		
		
		carid 		= data.carid;
		tripid 		= data.tripid;
		engine 		= data.engine;
		speed 		= parseInt(data.speed);
		rpm 		= parseInt(data.rpm);
		
		//TODO: correct rpm to match x1000
		
		throttle 	= parseInt(data.throttle);
		steering 	= data.steering
		gear 		= data.gear
		light 		= data.light
		door 		= data.door
		turn 		= data.turn
		brake	 	= data.brake
		fuel 		= data.fuel
		temperature = data.temperature
		lat 		= data.lat;
		lon 		= data.lon;
		timedb 		= -1;//data.timedb
		timecurr    = new Date();
		
		
		// update Dashboard UI
		updateDashboard(); 

		// update the TRIP page
		updateTripUI();
		
		currentData = {
				eng : engine,
				sp  : speed,
				rp  : rpm,
				th  : throttle,
				st  : steering,
				ge  : gear,
				li  : light,
				doo : door,
				tu  : turn,
				br  : brake,
				fu  : fuel,
				te  : temperature,
				la  : lat,
				lo  : lon,
				ti  : timecurr
			};
		
		// check if it is a new trip
		/*
		if(tripid > oldTrip){
			oldTrip = tripid;
			
			//clear the array 
			thisTrip.length = 0;
			
			thisTrip.push(currentData);
		}
		else if(tripid == oldTrip){
			thisTrip.push(currentData);
		}
		*/
		
		thisTrip.push(currentData);
		
		
		if(run == 1){
			db = window.openDatabase("Database", "1.0", "Cordova Demo", 999999);	
		}
		run++;
	
		//db.transaction(populateDB, errorCB, successCB);
	
	
		
		//console.log('Throttle: ' + throttle + '  RPM: ' + rpm + '  Speed: ' + speed + '  lat: ' + lat + '  lon: ' + lon);
		
		
		// got all the data -- store the values in the database
		
		if(db != null){
			
			//console.log('inserting into DB...');
			//tx.executeSql('INSERT INTO SPEEDINFO VALUES(0, carid, tripid, engine, speed, rpm, throttle, steering, gear, light, door, turn, brake, fuel, temperature, lat, lon, timedb, timecurr)');
			//db.transaction(insertDB, [], successInsertCB, errorCB);	
		}
		 
		
		
		
	}); // received new data
	

}


/**
 * update UI on the dashboard
 */
function updateDashboard() {
	
	// speed
	if (speed < 10) {
		speedData = '0' + speed;
	} else {
		speedData = speed;
	}

	$("#kmh").data("kendoRadialGauge").value(speedData);
	$('#speedRT').text(speedData); 
	
	
	// rpm
	$("#rpm").data("kendoRadialGauge").value(rpm);	
	
	// lights
	if(light == 0) {
		headlampOff();
	}
	else {
		headlampOn(light);
	}
	
	// gear
	setGear(gear);
	
	// door
	if(door == 0){
		closeDoors()
	}
	else{
		openDoor(door);	
	}
	
	
	// brake
	if(brake == 0) {
		brakeOff();
	}
	else {
		brakeOn();
	}
	
	// turn
	
	
	// fuel levels
	
	
	// temperature
}


/**
 * 
 */
function updateTripUI() {
	if (flag) {// only update the UI if flag is true
		//$('#throttleText').html(throttle + ' %');
		//updateThrottle(throttle);
		
		$('#throttlePosition').html(throttle);
		$('#rpmMeter').html(rpm);
		$('#speedMeter').html(speed);
		$('#steeringMeter').html(steering);

		// door
		updateTripDoor();
		
		// light
		updateTripLight();
		
		// turn
		updateTripTurn();
		
		// brake
		updateTripBrake();
		
		// gear
		updateTripGear();

		// map
		var latLng = new google.maps.LatLng(lat, lon);
		var marker = new google.maps.Marker({
			position : latLng,
			map : map
		});
		
		
		//FIXME: add points to the series on update -- not interval
	}
}


function updateTripGear() {
	if(gear == 1){$('#gearIcon').html('P');}	
	else if(gear == 2){$('#gearIcon').html('R');}
	else if(gear == 3){$('#gearIcon').html('N');}
	else if(gear == 4){$('#gearIcon').html('D');}
}


function updateTripBrake() {
	if(brake == 0) {
		$('#brakeIcon').html('OFF');
	}
	else {
		$('#brakeIcon').html('ON');
	}
}

function updateTripDoor() {
	if(door == 0) {
			$('#doorText').html('CLOSED');
			$('#doorIcon').html('');
		}
		else if(door == 1) {
			$('#doorText').html('OPEN');
			$('#doorIcon').html('DF');
		}
		else if(door == 2) {
			$('#doorText').html('OPEN');
			$('#doorIcon').html('PF');
		}
		else if(door == 3) {
			$('#doorText').html('OPEN');
			$('#doorIcon').html('DR');
		}
		else if(door == 4) {
			$('#doorText').html('OPEN');
			$('#doorIcon').html('PR');
		}
		// TODO: handle all posibilities
}

function updateTripLight() {
	if(light == 0) {
			$('#lightIcon').html('OFF');
		}
		else {
			$('#lightIcon').html('ON');	
		}
}

function updateTripTurn() {
	if(turn == 0) {
		$('#turnText').html('OFF');
	}
	else if(turn == 1) {
		$('#turnText').html('ON');
		$('#turnIcon').html('L');
	}
	else if(turn == 2) {
		$('#turnText').html('ON');
		$('#turnIcon').html('R');
	}
	else if(turn == 3) {
		$('#turnText').html('ON');
		$('#turnIcon').html('P');
	}
}

function initValues() {
	// warning lights 
	clearWarning();
	
	// gear - Parking
	setGear(1);
	
	// headlamp - Off
	headlampOff();
	
	// doors - closed
	closeDoors();
	
	// brake - off
	brakeOff();

}


function clearWarning() {
	$('.wIcons').addClass('signOff');
}

function headlampOn(intensity) {
	$('.headlamp').css('background-color', 'yellow');
	$('#anyLight').removeClass('signOff');
	
	
	if(intensity == 1){
		$('.headlamp').css('opacity', '0.3');
		$('#highHeadlamp').addClass('signOff');		
	}
	else if(intensity == 2){
		$('.headlamp').css('opacity', '0.5');
		$('#highHeadlamp').addClass('signOff');
	}
	else if(intensity == 3){
		$('.headlamp').css('opacity', '0.8');
		$('#highHeadlamp').removeClass('signOff');
	}
 
}


function headlampOff() {
	$('.headlamp').css('background-color', 'gray');
	$('.headlamp').css('opacity', '0.2');
	
	$('#highHeadlamp').addClass('signOff');
	$('#anyLight').addClass('signOff');
}

function clearGear() {
	$('.stickPosition').css('background-color', 'black');
	$('.stickPosition').css('color', 'gray');
}

function setGear(position) {
	clearGear();
	
	switch (position) {
		case 1:
			$('#p').css('background-color', 'white');
			$('#p').css('color', '#000000');
			break;
		case 2:
			$('#r').css('background-color', 'white');
			$('#r').css('color', '#000000');
			break;
		case 3:
			$('#n').css('background-color', 'white');
			$('#n').css('color', '#000000');
			break;
		case 4:
			$('#d').css('background-color', 'white');
			$('#d').css('color', '#000000');
			break;
		default:
			break;
	}
}


function openDoor(doorPosition) {
	
	closeDoors();
	
	$('#doorWarning').removeClass('signOff');
	
	switch(doorPosition) {
		case 1:	//driver front
			$('#dfront').css('background-color', 'green');
			$('#dfront').css('opacity', '0.5');
			break;
		case 2:	//passenger front
			$('#pfront').css('background-color', 'green');
			$('#pfront').css('opacity', '0.5');
			break;
		case 3:	//driver rear
			$('#drear').css('background-color', 'green');
			$('#drear').css('opacity', '0.5');
			break;
		case 4:	//passenger rear
			$('#prear').css('background-color', 'green');
			$('#prear').css('opacity', '0.5');
			break;
		case 5:	//both front
			$('#dfront').css('background-color', 'green');
			$('#dfront').css('opacity', '0.5');
			$('#pfront').css('background-color', 'green');
			$('#pfront').css('opacity', '0.5');
			break;
		case 6:
			
			break;
		case 7:
			
			break;
		case 8:
			
			break;
		default:
			break;
	}
}

function closeDoors() {
	$('#pfront').css('background-color', 'gray');
	$('#pfront').css('opacity', '0.1');
	$('#prear').css('background-color', 'gray');
	$('#prear').css('opacity', '0.1');
	$('#dfront').css('background-color', 'gray');
	$('#dfront').css('opacity', '0.1');
	$('#drear').css('background-color', 'gray');
	$('#drear').css('opacity', '0.1');
	$('#doorWarning').addClass('signOff');
}

function brakeOn() {
	$('#brakesqR').css('opacity', '0.6');
	$('#brakesqR').css('background-color', 'red');
	$('#brakesqL').css('opacity', '0.6');
	$('#brakesqL').css('background-color', 'red');
	
	$('#brakeWarning').removeClass('signOff');
	$('#brakeLight').removeClass('signOff');
}

function brakeOff() {
	$('#brakesqR').css('opacity', '0.1');
	$('#brakesqR').css('background-color', 'gray');
	$('#brakesqL').css('opacity', '0.1');
	$('#brakesqL').css('background-color', 'gray');
	
	$('#brakeWarning').addClass('signOff');
	$('#brakeLight').addClass('signOff');
}


function turnIndicator(indiPosition) {	//TODO: implement this at last
	switch(indiPosition) {
		case 0:
			
			break;
		case 1:
		
			break;
			
		case 2:
		
			break;
			
		case 3:
		
			break;
	}
}



function createDashboard() {
	$("#rpm").kendoRadialGauge({
		theme : "black",

		pointer : {
			value : 0,
			color : "#ea7001"
		},

		scale : {
			startAngle : -45,
			endAngle : 120,

			min : 0,
			max : 6,

			majorUnit : 1,
			majorTicks : {
				width : 1,
				size : 7
			},

			minorUnit : 0.2,
			minorTicks : {
				size : 5
			},

			ranges : [{
				from : 4,
				to : 5,
				color : "#ff7a00"
			}, {
				from : 5,
				to : 6,
				color : "#c20000"
			}],

			labels : {
				font : "15px Arial,Helvetica,sans-serif"
			}
		}
	});

	$("#kmh").kendoRadialGauge({
		theme : "black",

		pointer : {
			value : 0,
			color : "#1BA1E2"
		},

		scale : {
			startAngle : -50,
			endAngle : 230,

			min : 0,
			max : 160,

			majorTicks : {
				width : 3,
				size : 14,
				color : "#1BA1E2"
			},

			minorTicks : {
				size : 10
			},

			minorUnit : 2,
			majorUnit : 10,

			labels : {
				font : "17px Arial,Helvetica,sans-serif"
			}
		}
	});

	$("#fuel").kendoRadialGauge({
		theme : "black",

		pointer : {
			value : 0.5,
			color : "#ea7001"
		},

		scale : {
			startAngle : 90,
			endAngle : 180,

			min : 0,
			max : 1,

			majorUnit : 0.5,
			majorTicks : {
				width : 2,
				size : 6
			},

			minorUnit : 0.25,
			minorTicks : {
				size : 3
			},

			ranges : [{
				from : 0,
				to : 0.1,
				color : "#c20000"
			}],

			labels : {
				font : "11px Arial,Helvetica,sans-serif"
			}
		}
	});

	$("#water-temprature").kendoRadialGauge({
		theme : "black",

		pointer : {
			value : 90,
			color : "#ea7001"
		},

		scale : {
			startAngle : 180,
			endAngle : 270,

			min : 60,
			max : 120,

			majorUnit : 30,
			majorTicks : {
				width : 2,
				size : 6
			},

			minorUnit : 10,
			minorTicks : {
				size : 3
			},

			ranges : [{
				from : 110,
				to : 120,
				color : "#c20000"
			}],

			labels : {
				font : "11px Arial,Helvetica,sans-serif"
			}
		}
	});
}


var animateInterval;
function animateDashboard() {
	if (animateInterval) {
		return;
	}

	var GEARS = [0.14, 0.06, 0.035, 0.027, 0.019], IDLE_RPM = 0.9, CHANGE_RPM = 4, CHANGE_DELAY = 400, DECAY_RATE = 0.0017, TOP_SPEED = 210, ACCELERATION = 0.6, INTERVAL = 500;

	var speed = 0, skip = 0, ratio, gear = 0;

	function update() {

	}

	animateInterval = setInterval(function() {
		if (speed < TOP_SPEED) {
			if (GEARS[gear] * speed > CHANGE_RPM && gear < GEARS.length) {
				gear++;
				skip = CHANGE_DELAY / INTERVAL;
				update();
			}

			if (skip-- < 0) {
				speed += ACCELERATION - (DECAY_RATE * speed);
				update();
			}
		} else {
			skip = 100;
			speed = 0;
			gear = 0;
		}
	}, INTERVAL);
}




// TRIP JS ********************************

function initSlider() {
	
	// $( "#slider" ).slider({
		// min: minTime,
        // max: maxTime,
        // slide: function( event, ui ) {
        	// console.log(ui.value);
        // }
// 	
	// });
	
	$('#slider').slider({ theme: "a" });
	$('#slider').slider('disable');
	
	$('.ui-slider-handle').height(25);
	$('.ui-slider-handle').width(25);
	
	
	$('#slider').change(function(){
    var slider_value = $(this).val()
    
    setNewUI(slider_value);
});

	
}

function initializeMap() {
	var mapOptions = {
		center : new google.maps.LatLng(39.95275,-75.192146),
		zoom : 14,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("mapDiv"), mapOptions);
}

function updateThrottle(passed_th) {
	
	/*
	clearThrottle();
	
	//TODO: fix this to reflect passed_th
	
	
	if(throttle > 0 && throttle < 11){
		$('#l1').css('background-color', '#00BFFF');
	}
	else if(throttle >= 10 && throttle < 21){
		$('#l1').css('background-color', '#00BFFF');
		$('#l2').css('background-color', '#00BFFF');
	}
	else if(throttle > 20 && throttle < 31){
		$('#l1').css('background-color', '#00BFFF');
		$('#l2').css('background-color', '#00BFFF');
		$('#l3').css('background-color', '#00BFFF');
	}
	else if(throttle > 30 && throttle < 41){
		$('#l1').css('background-color', '#00BFFF');
		$('#l2').css('background-color', '#00BFFF');
		$('#l3').css('background-color', '#00BFFF');
		$('#l4').css('background-color', '#00BFFF');
	}
	else if(throttle > 40 && throttle < 51){
		$('#l1').css('background-color', '#00BFFF');
		$('#l2').css('background-color', '#00BFFF');
		$('#l3').css('background-color', '#00BFFF');
		$('#l4').css('background-color', '#00BFFF');
		$('#l5').css('background-color', '#00BFFF');
	}
	else if(throttle > 50 && throttle < 61){
		$('#l1').css('background-color', '#00BFFF');
		$('#l2').css('background-color', '#00BFFF');
		$('#l3').css('background-color', '#00BFFF');
		$('#l4').css('background-color', '#00BFFF');
		$('#l5').css('background-color', '#00BFFF');
		$('#l6').css('background-color', '#00BFFF');
	}
	else if(throttle > 60 && throttle < 71){
		$('#l1').css('background-color', '#00BFFF');
		$('#l2').css('background-color', '#00BFFF');
		$('#l3').css('background-color', '#00BFFF');
		$('#l4').css('background-color', '#00BFFF');
		$('#l5').css('background-color', '#00BFFF');
		$('#l6').css('background-color', '#00BFFF');
		$('#l7').css('background-color', '#00BFFF');
	}
	else if(throttle > 70 && throttle < 81){
		$('#l1').css('background-color', '#00BFFF');
		$('#l2').css('background-color', '#00BFFF');
		$('#l3').css('background-color', '#00BFFF');
		$('#l4').css('background-color', '#00BFFF');
		$('#l5').css('background-color', '#00BFFF');
		$('#l6').css('background-color', '#00BFFF');
		$('#l7').css('background-color', '#00BFFF');
		$('#l8').css('background-color', '#00BFFF');
	}
	else if(throttle > 80 && throttle < 91){
		$('#l1').css('background-color', '#00BFFF');
		$('#l2').css('background-color', '#00BFFF');
		$('#l3').css('background-color', '#00BFFF');
		$('#l4').css('background-color', '#00BFFF');
		$('#l5').css('background-color', '#00BFFF');
		$('#l6').css('background-color', '#00BFFF');
		$('#l7').css('background-color', '#00BFFF');
		$('#l8').css('background-color', '#00BFFF');
		$('#l9').css('background-color', '#00BFFF');
	}
	else if(throttle > 90 && throttle < 101){
		$('#l1').css('background-color', '#00BFFF');
		$('#l2').css('background-color', '#00BFFF');
		$('#l3').css('background-color', '#00BFFF');
		$('#l4').css('background-color', '#00BFFF');
		$('#l5').css('background-color', '#00BFFF');
		$('#l6').css('background-color', '#00BFFF');
		$('#l7').css('background-color', '#00BFFF');
		$('#l8').css('background-color', '#00BFFF');
		$('#l9').css('background-color', '#00BFFF');
		$('#l10').css('background-color', '#00BFFF');
	}
	*/
}



function loadCharts() {
Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });
    
       
        chart = new Highcharts.Chart({	//FIXME: ticks width on the Y axis
            chart: {
                renderTo: 'container',
                backgroundColor: '#000000',
                //height: 200,
                type: 'spline',
                marginRight: 0,
                
                events: {
                    
                    load: function() {
    
                        // set up the updating of the chart each second
                        series = this.series[0];
                        rpmseries = this.series[1];
                        angleseries = this.series[2];
                        chartInterval = setInterval(function() {
                            	var x = (new Date()).getTime(); // current time
                            
                            
                            //console.log('in chart: ' + speed);
                            series.addPoint([x, speed], flag, flag);    
                            rpmseries.addPoint([x, rpm], flag, flag);
                            angleseries.addPoint([x, steering], flag, flag);
                            
                        }, 1000);
                        
                    }
                }
            },
            
            colors: [
            	'#007FFF', //blue
            	'#FFFF00', //yellow
            	'#00FF00', //green
            	'#FF00FF', //magenta
            	'#FF2400' //orange red
            ],
            
            plotOptions: {
	            series: {
	                marker: {
	                    enabled: false   
	                }
	            }
	        },
            
            credits: {
            	enabled : false
            },
            
            title: {
                text: 'Live Monitor'
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 100
            },
            yAxis: [{
            	gridLineWidth : 0,
            	minorGridLineWidth: 0,
            	gridLineColor : '#000000',
            	min : 0,
            	max : maxSpeed,
            	height: 100,
            	offset: 0,
                title: {
                    text: 'Speed'
                },
                
                plotLines: [{
                    value : speedLimit,
                    color : 'red',
                    dashStyle : 'shortdash',
                    width : 2
                    
                }]
            }, {
            	top : 170,
            	gridLineWidth : 0,
            	height : 100,
            	min : 0,
            	max : 6,
            	offset: 0,
            	title : {
            		text: 'RPM'
            	},
            	plotLines: []
            },
            {
            	top : 300,
            	gridLineWidth : 0,
            	height : 100,
            	min : -100,
            	minorGridLineWidth : 0,
            	max : 100,
            	offset: 0,
            	title : {
            		text: 'ANGLE'
            	},
            	plotLines: []
            }],
            tooltip: {
                formatter: function() {
                        return '<b>'+ this.series.name +'</b><br/>'+
                        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) +'<br/>'+
                        Highcharts.numberFormat(this.y, 2);
                }
            },
            legend: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            series: [{
                name: 'Speed data',
                
                data: (function() {
                
                    // generate an array of random data
                    var data1 = [],
                        time = (new Date()).getTime(),
                        i;
    
                    for (i = -19; i <= 0; i++) {
                        data1.push({
                            x: time + i * 1000,
                            y: 0
                        });
                    }
                    return data1;
                })()
            }, {
            	name: 'RPM Data',
            	yAxis : 1,
            	data: (function() {
                    // generate an array of random data
                    var data = [],
                        time = (new Date()).getTime(),i;
    
                    for (i = -19; i <= 0; i++) {
                        data.push({
                            x: time + i * 1000,
                            y: 0
                        });
                    }
                    return data;
                })()
            }, {
            	name: 'angle Data',
            	yAxis : 2,
            	data: (function() {
                    // generate an array of random data
                    var data = [],
                        time = (new Date()).getTime(),i;
    
                    for (i = -19; i <= 0; i++) {
                        data.push({
                            x: time + i * 1000,
                            y: 0
                        });
                    }
                    return data;
                })()
            }]
        });
}


function onPauseClick() {
	//clearInterval(chartInterval);
	flag = false;
	
	//enable slider
	$('#slider').slider('enable');
	
	// reverse the array and copy it in a new array
	playback = thisTrip.slice();
	
	maxlen = playback.length - 1;
	
	console.log('Pause handler: ' + maxlen)
	
	$("#slider").attr("max", maxlen).slider("refresh");
	$("#slider").val(maxlen).slider("refresh");
	
	//FIXME: at the end, make the slider snap to values in the range
}


function setNewUI(passed_value) {
	currpb = playback[passed_value];
	
	$('#throttlePosition').html(currpb.th);
	

	$('#rpmMeter').html(currpb.rp);
	$('#speedMeter').html(currpb.sp);	//TODO: update other parameters also
	$('#steeringMeter').html(currpb.st);

	if(currpb.li == 0) {
			$('#lightIcon').html('OFF');
		}
		else {
			$('#lightIcon').html('ON');	
		}
		
	if(currpb.tu == 0) {
		$('#turnText').html('OFF');
	}
	else if(currpb.tu == 1) {
		$('#turnText').html('ON');
		$('#turnIcon').html('L');
	}
	else if(currpb.tu == 2) {
		$('#turnText').html('ON');
		$('#turnIcon').html('R');
	}
	else if(currpb.tu == 3) {
		$('#turnText').html('ON');
		$('#turnIcon').html('P');
	}
	
	if(currpb.br == 0) {
		$('#brakeIcon').html('OFF');
	}
	else {
		$('#brakeIcon').html('ON');
	}
	
	if(currpb.doo == 0) {
			$('#doorText').html('CLOSED');
		}
		else if(currpb.doo == 1) {
			$('#doorText').html('OPEN');
			$('#doorIcon').html('DF');
		}
		else if(currpb.doo == 2) {
			$('#doorText').html('OPEN');
			$('#doorIcon').html('PF');
		}
		else if(currpb.doo == 3) {
			$('#doorText').html('OPEN');
			$('#doorIcon').html('DR');
		}
		else if(currpb.doo == 4) {
			$('#doorText').html('OPEN');
			$('#doorIcon').html('PR');
		}
		// TODO: handle all posibilities

	// map
	// TODO: clear all markers first
	
	
	var latLng = new google.maps.LatLng(currpb.lat, currpb.lon);
	var marker = new google.maps.Marker({
		position : latLng,
		map : map
	}); 
	/*
	// Create our "tiny" marker icon
        var blueIcon = new GIcon(G_DEFAULT_ICON);
        blueIcon.image = "http://gmaps-samples.googlecode.com/svn/trunk/markers/blue/blank.png";
		
		// Set up our GMarkerOptions object
		markerOptions = { icon:blueIcon };

	//map.addOverlay(new GMarker(latlng, markerOptions));
	*/
}

function onResumeClick() {
	//setInterval(chartInterval);
	flag = true;
	
	// clear the temp playback array
	playback.length = 0;
	
	//disable slider
	$('#slider').slider('disable');	
}




// ------------------------- DATABASE ------------------ //

/*
        	
function setupDB(tx) {
	tx.executeSql('CREATE TABLE IF NOT EXISTS CARSELECT (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, carid INTEGER NOT NULL, TIMESTAMP)');
	
	tx.executeSql('CREATE TABLE IF NOT EXISTS SPEEDINFO ( \
								ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
								CARID INTEGER NOT NULL, \
								TRIPID INTEGER NOT NULL, \
								ENGINE INTEGER NOT NULL, \
								SPEED INTEGER NOT NULL, \
								RPM INTEGER NOT NULL, \
								THROTTLE INTEGER NOT NULL, \
								STEERING INTEGER NOT NULL, \
								GEAR INTEGER NOT NULL, \
								LIGHT INTEGER NOT NULL, \
								DOOR INTEGER NOT NULL, \
								TURN INTEGER NOT NULL, \
								BRAKE INTEGER NOT NULL, \
								FUEL INTEGER NOT NULL, \
								TEMPERATURE INTEGER NOT NULL, \
								LAT REAL NOT NULL, \
								LON REAL NOT NULL, \
								TIMEDB INTEGER NOT NULL, \
								TIMECURR INTEGER NOT NULL)');
	
}

function insertDB(tx) {
	tx.executeSql('INSERT INTO SPEEDINFO VALUES(0, carid, tripid, engine, speed, rpm, throttle, steering, gear, light, door, turn, brake, fuel, temperature, lat, lon, timedb, timecurr)');
	//tx.commit();
}

*/




/*************************************** ANALYSIS JS ********************************/


function loadAnalysis(pData) {


}





// -----


function createChart() {
$.getJSON('http://www.highcharts.com/samples/data/jsonp.php?filename=aapl-ohlcv.json&callback=?', function(data) {

        // split the data set into ohlc and volume
        var ohlc = [],
            volume = [],
            speedAllSeries = [], rpmAllSeries = [],
            dataLength = data.length;
            
        for (i = 0; i < 2; i++) {
            
            //alert(data[i][0]);
            
            speedAllSeries.push([
                data[i][0], // the date
                data[i][1]
            ]);
            
            rpmAllSeries.push([
                data[i][0], // the date
                data[i][5] // the volume
            ])
        }

       

        // create the chart
        chartNew = new Highcharts.StockChart({
            chart: {
                renderTo: 'analysisContainer',
                alignTicks: false
            },
            
            credits: {
                enabled: false
            },
                exporting: {
                enabled: false                
                } ,          

            rangeSelector: {
                enabled: false
            },

            title: {
                text: 'Trip Analysis'
            },

            yAxis: [{
                title: {
                    text: 'Speed'
                },
                height: 200,
                lineWidth: 2
            }, {
                title: {
                    text: 'RPM'
                },
                top: 300,
                height: 100,
                offset: 0,
                lineWidth: 2
            }],
            
            series: [{
                type: 'spline',
                name: 'Speed',
                data: speedAllSeries
                
            }, {
                type: 'spline',
                name: 'RPM',
                data: rpmAllSeries,
                yAxis: 1
            }]
        });
    });        

}

