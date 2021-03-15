#!/usr/bin/python
#
# /home/pi/scripts/shutdown_strompi.py
#
# This script corresponds with the extension StromPi.
# It will check pin 21 for a change of value & shut down the RasPi.
# The original file is taken from www.joy-it.net.
#
# Edited: Lara Klimm
# Date: 09.06.2016



import RPi.GPIO as GPIO
import time
import os
GPIO.setmode(GPIO.BCM)
 
GPIO_TPIN = 21
  
# Set pin as input
GPIO.setup(GPIO_TPIN,GPIO.IN,pull_up_down = GPIO.PUD_DOWN)      
 
Current_State  = 0
Previous_State = 0
 
try:  
  while GPIO.input(GPIO_TPIN)==1:
    Current_State  = 0
  while True :
    Current_State = GPIO.input(GPIO_TPIN)
    if Current_State==1 and Previous_State==0:
      Previous_State=1
      os.system("sudo shutdown -h now")
    elif Current_State==0 and Previous_State==1:
      Previous_State=0
 
    time.sleep(0.01)
 
except KeyboardInterrupt:
  print " \nQuit"
  GPIO.cleanup()


  
