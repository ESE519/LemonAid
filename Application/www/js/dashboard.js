var isNetConnected = false;
var isSocketConnected = false;
var socket = -1;


var speedData = 0, rpmData = 0;
var map;
var chart;
var chartInterval;
var flag = true;
 
var speed = 0;
var maxSpeed =20;
var speedLimit = 15;
var series; // speed series

var rpm = 0;
var rpmseries; // rpm series

var throttle = 0;

var lat = 0;
var lon = 0;

var minTime = 0;
var maxTime = 100;



/**
 *  steps to do when cordova is ready
 */
document.addEventListener("deviceready", function() {
	console.log("PhoneGap ready")

	// Tab bar control
	plugins.tabBar.init()
	plugins.navigationBar.init()

	plugins.tabBar.create()
	plugins.navigationBar.create("Black")


	plugins.tabBar.createItem("control", "Control", "www/img/tabbar/house.png", {
		onSelect : function() {
			plugins.tabBar.selectItem("control");
			plugins.navigationBar.setTitle("LemonAid")
			window.location.href = "#controlPage";
		}
	})

	plugins.tabBar.createItem("dashboard", "Dashboard", "www/img/tabbar/81-dashboard.png", {
		onSelect : function() {
			plugins.tabBar.selectItem("dashboard");
			plugins.navigationBar.setTitle("Dashboard")
			window.location.href = "#dashboardPage";
		}
	})

	plugins.tabBar.createItem("trip", "Trip", "www/img/tabbar/map.png", {
		onSelect : function() {
			plugins.tabBar.selectItem("trip");
			plugins.navigationBar.setTitle("Trip")
			window.location.href = "#tripPage";
		}
	})

	plugins.tabBar.createItem("analysis", "Analysis", "/www/img/tabbar/ekg.png", {
		onSelect : function() {
			plugins.tabBar.selectItem("analysis");
			plugins.navigationBar.setTitle("Analysis")
			window.location.href = "#analysisPage";
		}
	})
	
	
	plugins.navigationBar.setupRightButton(
        "Settings",
        null,//"barButton:Bookmarks", // or your own file like "/www/stylesheets/images/ajax-loader.png",
        function() {
            //alert("right nav button tapped")
            console.log("right nav button tapped")
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

	

	animateInterval = null;

	createDashboard();
	
	$(document).bind("kendo:skinChange", function(e) {
		createDashboard();
	});


	// dashboard
	initValues();	
	
	// trip
	initializeMap();
	initSlider();
	loadCharts();
	
	connectToSocket();

}, false)



function connectToSocket() {
	socket = io.connect('http://localhost:8080');
	//socket = io.connect('http://192.168.1.3:8080');

	socket.emit('getNewData', function() {
		console.log('Requesting new data');
	});

	socket.on('newData', function(data) {
		isSocketConnected = true;
		
		// dashboard
		speed = parseInt(data.speed);
		if (speed < 10) {
			speed = '0' + speed;
		}

		$("#rpm").data("kendoRadialGauge").value(rpm);
		$("#kmh").data("kendoRadialGauge").value(speed);
		$('#speedRT').text(speed);

		
		
		
		// trip 
		throttle = parseInt(data.throttle);
		rpm = parseInt(data.rpm);
		speed = parseInt(data.speed);
		
		lat = data.lat;
		lon = data.lon;
		
		console.log('Throttle: ' + throttle + '  RPM: ' + rpm + '  Speed: ' + speed + '  lat: ' + lat + '  lon: ' + lon);
		
		
		if(flag){
			$('#throttleText').html(throttle + ' %');
			updateThrottle();
			
			$('#rpmMeter').html(data.rpm);
			$('#speedMeter').html(data.speed);
			
			var latLng = new google.maps.LatLng(data.lat, data.lon);
			var marker = new google.maps.Marker({
	            position: latLng,
	        	map: map
	        });	
		}
		
	});
	

}



/**
 * 
 */
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
	
	if(intensity == 1){
		$('.headlamp').css('opacity', '0.3');	
	}
	else if(intensity == 2){
		$('.headlamp').css('opacity', '0.5');
	}
	else if(intensity == 3){
		$('.headlamp').css('opacity', '0.8');
	}
	
	//TODO: also light up the icon on dash strip
	//set a global light count; 
}


function headlampOff() {
	$('.headlamp').css('background-color', 'gray');
	$('.headlamp').css('opacity', '0.2');
	
	//TODO: check if global light count is 0; if 0 -> turn off the light
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
	$('#doorsquare').css('background-color', 'gray');
	$('#doorWarning').addClass('signOff');
}

function brakeOn() {
	$('#brakesqR').css('opacity', '0.6');
	$('#brakesqR').css('background-color', 'red');
	$('#brakesqL').css('opacity', '0.6');
	$('#brakesqL').css('background-color', 'red');
	
	$('#brakeWarning').removeClass('signOff');
}

function brakeOff() {
	$('#brakesqR').css('opacity', '0.1');
	$('#brakesqR').css('background-color', 'gray');
	$('#brakesqL').css('opacity', '0.1');
	$('#brakesqL').css('background-color', 'gray');
	
	$('#brakeWarning').addClass('signOff');
}





/**
 *  handle online event
 */
function onOnline() {
	$('#netCon').text('WiFi connected');
	isNetConnected = true;
}

/**
 *  handle offline event
 */
function onOffline() {
	$('#netCon').text('WiFi disconnected');
	isNetConnected = false;
}





/**
 *  Create and initialize the dashboard
 */
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




/*************************************** TRIP JS ********************************/

function initSlider() {
	$( "#slider" ).slider({
		min: minTime,
        max: maxTime,
        slide: function( event, ui ) {
        	console.log(ui.value);
        }
	
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

function updateThrottle() {
	
	clearThrottle();
	
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
}


function clearThrottle() {
	$('.tposition').css('background-color', '#808080');
}



function loadCharts() {
Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });
    
       
        chart = new Highcharts.Chart({
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
                        chartInterval = setInterval(function() {
                            	var x = (new Date()).getTime(); // current time
                                y = speed;
                                
                                
                                
                            if(speed >= speedLimit){
                            	
                            	var v = {
                            		x: x,
                            		y: speed	
                            		
                            	}
                            	
                            	//TODO: add a marker at that point
                            	
                            	
                            }
                            else{
                            	
                            	var v = {
                            		x: x,
                            		y: speed
                            	}	
                            	
                            }    
                            series.addPoint(v, flag, flag);    
                            rpmseries.addPoint([x, rpm], flag, flag);
                            
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
                tickPixelInterval: 500
            },
            yAxis: [{
            	min : 0,
            	max : maxSpeed,
            	height: 100,
            	offset: 0,
                title: {
                    text: 'Speed'
                },
                
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }, {
                    value : speedLimit,
                    color : 'red',
                    dashStyle : 'shortdash',
                    width : 2,
                    label : {
                        text : 'Speed Limit'
                    }
                }]
            }, {
            	top : 200,
            	height : 100,
            	min : 0,
            	max : 6,
            	offset: 0,
            	title : {
            		text: 'RPM'
            	},
            	plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
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
                    var data = [],
                        time = (new Date()).getTime(),
                        i;
    
                    for (i = -19; i <= 0; i++) {
                        data.push({
                            x: time + i * 1000,
                            y: 0
                        });
                    }
                    return data;
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
            }]
        });
}


function onPauseClick() {
	//clearInterval(chartInterval);
	flag = false;
}

function onResumeClick() {
	//setInterval(chartInterval);
	flag = true;	
}


/*************************************** ANALYSIS JS ********************************/

