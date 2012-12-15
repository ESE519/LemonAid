#Read Me
###Quick Start
If you already have your beaglebone setup, you only need to run the following commands to run the programs:
`sudo canmonitor -f=/dev/pcanXX > /dev/null 2>&1 &`  *(depends on the pcan device name)*  
`node server.js` *(depends on the file name)*  

###SD Card Setup
If you have a blank or unused SD card that are ready for LemonAid project, simply insert the SD card into your laptop *(Ubuntu required)*,
and then clone our project by running this command: `git clone git://github.com/ESE519/LemonAid`, and finally run 
`cd ./LemonAid && sh ./tools/install_lemonaid.sh`  
And the "install\_lemonaid.sh" will do everything for you.

###Beaglebone Setup
After running the install-lemonaid script, you will have an customized Ubuntu with our pcandriver on board. After plugging the SD card into your Beaglebone, 
