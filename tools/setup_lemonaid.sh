#!/bin/bash

echo "installing required packages..."
echo " "

sudo apt-get update
sudo apt-get upgrade
sudo apt-get install gcc-4.6 g++-4.6 g++-4.6-multilib curl build-essential make libtinfo-dev libstdc++6 libstdc++6-4.6-dev hostapd dhcp3-server node mysql-server mysql-common mysql-client
curl http://npmjs.org/install.sh | sh
sudo npm install socket.io 
sudo npm install -d mysql

echo "configuring required packages..."
echo " "

echo "setting up hostapd..."
WLAN_INTERFACE=`sudo ifconfig -a | grep wlan | awk '{print $1}'`
sudo cp /etc/hostapd/hostapd.conf /etc/hostapd/hostapd.conf_backup
sudo echo "interface=${WLAN_INTERFACE}" > /etc/hostapd/hostapd.conf
sudo echo "driver=nl80211" >> /etc/hostapd/hostapd.conf
sudo echo "ssid=rttep" >> /etc/hostapd/hostapd.conf
sudo echo "channel=1" >> /etc/hostapd/hostapd.conf
sudo update-rc.d hostapd defaults

echo "setting up dhcp3-server..."
sudo cp /etc/dhcp/dhcpd.conf /etc/dhcp/dhcpd.conf_backup
sudo echo "ddns-update-style-none;" > /etc/dhcp/dhcpd.conf
sudo echo "authoritative;" >> /etc/dhcp/dhcpd.conf
sudo echo "subnet" >> /etc/dhcp/dhcpd.conf
sudo echo "192.168.1.0 netmask 255.255.255.0 {" >> /etc/dhcp/dhcpd.conf
sudo echo "option routers 192.168.1.1;" >> /etc/dhcp/dhcpd.conf
sudo echo "option subnet-mask 255.255.255.0;" >> /etc/dhcp/dhcpd.conf
sudo echo "option broadcast-address 192.168.1.255;" >> /etc/dhcp/dhcpd.conf
sudo echo "option domain-name-servers 192.168.1.1;" >> /etc/dhcp/dhcpd.conf
sudo echo "option range 192.168.1.2 192.168.1.10;" >> /etc/dhcp/dhcpd.conf
sudo echo "option default-lease-time 1209600;" >> /etc/dhcp/dhcpd.conf
sudo echo "option mas-lease-time 1814400;" >> /etc/dhcp/dhcpd.conf
sudo echo "}" >> /etc/dhcp/dhcpd.conf
sudo update-rc.d isc-dhcp-server defaults

echo "setting up network interfaces..."
sudo cp /etc/network/interfaces /etc/network/interfaces_backup
sudo echo "auto lo" > /etc/network/interfaces
sudo echo "iface lo inet loopback" >> /etc/network/interfaces
sudo echo "auto wlan0" >> /etc/network/interfaces
sudo echo "iface wlan0 inet static" >> /etc/network/interfaces
sudo echo "address 192.168.1.1" >> /etc/network/interfaces
sudo echo "netmask 255.255.255.0" >> /etc/network/interfaces
sudo echo "gateway 192.168.1.1" >> /etc/network/interfaces

echo "setting up can monitor program..."
make clean && make

echo "Done!"
echo "Reboot required!"

