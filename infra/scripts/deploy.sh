#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: deploy.sh <backend-image-uri> <frontend-image-uri>"
  exit 1
fi

if [[ ! -f backend.env ]]; then
  echo "backend.env not found. Copy infra/backend.env.example and fill secrets before deploying."
  exit 1
fi

export BACKEND_IMAGE="$1"
export FRONTEND_IMAGE="$2"

COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.ec2.yml}

echo "Pulling images..."
docker compose -f "$COMPOSE_FILE" pull backend frontend || true

echo "Applying stack..."
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

docker compose -f "$COMPOSE_FILE" ps
