#!/bin/bash
#
# /home/ubuntu/scripts/mysql_import.sh
#
# This script will import sql dumps that are stored on a USB storage device.
# At first it will check if any device is mounted and then it will read the
# group's name and path from ~/files/group.conf.
# If there are any dumps in der group's folder it will choose the latest one
# to import to the database TeamBox.
# If there are no dumps for the selected group this script will import an empty
# database from dump ~/files/TeamBox_emptyDB.sql.
#
# Dependencies:
# /home/ubuntu/files/group.conf
# /home/ubuntu/files/TeamBox_emptyDB.sql
# /home/ubuntu/files/etherpadLite_emptyDB.sql
# /home/ubuntu/scripts/usb_mount.sh
#
# Author: Lara Klimm
# Date: 02.05.2016
#
# Edited by Lukas Reichwein
# Date 15.03.2021


group_conf="/home/ubuntu/files/group.conf"
empty_db_path="/home/ubuntu/files/"
user="TeamBox"
password="yourPassword"

exit_status=1


# import database from usb (group folder)
# param $1 : database to import
function import_DB(){
	# get all dumps
	dumps_str=$(find "${dump_path}" -maxdepth 1 -type f | grep -oP "${1}_[0-9]{10}\.sql")
	dumps=( $dumps_str )
	dumps_num=${#dumps[@]}
	# check if there are any dumps
	if [ "$dumps_num" -gt 0 ]
	then
		# get latest dump
		latest_dump=${dumps[(($dumps_num-1))]}
		# import
		mysql --user="$user" --password="$password" "$1" < "${dump_path}${latest_dump}"
		if [ "$?" = 0 ]
		then
			exported_dump="$latest_dump"
			exit_status=0
		else
			printf "Could not import latest dump! Trying to import backup file..." >&2
			if [ "$dumps_num" -gt 1 ]
			then
				# import second dump
				nd_latest_dump=${dumps[(($dumps_num-2))]}
				mysql --user="$user" --password="$password" "$1" < "${dump_path}${nd_latest_dump}"
				if [ "$?" = 0 ]
				then
					exported_dump="$nd_latest_dump"
					exit_status=0
				else
					if [ "$dumps_num" -gt 2 ]
					then
						# import third dump
						rd_latest_dump=${dumps[(($dumps_num-3))]}
						mysql --user="$user" --password="$password" "$1" < "${dump_path}${rd_latest_dump}"
						exported_dump="$rd_latest_dump"
						exit_status="$?"
					else
						exit_status=1
					fi
				fi
			else
				exit_status=1
			fi
		fi
		if [ "$exit_status" = 0 ]
		then
			printf "Imported database $1\n"
		else
			printf "Could not import database $1!\n" >&2
		fi
	else
		printf "There are no ${1} sql dumps for this group yet!\n"
		# import an empty table
		mysql --user="$user" --password="$password" "$1" < "${empty_db_path}${1}_emptyDB.sql"
		exit_status="$?"
		if [ "$exit_status" = 0 ]
		then
			printf "Copied empty database\n"
		fi
	fi

}


# check if an usb storage device is mounted
check_mounted=$(mount | grep "TeamBox")
if [ -z "$check_mounted" ]
then
	# try to mount usb
	sudo bash /home/ubuntu/scripts/usb_mount.sh
	if [ "$?" = 0 ]
	then
		exit_status=0
	else
		printf "\nNo USB storage device mounted - try to cannot import data structure!\n" >&2
		exit_status=1
		exit exit_status
	fi
fi

# check if a group is selected
if [ -f "$group_conf" ]
then
	check_group=$(cat "$group_conf" | grep -oP "(?<=group\=).*")
	if [ -z "$check_group" ]
	then
		printf "No group selected - cannot import data structure!\n" >&2
		exit 1
	fi

	group_path=$(cat "$group_conf" | grep -oP "(?<=path\=).*")
	dump_path="${group_path}/.meta/"

	# check if there is a .meta folder & sql dumps in it
	if [ ! -d "${dump_path}" ]
	then
		sudo mkdir "${dump_path}"
		if [ "$?" = 0 ]
		then
			sudo chmod -R 775 "${dump_path}"
			exit_status=0
		else
			exit_status=1
			exit "$exit_status"
		fi
	fi
	# import databases
	import_DB "TeamBox"
	import_DB "etherpadLite"
	# import_DB "collabtive" replaced with WEKAN wich uses MongoDB as it's Database.

	# call scripts to synchronise json dump & data folders
	sudo bash /home/ubuntu/scripts/json_sync.sh
	sudo bash /home/ubuntu/scripts/folder_sync.sh
else
	printf "Configuration file does not exist!\n" >&2
	exit_status=1
fi


exit "$exit_status"
