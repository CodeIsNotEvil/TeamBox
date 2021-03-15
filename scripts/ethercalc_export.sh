#!/bin/bash
#
# /home/pi/scripts/ethercalc_export.sh
#
# This scripts exports all the calc to a .xlsx on the usb storage device (into
# /files/)
#
# Author: Lara Klimm
# Date: 13.07.2016


dump_path="/home/pi/dump.json"
group_conf="/home/pi/files/group.conf"
group_path=$(cat "$group_conf" | grep -oP "(?<=path\=).*")

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

# save ethercalc text ad .xlsx file
# param1: name of pad
save_table(){
	curl -s -o "${group_path}/files/tables/${1}.xlsx" "http://localhost:8000/_/${1}/xlsx" >/dev/null
	exit_status="$?"
	if [ "$exit_status" = 0 ]
	then
		printf "Saved table ${1}\n"
	else
		printf "Could not save table ${1}!\n"
	fi
}


# create nessecary folders
new_folder "${group_path}/files/"
new_folder "${group_path}/files/tables"

if [ "$exit_status" = 0 ]
then
	calcs_str=$(cat /home/pi/dump.json | grep -oP "(?<=chat\-)[^\"]*(?=\_formdata)")
IFS="
"
        calcs_all=( $calcs_str )
        calcs=()
        calcs+=""

        unset IFS;
	for calc in "${calcs_all[@]}"
	do
		save_table "$calc"
	done
fi

exit "$exit_status"


