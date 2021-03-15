#!/bin/bash
#
# /home/pi/scripts/wlan_set_random_psk.sh
#
# This script generates a random pre shared key for the hostapd acess point
# and writes this to /etc/hostapd/hostapd.wpa_psk which will be read from
# /etc/hostapd/hostapd.conf.
# This script get called when the hostapd service is started.
#
# Dependencies:
# /etc/init.d/hostapd
# /etc/hostapd/hostapd.wpa_psk
#
# Author: Lara Klimm
# Date: 03.05.2016



psk_path="/etc/hostapd/hostapd.wpa_psk"

# create config file if it does not exist
if [ ! -f "$psk_path" ]
then
	sudo touch "$psk_path"
fi
# generate random psk

# really easy 5 digit pin (doesn work with IEEE!!!)
#psk=$(echo $((RANDOM % 10)))$(echo $((RANDOM % 10)))$(echo $((RANDOM % 10)))$(echo $((RANDOM % 10)))$(echo $((RANDOM % 10)))
# way more complicated 12 char long password including upper case, lower case & special chars as well as numbers
#psk=$(openssl rand -base64 12)
# easier 9 char long password containing only lower case chars & numbers (with at least one char at beginning & one number at end)
#psk=$(cat /dev/urandom | tr -dc 'a-z' | fold -w 1 | head -n 1)$(cat /dev/urandom | tr -dc 'a-z0-9' | fold -w 6 | head -n 1)$(echo $((RANDOM % 10)))

# password containing 4 chars & 4 numbers
psk=$(cat /dev/urandom | tr -dc 'a-z' | fold -w 4 | head -n 1)$(cat /dev/urandom | tr -dc '0-9' | fold -w 4 | head -n 1)
echo $psk
# write to hostapd.conf
sudo echo "00:00:00:00:00:00" $psk > "$psk_path"

exit $?
