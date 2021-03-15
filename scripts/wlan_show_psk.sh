#!/bin/bash
#
# /home/pi/scripts/wlan_show_psk.sh
#
# This script shows the pre shared key for hostapd access point from
# /etc/hostapd/hostapd.wpa_psk on console.
#
# Dependencies:
# /etc/hostapd/hostapd.wpa_psk
#
# Author: Lara Klimm
# Date: 03.05.2016


hostapd_path="/etc/hostapd/hostapd.wpa_psk"

printf "$(cut -d' ' -f2 < $hostapd_path)"

exit 0
