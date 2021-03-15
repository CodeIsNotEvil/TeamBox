#!/bin/bash
#
# /home/pi/scripts/etherpad_export.sh
#
# This scripts exports all the pads to a .txt on the usb storage device (into
# /files/)
#
# Author: Lara Klimm
# Date: 15.06.2016


group_conf="/home/pi/files/group.conf"
group_path=$(cat "$group_conf" | grep -oP "(?<=path\=).*")
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

# save etherpad text ad .txt file
# param1: name of pad
save_text(){
	curl -s -o "${group_path}/files/texts/${1}.txt" "http://localhost:9001/p/${1}/export/txt" >/dev/null
	exit_status="$?"
	if [ "$exit_status" = 0 ]
	then
		printf "Saved pad ${1}\n"
	else
		printf "Could not save pad ${1}!\n"
	fi
}


# create nessecary folders
new_folder "${group_path}/files/"
new_folder "${group_path}/files/texts"

if [ "$exit_status" = 0 ]
then
	# get all pads
	pads_str=$(mysql -u"$user" -p"$password" -hlocalhost <<EOF
use etherpadLite;
SELECT s.key FROM store as s;
EOF
	)


IFS="
"
	pads_all=( $pads_str )
	pads=()
	pads+=""

	unset IFS;
	for pad in "${pads_all[@]}"
	do
		pad=$(echo "$pad" | grep  -oP "(?<=^pad:)[^:]*")
		if [ -n "$pad" ]
		then
			if [ ! "${pads[${#pads[@]}-1]}" = "$pad" ]
			then
				pads[${#pads[@]}]="$pad"
	echo $pad
				save_text "$pad"
			fi
		fi
	done
fi

exit "$exit_status"


