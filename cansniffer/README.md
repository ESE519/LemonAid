#CAN Bus Sniffer
The purpose of this program is to sniff the CAN bus of an automobile by parsing message packets with various CAN ids, understand the data and store them into a sqlite database.

###Installation
Go up to the parent directory, and run `make clean && make` to compile the library and program.

###Usage
1. Cansniffer

Run `sudo cansniffer -f=/dev/pcanXX` to launch the program.

2. Canmonitor

 - Setup
   - In order to run canmonitor program, you need to install and setup MySQL database: 
`sudo apt-get install mysql-server mysql-client mysql-common`
