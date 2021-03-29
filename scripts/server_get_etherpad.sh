#!/bin/bash
#
# /home/ubuntu/app/scripts/server_get_etherpad.sh
#
#
# This scripts gets all the pads from etherpad's database
#
# Author: Lara Klimm
# Date: 15.06.2016


user="TeamBox"
password="yourPassword"
#user="root"
#password="TeamBoxNeedsSomeSQL!"

pads_str=$(mysql -u"$user" -p"$password" -hlocalhost << EOF
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
			echo "$pad"
		fi
	fi
done

exit 0


