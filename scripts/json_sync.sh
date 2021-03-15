#!/bin/bash
#
# /home/ubuntu/scripts/json_sync.sh
#
# This script will synchronize the json dump for ethercalc on the usb storage
# device. It simply creates a link to a dump file in the group's folder.
# This is called on mysql_import.
#
# Dependencies:
# /home/ubuntu/files/group.conf
#
# Author: Lara Klimm
# Date: 10.06.2016
#
# Edited by Lukas Reichwein
# Date 15.03.2021


group_conf="/home/ubuntu/files/group.conf"
group_path=$(cat "$group_conf" | grep -oP "(?<=path\=).*")
dump_path="${group_path}/.meta/"
ethercalc_link_path="/home/ubuntu/dump.json"

exit_status=1


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


# create a symbolic link to a file
# param1 : original target file
# param2 : copy destination of target file
# param3 : path to link
link_file(){
        # copy old dump for new dump file
	sudo cp "$1" "$2"
	exit_status="$?"
	if [ "$exit_status" = 0 ]
	then
		# create link
		if [ -e "$3" ]
		then
			sudo rm "$3"
		fi
		sudo ln -sf "$2" "$3"
		exit_status="$?"
		if [ "$exit_status" = 0 ]
		then
			synced_dump="$2"
		fi
	else
		printf "Could not multiply latest dump!\n"
	fi

}


# synchronize (link) the file
# param1 : target file (without date extension)
# param2 : path to link
sync_file(){
	# get all dumps
	dumps_str=$(find "${dump_path}" -maxdepth 1 -type f | grep -oP "${1}_[0-9]{10}\.json")
	dumps=( $dumps_str )
	dumps_num=${#dumps[@]}
	# check if there are any dumps
	#date=$(date +%y%m%d_%H%M%S)
	date=$(date +%s)
	new_dump="${1}_${date}.json"
	# touch file if no dump exists
	if [ ! "$dumps_num" -gt 0 ]
	then
	        printf "There are no ${1} dumps for this group yet!\n"
	        # create new dump file
		sudo touch "${dump_path}${new_dump}"
	        exit_status="$?"
		if [ "$?" = 0 ]
		then
			printf "Copied empty json dump\n"
			sudo chmod 775 "${dump_path}${new_dump}"
		fi
	fi
	if [ "$dumps_num" -gt 0 ]
	then
		# synchronize dump
	        # get latest dump
	        latest_dump=${dumps[(($dumps_num-1))]}
	        # copy dump
		link_file "${dump_path}${latest_dump}" "${dump_path}${new_dump}" "$2"
	fi
	if [ "$exit_status" = 1 ]
	then
		# if snchronizing fails: try to sync one of the oder dumps
		# synchronize second dump
		if [ "$dumps_num" -gt 1 ]
		then
			nd_latest_dump=${dumps[(($dumps_num-2))]}
			# copy & link
		        link file "${dump_path}${nd_latest_dump}" "${dump_path}${new_dump}" "$2"
		        if [ "$exit_status" = 1 ]
			then
				# synchronize third dump
		                if [ "$dumps_num" -gt 2 ]
        		        then
                		        rd_latest_dump=${dumps[(($dumps_num-3))]}
                		        # copy & link
                		        link_file "${dump_path}${rd_latest_dump}" "${dump_path}${new_dump}" "$2"
				fi
			fi
		fi
	fi
	if [ "$exit_status" = 0 ]
	then
	        printf "Synchronized ${1}\n"
		exit_status=0
		for dump in "${dumps[@]}"
		do
	                if [ "$dumps_num" -gt 3 ]
	               	then
	               	        # delete old dumps
	               	        sudo rm "${dump_path}${dump}"
	               	        dumps_num=$((dumps_num-1))
	               	fi
	        done
	else
	        printf "Could not link ${1} dump!\n" >&2
	        exit_status=1
	fi
}


if [ -z "$group_path" ]
then
	printf "No group chosen - cannot synchronize!\n">&2
	exit 0
fi

# create .meta folder
new_folder "$dump_path"
# snchronizy dump
sync_file "ethercalcDump" "$ethercalc_link_path"

exit "$exit_status"
