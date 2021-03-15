#!/bin/bash
#
# /home/ubuntu/scripts/group_choose.sh
#
# param $1 : chosen group's name
#
# This skript lets you choose an existing group from a plugged in USB storage
# device to work on that grouop's collaborative work.
# At the beginning it checks if there is any device plugged in to continue.
# If there is the folder TeamBox in it the script will check for it's
# content which is the group folders.
# Now you can choose your group from console by giving an numberor you can
# also choose to create a new one.
# This will call the script ~/scripts/group_create.sh.
# As an alternative xou can also call this script with one parameter which
# is the group's name.
# If the chosen group exists this script will check for the nessecary
# file structure to save sql dumps. Therefor another folder called .meta
# will be created if not already existent.
# At the end the group's name and path to their folder will be written out
# to ~/files/group.conf.
#
# Dependencies:
# /home/ubuntu/files/group.conf
# /home/ubuntu/scripts/usb_mount.sh
#
# Author: Lara Klimm
# Date: 02.05.2016
#
# Edited by Lukas Reichwein
# Date 15.03.2021



# path where devices shoud be mounted to
mount_path="/media/USB-TeamBox"
group_conf="/home/ubuntu/files/group.conf"
group=""

exit_status=1



# read group number from console
read_number(){
	printf "Please choose your group by typing in the number (submit by pressing ENTER):\n"
	count=1
	# list all groups
	for directory in "${directories[@]}"
	do
		printf "\n[$count] $directory"
		count=$((count+1))
	done
	printf "\n----------------------------------\n[0] Create new group\n\n> "
	success=0
	until [ "$success" = 1 ]
	do
		number=""
		read -e -n 10 number
		check_num=$(echo "$number" | grep "[^0-9]")
		if [ -n "$check_num" ]
		then
			printf "\nPlease enter a number!\n> "
		elif [ "$number" -gt "$dir_num" ]
 		then
			printf "\nThis group does not exist!\n> "
		else
			if [ "$number" = 0 ]
			then
				sudo bash /home/ubuntu/scripts/group_create.sh
				success=1
			else
				group="${directories[(($number-1))]}"
				printf "\nSelected group: $group\n\n"
				success=1
			fi
		fi
	done
}

# check if the folder exists (& create the folder on usb storage device)
# param1 : folder path
new_folder(){
        sudo bash /home/ubuntu/scripts/new_folder.sh "$1"
        if [ "$?" = 1 ]
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
                        exit_status=0
                else
                        exit_status=1
                fi
        fi
}


# check if device is mounted
check_mounted=$(mount | grep "TeamBox")
if [ ! -n "$check_mounted" ]
then
	# try to mount usb
	sudo bash /home/ubuntu/scripts/usb_mount.sh
	if ["$?" = 0 ]
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
	if [ "$#" = 0 ]
	then
		if [ ! "$group" = "" ]
		then
			sudo bash /home/ubuntu/scripts/group_create.sh "$group"
			exit_status="$?"
		fi
	else
		exit_status=1
		exit "$exit_status"
	fi
else
	exit_status=0
fi
# check if subfolder contains other folders
directories_str="$(find ${mount_path}/TeamBox -maxdepth 1 -type d | grep -oP '(?<=\/TeamBox\/).*')"
# yeah i've done som hacking here to set the delitimer as newline....
IFS="
"
directories=( $directories_str )
unset IFS
dir_num=${#directories[@]}
if [ "$dir_num" -gt 0 ]
then
	# check for group name parameter
	if [ "$#" = 0 ]
	then
		# choose from console
		read_number
	else
		if [ ! "$1" = "" ]
		then
			group="$1"
			if [ ! -d "${mount_path}/TeamBox/${group}" ]
			then
				printf "This group does not exist!\n\n" >&2
				exit_status=1
			else
				exit_status=0
			fi
		fi
	fi
	# create dump folder if it does not exist
	if [ "$exit_status" = 0 ]
	then
		if [ ! -d "${mount_path}/TeamBox/${group}/.meta" ]
		then
			new_folder "${mount_path}/TeamBox/${group}/.meta"
			if [ "$exit_status" = 0 ]
			then
				save_group
				exit_status=0
			else
				exit_status=1
			fi
		else
			# save group to file
			save_group "$group"
			exit_status=0
		fi
	fi
else
	printf "There are no groups yet! Please create a new one...\n\n"
	sudo bash /home/ubuntu/scripts/group_create.sh
	exit_status="$?"
fi



exit $exit_status
