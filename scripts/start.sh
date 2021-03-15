#!/bin/bash
#
# /home/pi/scripts/start.sh
#
# This script is a start script to mount a USB storage device, create nessecary
# data structure, choose a group (or create a new group), import the group's 
# mysql dump & start wlan access point.
#
# Dependencies:
# /home/pi/scripts/usb_mount.s
# /home/pi/scripts/group_choose.sh
# /home/pi/scripts/mysql_import.sh
# /home/pi/scripts/wlan_start.sh
# Indirect dependencies:
# /etc/init.d/hostapd
# /home/pi/scripts/group_create.sh
# /home/pi/scripts/wlan_show_info.sh
# /home/pi/scripts/wlan_set_random_psk.sh
# /home/pi/scripts/wlan_set_random_ssid.sh
# /home/pi/scripts/wlan_show_psk.sh
# /home/pi/scripts/wlan_show_ssid.sh
# /home/pi/scripts/wlan_show_ip.sh
#
# Author: Lara Klimm
# Date: 02.05.2016


exit_status=1

clear

# mount connceted usb storage devices
sudo bash /home/pi/scripts/usb_mount.sh
exit_status="$?"

if [ "$exit_status" = 0 ]
then
	# choose group or create new group & nessecary data structur on usb
	# sudo bash /home/pi/scripts/group_create.sh is called from cript below, if there a no groups yet
	printf "\n=============================================================================\n\n"
	sudo bash /home/pi/scripts/group_choose.sh
	exit_status="$?"

	if [ "$exit_status" = 0 ]
	then
		# import mysql dump from group
		printf "\n=============================================================================\n\n"
		sudo bash /home/pi/scripts/mysql_import.sh
		exit_status="$?"
		printf "\n=============================================================================\n\n"
		# start wlan access point
		sudo bash /home/pi/scripts/wlan_start.sh
		exit_status="$?"
	fi
fi



exit "$exit_status"
