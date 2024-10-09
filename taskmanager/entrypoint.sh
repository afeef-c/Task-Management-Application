#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Wait for PostgreSQL to become available
echo "Waiting for PostgreSQL to start..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started!"

# Apply Django migrations
echo "Applying migrations..."
/py/bin/python manage.py migrate

# Start Daphne (ASGI server) to serve Django and Channels
echo "Starting Daphne..."
daphne -u /tmp/daphne.sock taskmanager.asgi:application &

# Start Nginx
echo "Starting Nginx..."
nginx -g "daemon off;"
