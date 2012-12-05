var isNetConnected = false;
var isDbConnected = false;
var isSocketConnected = false;


var socket = -1;

/**
 *  steps to do when cordova is ready
 */
document.addEventListener("deviceready", function() {
	console.log("PhoneGap ready")
	document.addEventListener("pause", onPause, false);
	//document.addEventListener("resume", onResume, false);

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
			window.location.href = "trip.html"
		}
	})

	plugins.tabBar.createItem("analysis", "Analysis", "/www/img/tabbar/ekg.png", {
		onSelect : function() {
			//window.location.href = "analysis.html";
		}
	})

	plugins.tabBar.selectItem("analysis");


	connectToSocket();


	

}, false)


function onPause() {
	socket.emit('stopData', function() {
		console.log('request to stop data');
	});

	socket.disconnect();
	socket = -1;
}



function connectToSocket() {
	socket = io.connect('http://localhost:8080');
	//socket = io.connect('http://192.168.1.1:8080');

}



/**
 *  handle online event
 */
function onOnline() {
	//$('#netCon').text('WiFi connected');
	isNetConnected = true;
}

/**
 *  handle offline event
 */
function onOffline() {
	//$('#netCon').text('WiFi disconnected');
	isNetConnected = false;
}



