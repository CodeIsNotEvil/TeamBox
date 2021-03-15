#!/bin/bash
#
# /home/ubuntu/scripts/wlan_show_ssid.sh
#
# This script shows ssid for hostapd access point from
# /etc/netplan/*.yaml on console.
#
# Dependencies:
# /etc/netplan/*.yaml
#
# Author: Lara Klimm
# Date: 03.05.2016
#
# Edited by Lukas Reichwein
# Date 15.03.2021


netplan_conf_path="/etc/netplan/*.yaml"

printf "$(grep -oP '(?!\s*")(\w*\s)*(\w)*(?=":)' $netplan_conf_path)"

exit 0
