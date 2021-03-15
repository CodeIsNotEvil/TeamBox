#!/bin/bash
#
# /home/ubuntu/scripts/wlan_show_info.sh
#
# This script shows all information about the access point
#
# Dependencies:
# /home/ubuntu/scripts/wlan_show_ssid.sh
# /home/ubuntu/scripts/wlan_show_psk.sh
# /home/ubuntu/scripts/wlan_show_url.sh
# /home/ubuntu/scripts/wlan_show_ip.sh
#
# Author: Lara Klimm
# Date: 04.08.2016
#
# Edited by Lukas Reichwein
# Date 15.03.2021


printf "\n--------------------------------------------------"
printf "\nSSID: \t"
sudo bash /home/ubuntu/scripts/wlan_show_ssid.sh
# printf "\nPSK: \t"
# sudo bash /home/ubuntu/scripts/wlan_show_psk.sh
printf "\nURL: \t"
sudo bash /home/ubuntu/scripts/wlan_show_url.sh
printf "\nIP: \t"
sudo bash /home/ubuntu/scripts/wlan_show_ip.sh
printf "\n--------------------------------------------------\n"

exit 0
