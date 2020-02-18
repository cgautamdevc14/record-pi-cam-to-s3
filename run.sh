#!/bin/bash 

cd /home/pi/video-record-pi
forever start server.js
DISPLAY=:0 chromium-browser http://localhost:9001 &
