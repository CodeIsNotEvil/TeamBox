#!/bin/bash
#
# /home/ubuntu/scripts/wlan_start.sh
#
# This script starts NetworkManager with a random generated pre shared key & ssid.
# If hostapd service is already running it restarts the service.
# It also shows nessecary information on console (psk, ssid, ip, url) after
# they have been edited by the corresponding scripts calles by hostapd.service.
#
# Dependencies:
# /home/ubuntu/scripts/wlan_show_info.sh
# Indirect dependencies:
# /home/ubuntu/scripts/wlan_set_random_ssid.sh
# /home/ubuntu/wlan_shwo_random_ssid.sh
# /home/ubuntu/wlan_shwo_ip.sh
#
# Author: Lara Klimm
# Date: 25.04. 2016
#
# Edited by Lukas Reichwein
# Date 15.03.2021



color_red="\033[00;31m"
color_white="\033[00;00m"

exit_status=1;


if [ "$?" = "0" ]
# try to start access point
then
	# check if service is already active
	network_manager_status=$(sudo service NetworkManager status | grep -oP "(?<=Active:\ )[^\ ]*(?=\ )")
	if [ "$network_manager_status" = "active" ]
	# restart NetworkManager service
	then
		sudo service NetworkManager restart
		sleep 5
		network_manager_status_all=$(sudo service NetworkManager status | grep -oP "(?<=Active:\ )[^\ ]*[\ ][^\ ]*(?=\ )")
                if [ "$network_manager_status_all" = "active (running)" ]
                then
                        printf "Access point has been restarted\n"
			exit_status=0
                else
                        printf "Could not restart access point!\n" >&2
                        exit_status=1
			exit "$exit_status"
		fi
	# start service
	else
		sudo service NetworkManager start
		sleep 5
		network_manager_status_all=$(sudo service NetworkManager status | grep -oP "(?<=Active:\ )[^\ ]*[\ ][^\ ]*(?=\ )")
		if [ "$network_manager_status_all" = "active (running)" ]
		then
			printf "Access point has been started\n"
			exit_status=0
		else
			printf "Could not start access point!\n" >&2
			exit_status=1
			exit "$exit_status"
		fi
	fi
	# show info
#	sudo bash /home/ubuntu/scripts/wlan_show_info.sh

# error if there ist no device
else
	printf "${color_red}No USB storage devices mounted!\nCannot start access point!${color_white}\n\n"
fi

exit "$exit_status"
