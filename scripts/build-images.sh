#!/bin/bash

# Exit on error
set -e

# Configuration
DOCKER_REGISTRY="your-registry.com"
VERSION=$(git describe --tags --always --dirty)

# Build frontend
echo "Building frontend image..."
docker build -t ${DOCKER_REGISTRY}/frontend:${VERSION} -t ${DOCKER_REGISTRY}/frontend:latest ./frontend

# Build backend
echo "Building backend image..."
docker build -t ${DOCKER_REGISTRY}/backend:${VERSION} -t ${DOCKER_REGISTRY}/backend:latest ./backend

# Push images
echo "Pushing images to registry..."
docker push ${DOCKER_REGISTRY}/frontend:${VERSION}
docker push ${DOCKER_REGISTRY}/frontend:latest
docker push ${DOCKER_REGISTRY}/backend:${VERSION}
docker push ${DOCKER_REGISTRY}/backend:latest

# Build and push frontend image
docker build -t ghcr.io/murilolivorato/frontend:v1.0.1 ./frontend
docker push ghcr.io/murilolivorato/frontend:v1.0.1

echo "Images built and pushed successfully!" 