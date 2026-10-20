#!/bin/bash
set -e  # exit if any command fails

# Config
REMOTE_USER="tim"
REMOTE_HOST="192.168.50.199"
REMOTE_PATH="/home/tim/apps/vue-pi2"
REMOTE_SITE_PATH="/var/www/vue-pi2"
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
ssh -t ${REMOTE_USER}@${REMOTE_HOST} 'sudo cp -r /home/tim/apps/vue-pi2/* /var/www/vue-pi2'

echo "Done"

