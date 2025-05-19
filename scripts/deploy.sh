#!/bin/bash

# Exit on error
set -e

# Configuration
GITHUB_USERNAME="your-username"  # Replace with your GitHub username
GITHUB_REPO="your-repo"         # Replace with your repository name

# Get version from git tag or use default
if [ -z "$VERSION" ]; then
    VERSION=$(git describe --tags --always --dirty)
    if [ $? -ne 0 ]; then
        VERSION="v1.0.0"  # Default version if no git tag exists
    fi
fi

# GitHub Packages registry
DOCKER_REGISTRY="ghcr.io/${GITHUB_USERNAME}"

# Login to GitHub Packages
echo "Logging in to GitHub Packages..."
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin

# Build and tag frontend
echo "Building frontend image..."
docker build -t ${DOCKER_REGISTRY}/frontend:${VERSION} \
            -t ${DOCKER_REGISTRY}/frontend:latest \
            -t frontend:${VERSION} \
            -t frontend:latest \
            ./frontend

# Build and tag backend
echo "Building backend image..."
docker build -t ${DOCKER_REGISTRY}/backend:${VERSION} \
            -t ${DOCKER_REGISTRY}/backend:latest \
            -t backend:${VERSION} \
            -t backend:latest \
            ./backend

# Push images to GitHub Packages
echo "Pushing images to GitHub Packages..."
docker push ${DOCKER_REGISTRY}/frontend:${VERSION}
docker push ${DOCKER_REGISTRY}/frontend:latest
docker push ${DOCKER_REGISTRY}/backend:${VERSION}
docker push ${DOCKER_REGISTRY}/backend:latest

# Update Kubernetes deployments
echo "Updating Kubernetes deployments..."
sed -i "s|image: .*|image: ${DOCKER_REGISTRY}/frontend:${VERSION}|" k8s/frontend-deployment.yaml
sed -i "s|image: .*|image: ${DOCKER_REGISTRY}/backend:${VERSION}|" k8s/backend-deployment.yaml

# Apply Kubernetes configurations
echo "Applying Kubernetes configurations..."
kubectl apply -f k8s/

echo "Deployment completed successfully!"
echo "Images tagged and pushed:"
echo "Frontend: ${DOCKER_REGISTRY}/frontend:${VERSION}"
echo "Backend: ${DOCKER_REGISTRY}/backend:${VERSION}" 