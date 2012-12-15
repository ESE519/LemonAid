#Quick Start
If you already have your beaglebone setup, you only need to run the following commands to run the programs:
    sudo canmonitor -f=/dev/pcanXX > /dev/null 2>&1 &  *(depends on the pcan device name)*  
    node server.js *(depends on the file name)*  
