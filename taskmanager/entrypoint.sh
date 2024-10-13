#!/bin/sh

# Wait for the database to be ready
if [ "$DATABASE" = "postgres" ]; then
    echo "Waiting for PostgreSQL to be ready..."

    while ! nc -z "$SQL_HOST" "$SQL_PORT"; do
        sleep 0.1
    done

    echo "PostgreSQL started"
fi

# Run migrations and collect static files
echo "Running migrations..."
/py/bin/python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
/py/bin/python manage.py collectstatic --noinput

# Start Nginx in the background
echo "Starting Nginx..."
nginx &

# Start the Daphne ASGI server for WebSockets and HTTP
echo "Starting Daphne ASGI server..."
/py/bin/daphne -b 0.0.0.0 -p $PORT taskmanager.asgi:application

# Alternatively, if using Gunicorn for WSGI applications, use this:
# echo "Starting Gunicorn server..."
# /py/bin/gunicorn taskmanager.wsgi:application --bind 0.0.0.0:$PORT --workers 4 --timeout 120