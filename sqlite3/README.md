SQLite3 Configuration Guide
===========================

#SQLite versus MySQL as embedded database

The database requirments on an embedded device is different from that of a web service. MySQL can be very scalable, however, when dealing with embedded applications on board, it is too cumbersome. SQLite, on the other hand, is a single-file database, which means it is very fast for read/write. This is why both Android and iPhone use SQLite to be their database choice.

#SQLite setup
In order to use LemonAid programs, we need to setup a database for storing all kinds of parameters of a car, such as gear position, rpm and speed. 

*Note*: all the following commands only apply to Ubuntu.

###Install sqlite3
    sudo apt-get install sqlite3 libsqlite3-dev
    sqlite3 test.db

###Create the database
    sqlite3 test.db

###Create the table
    create table speedinfo (gear, light, turn, engine, dd, pd, dr, pr, wheel, speed, throttle, brake, rpm);
