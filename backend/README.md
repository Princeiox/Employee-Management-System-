# Perfect Systems Backend

Backend API for the Perfect Systems HR Management System built with FastAPI.

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL (SQLAlchemy ORM)
- **Authentication**: JWT (OAuth2 with Password)
- **Python Version**: 3.8+

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── v1/          # API version 1 endpoints
│   │   │   ├── auth.py       # Authentication endpoints
│   │   │   ├── users.py      # User management
│   │   │   ├── attendance.py # Attendance tracking
│   │   │   └── leaves.py     # Leave management
│   │   └── deps.py      # Dependencies
│   ├── core/
│   │   ├── config.py    # Configuration
│   │   └── security.py  # Security utilities
│   ├── db/
│   │   └── database.py  # Database configuration
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic schemas
│   └── main.py          # Application entry point
├── dev-scripts/         # Utility scripts (not for production)
├── requirements.txt     # Python dependencies
└── .gitignore

```

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

The API is available at `https://employee-management-system-fn7d.onrender.com` (Production) or `http://localhost:8000` (Local)

## API Documentation

Once the server is running, access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Default Admin Credentials

- **Email**: hr@example.com
- **Password**: hr123
- **Role**: HR

## Environment Variables

The application uses default settings defined in `app/core/config.py`. For production, create a `.env` file with:

```
PROJECT_NAME=Perfect Systems HR
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@server:port/dbname
```

## Database

The application uses PostgreSQL. Ensure you have a running PostgreSQL instance and configure the connection string in `.env`.

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Users
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me/theme` - Update user theme
- `GET /api/v1/users/employees` - List all employees (HR only)
- `PUT /api/v1/users/{user_id}` - Update employee (HR only)
- `DELETE /api/v1/users/{user_id}` - Delete employee (HR only)

### Attendance
- `POST /api/v1/attendance/punch-in` - Clock in
- `POST /api/v1/attendance/punch-out` - Clock out
- `GET /api/v1/attendance/my-attendance` - Get own attendance records
- `GET /api/v1/attendance/all` - Get all attendance (HR only)
- `GET /api/v1/attendance/stats` - Get attendance statistics

### Leaves
- `POST /api/v1/leaves/` - Request leave
- `GET /api/v1/leaves/my-leaves` - Get own leave requests
- `GET /api/v1/leaves/all` - Get all leave requests (HR only)
- `PUT /api/v1/leaves/{leave_id}/approve` - Approve leave (HR only)
- `PUT /api/v1/leaves/{leave_id}/reject` - Reject leave (HR only)
