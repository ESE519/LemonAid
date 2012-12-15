#Read Me
###Quick Start
If you already have your beaglebone setup, you only need to run the following commands to run the programs:
`sudo ./cansniffer/canmonitor -f=/dev/pcanXX > /dev/null 2>&1 &`  *(depends on the pcan device name)*  
`node server.js` *(depends on the file name)*  

###SD Card Setup
If you have a blank or unused SD card that are ready for LemonAid project, simply insert the SD card into your laptop *(Ubuntu required)*,
and then clone our project by running this command: `git clone git://github.com/ESE519/LemonAid`, and finally run 
`cd ./LemonAid && sh ./tools/install_lemonaid.sh`  
And the "install\_lemonaid.sh" will do everything for you.

###Beaglebone Setup
After running the install-lemonaid script, you will have an customized Ubuntu with our pcandriver on board. 
After plugging the SD card into your Beaglebone, **power up your Beaglebone with a separate power cord**, 
and connect the board to your laptop through USB cable. And run 
`screen /dev/ttyUSBX 115200`   
If you see no output, just type Enter, it will take 1 to 5 minutes to have the board bootup the operating system.  
When you see the login prompt, login with username: "ubuntu", password: "temppwd".   
Then you will be logged in onto the "home" path, and then run `sh ./setup_lemonaid.sh` to do the final setup

###Run Program
After setup of everything, run the following commands to start the standard program:
`sudo ./cansniffer/canmonitor -f=/dev/pcanXX > /dev/null 2>&1 &`  *(depends on the pcan device name)*  
`node server.js` *(depends on the file name)*  
   
   
**For more information about the cansniffer programs, please refer to the Readme in cansniffer folder**
