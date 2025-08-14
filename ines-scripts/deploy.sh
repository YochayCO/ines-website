#!/bin/bash

# Variables
IMAGE_NAME="ines-website-app"
VERSION=$1
TAR_FILE="./app-image-tars/${IMAGE_NAME}-${VERSION}.tar"
CONTAINER_NAME="ines-playground"

# Check if the TAR file exists
if [ ! -f "$TAR_FILE" ]; then
    echo "Error: Image file $TAR_FILE does not exist."
    exit 1
fi

# Load the Docker image
echo "Loading Docker image from $TAR_FILE..."
sudo docker load < "$TAR_FILE"

# Stop and remove the old container (if running)
echo "Stopping and removing old container..."
sudo docker stop $CONTAINER_NAME 2>/dev/null || true
sudo docker rm $CONTAINER_NAME 2>/dev/null || true

# Run the new container
echo "Starting new container with version $VERSION..."
sudo docker run -d -p 8085:80 --name $CONTAINER_NAME "$IMAGE_NAME:$VERSION"

echo "Deployment complete. Current version: $VERSION"

echo "$(date +'%Y-%m-%d--%H:%M:%S') $VERSION" >> "./versions.log"
