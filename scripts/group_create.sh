##!/bin/bash
#
# /home/pi/scripts/detect_usb.sh
#
# param $1 : new group's name
#
# This script lets you create a new group for collaborative work on documents
# saved on an USB storage device.
# First it will check for a plugged in device.
# If there is no folder called TeamBox on it this will create it.
# Another folder with the group's name will be created inside if it does not
# already exist.
# You are asked to write the new group's name to console if you did not call
# this script with a parameter which is the group's name.
# There will also be another subfolder created in the group's
# folder which is called .meta to save sql dumps.
# At the end this script will save the new created & now selected group's name
# as well as it's path to ~/files/group.conf.
#
# This script also get called from ~/scripts/group_choose.sh if you chose to
# create a new group instead of working on existing group projects.
#
# Dependencies:
# /home/pi/files/group.conf
# /home/pi/scripts/usb_mount.sh
#
# Author: Lara Klimm
# Date: 02.05.2016



# path where devices shoud be mounted to
mount_path="/media/USB-TeamBox"
group_conf="/home/pi/files/group.conf"
group=""

exit_status=1



# read new group name
read_name(){
	unique=0
	# read new group name
	until [ "$unique" = "1" ]
	do
		printf "\nPlease enter new group name (submit by pressing ENTER):\n> "
		name=""
		read -e -n 50 name
		if [ -d "${mount_path}/TeamBox/${name}" ]
		then
			printf "Group already exists! Please choose another name!\n\n"
		else
			unique=1
		fi
	done
	group="$name"
	exit_status=0
}

# check if the folder exists (& create the folder on usb storage device)
# param1 : folder path
new_folder(){
        sudo bash /home/pi/scripts/new_folder.sh "$1"

        if [ "$?" = "1" ]
        then
                exit 1
        else
                exit_status=0
        fi
}

# save group name to file /etc/hostapd/group
# param $1 : group name
save_group(){
        if [ ! -e "$group_conf" ]
        then
                sudo touch "$group_conf"
		sleep 0.2
		if [ "$?" = 0 ]
		then
                	sudo chmod 774 "$group_conf"
		else
			printf "Cannot create group config file\n\n" >&2
			exit_status=1
		fi
	fi
	if [ -e "$group_conf" ]
	then
	        sudo echo -e "group=${1}\npath=${mount_path}/TeamBox/${1}" > "$group_conf"
		if [ "$?" = 0 ]
		then
			printf "New group created: $1\n\n"
			exit_status=0
		else
			exit_status=1
		fi
	fi
}





# check if a device is mounted
check_mounted=$(mount | grep "TeamBox")
if [ ! -n "$check_mounted" ]
then
	# try to mount usb
	sudo bash /home/pi/scripts/usb_mount.sh
	if  [ "$?" = 0 ]
	then
		exit_status=0
	else
		exit_status=1
		printf "No USb device is mounted\n\n" >&2
		exit "$exit_status"
	fi
fi

# create TeamBox folder
new_folder "${mount_path}/TeamBox"

if [ -d "${mount_path}/TeamBox" ]
then
	# check for group name parameter
	if [ "$#" = 0 ]
	then
	        # read group name from console
	        read_name
	else
		group="$1"
		if [ -d "${mount_path}/TeamBox/${group}" ]
		then
			printf "This group already exists!\n\n" >&2
			exit_status=1
		else
			exit_status=0
		fi
	fi
	if [ "$exit_status" = 0 ]
	then
		# create group folder
		new_folder "${mount_path}/TeamBox/${group}"
		# create dump folder
		if [ "$exit_status" = 0 ]
		then
			# create .meta folder
			new_folder "${mount_path}/TeamBox/${group}/.meta/"
			# save group (info) to file
			if [ "$exit_status" = 0 ]
			then
				save_group "$group"
				exit_status=0
			else
				exit_status=1
			fi
			# create files folder
			new_folder "${mount_path}/TeamBox/${group}/files"
		else
			exit_status=1
		fi
	fi
else
	exit_status=1
fi



exit $exit_status
