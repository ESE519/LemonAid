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


var app = require('http').createServer(handler), 
     io = require('socket.io').listen(app), 
     fs = require('fs');
     mysql = require('mysql')
     
     
var connection = mysql.createConnection({
   user: "root",
   password: "12345",
   database: "lemon"
});

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
		
			
			var query = connection.query('SELECT * FROM speedinfo order by time desc limit 1');
query
  .on('error', function(err) {
    // Handle error, an 'end' event will be emitted after this as well
  })
  .on('fields', function(fields) {
    // the field packets for the rows to follow
  })
  .on('result', function(row) {
   	socket.emit('newData', {
								carid : row.carid,
								tripid : row.tripid,
								engine : row.engine,
								throttle : row.thr,
								rpm : row.rpm, 
								speed : row.speed,
								steering: row.steer,
								gear : row.gear,
								light: row.light,
								door: row.door,
								turn: row.turn,
								brake: row.brake,
								fuel: row.fuel,
								temperature: row.temp,	 
								lat : row.lat,
								lon : row.lon,
								timedb: row.time
				
							});
  })
  .on('end', function() {
    // all rows have been received
    
    
    
    
  });	
			
			
		}, 1600);
	
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

