#!/bin/bash
#
# /home/pi/scripts/display_exit.sh
#
# This script calles display_exit(.c) to exit the display UI
#
# Dependencies:
# /home/pi/display/display_current/display_exit
# /home/pi/scripts/mysql_export.sh
# /home/pi/scripts/group_delete.sh
#
# Author: Lara Klimm
# Date: 27.06.2016



# try to save group's works
sudo /home/pi/scripts/mysql_export.sh
# delete group name from config
sudo /home/pi/scripts/group_delete.sh
# call program to disable display
sudo /home/pi/display/display_current/display_exit

exit 0
