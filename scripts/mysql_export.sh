#!/bin/bash
#
# /home/pi/scripts/mysql_export.sh
#
# This script exports sql dumps that are stored on a USB storage device to
# the folder .meta.
# At first it will check if any device is mounted an then read the selected
# group and their path from the file ~/files/group.conf.
# If there are any dumps in the groups's subfolder .meta this script will
# export the current dump from the database TeamBox and will also keep the
# latest 4 dumps for backup.
#
# Dependencies:
# /home/pi/files/group.conf
# /home/pi/scripts/usb_mount.sh
# /home/pi/scripts/etherpad_save.sh
#
# Author: Lara Klimm
# Date: 02.05.2016



group_conf="/home/pi/files/group.conf"
group_path=$(cat "$group_conf" | grep -oP "(?<=path\=).*")
dump_path="${group_path}/.meta/"
user="TeamBox"
password="PasswdForTeamBox"

exit_status=1


# check if the folder exists (& create the folder on usb storage device)
# param1 : folder path
new_folder(){
        sudo bash /home/pi/scripts/new_folder.sh "$1"
        if [ "$?" = 1 ]
        then
                exit 1
        else
                exit_status=0
        fi
}


# export database to usb (group folder)
# param $1 : database to export
export_DB(){
	dumps_str=$(find "${dump_path}" -maxdepth 1 -type f | grep -oP "${1}_[0-9]{10}\.sql")
	dumps=( $dumps_str )
	dumps_num=${#dumps[@]}
	# export
	date=$(date +%s)
	mysqldump --user="$user" --password="$password" "$1" > "${dump_path}${1}_${date}.sql"
	if [ "$?" = 0 ]
	then
		printf "Exported database $1 to $group_path\n"
		exit_status=0
		if [ "$dumps_num" -gt 0 ]
		then
			# check if there are any changes (& delete the older same one)
			latest_dump=${dumps[(($dumps_num-1))]}
			changes=$(cmp "${dump_path}${latest_dump}" "${dump_path}${1}_${date}.sql")
			if [ -z "$changes" ]
			then
				printf "No changes made, deleting older one..."
				sudo rm "${dump_path}${latest_dump}"
			fi
			# delete old dumps
			for dump in "${dumps[@]}"
			do
				if [ "$dumps_num" -gt 3 ]
				then
					# delete old dumps
					sudo rm "${dump_path}$dump"
					dumps_num=$((dumps_num-1))
				fi
			done
		fi
	else
		printf "Could not export database $1!\n" >&2
		exit_status=1
	fi
}



# check if an usb storage device is mounted
check_mounted=$(mount | grep "TeamBox")
if [ -z "$check_mounted" ]
then
	# try to mount usb
	sudo bash /home/pi/scripts/usb_mount.sh
	if [ "$?" = 0 ]
	then
		exit_status=0
	else
		printf "\nNo USB storage device mounted - cannot export data structure!\n" >&2
		exit_status=1
		exit "$exit_status"
	fi
fi

# check if a group is selected
check_group=$(cat "$group_conf" | grep -oP "(?<=group\=).*")
if [ -z "$check_group" ]
then
	printf "No group selected - cannot export data structure!\n" >&2
	exit_status=1
	exit "$exit_status"
fi


# create .meta folder
new_folder "$dump_path"

# export databases
export_DB "TeamBox"
export_DB "etherpadLite"
export_DB "collabtive"

# call script to save etherpads
sudo bash /home/pi/scripts/etherpad_export.sh &
sudo bash /home/pi/scripts/ethercalc_export.sh &



exit "$exit_status"
