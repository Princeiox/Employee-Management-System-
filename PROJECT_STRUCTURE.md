# Perfect Systems - Project Structure

## Overview
Perfect Systems is a full-stack HR Management System that includes attendance tracking, leave management, and employee administration capabilities.

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Python Version**: 3.8+

### Frontend  
- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context API

## Directory Structure

```
PERFECT-SYSTEMS/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py          # Authentication endpoints
│   │   │   │   ├── users.py         # User management endpoints
│   │   │   │   ├── attendance.py    # Attendance tracking endpoints
│   │   │   │   └── leaves.py        # Leave management endpoints
│   │   │   └── deps.py              # API dependencies
│   │   ├── core/
│   │   │   ├── config.py            # Application configuration
│   │   │   └── security.py          # Security utilities (JWT, password hashing)
│   │   ├── db/
│   │   │   └── database.py          # Database setup and connection
│   │   ├── models.py                # SQLAlchemy database models
│   │   ├── schemas.py               # Pydantic request/response schemas
│   │   └── main.py                  # FastAPI application entry point
│   ├── dev-scripts/                     # Utility scripts (development only)
│   ├── requirements.txt             # Python dependencies
│   ├── .gitignore
│   └── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js             # Axios configuration
│   │   ├── components/
│   │   │   ├── Common.jsx           # Reusable UI components
│   │   │   └── Layout.jsx           # Main layout wrapper
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Authentication context
│   │   │   └── ChatContext.jsx      # Chat/messaging context
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Signup.jsx           # Registration page
│   │   │   ├── Dashboard.jsx        # Main dashboard
│   │   │   ├── Profile.jsx          # User profile
│   │   │   ├── Attendance.jsx       # Employee attendance view
│   │   │   ├── Leaves.jsx           # Employee leave requests
│   │   │   ├── Holidays.jsx         # Company holidays
│   │   │   ├── Employees.jsx        # HR: Employee directory
│   │   │   ├── AttendanceAdmin.jsx  # HR: Attendance management
│   │   │   └── LeavesAdmin.jsx      # HR: Leave approvals
│   │   ├── App.jsx                  # Main app component
│   │   ├── index.css                # Global styles
│   │   └── main.jsx                 # Application entry point
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── README.md
│
└── README.md                        # Main project documentation
```

## Key Features

### For Employees
- ✅ Clock in/out attendance tracking
- ✅ View personal attendance history
- ✅ Apply for leaves
- ✅ Check leave balance
- ✅ View company holidays
- ✅ Update user profile
- ✅ Light/Dark theme toggle

### For HR/Admin
- ✅ View all employee timesheets
- ✅ Approve/reject leave requests
- ✅ Manage employee directory
- ✅ View attendance statistics
- ✅ Monitor working hours
- ✅ Employee management (CRUD operations)

## Database Schema

### Users Table
- id, employee_id, name, email, hashed_password
- designation, department, role (employee/hr)
- leave_balance, profile_pic, theme
- is_active, created_at

### Attendance Table
- id, user_id, punch_in, punch_out
- working_hours, location, created_at

### Leaves Table
- id, user_id, from_date, to_date
- reason, status (pending/approved/rejected)
- created_at, updated_at

## API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /login` - User login
- `POST /register` - New user registration

### Users (`/api/v1/users`)
- `GET /me` - Get current user info
- `PUT /me/theme` - Update user theme
- `GET /employees` - List employees (HR only)
- `PUT /{user_id}` - Update employee (HR only)
- `DELETE /{user_id}` - Delete employee (HR only)

### Attendance (`/api/v1/attendance`)
- `POST /punch-in` - Clock in
- `POST /punch-out` - Clock out
- `GET /my-attendance` - Personal attendance records
- `GET /all` - All attendance records (HR only)
- `GET /stats` - Attendance statistics

### Leaves (`/api/v1/leaves`)
- `POST /` - Apply for leave
- `GET /me` - Personal leave requests
- `GET /all` - All leave requests (HR only)
- `PUT /{leave_id}/status` - Update leave status (HR only)

## Getting Started

### Backend Setup
1. Navigate to backend directory: `cd backend`
2. Create virtual environment: `python -m venv venv`
3. Activate environment: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Linux/Mac)
4. Install dependencies: `pip install -r requirements.txt`
5. Run server: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
6. Access API docs: `http://localhost:8000/docs`

### Frontend Setup
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev -- --host`
4. Open browser: `http://localhost:5173`

### Default Credentials
- **HR Account**
  - Email: hr@example.com
  - Password: hr123

## Development Notes

- The backend uses PostgreSQL database
- JWT tokens expire after 24 hours
- Attendance punch-in/out times are stored with timezone information
- Leave requests automatically deduct from employee leave balance upon approval
- The application supports both light and dark themes

## Deployment Considerations

1. **Environment Variables**: Create a `.env` file for production with secure values
   - `SECRET_KEY` - Strong random secret for JWT
   - `DATABASE_URL` - Production database connection string

2. **Database**: Use PostgreSQL for production

3. **CORS**: Update allowed origins in `backend/app/main.py` for production URLs

4. **Build Frontend**: Run `npm run build` to create production bundle

## License
This project is for demonstration and educational purposes.
