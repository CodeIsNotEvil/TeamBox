#!/bin/bash
#
# /home/ubuntu/app/scripts/folder_sync.sh
#
# This script will synchronize the data folders on the usb storage
# device. It simply creates a link to a folder file in the group's folder.
# This is called on mysql_import.
#
# Dependencies:
# /home/ubuntu/files/group.conf
#
# Author: Lara Klimm
# Date: 20.06.2016

# get the parent path and cd to it.
# this assures that we alway have te right paths if we use relatives
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

group_conf="/home/ubuntu/files/group.conf"
group_path=$(cat "$group_conf" | grep -oP "(?<=path\=).*")

exit_status=1



# create/copy the folder on usb storage device
# param1: create new empty folder [0] / copy (not really) empty folder [1]
# param2 : folder destination
# param3 : folder path (source)
new_folder(){
	# if folder to link does not exist...
	if [ ! -d "$2" ]
	then
		if [ "$1" = 1 ]
		then
			# copy folder
		        sudo cp -R "$3" "$2"
			exit_status="$?"
		        if [ "$exit_status" = 0 ]
		        then
		                sudo chmod -R 775 "$2"
		        else
		                printf "Could not copy ${3}!\n" >&2
		        fi
		else
			sudo bash new_folder.sh "$2"
			exit_status="$?"
		fi
	fi
}


# synchronize (link) the folder
# param1 : application name
# param2 : target folder
# param3 : path to link
# param4 : create new empty folder [0] / copy (not really) empty folder [1]
# param5 : name of empty folder
sync_folder(){
	# create data folder if it does not exist
	if [ ! -e "$2" ]
	then
		printf "There are no ${1} files for this group yet! Copying empty folder...\n"
		new_folder "$4" "$2" "$5"
	else
		exit_status=0
	fi

	if [ "$exit_status" = 0 ]
	then
		# synchronize (link) the folder
		if [ -e "$3" ]
		then
			sudo rm "$3" >/dev/null
			if [ "$?" = 1 ]
			then
				sudo rm -R "$3"
			fi
		fi
		sudo ln -sf "$2" "$3"
	        if [ "$?" = 0 ]
		then
			printf "Created link for ${1} folder\n"
			exit_status=0
		else
	                printf "Could not link ${1} folder!\n" >&2
	                exit_status=1
	        fi
	fi
}


if [ -z "$group_path" ]
then
	printf "No group chosen - cannot synchronize!\n">&2
	exit 0
fi

# check if files folder exists (& create it)
if [ ! -e "${group_path}/files/" ]
then
	printf "Creating folder files/...\n"
	sudo mkdir "${group_path}/files/"
	exit_status="$?"
	if [ "$exit_status" = 0 ]
	then
		sudo chmod 775 "${group_path}/files/"
	else
		printf "Could not create folder files/!\n"
		exit "$exit_status"
	fi
fi


# create some new folders for later exports
new_folder 0 "${group_path}/files/texts"
new_folder 0 "${group_path}/files/tables"

# copy mindmap files
mindmaps_data_path="/var/www/html/app/screenshots"
sync_folder "mindmaps" "${group_path}/files/mindmaps" "$mindmaps_data_path" 0

# copy drawing files
drawings_data_path="/var/www/html/app/drawings"
sync_folder "drawings" "${group_path}/files/drawings" "$drawings_data_path" 0

# copy collabtive files
# collabtive_data_path="/var/www/html/collabtive/files"
# collabtive_empty_path="/home/pi/files/collabtive_data_emptyFolder/"
# sync_folder "collabtive" "${group_path}/.meta/" "$collabtive_data_path" 1 "$collabtive_empty_path"

# copy bozon files
# bozon_data_path_uploads="/var/www/html/bozon/uploads/TeamBox"
# bozon_data_path_thumbs="/var/www/html/bozon/thumbs/uploads/TeamBox"
# bozon_empty_thumbs_path="/home/pi/files/bozon_data_emptyFolder/TeamBox_thumbs/"
#sync_folder "bozon uploads" "${group_path}/files/uploads" "$bozon_data_path_uploads" 0
# sync_folder "bozon uploads" "${group_path}/files" "$bozon_data_path_uploads" 0
# sync_folder "bozon thumbs" "${group_path}/.meta/bozon_thumbs" "$bozon_data_path_thumbs" 1 "$bozon_empty_thumbs_path"


exit "$exit_status"

