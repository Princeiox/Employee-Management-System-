# Perfect Systems - HR Management System

Perfect Systems is a modern, full-stack HR management platform designed to streamline organizational operations, attendance tracking, leave management, and team collaboration.

![Backend](https://img.shields.io/badge/Backend-FastAPI-emerald)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Key Features

### 📅 Attendance Management
- **Clock In/Out Tracking**: Simple and efficient time tracking system
- **Working Hours Calculation**: Automatic calculation of daily working hours
- **Attendance History**: Complete view of personal and team attendance records
- **HR Dashboard**: Comprehensive overview of all employee attendance

### 🏖️ Leave Management
- **Leave Requests**: Easy-to-use leave application system
- **Balance Tracking**: Real-time leave balance monitoring
- **Approval Workflow**: Streamlined approval/rejection process for HR
- **Leave History**: Complete history of leave requests and their status

### 👥 Employee Management
- **Employee Directory**: Centralized employee information management
- **Role-Based Access**: Separate views and permissions for employees and HR
- **Profile Management**: User profiles with designation and department details
- **Theme Customization**: Light and dark mode support

### 💬 Additional Features
- **Messaging System**: Internal chat for team communication
- **Task Management**: Assign and track tasks across the organization
- **Notifications**: Real-time alerts for important updates
- **Reports**: Generate attendance and leave reports

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.8+)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Automatic OpenAPI/Swagger documentation

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 📦 Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the server (accessible on network):
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

   The API will be available at `http://localhost:8000`
   
   API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server (accessible on network):
   ```bash
   npm run dev -- --host
   ```

   The application will be available at `http://localhost:5173`
   (Or your network IP: `http://192.168.x.x:5173`)

## 🔑 Default Login Credentials

### HR Account (Administrator)
- Email: `hr@example.com`
- Password: `hr123`

### Employee Account
- Email: `employee@example.com` 
- Password: `emp123`

## 📁 Project Structure

```
PERFECT-SYSTEMS/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Configuration & security
│   │   ├── db/           # Database setup
│   │   ├── models.py     # Database models
│   │   └── schemas.py    # Pydantic schemas
│   └── requirements.txt
│
├── frontend/             # React frontend
│   ├── src/
│   │   ├── pages/        # Application pages
│   │   ├── components/   # Reusable components
│   │   ├── context/      # State management
│   │   └── api/          # API configuration
│   └── package.json
│
├── README.md             # Main documentation
├── PROJECT_STRUCTURE.md  # Detailed structure guide
├── QUICK_START.md        # Quick start guide
└── LICENSE               # MIT License
```

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - Register new user

### Users
- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/users/employees` - List employees (HR only)

### Attendance
- `POST /api/v1/attendance/punch-in` - Clock in
- `POST /api/v1/attendance/punch-out` - Clock out
- `GET /api/v1/attendance/my-attendance` - Personal records
- `GET /api/v1/attendance/all` - All records (HR only)

### Leaves
- `POST /api/v1/leaves/` - Apply for leave
- `GET /api/v1/leaves/me` - Personal leave requests
- `GET /api/v1/leaves/all` - All requests (HR only)
- `PUT /api/v1/leaves/{leave_id}/status` - Update status (HR only)

## 🚀 Deployment

### Environment Variables

Create a `.env` file for production:

```env
SECRET_KEY=your-secure-random-secret-key
DATABASE_URL=postgresql://user:password@server:port/dbname
```

### Production Build

Backend:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Frontend:
```bash
npm run build
```

## 📚 Documentation

- **API Documentation**: Access Swagger UI at `http://localhost:8000/docs`
- **Project Structure**: See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **Quick Start Guide**: See [QUICK_START.md](QUICK_START.md)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with FastAPI and React
- Icons by Lucide
- Styling with Tailwind CSS

---

**Made with ❤️ for modern organizations**
