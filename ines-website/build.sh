#!/bin/bash

# Variables
SERVER="socsci"
REMOTE_PATH="~/app-image-tars"
IMAGE_NAME="ines-website-app"
VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: $0 <version>"
    exit 1
fi

TAGGED_IMAGE_NAME="${IMAGE_NAME}:${VERSION}"
# Build and tag the Docker image
echo "Building Docker image..."
docker build -t $TAGGED_IMAGE_NAME .

# Save the image to a tar file
TAR_FILE="${IMAGE_NAME}-${VERSION}.tar"
echo "Saving Docker image to $TAR_FILE..."
sudo docker save -o $TAR_FILE $TAGGED_IMAGE_NAME &
wait
echo "Image saved to $TAR_FILE"

# Transfer the image to the server
echo "Transferring $TAR_FILE to the server..."
scp $TAR_FILE ${SERVER}:${REMOTE_PATH}/

echo "Done. Go to the server and run the deploy.sh script."

# # Deploy the image on the server
# echo "Deploying version $VERSION on the server..."
# ssh ${SERVER} "bash -s" < ./deploy.sh $VERSION

# # Clean up local tar file
# rm $TAR_FILE
# echo "Deployment of version $VERSION completed."
