#!/bin/sh

# Wait for the database to be ready
if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi

# Run migrations and collect static files
echo "Running migrations..."
/py/bin/python manage.py migrate

# Collect static files if needed
echo "Collecting static files..."
/py/bin/python manage.py collectstatic --noinput

# Start Nginx in the background
echo "Starting Nginx..."
nginx &

# Start the taskmanager server (Daphne or Gunicorn)
/py/bin/daphne -b 0.0.0.0 -p 8000 taskmanager.asgi:application

# Alternatively, if using Gunicorn, you can replace the above line with:
# /py/bin/gunicorn your_project.wsgi:application --bind 0.0.0.0:8000
