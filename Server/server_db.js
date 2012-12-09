var speed = 0

var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , mysql = require('mysql')
  , sqlite3 = require('sqlite3').verbose()
  , db = new sqlite3.Database('test.db');

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

function handler (req, res) {
    res.writeHead(200);
    res.end();
}

var TEST_DATABASE = 'mydb';
var TEST_TABLE = 'speedinfo';

io.sockets.on('connection', function (socket) {
    console.log('*** Client connected ***' + socket.id);

    //db_client.query('USE '+TEST_DATABASE);

   // setInterval(function(){
        /*
        db_client.query('SELECT tripID, speed, rpm, time FROM '+ TEST_TABLE + ' order by tripID desc limit 1', function(err, results) {
            if (err) throw err;
                //TODO: check for update in db

                socket.emit('news', { hello: results[0].rpm });
            });
        */
        
        db.serialize(function() {
			
			var count = 0
			
  			db.each("SELECT rowid as id, speed FROM speedinfo limit 1", function(err, row) {	// order by id desc in real program
			      if(row.id > count){
				      console.log( row.id + ": " + row.speed);
				      //emit
				  }
				  count = row.id
		    });
		});

    //}, 3000);

    

    socket.on('disconnect', function(){
    	db.close()
        console.log("Connection " + socket.id + " terminated.");
    });

});

