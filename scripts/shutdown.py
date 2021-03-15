#!/bin/python
#
# /home/pi/scripts/shutdown.py
#
# This is a simple python scripts that shuts down the pi when pressing a button
# connected to GPIO pin 21 (& ground).
#
# Author: Lara Klimm
# Date: 24.06.2016



import RPi.GPIO as GPIO
import time
import os

# use Broadcom SOC Pin numbers
GPIO.setmode(GPIO.BCM)

# listen to pin 21 (BCM)
button_pin=21

# set pin to reading mode with internal pullup enabled
GPIO.setup(button_pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

#wait for a falling edge to shutdown
try:
	GPIO.wait_for_edge(button_pin, GPIO.FALLING)
	print "\nshutting down..."
	os.system("sudo /home/pi/display/display_current/display_exit")
	os.system("sudo shutdown -h now")
except:
	pass

GPIO.cleanup()
