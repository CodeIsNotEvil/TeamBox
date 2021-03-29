#!/bin/bash
#
# /home/pi/scripts/wlan_set_random_ssid.sh
#
# This script generates a random wlan ssid as a combination of 4 words.
# Therefor it chooses a random word from every file in
# ~/files/generate_ssid_words and concatenates them (and the word TeamBox).
# This random name is written to the hostapd configuration file
# /etc/hostapd/hostapd.conf.
# This scrip gets called when the hostapd service is started.
#
# Dependencies:
# /etc/init.d/hostapd
# /home/pi/files/generate_ssid_words/verb
# /home/pi/files/generate_ssid_words/adverb
# /home/pi/files/generate_ssid_words/adjective
# /etc/hostapd/hostapd.conf
#
# Author: Lara Klimm
# Date: 03.05.2016


hostapd_path="/etc/hostapd/hostapd.conf"
verb_path="/home/pi/files/generate_ssid_words/verb"
adverb_path="/home/pi/files/generate_ssid_words/adverb"
adjective_path="/home/pi/files/generate_ssid_words/adjective"

# generate random ssid
# ssid: TeamBox-*6-random-characters*
#ssid="TeamBox-"$(openssl rand -base64 6)
# ssid: TeamBox *random-verb* *random-adverb* *random-adjective* from /home/pi/files/generate_random_ssid/*
word1=$(awk "NR==$(shuf -i 1-$(wc -l < "$verb_path") -n 1)" "$verb_path")
word2=$(awk "NR==$(shuf -i 1-$(wc -l < "$adverb_path") -n 1)" "$adverb_path")
word3=$(awk "NR==$(shuf -i 1-$(wc -l < "$adjective_path") -n 1)" "$adjective_path")

ssid=TeamBox" "$word1" "$word2" "$word3

# edit hostapd.conf
sed -i "s/^ssid\=.*$/ssid=$ssid/" "$hostapd_path"
printf "\nSSID: $ssid\n\n"

exit $?
