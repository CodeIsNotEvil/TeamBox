#!/bin/bash
#
# /home/ubuntu/app/scripts/group_name.sh
#
# This script will delete group info in ~/files/group.conf.
#
# Dependencies:
# /home/ubuntu/files/group.conf
#
# Author: Lara Klimm
# Date: 30.05.2016
#
# Edited by Lukas Reichwein
# Date 15.03.2021


group_conf="/home/ubuntu/files/group.conf"


# check if a group is selected
if [ ! -f "$group_conf" ]
then
	sudo touch "$group_conf"
	exit 1
	sudo chmod 775 "$group_conf"
fi

if [ -f "$group_conf" ]
then
	echo "" > "$group_conf"
	exit 0
fi

