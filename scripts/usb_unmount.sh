#!/bin/bash
#
# /home/ubuntu/scripts/usb_unmount.sh
#
# param $1 : unmount despite export failure (yes/no [0/2])
#
# This script will unmount the USB storage device that is mounted to
# /media/USB-TeamBox and also will export a mysql dump to the device.
# At first it checks if there is any device mounted to this location and then
# it tries to export mysql dump an unmount it. To do so this script reads
# ~/files/group.conf to get the group's path.
# If writing a mysql dump fails you will be asked to write to console wheater
# to unmount it anyway (which could cause data loss!) or not.
# When calling this script with a parameter yes/no (0/1) it will automatically
# be (not) unmounted despite any failure.
#
# Dependencies:
# /home/ubuntu/files/group.conf
# /home/ubuntu/scripts/mysql_export.conf
#
# Author: Lara Klimm
# Date: 02.05.2016
#
# Edited by Lukas Reichwein
# Date 15.03.2021


group_conf="/home/ubuntu/files/group.conf"
number=""

exit_status=1


# read from console if device should be unmounted when no dumps were exported
readNumber(){
	printf "Unmount USB storage device anyway? (NOTE: This may cause data loss!)\nPlease choose...\n"
	printf "[0] yes\n[1] no\n> "
	success=0
	until [ "$success" = 1 ]
	do
		read -e -n 10 number
		check_num=$(echo "$number" | grep "[0-9]")
		if [ -z check_num ]
		then
			printf "Please enter number 0 or 1!\n> "
		else
			if [ "$number" -gt 1 ]
			then
				printf "Please enter number 0 or 1!\n> "
			else
				success=1
			fi
		fi
	done
}

# unmount usb device
unmount(){
	sudo umount $device
	if [ "$?" = 0 ]
	# unmount
	then
		printf "\nUnmounted USB device $device\n"
		# stop access point
		echo "" > "$group_conf"
		sudo service hostapd stop
		exit_status=0
	else
		printf "$device could not be unmounted!\n" >&2
		exit_status=1
	fi
}


# get usb storage device
device=$(mount | grep "TeamBox" | cut -d" " -f1)
if [ -z "$device" ]
then
	printf "\nNo usb storage device mounted!\n" >&2
else
	# export mysql dump first
	sudo bash /home/ubuntu/scripts/mysql_export.sh
	if [ "$?" = 0 ]
	then
		printf "Exported data structure to USB device\n"
		exit_status=0
	else
		printf "Could not export data structure!\n" >&2
		# check parameter to unmount anyway
		if [ "$#" -gt 0 ]
		then
			if [ "$1" = "yes" ]
			then
				number=0
			elif [ "$1" = "no" ]
			then
				number=1
			elif [ "$1" = 0 ]
			then
				number=0
			elif [ "$?" = 1 ]
			then
				number=1
			else
				readNumber
			fi
		else
			# read from console
			readNumber
		fi
		if [ "$number" = 0 ]
		then
			unmount
		fi
	fi
fi


exit $exit_status
