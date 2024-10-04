# Task-Management-Application
The Task Management Application is a full-stack web application designed to help users manage their tasks efficiently. Built with Django as the backend framework and React for the frontend, this application provides a user-friendly interface for creating, updating, and deleting tasks




## Project Overview

The Task Management Application is a full-stack web app built with Django for the backend and React for the frontend. It allows users to create, manage, and organize tasks efficiently, with features such as real-time updates and role-based access control.

## Features

- **User Authentication**: Secure sign-up and login functionality using JWT tokens for user sessions.
- **Role-Based Access Control**: Different permissions for regular users and admin users to manage tasks.
- **Task Management**: Users can create, update, delete, and view their tasks.
- **Real-Time Updates**: WebSocket integration for live updates when tasks are created or modified.
- **Responsive Design**: A user-friendly interface that works seamlessly across devices.
- **Error Handling**: Proper error messages for failed operations (e.g., task creation, deletion).
- **Sorting and Filtering**: Easily view tasks based on their status (e.g., TODO, IN_PROGRESS, DONE).

## Tech Stack

- **Frontend**: 
  - React
  - Redux Toolkit for state management
  - Vite for development and build tooling
  - Axios for API requests
- **Backend**: 
  - Django REST Framework
  - Django Channels for WebSocket support
  - PostgreSQL as the database
- **Authentication**: 
  - JWT (JSON Web Tokens) for secure user authentication
- **Deployment**: 
  - Docker for containerization
  - Render for cloud hosting

## Getting Started

### Prerequisites

- Node.js (for the frontend)
- Python 3.x (for the backend)
- Docker (for containerization)
- PostgreSQL (for database)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/afeef-c/Task-Management-Application.git
   cd Task-Management-Application
