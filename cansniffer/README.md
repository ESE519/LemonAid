#CAN Bus Sniffer
The purpose of this program is to sniff the CAN bus of an automobile by parsing message packets with various CAN ids, understand the data and store them into a mysql database.

###Installation
Go up to the parent directory, and run `make clean && make` to compile the library and program.

###Usage
1. Ford Focus Electronic Neutralizer  

    Run `sudo ~/cansniffer/cantransmitter -f=/dev/pcanXX ~/cansniffer/transmit.txt`

2. Cansniffer  

    Run `sudo ~/cansniffer/cansniffer -f=/dev/pcanXX` to launch the program. **XX** is the pcan port number, which you can find using the `ls /dev/ | grep pcan` command.   
    After launching the program, there are several optional commands you can execute on the fly:  
     - **'r'**: instead of displaying formatted data (Ford Focus), list raw CAN messages
     - **'0-9'**: setup filters within a range, *for example*: **'1'** will setup filter to be within [0x100, 0x200]
     - **'c'**: clear all the settings  
    
3. Canmonitor   

 - Setup *(If you have already run the "setup\_lemonaid.sh" script, just jump to the next step)*
   - Make sure the PCAN cable is plugged in, and run `lsmod | grep pcan` to check if the driver is properly loaded.
   - In order to run canmonitor program, you need to install and setup MySQL database:  
**NOTE: during the installation, set the root password as: "12345"**  
`sudo apt-get install mysql-server mysql-client mysql-common`  
   - After successfully installing the mysql database, we need to setup the mysql table for the program:
     - run
`mysql -u root -p` and type in "12345" as the root password  
     - in the mysql console, type the following command and hit enter:  
`create table if not exists speedinfo (carid int,   
					tripid int,   
					engine int,   
					speed int,   
					rpm int,   
					thr int,   
					steer int,   
					gear int,   
					light int,   
					door int,   
					turn int,   
					brake int,   
					fuel int,   
					temp int,   
					lat real,   
					lon real,   
					time int);`

 - Run program
`sudo ~/cansniffer/canmonitor -f=/dev/pcanXX` 
