var isSelectionOpen = false;
var socket;
var selectedCar = -1;

function onBodyLoad() {
	document.addEventListener("deviceready", onDeviceReady, false);
	
}

function onDeviceReady() {
	document.addEventListener("pause", onPause, false);
	document.addEventListener("resume", onResume, false);
	initDisplay();

	// 
// 
    // //plugins.navigationBar.create()
    // // or to apply a certain style (one of "Black", "BlackOpaque", "BlackTranslucent", "Default"):
    


	plugins.tabBar.init()
	plugins.navigationBar.init()

	plugins.tabBar.create()
	plugins.navigationBar.create("Black")

	plugins.tabBar.createItem("control", "Control", "www/img/tabbar/house.png", {
		onSelect : function() {

		}
	})

	plugins.tabBar.createItem("dashboard", "Dashboard", "www/img/tabbar/81-dashboard.png", {
		onSelect : function() {
			window.location.href = "dashboard.html";
		}
	})

	plugins.tabBar.createItem("trip", "Trip", "www/img/tabbar/map.png", {
		onSelect : function() {
			window.location.href = "trip.html";
		}
	})

	plugins.tabBar.createItem("analysis", "Analysis", "/www/img/tabbar/ekg.png", {
		onSelect : function() {
			window.location.href = "analysis.html";
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

/*	    
    
    

    plugins.navigationBar.showLeftButton()
    

	// Create left navigation button with a title (you can either have a title or an image, not both!)
    plugins.navigationBar.setupLeftButton("Text", null, function() {
        //alert("left nav button tapped")
    })

    // Create right navigation button from a system-predefined button (see the full list in NativeControls.m)
    // or from an image
    plugins.navigationBar.setupRightButton(
        null,
        "barButton:Bookmarks", // or your own file like "/www/stylesheets/images/ajax-loader.png",
        function() {
            //alert("right nav button tapped")
        }
    )

*/

    plugins.tabBar.show()
	plugins.tabBar.showItems("control", "dashboard", "trip", "analysis")
	plugins.tabBar.selectItem("control"); 

	plugins.navigationBar.hideLeftButton()
    //plugins.navigationBar.hideRightButton()

	plugins.navigationBar.showRightButton()

	plugins.navigationBar.setTitle("LemonAid")
    plugins.navigationBar.show()

	//TODO: connect to wifi
	//connectWifi();

	
	// determine the car type
	selectedCar = getCar();

	// load the screen with selected car info
	loadCarInfo(selectedCar);

	/*
	var storage = window.localStorage;
	var valueStored = storage.getItem("test");
	console.log(valueStored);
	if(valueStored != "valueDefault"){
	storage.setItem("test", "valueDefault");
	}
	*/

	// create database if does not exists
	createDB();

	// open socket connection
	connectToSocket();
	
}


function onPause() {
	socket.disconnect();
	socket = -1;
}


function onResume() {
	connectToSocket();
}


function initDisplay() {
	$('#carSelect').addClass('hidden');

}
        	

function createDB() {
	var db = window.openDatabase("carChoice", "1.0", "carChoice", 8000000);
	db.transaction(setupDB, errorCB, successCB);
}

function dropDB(tx) {
	tx.executeSql('DROP TABLE IF EXISTS CARSELECT');
	tx.executeSql('DROP TABLE IF EXISTS SPEEDINFO');
}
        	
function setupDB(tx) {
	tx.executeSql('CREATE TABLE IF NOT EXISTS CARSELECT (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, carID INTEGER NOT NULL, TIMESTAMP)');
	tx.executeSql('CREATE TABLE IF NOT EXISTS SPEEDINFO ( \
								id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
								carID INTEGER NOT NULL, \
								SPEED INTEGER NOT NULL, \
								RPM INTEGER NOT NULL, \
								DOOR INTEGER NOT NULL, \
								LIGHT INTEGER NOT NULL, TIMESTAMP)');
}

function errorCB(err) {
	alert("Error processing SQL: " + err.code);
}
	

function successCB() {
	//alert("success!");
	console.log("success!");
}


function selectCar(car) {
	var tempCar = -1;

	if ($(car).attr('id') == "ford") {
		console.log("Ford Focus");
		tempCar = 1;
		
		socket.emit('carSelection', {
			car : 1
		});
	}

	if ($(car).attr('id') == "toyota") {
		console.log("Toyota Prius");
		tempCar = 2;

		socket.emit('carSelection', {
			car : 2
		});
	}
	$('#carSelect').removeClass('visible').addClass('hidden');
	isSelectionOpen = false;

	loadSelectedCar(tempCar);

	return tempCar;
}


function connectToSocket() {
	socket = io.connect('http://localhost:8080');
	//socket = io.connect('http://192.168.1.3:8080');

	
}


function loadCarInfo(tCar) {
	console.log(tcar);

}


/**
 *  Handle car select option
 */
$('#carSelectButton').click(function() {
	if (isSelectionOpen) {
		//console.log('clicked car close');
		$('#carSelect').removeClass('visible').addClass('hidden');
		isSelectionOpen = false;
	} else {
		//console.log('clicked car open');
		$('#carSelect').removeClass('hidden').addClass('visible');
		isSelectionOpen = true;
	}

});

			

/**
 *
 */
$('#simulate').click(function() {
	window.location.href = "dashboardDemo.html";
}); 


/**
 * 
 */
function loadSelectedCar(passedCar) {
	if(passedCar == 1){
		imageUrl = './www/focus.jpg';
		window.localStorage.setItem('carSelected', 'focus');
	}
	else if(passedCar == 2){
		imageUrl = './www/prius.jpg';
		window.localStorage.setItem('carSelected', 'prius');
	}
	$('#app').css('background-image', 'url(' + imageUrl + ')');
	
}
