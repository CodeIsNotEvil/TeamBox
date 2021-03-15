#!/bin/bash
#
# /home/pi/scripts/usb_check_free.sh
#
# This script checks the usb storagde device's free space
#
# Author: Lara Klimm
# Date: 22.07.2016


group_conf="/home/pi/files/group.conf"
teambox_path="/media/USB-TeamBox/TeamBox"


size=$(df -h | grep "TeamBox" | sed 's/\s\s*/ /g' | cut -d " " -f 2)
size_comp=$(df | grep "TeamBox" | sed 's/\s\s*/ /g' | cut -d " " -f 2)
used=$(df -h | grep "TeamBox" | sed 's/\s\s*/ /g' | cut -d " " -f 3)
used_perc=$(df -h | grep "TeamBox" | sed 's/\s\s*/ /g' | cut -d " " -f 5 | cut -d "%" -f 1)
free=$(df -h | grep "TeamBox" | sed 's/\s\s*/ /g' | cut -d " " -f 4)
free_perc=$((100-$used_perc))

printf "size:\t\t$size\n"
printf "free:\t\t$free\t = $free_perc%%\n"
printf "used:\t\t$used\t = $used_perc%%\n"

if [ ! -d "$teambox_path" ]
then
	printf "No TeamBox folder!\n"
else
	teambox=$(du -sh "$teambox_path" | sed 's/\s\s*/ /g' | cut -d " " -f 1)
	teambox_comp=$(du -s "$teambox_path" | sed 's/\s\s*/ /g' | cut -d " " -f 1)
	teambox_perc=$(awk "BEGIN {print $teambox_comp"/"$size_comp"})
	printf "TeamBox:\t$teambox\t = $teambox_perc%%\n"
fi

#if [ -f "$group_conf" ]
#then
#	check_path=$(cat "$group_conf" | grep -oP "(?<=path\=).*")
#	if [ -z "$check_path" ]
#	then
#		printf "No group selected!\n" >&2
#
#	else
#		group=$(du -sh "$check_path" | sed 's/\s\s*/ /g' | cut -d " " -f 1)
#		group_comp=$(du -s "$check_path" | sed 's/\s\s*/ /g' | cut -d " " -f 1)
#		group_perc=$(awk "BEGIN {print $group_comp"/"$size_comp"})
#		printf "group:\t\t$group\t = $group_perc%%\n"
#	fi
#fi


exit 0

