


// load at least 150 data points for each trip 


// connect to the database


// load unique trips from the database - also cache all trip data in a map
/* 
 * 1. select unique trip ids from speedInfo;
 * 2. select * from speedInfo where tripID = xx;
 * 3. make cache maps
 *  
 */


// populate trips in the list and wait for trip selection



// by default just show the first trip data



// display data for selected trips


// add markers to key events
/*
 * KEY EVENTS:
 * ----------
 * 1. SPEED LIMIT
 * 2. SUDDEN SPEED DECREASE
 * 3. STEERING ANGLE AND TURN LIGHTS
 * 4. ENGINE ON/OFF | LIGHTS ON/OFF | DOORS OPEN/CLOSE
 * 5. THROTTLE TOO HIGH
 * 6. SUDDEN BRAKE WITH DEPLOYEMENT OF BRAKE
 * 7. MAPS - BASED ON MAP -> SUDDEN TURNS ON STRAIGHT ROAD
 * 8. KEEP A GLOBAL COUNT OF THESE EVNETS PER TRIP AND PER CAR
 * 
 */

