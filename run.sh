#!/bin/bash 

cd /home/pi/record-pi-cam-to-s3
forever start server.js
DISPLAY=:0 chromium-browser http://localhost:9001 &
