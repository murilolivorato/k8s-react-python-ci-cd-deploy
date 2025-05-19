#!/bin/bash

# Exit on error
set -e

# Configuration
GITHUB_USERNAME="your-username"  # Replace with your GitHub username
GITHUB_REPO="your-repo"         # Replace with your repository name
VERSION=$(git describe --tags --always --dirty)

# GitHub Packages registry
DOCKER_REGISTRY="ghcr.io/${GITHUB_USERNAME}"

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable is not set"
    exit 1
fi

# Login to GitHub Packages
echo "Logging in to GitHub Packages..."
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin

# Pull the images
echo "Pulling images from GitHub Packages..."
docker pull ${DOCKER_REGISTRY}/frontend:${VERSION}
docker pull ${DOCKER_REGISTRY}/backend:${VERSION}

# Tag the images for local use
echo "Tagging images..."
docker tag ${DOCKER_REGISTRY}/frontend:${VERSION} frontend:latest
docker tag ${DOCKER_REGISTRY}/backend:${VERSION} backend:latest

# Update docker-compose.yml with the new image versions
echo "Updating docker-compose.yml..."
sed -i "s|image: .*frontend.*|image: frontend:latest|" docker-compose.yml
sed -i "s|image: .*backend.*|image: backend:latest|" docker-compose.yml

# Stop and remove existing containers
echo "Stopping existing containers..."
docker-compose down

# Start the new containers
echo "Starting new containers..."
docker-compose up -d

echo "Deployment to Linode completed successfully!" 