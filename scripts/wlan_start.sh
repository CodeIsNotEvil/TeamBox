#!/bin/bash
#
# /home/pi/scripts/wlan_start.sh
#
# This script starts hostapd with a random generated pre shared key & ssid.
# At first it checks if the dhcp server is running and start it if not active.
# If hostapd service is already running it restarts the service.
# It also shows nessecary information on console (psk, ssid, ip, url) after
# they have been edited by the corresponding scripts calles by hostapd.service.
#
# Dependencies:
# /etc/init.d/hostapd
# /etc/init.d/isc-dhcp-server
# /home/pi/scripts/wlan_show_info.sh
# Indirect dependencies:
# /home/pi/scripts/wlan_set_random_psk.sh
# /home/pi/scripts/wlan_set_random_ssid.sh
# /home/pi/wlan_shwo_random_psk.sh
# /home/pi/wlan_shwo_random_ssid.sh
# /home/pi/wlan_shwo_ip.sh
#
# Author: Lara Klimm
# Date: 25.04. 2016



color_red="\033[00;31m"
color_white="\033[00;00m"

exit_status=1;


if [ "$?" = "0" ]
# try to start access point
then
#	printf "\n---------------------------------------------\n\n"
	# check if dhcp server ist running
	dhcp_status=$(sudo service dhcpcd status | grep -oP "(?<=Active:\ )[^\ ]*(?=\ )")
	if [ "$dhcp_status" = "inactive" ]
	then
		sudo service dhcpcd start
		sleep 5
	fi
	if [ "$dhcp_status" = "inactive" ]
	then
		printf "{color_red}DHCP server is not running/could not be started!${color_white}\n\n"
		exit_status=1
		exit "$exit_status"
	else
		exit_status=0
	fi
	# check if service is already active
	hostapd_status=$(sudo service hostapd status | grep -oP "(?<=Active:\ )[^\ ]*(?=\ )")
	if [ "$hostapd_status" = "active" ]
	# restart hostapd service
	then
		sudo service hostapd restart
		sleep 5
		hostapd_status_all=$(sudo service hostapd status | grep -oP "(?<=Active:\ )[^\ ]*[\ ][^\ ]*(?=\ )")
                if [ "$hostapd_status_all" = "active (running)" ]
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
		sudo service hostapd start
		sleep 5
		hostapd_status_all=$(sudo service hostapd status | grep -oP "(?<=Active:\ )[^\ ]*[\ ][^\ ]*(?=\ )")
		if [ "$hostapd_status_all" = "active (running)" ]
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
#	sudo bash /home/pi/scripts/wlan_show_info.sh

# error if there ist no device
else
	printf "${color_red}No USB storage devices mounted!\nCannot start access point!${color_white}\n\n"
fi

exit "$exit_status"
