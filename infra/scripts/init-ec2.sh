#!/usr/bin/env bash
set -euo pipefail

sudo yum update -y
sudo amazon-linux-extras install docker -y || sudo yum install docker -y
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ec2-user

# Install docker compose v2
if ! command -v docker-compose >/dev/null; then
  sudo curl -L "https://github.com/docker/compose/releases/download/v2.29.7/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

echo "Docker and Compose installed"
