/*
In the same folder,
$npm install -d mysql
$npm install -d socket.io

*/


var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(8080);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
	console.log('*** Client connected ***' + socket.id);
	
	setTimeout(function(){
		socket.emit('news', { hello: 'world' });
  		console.log('*** news event emitted ***');
  	}, 10000);
	
  	
  	
  	socket.on('my other event', function (data) {
    	console.log('*** other event occured ***');
    	console.log(data);
  	});
  
  	socket.on('disconnect', function(){
    	console.log("Connection " + socket.id + " terminated.");
  	});
});

