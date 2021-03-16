#!/bin/bash
#
# /home/ubuntu/scripts/start.sh
#
# This script is a start script to mount a USB storage device, create nessecary
# data structure, choose a group (or create a new group), import the group's 
# mysql dump & start wlan access point.
#
# Dependencies:
# /home/ubuntu/scripts/usb_mount.s
# /home/ubuntu/scripts/group_choose.sh
# /home/ubuntu/scripts/mysql_import.sh
# /home/ubuntu/scripts/wlan_start.sh
# Indirect dependencies:
# /home/ubuntu/scripts/group_create.sh
# /home/ubuntu/scripts/wlan_show_info.sh
# /home/ubuntu/scripts/wlan_set_random_psk.sh
# /home/ubuntu/scripts/wlan_set_random_ssid.sh
# /home/ubuntu/scripts/wlan_show_psk.sh
# /home/ubuntu/scripts/wlan_show_ssid.sh
# /home/ubuntu/scripts/wlan_show_ip.sh
#
# Author: Lara Klimm
# Date: 02.05.2016
#
# Edited by Lukas Reichwein
# Date 15.03.2021



exit_status=1

clear

# mount connceted usb storage devices
sudo bash /home/ubuntu/scripts/usb_mount.sh
exit_status="$?"

if [ "$exit_status" = 0 ]
then
	# choose group or create new group & nessecary data structur on usb
	# sudo bash /home/ubuntu/scripts/group_create.sh is called from cript below, if there a no groups yet
	printf "\n=============================================================================\n\n"
	sudo bash /home/ubuntu/scripts/group_choose.sh
	exit_status="$?"

	if [ "$exit_status" = 0 ]
	then
		# import mysql dump from group
		printf "\n=============================================================================\n\n"
		sudo bash /home/ubuntu/scripts/mysql_import.sh
		exit_status="$?"
		printf "\n=============================================================================\n\n"
		# start wlan access point
		sudo bash /home/ubuntu/scripts/wlan_start.sh
		exit_status="$?"
	fi
fi



exit "$exit_status"
