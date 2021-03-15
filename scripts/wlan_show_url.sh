#!/bin/bash
#
# /home/pi/scripts/wlan_show_url.sh
#
# This script shows the pi's local address on console.
# It uses the the variable $HOSTNAME.
#
# Author: Lara Klimm
# Date: 24.05.2016


url=http://$(echo $HOSTNAME)".local"
printf "$url"

exit 0
