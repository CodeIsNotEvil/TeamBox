#!/bin/bash
#
# /home/ubuntu/app/scripts/wlan_show_ip.sh
#
# This script shows the pi's wlan IP address on console.
# It uses the commands ifconfig.
#
# Author: Lara Klimm
# Date: 04.05.2016
#
# Edited by Lukas Reichwein
# Date 15.03.2021


ip=$(ifconfig wlan0 | grep -oP "(?<=inet\s)([0-9]{1,3}.){3}[0-9]{1,3}")
printf "$ip"

exit 0
