#!/bin/bash
#
# /home/ubuntu/app/scripts/group_show.sh
#
# This skript shows all existing groups from a plugged in USB storage
# device to work on that grouop's collaborative work.
# At the beginning it checks if there is any device plugged in to continue.
# If there is the folder TeamBox in it the script will check for it's
# content which is the group folders.
#
# Dependencies:
# usb_mount.sh
#
# Author: Lara Klimm
# Date: 11.05.2016

# get the parent path and cd to it.
# this assures that we alway have te right paths if we use relatives
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

# path where devices shoud be mounted to
mount_path="/media/USB-TeamBox"
group=""

exit_status=1


# check if device is mounted
check_mounted=$(mount | grep "TeamBox")
if [ ! -n "$check_mounted" ]
then
	# try to mount usb
	sudo bash usb_mount.sh
	if [ "$?" = 0 ]
	then
		exit_status=0
	else
		printf "No USB storage device is mounted\n\n" >&2
		exit_status=1
		exit "$exit_status"
	fi
fi
# check if subfolder TeamBox exists
if [ ! -d "${mount_path}/TeamBox" ]
then
	printf "There are no groups yet!\nPlease create a new one...\n\n" >&2
	exit_status="$?"
else
	# check if subfolder contains other folders
	directories_str="$(find ${mount_path}/TeamBox/ -maxdepth 1 -type d | sort -nr | grep -oP '(?<=\/TeamBox\/).*')"
	printf "$directories_str\n"
	exit_status=0
fi


exit $exit_status
