#!/bin/bash

# Target details
DOMAIN="api.fammy-sp.biz"
EMAIL="prasoppolsirichai@gmail.com"

# Determine the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Navigate to the backend directory (parent of nginx directory)
cd "$SCRIPT_DIR/.."

echo "=== Current working directory: $(pwd) ==="

if [ ! -f "docker-compose.yml" ]; then
  echo "Error: docker-compose.yml not found. Please run this script from the project root or its directory."
  exit 1
fi

echo "=== Checking if SSL certificates already exist for $DOMAIN ==="
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm --entrypoint "" certbot sh -c "[ -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]"

if [ $? -eq 0 ]; then
  echo "SSL certificates already exist for $DOMAIN. Starting all services normally..."
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
else
  echo "SSL certificates not found. Starting bootstrap process..."

  # 1. Create a dummy self-signed certificate so Nginx doesn't crash on start
  echo "Creating dummy certificate for $DOMAIN..."
  docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm --entrypoint "" certbot sh -c "
    mkdir -p /etc/letsencrypt/live/$DOMAIN && \
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
      -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
      -subj '/CN=localhost'
  "

  # 2. Start Nginx
  echo "Starting Nginx..."
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d nginx

  # 3. Delete the dummy certificate
  echo "Deleting dummy certificate..."
  docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm --entrypoint "" certbot sh -c "
    rm -rf /etc/letsencrypt/live/$DOMAIN/*
  "

  # 4. Request the real certificate from Let's Encrypt
  echo "Requesting real Let's Encrypt certificate for $DOMAIN..."
  docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    -d $DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --non-interactive

  # 5. Reload Nginx to load the new certificate
  echo "Reloading Nginx config..."
  docker compose -f docker-compose.yml -f docker-compose.prod.yml exec nginx nginx -s reload

  # 6. Start the rest of the services (backend, db, certbot daemon)
  echo "Starting all remaining services..."
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

  echo "=== SSL bootstrapping completed successfully! ==="
fi
