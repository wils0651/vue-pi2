#!/bin/bash
set -e  # exit if any command fails

# Config
REMOTE_USER="pi"
REMOTE_HOST="192.168.50.3"
REMOTE_PATH="/home/pi/vue-pi2"
REMOTE_SITE_PATH="/var/www/test1"
PROJECT_DIR="/home/tim/Repos/vue-pi2"

# Go to project directory
echo "Changing to project directory: $PROJECT_DIR"
cd "$PROJECT_DIR"

echo "Git Pull"
git pull

echo "NPM"
npm install
npm run build

echo "Deploying"
scp -r ${PROJECT_DIR}/dist/* ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}

echo "Moving on Pi"
ssh ${REMOTE_USER}@${REMOTE_HOST} 'sudo cp -r /home/pi/vue-pi2/* /var/www/test1'

echo "Done"

