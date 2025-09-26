# MyApp Backend Setup Instructions

## Overview

This is a FastAPI-based backend with SQLite database that provides user authentication and data persistence for MyApp.

## Features

- 🔐 **JWT Authentication** - Secure login/logout with access tokens
- 👤 **User Management** - User registration, profile management
- 💾 **Data Persistence** - Store user-specific data (like QR text)
- 🌐 **CORS Support** - Configured for frontend integration
- 📱 **RESTful API** - Well-structured endpoints

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Create virtual environment (recommended):**

   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**

   ```bash
   # Windows
   venv\Scripts\activate

   # Linux/Mac
   source venv/bin/activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Configuration

The backend uses environment variables for configuration. A `.env` file is already created with default settings:

```env
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./app.db
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
```

**Important:** Change the `SECRET_KEY` for production use!

## Running the Backend

1. **Start the server:**

   ```bash
   python run.py
   ```

   Or using uvicorn directly:

   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **The API will be available at:**
   - Main API: http://localhost:8000
   - Interactive docs: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### User Data (Protected)

- `GET /api/data` - Get all user data
- `GET /api/data/{key}` - Get specific data by key
- `POST /api/data` - Create new data
- `PUT /api/data/{key}` - Update data by key
- `DELETE /api/data/{key}` - Delete data by key
- `GET /api/dashboard` - Get dashboard data

### Users (Protected)

- `GET /api/users/` - List users (superuser only)
- `GET /api/users/{user_id}` - Get user by ID

## Database

The backend uses SQLite database with the following tables:

1. **users** - User accounts and authentication info
2. **user_data** - Key-value storage for user-specific data

The database is automatically created when you first run the application.

## Development

### Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app configuration
│   ├── config.py         # Settings and configuration
│   ├── database.py       # Database setup and connection
│   ├── models/
│   │   └── user.py       # SQLAlchemy models
│   ├── schemas/
│   │   └── user.py       # Pydantic schemas
│   ├── routers/
│   │   ├── auth.py       # Authentication endpoints
│   │   ├── users.py      # User management endpoints
│   │   └── protected.py  # Protected data endpoints
│   └── utils/
│       └── auth.py       # Authentication utilities
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables
└── run.py               # Application entry point
```

### Adding New Features

1. **Models**: Add new SQLAlchemy models in `app/models/`
2. **Schemas**: Add Pydantic schemas in `app/schemas/`
3. **Endpoints**: Add new routers in `app/routers/`
4. **Register**: Include new routers in `app/main.py`

## Testing

You can test the API using:

1. **Interactive Docs**: Visit http://localhost:8000/docs
2. **cURL**: Example commands below
3. **Frontend**: The React frontend is pre-configured to work with this backend

### Example cURL Commands

**Register a user:**

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "testpass123"}'
```

**Login:**

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123"}'
```

**Get user data (with token):**

```bash
curl -X GET "http://localhost:8000/api/data" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens expire after 30 minutes (configurable)
- CORS is configured for specific origins
- All protected endpoints require valid JWT token

## Troubleshooting

1. **Port already in use**: Change port in `run.py` or kill existing process
2. **Database errors**: Delete `app.db` to reset the database
3. **CORS errors**: Check `ALLOWED_ORIGINS` in `.env` file
4. **Import errors**: Make sure virtual environment is activated and dependencies are installed
