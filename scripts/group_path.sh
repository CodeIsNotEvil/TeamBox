#!/bin/bash
#
# /home/ubuntu/scripts/group_path.sh
#
# This script will check if any device is mounted and then it will read the
# group's path from ~/files/group.conf.
#
# Dependencies:
# /home/ubuntu/files/group.conf
# /home/ubuntu/scripts/usb_mount.sh
#
# Author: Lara Klimm
# Date: 27.05. 2016
#
# Edited by Lukas Reichwein
# Date 15.03.2021


group_conf="/home/ubuntu/files/group.conf"

exit_status=1



# check if an usb storage device is mounted
check_mounted=$(mount | grep "TeamBox")
if [ -z "$check_mounted" ]
then
	# try to mount usb
	sudo bash /home/ubuntu/scripts/usb_mount.sh 2>/dev/null
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
	check_path=$(cat "$group_conf" | grep -oP "(?<=path\=).*")
	if [ -z "$check_path" ]
	then
#		printf "No group selected!\n" >&2
		exit 1
	else
		printf "$check_path"
		exit_status=0
	fi

else
#	printf "Configuration file does not exist!\n" >&2
	exit_status=1
fi


exit "$exit_status"
