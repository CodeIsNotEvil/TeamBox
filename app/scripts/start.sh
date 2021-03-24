#!/bin/bash
#
# /home/ubuntu/app/scripts/start.sh
#
# This script is a start script to mount a USB storage device, create nessecary
# data structure, choose a group (or create a new group), import the group's 
# mysql dump & start wlan access point.
#
# Dependencies:
# usb_mount.s
# group_choose.sh
# mysql_import.sh
# wlan_start.sh
# 
# Indirect dependencies:
# group_create.sh
# wlan_show_info.sh
# wlan_set_random_psk.sh
# wlan_set_random_ssid.sh
# wlan_show_psk.sh
# wlan_show_ssid.sh
# wlan_show_ip.sh
#
# Author: Lara Klimm
# Date: 02.05.2016
#
# Edited by Lukas Reichwein
# Date 15.03.2021

# get the parent path and cd to it.
# this assures that we alway have te right paths if we use relatives
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

exit_status=1

clear

# mount connceted usb storage devices
sudo bash usb_mount.sh
exit_status="$?"

if [ "$exit_status" = 0 ]
then
	# choose group or create new group & nessecary data structur on usb
	# sudo bash group_create.sh is called from cript below, if there a no groups yet
	printf "\n=============================================================================\n\n"
	sudo bash group_choose.sh
	exit_status="$?"

	if [ "$exit_status" = 0 ]
	then
		# import mysql dump from group
		printf "\n=============================================================================\n\n"
		sudo bash mysql_import.sh
		exit_status="$?"
		printf "\n=============================================================================\n\n"
		# start wlan access point
		sudo bash wlan_start.sh
		exit_status="$?"
	fi
fi



exit "$exit_status"
