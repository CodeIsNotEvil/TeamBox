#!/bin/bash
#
# /home/ubuntu/app/scripts/usb_mount.sh
#
# This script will mount one (assuming there will only be one reachable USB
# slot) plugged in USB storage device to the predefined location
# /media/USB-TeamBox (which will be created if it does not exist).
# At first it checks out /dev for storage devices (it takes the first one
# listed) and gets the filesystem from the command sudo blkid.
# This device will be mounted according to the filesystem if it is not already
# mounted.
#
# Author: Lara Klimm
# Date: 02.05.2016
#
# Edited by Lukas Reichwein
# Date 15.03.2021


# path where devices shoud be mounted to
mount_path="/media/USB-TeamBox"

exit_status=1



# mount single device
# param $1 : device that should be mounted
# param $2 : device's file system
mountDevice(){
	# if path does not exits jet: create
	if [ ! -d "$mount_path" ]
	then
		sudo mkdir "$mount_path"
		sudo chown -R www-data:www-data "$mount_path"
		sudo chmod -R 777 "$mount_path"
	fi
	# mount device
	if [ "$2" = "ntfs" ]
	then
		sudo mount -t ntfs-3g -o umask=000,gid=www-data,uid=www-data "$1" "$mount_path"
	elif [ "$2" = "vfat" ]
	then
		sudo mount -t vfat -o umask=000,gid=www-data,uid=www-data "$1" "$mount_path"
	else
		sudo mount "$1" "$mount_path"
		sudo chmod -R 777 "$mount_path"
	fi
	if [ "$?" = "0" ]
	then
		printf "Device mounted\n"
		exit_status=0
	else
		printf "An error eccured! Device could not be mounted properly!\n" >&2
		exit_status=1
	fi
}


# get usb storage device (starting with /dev/sd..) - assuming there could only be one
device=$(find "/dev" -name "sd[a-z][0-9]")


if [ -z "$device" ]
# if there is no device: error, exit
then
	printf "No usb storage device detected!\nPlease plug in to continue...\n" >&2
	exit_status=1
# if there is a device
else
	printf "$device\n" &>/dev/null
	# get file system (to mount correctly)
	file_system=$(sudo blkid "$device" | grep -oP "(?<=TYPE\=\")[^\"]*(?=\")")
	printf "File system: $file_system\n" &>/dev/null
	# check if device is already mounded somewhere
	check_mounted=$(mount | grep "$device")
	if [ -n "$check_mounted" ]
	then
		# check if device is already mounted at TeamBox
		check_mounted_tb=$(mount | grep "$device on $mount_path")
		if [ -n "$check_mounted_tb" ]
		then
			printf "Device already mounted\n"
			exit_status=0
		# device is moundet but not at TeamBox -> remount
		else
			sudo umount "$device"
			if [ "$?" = "0" ]
			then
				mount "$device" "$file_system"
			else
				exit_status=1
			fi
		fi
	# if not mounted: mount device
	else
		mountDevice "$device" "$file_system"
	fi
fi


exit "$exit_status"
