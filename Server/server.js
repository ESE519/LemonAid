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
     fs = require('fs');
     //mysql = require('mysql'),
     //sqlite3 = require('sqlite3').verbose(),
     //db = new sqlite3.Database('test.db');


//database
/*
var db_client = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '12345',
});
*/

//db_client.connect();


app.listen(8088);

function handler(req, res) {
	res.writeHead(200);
	res.end(data);
}

var itr = 0;
var right = true;

var TEST_DATABASE = 'lemon';
var TEST_TABLE = 'speedinfo';

io.sockets.on('connection', function(socket) {
	
	//console.log('client connected -- next statement is use database');
	
	
	//db_client.query('USE '+TEST_DATABASE);
	
	console.log('******************* Client connected *******************' + socket.id);
	
	// handle data request
	var sendCount = 0;
	socket.on('getNewData', function(){
		
		console.log('***************** new data requested *********************');
		
		
		
        
		
		
		
		transmitInterval = setInterval(function() {
			
			
			
			
			
			/*
			db_client.query('SELECT * FROM '+ TEST_TABLE + ' order by time desc limit 1', function(err, results) {
            if (err) throw err;
                //TODO: check for update in db


                //socket.emit('news', { hello: results[0].rpm });
                
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
            });*/
        
			//TODO: read new data from the database and if new -> emit
			
			rpm = Math.floor(Math.random() * (4000 - 699 + 1)) + 699;
			
			speed = Math.floor(Math.random() * (70 - 0 + 1)) + 0;
			steering = Math.floor(Math.random() * (100 - 1  + 1)) + 2;
			latData = lat[itr];
			lonData = lon[itr];
			
			itr++;
			
			if(itr >= lat.length){
				itr = 0;
				
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
					door = door + 1
					if(door > 3){
						door = 0
					}
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
			
			/*
			if(steering > 90){
				steering -= 45	
			}
			else if (steering < -95){
				steering += 25
			}
			
			
			/*
			 * Simulate -- Trip 7 --> Human crash
			 * 
			 * 1. Speed 
			 * 2. Steering angle
			 * 3. Light
			 * 4. Door
			 * 5. brake
			 * 
			 */			
			
			
			
			
			
				//speed = speed - 1
				
				
			
			
				//steering = steering + 18; 
			 
			
			
			timedb = (new Date).getTime();
			carid = 0;
			tripid = 9;
			
			//console.log(lat , '    ', lon)
			
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
								lat : latData,
								lon : lonData,
								timedb: timedb
				
			});
			
			console.log('***************************************  ' + sendCount + 'steering  - ' + steering );
			
			
			
			sendCount++;
			
		}, 1200);
	
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

