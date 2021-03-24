#!/bin/bash
#
# /home/ubuntu/app/scripts/server_get_ethercalc.sh
#
#
# This scripts gives all the calcs stored in the ethercalc dump.
#
# Author: Lara Klimm
# Date: 15.06.2016


dump_path="/home/ubuntu/dump.json"

calcs=$(cat /home/ubuntu/dump.json | grep -oP "(?<=chat\-)[^\"]*(?=\_formdata)")

echo "$calcs"


exit 0


