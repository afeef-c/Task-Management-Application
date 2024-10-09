# Use the official Python image as the base
FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/py/bin:$PATH"

# Create a virtual environment
RUN python -m venv /py

# Upgrade pip within the virtual environment
RUN /py/bin/pip install --upgrade pip

# Install system dependencies
RUN apt-get update && apt-get install --no-install-recommends -y \
    postgresql-client \
    build-essential \
    libpq-dev \
    netcat-openbsd \
    curl \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt to leverage Docker cache
COPY ./requirements.txt /requirements.txt

# Install Python dependencies in the virtual environment
RUN /py/bin/pip install -r /requirements.txt

# Set the working directory to /taskmanager
WORKDIR /taskmanager

# Copy application code into /taskmanager
COPY . .

# Create media and static directories if they don't exist
RUN mkdir -p /media /static

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Collect static files
RUN /py/bin/python manage.py collectstatic --noinput

# Copy the entrypoint script and make it executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose necessary ports (both for HTTP and Daphne WebSocket server)
EXPOSE 8000 80

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]
