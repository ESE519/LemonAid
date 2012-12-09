/*
 In the same folder,
 $npm install -d mysql
 $npm install -d socket.io

 */

var speed = 0;
var throttle = 0, rpm = 0;
var engine = 0;
var carid = 0;
var tripid = 0;
var steering = 0;
var gear = 0;
var light = 0
var door = 0;
var turn = 0;
var brake = 0;
var fuel = -1;
var temperature = -1;
var lat = 300;
var lon = 300;
var timedb = -1;


var transmitInterval;

var lat = ['39.955775','39.954187','39.954130','39.954047','39.953998','39.953908','39.953867','39.953784','39.953718','39.953603','39.953488','39.953373','39.953151','39.952732','39.952057','39.951893','39.952032','39.952255'];
var lon = ['-75.192972','-75.190676','-75.190226','-75.189754','-75.189174','-75.188627','-75.188112','-75.187544','-75.186803','-75.185924','-75.185173','-75.184143','-75.183810','-75.183896','-75.184067','-75.184786','-75.185956','-75.187683'];

console.log('lat: ');


var app = require('http').createServer(handler), 
     io = require('socket.io').listen(app), 
     fs = require('fs'),
     sqlite3 = require('sqlite3').verbose(),
     db = new sqlite3.Database('test.db');

app.listen(8088);

function handler(req, res) {
	res.writeHead(200);
	res.end(data);
}

var itr = 0;
var right = true;

io.sockets.on('connection', function(socket) {
	console.log('******************* Client connected *******************' + socket.id);
	
	// handle data request
	var sendCount = 0;
	socket.on('getNewData', function(){
		
		console.log('***************** new data requested *********************');
		
		transmitInterval = setInterval(function() {
			//TODO: read new data from the database and if new -> emit
			
			rpm = Math.floor((Math.random() * 10) + 1);
			if(rpm > 6){
				rpm = 4;
			}
			speed = Math.floor(Math.random() * (70 - 0 + 1)) + 0;
			
			latData = lat[itr];
			lonData = lon[itr];
			
			itr++;
			
			if(itr >= lat.length){
				latData = 0;
				lonData = 0;
			}
			
			throttle = Math.floor(Math.random() * (100 - 0 + 1)) + 0;
			
			
			if(sendCount % 50 == 0){
				if(engine == 1){
					engine = 0
				}
				else{
					engine = 1	
				}
			}
			
			if(sendCount % 7 == 0){
				if(door != 0){
					door = 0	
				}
				else{
					door = 1
				}
			}
			
			
			if(sendCount % 8 == 0){
				gear += 1
				if(gear > 4){
					gear = 1
				}
			}
			
			
			if(sendCount % 10 == 0){
				light += 1
				if(light > 3){
					light = 0
				}
			}
			
			
			if(sendCount % 11 == 0){
				if(brake == 0){
					brake = 1	
				}
				else {
					brake = 0
				}
			}
			
			
			if(steering < 90){
				steering += 2	
			}
			else{
				steering -= 2
			}
			
			
						
			
			
			socket.emit('newData', {
								carid : carid,
								tripid : tripid,
								engine : engine,
								throttle : throttle,
								rpm : rpm, 
								speed : speed,
								steering: steering,
								gear : gear,
								light: light,
								door: door,
								turn: turn,
								brake: brake,
								fuel: fuel,
								temperature: temperature,	 
								lat : lat,
								lon : lon,
								timedb: timedb
				
			});
			
			console.log('***************************************  steering:     ' + steering + '  -----------  ' + sendCount  );
			
			/*
			db.serialize(function() {
			
			var count = 0
				
  				db.each("SELECT rowid as id, * FROM speedinfo", function(err, row) {	// order by id desc in real program
			    	  //if(row.id > count){
			    	  	
			    	  	
			    	  	//cap off values if they are out-of-bounds
			    	  	
				    	  
				          socket.emit('newData', {
								carid : row.carid,
								tripid : row.tripid,
								engine : row.engine,
								throttle : row.throttle,
								rpm : row.rpm, 
								speed : row.speed,
								steering: row.steering,
								gear : row.gear,
								light: row.light,
								door: row.door,
								turn: row.turn,
								brake: row.brake,
								fuel: row.fuel,
								temperature: row.temperature,	 
								lat : row.lat,
								lon : row.lon,
								timedb: row.timedb
				
							});
				  	  //}
				  	 count = row.id 
		    	});
		    	
			});
			*/
			
			sendCount++;
			
		}, 1500);
	
	});
	
	// handle stop data request
	socket.on('stopData', function(){
		clearInterval(transmitInterval);
	});
	
	// car selection
	socket.on('carSelection', function(data) {
		//TODO: store the selection into the database
		console.log('******************* Car Selected: ' + data.car + "*******************");
	});

	// disconnect event
	socket.on('disconnect', function() {
		console.log("**************** Connection " + socket.id + " terminated. *******************");
	});
});

