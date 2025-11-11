# Basic Network Programming - HTTP Request Labs API

This project provides an API for various labs related to HTTP Requests in the "Basic Network Programming" course. The API supports user registration, authentication, and dish management.


## Features

- **User Registration**: Create new user accounts.
- **Authentication**: Login and secure endpoints using authentication.
- **Dish Management**: CRUD operations for managing dishes.

## Getting Started

### Prerequisites
- Python 3.8+
- Flask

### Installation & Running

#### Option 1: Manual Setup
1. **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2. **Run the server:**
    ```bash
    python app/main.py
    ```

#### Option 2: Using Docker Compose
1. **Start the server:**
    ```bash
    docker-compose up
    ```

## API Documentation

This application provides a RESTful API for managing users and dishes. The complete API documentation is available at `/docs` using Swagger UI, where you can explore and test all endpoints interactively.

### Authentication Endpoints
- **POST /api/v1/user/signup** - Creates a new user account in the system
- **POST /auth/token** - Authenticates an existing user and returns an authentication token

### Dish Management Endpoints
- **POST /api/v1/monan/add** - Adds a new dish to the system.
- **GET /api/v1/monan/all** - Retrieves a list of all available dishes
- **POST /api/v1/monan** - Creates a new dish entry (requires authentication)
- **PUT /api/v1/monan/:id** - Updates an existing dish by its ID (requires authentication)
- **DELETE /api/v1/monan/:id** - Removes a dish from the system by its ID.

For detailed request/response schemas, authentication requirements, and to test the API endpoints, visit the interactive Swagger documentation at `/docs`.


## Usage

Use tools like Postman or curl to interact with the API endpoints.

## License

This project is for educational purposes.
