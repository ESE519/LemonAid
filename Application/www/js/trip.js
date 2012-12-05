// global variables
var socket = -1;
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
	document.addEventListener("pause", onPause, false);

	/*
	// initialize tab bar
	plugins.tabBar.createItem("control", "Control", "www/img/tabbar/house.png", {
		onSelect : function() {
			window.location.href = "index.html";
		}
	})

	plugins.tabBar.createItem("dashboard", "Dashboard", "www/img/tabbar/81-dashboard.png", {
		onSelect : function() {
			window.location.href = "dashboard.html";
		}
	})

	plugins.tabBar.createItem("trip", "Trip", "www/img/tabbar/map.png", {
		onSelect : function() {
			//window.location.href = "trip.html"
		}
	})

	plugins.tabBar.createItem("analysis", "Analysis", "/www/img/tabbar/ekg.png", {
		onSelect : function() {
			window.location.href = "analysis.html";
		}
	})
	*/

	initializeMap();
	initSlider();
	loadCharts();
	connectToSocket();
	
	

}, false)



function onPause() {
	socket.emit('stopData', function() {
		console.log('request to stop data');
	});

	socket.disconnect();
	socket = -1;
}


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




function connectToSocket() {

	socket = io.connect('http://localhost:8080');
	//socket = io.connect('http://192.168.1.3:8080');

	socket.emit('getNewData', function() {
		console.log('Requesting new data');
	});

	socket.on('newData', function(data) {
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
		
		//updateValues(pThrottle, pRPM, data.speed, pDoor, pLight, pTurn, pBrake);
	}); 
	
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
