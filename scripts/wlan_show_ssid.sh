#!/bin/bash
#
# /home/pi/scripts/wlan_show_ssid.sh
#
# This script shows ssid for hostapd access point from
#/etc/hostapd/hostapd.conf on console.
#
# Dependencies:
# /etc/hostapd/hostapd.conf
#
# Author: Lara Klimm
# Date: 03.05.2016

hostapd_path="/etc/hostapd/hostapd.conf"

printf "$(grep -oP '(?<=^ssid\=).*' $hostapd_path)"

exit 0
