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

# Copy requirements.txt first to leverage Docker cache
COPY ./requirements.txt /requirements.txt

# Install Python dependencies in the virtual environment
RUN /py/bin/pip install -r /requirements.txt

# Set working directory to /taskmanager
WORKDIR /taskmanager

# Copy application code into /taskmanager
COPY . .

# Create media directory if it doesn't exist
RUN mkdir -p /media

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Pass SECRET_KEY as an environment variable
ARG SECRET_KEY
ENV SECRET_KEY=${SECRET_KEY}

# Collect static files (assuming AWS S3 or similar is configured in Django settings)
RUN /py/bin/python manage.py collectstatic --noinput

# Copy the entrypoint script and make it executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose necessary ports
EXPOSE 8000  

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]