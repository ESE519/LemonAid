/*
In the same folder,
$npm install -d mysql
$npm install -d socket.io

*/

var speed = 0

var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(8080);

function handler (req, res) {
  //fs.readFile(__dirname + '/index.html',
  //function (err, data) {
   // if (err) {
     // res.writeHead(500);
     // return res.end('Error loading index.html');
   // }

   // res.writeHead(200);
   // res.end(data);
  //});
  
    res.writeHead(200);
	res.end(data);
}

io.sockets.on('connection', function (socket) {
	console.log('*** Client connected ***' + socket.id);
	
		setInterval(function(){
			speed = Math.floor((Math.random()*10)+1);
			socket.emit('news', { hello: speed*2 });
  			//console.log('*** news event emitted *** ');
  		}, 300);
	
	//socket.emit('news', { hello: speed*2 });
	
  	
  	socket.on('my other event', function (data) {
    	console.log('*** other event occured ***');
    	console.log(data);
  	});
  
  	socket.on('disconnect', function(){
    	console.log("Connection " + socket.id + " terminated.");
  	});
});

