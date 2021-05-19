
#!/bin/bash
#
# /home/ubuntu/app/scripts/server_start.sh
#
#
# This scripts starts nodejs applications on ports 3000, 8000 & 9001 if they
# are not already running.
#
# Author: Lara Klimm
# Date: June 15th 2016
#
# Edited by Lukas Reichwein
# Date 15.03.2021

# get the parent path and cd to it.
# this assures that we alway have te right paths if we use relatives
# parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
parent_path=$( cd "$(dirname "$0")" ; pwd -P )
cd "$parent_path"
printf "parent path:\n$parent_path"

# start own NodeJs app on port 3000
app=$(netstat -lt | grep "3000")
if [ -z "$app" ]
then
	cd /home/ubuntu/
	sudo -H -u root node app/server.js &
	printf "\nStarted app"
	cd "$parent_path"
else
	printf "\nApp is already running"
fi

# start etherpadLite on port 9001
etherpad=$(netstat -lt | grep "9001")
if [ -z "$etherpad" ]
then
	sudo -H -u ubuntu bash -c /home/ubuntu/etherpad-lite/bin/fastRun.sh &
	printf "\nStarted etherpad"
else
	printf "\nEtherpad is already running"
fi

# start ethercalc on port 8000
ethercalc=$(netstat -lt | grep "8000")
if [ -z "$ethercalc" ]
then
	# first change directory (to save dump in ubuntu's home)
	cd /home/ubuntu
	sudo -H -u root bash -c ethercalc &
	printf "\nStarted ethercalc"
else
	printf "\nEthercalc is already running"
fi

#filebrowser_status=$(sudo service filebrowser status | grep -oP "(?<=Active:\ )[^\ ]*(?=\ )")
#	if [ "$filebrowser_status" = "active" ]
#	then
#		printf "\nFile Browser is Active"
#	else
#		printf "\nFile Browser is not Active start the service..."
#		sudo systemctl start filebrowser
#	fi

# start WEKAN on port 2000
wekan=$(netstat -lt | grep "2000")
if [ -z "$wekan" ]
then
	# first change directory (to save dump in ubuntu's home)
	cd /home/ubuntu/bundle
	sudo -H -u ubuntu bash -c ./start-wekan.sh &
	printf "\nStarted WEKAN"
else
	printf "\nWEKAN is already running"
fi

printf "\n\n"

exit 0


