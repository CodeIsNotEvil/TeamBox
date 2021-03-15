#!/bin/bash
#
# /home/pi/scripts/group_name.sh
#
# This script will check if any device is mounted and then it will read the
# group's name from ~/files/group.conf.
#
# Dependencies:
# /home/pi/files/group.conf
# /home/pi/scripts/usb_mount.sh
#
# Author: Lara Klimm
# Date: 24.05.2016



group_conf="/home/pi/files/group.conf"

exit_status=1



# check if an usb storage device is mounted
check_mounted=$(mount | grep "TeamBox")
if [ -z "$check_mounted" ]
then
	# try to mount usb
	sudo bash /home/pi/scripts/usb_mount.sh 2>/dev/null
	if [ "$?" = 0 ]
	then
		exit_status=0
	else
		exit 1
	fi
fi

# check if a group is selected
if [ -f "$group_conf" ]
then
	check_group=$(cat "$group_conf" | grep -oP "(?<=group\=).*")
	if [ -z "$check_group" ]
	then
#		printf "No group selected!\n" >&2
		exit 1
	else
		printf "$check_group"
		exit_status=0
	fi

else
#	printf "Configuration file does not exist!\n" >&2
	exit_status=1
fi


exit "$exit_status"
