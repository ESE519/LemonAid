LemonAid
========

# Introduction
LemonAid project wants to bring down the difficulties of monitoring and diagnostics for your car by providing a black box solution of OBDII sniffer with an iPad monitoring app and analytics.

# Strategy
LemonAid project wants to explore the following aspects of OBD:
 - (Done) Storing all the data of a trip into a device for further manipulation, including data query, wireless transmission, and etc.
 - Automating the process of understanding CAN IDs
 - Comprehensive display of all the data on the iPad
 - Finding a reasonable approach for analytics on all aspects of the data

# Structure
LemonAid project requires the following components (both software and hardware) : (Top-Down)
 - iPad
	 - Objective C (iPad app)
	 - Socket.io (on both sides)
 - Beaglebone
	 - Socket.io (on both sides)
	 - node.js server
	 - MySQL
	 - C++
	 - Custom pcan driver (USB2CAN)
 - OBD2CAN Cable


