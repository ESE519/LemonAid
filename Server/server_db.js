
var speed = 0

var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , mysql = require('mysql')

//database
var db_client = mysql.createConnection({
              host: 'localhost',
              user: 'root',
              password: '',
});


db_client.connect();

app.listen(8080);

function handler (req, res) {
    res.writeHead(200);
	res.end(data);
}

var TEST_DATABASE = 'my_db';
var TEST_TABLE = 'speedinfo';

io.sockets.on('connection', function (socket) {
	console.log('*** Client connected ***' + socket.id);
	
	db_client.query('USE '+TEST_DATABASE);
	
	
	
		setInterval(function(){
			
			db_client.query('SELECT speed, time FROM '+TEST_TABLE, function(err, results) {
		    	if (err) throw err;
				//console.log(results[0].speed);
				//speed = Math.floor((Math.random()*10)+1);
				
				//TODO: check for update in db
				
				socket.emit('news', { hello: results[0].speed*2 });
			});
			
			
  			//console.log('*** news event emitted *** ');
  		}, 300);
	
	
  	
  	socket.on('my other event', function (data) {
    	console.log('*** other event occured ***');
    	console.log(data);
  	});
  
  	socket.on('disconnect', function(){
    	console.log("Connection " + socket.id + " terminated.");
  	});
});

