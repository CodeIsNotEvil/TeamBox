#!/bin/bash
#
# /etc/hostapd/wlan_show_ip.sh
#
# This script shows the pi's wlan IP address on console.
# It uses the commands ifconfig.
#
# Author: Lara Klimm
# Date: 04.05.2016


ip=$(ifconfig wlan0 | grep -oP "(?<=inet addr:)[^\ ]*")
printf "$ip"

exit 0
