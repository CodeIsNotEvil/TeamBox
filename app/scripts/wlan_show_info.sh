#!/bin/bash
#
# /home/ubuntu/app/scripts/wlan_show_info.sh
#
# This script shows all information about the access point
#
# Dependencies:
# wlan_show_ssid.sh
# wlan_show_psk.sh
# wlan_show_url.sh
# wlan_show_ip.sh
#
# Author: Lara Klimm
# Date: 04.08.2016
#
# Edited by Lukas Reichwein
# Date 15.03.2021

# get the parent path and cd to it.
# this assures that we alway have te right paths if we use relatives
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

printf "\n--------------------------------------------------"
printf "\nSSID: \t"
sudo bash wlan_show_ssid.sh
printf "\nURL: \t"
sudo bash wlan_show_url.sh
printf "\nIP: \t"
sudo bash wlan_show_ip.sh
printf "\n--------------------------------------------------\n"

exit 0
