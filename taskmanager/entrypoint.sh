#!/bin/sh

# Wait for the database to be ready
if [ "$DATABASE" = "postgres" ]; then
    echo "Waiting for PostgreSQL to be ready..."

    TIMEOUT=30
    COUNTER=0
    while ! nc -z "$SQL_HOST" "$SQL_PORT"; do
        sleep 0.1
        COUNTER=$((COUNTER + 1))
        if [ "$COUNTER" -ge "$TIMEOUT" ]; then
            echo "PostgreSQL did not start within $TIMEOUT seconds"
            exit 1
        fi
    done

    echo "PostgreSQL started"
fi

# Run migrations and collect static files
echo "Running migrations..."
/py/bin/python manage.py migrate --noinput || { echo "Migration failed"; exit 1; }

# Collect static files
echo "Collecting static files..."
/py/bin/python manage.py collectstatic --noinput || { echo "Collecting static files failed"; exit 1; }

# Start Nginx in the background
echo "Starting Nginx..."
nginx -g 'daemon off;' >> /var/log/nginx/nginx.log 2>&1 &

# Start the Daphne ASGI server for WebSockets and HTTP
echo "Starting Daphne ASGI server..."
exec /py/bin/daphne -b 0.0.0.0 -p $PORT taskmanager.asgi:application
