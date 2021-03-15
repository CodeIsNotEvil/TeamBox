#!/bin/bash
#
# /home/ubuntu/scripts/new_folder.sh
#
# Create a new folder and set permissions
# param1 : folder destination
# param2 : owner
#
#
# Author: Lara Klimm
# Date: 04.08.2016



exit_status=1


# if folder to link does not exist...
if [ -n "$1" ]
then
	if [ ! -d "$1" ]
	then
		# create new folder
		sudo mkdir "$1"
		exit_status="$?"
		if [ "$exit_status" = 0 ]
		then
			sudo chmod -R 777 "$1"
			if [ -n "$2" ]
			then
				sudo chown -R "$2":"$2" "$1"
			fi
		else
			printf "Could not create ${1}!\n">&2
		fi
	else
		exit_status=0
	fi
else
	sudo chmod -R 777 "$1"
	if [ -n "$2" ]
	then
		sudo chown -R "$2":"$2" "$1"
	fi
fi


exit "$exit_status"

