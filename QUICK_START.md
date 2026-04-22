# Perfect Systems - Quick Start Guide

## 🚀 Running the Application

### Prerequisites
- **Python 3.8+** installed
- **Node.js 16+** and npm installed
- **PostgreSQL** installed and running
- Terminal/Command Prompt

### Backend Server

1. Open a terminal and navigate to the backend directory:
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

4. Configure Database:
   - Ensure PostgreSQL is running
   - Create a database (e.g., `perfect_systems_db`)
   - Update `.env` file with your credentials

5. Run the server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

   The API will be available at: `http://localhost:8000`
   
   API Documentation: `http://localhost:8000/docs`

###  Frontend Application

1. Open a **new terminal** and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev -- --host
   ```

   The application will be available at: `http://localhost:5173`
   (Or your network IP: `http://192.168.x.x:5173`)

## 🔑 Default Login Credentials

### HR Account (Admin)
- **Email**: `hr@example.com`
- **Password**: `hr123`

### Employee Account
- **Email**: `employee@example.com`
- **Password**: `emp123`

## 📁 Project Structure

```
PERFECT-SYSTEMS/
├── backend/          # FastAPI backend server
│   ├── app/
│   │   ├── api/      # API endpoints
│   │   ├── core/     # Configuration & security
│   │   ├── db/       # Database setup
│   │   └── models.py # Database models
│   └── requirements.txt
│
├── frontend/         # React frontend application
│   ├── src/
│   │   ├── pages/    # Application pages
│   │   ├── components/ # Reusable components
│   │   └── context/  # State management
│   └── package.json
│
└── README.md         # Main documentation
```

## ✨ Key Features

### Employee Features
- ⏰ Clock in/out attendance tracking
- 📅 View personal attendance history
- 🏖️ Apply for leaves
- 📊 Check leave balance
- 🎨 Light/Dark theme toggle

### HR/Admin Features
- 👥 Manage employee directory
- ✅ Approve/reject leave requests
- 📈 View attendance statistics
- 🕐 Monitor working hours
- 👤 Employee management (CRUD)

## 🛠️ Tech Stack

### Backend
- FastAPI - Modern Python web framework
- SQLAlchemy - SQL toolkit and ORM
- PostgreSQL - Robust relational database
- JWT - Authentication & authorization

### Frontend
- React - UI library
- Vite - Build tool and dev server
- Tailwind CSS - Utility-first CSS framework
- React Router - Client-side routing

## 📝 Development Notes

- The backend automatically creates database tables on startup
- JWT tokens expire after 24 hours
- Both light and dark themes are supported
- All times are handled with timezone awareness

## 🔧 Troubleshooting

### Backend won't start
- Ensure Python 3.8+ is installed
- Verify virtual environment is activated
- Check all dependencies are installed: `pip install -r requirements.txt`
- Verify PostgreSQL connection in `.env`

### Frontend won't start
- Ensure Node.js 16+ is installed
- Delete `node_modules` and run `npm install` again
- Clear browser cache

### Can't login
- Ensure backend server is running on port 8000
- Check browser console for errors
- Verify CORS settings in `backend/app/main.py`
- Ensure database is connected and seeded

## 📦 Production Deployment

1. Set environment variables in `.env` file
2. Change SECRET_KEY to a strong random value
3. Use a managed PostgreSQL instance
4. Build frontend: `npm run build`
5. Deploy with proper HTTPS and security headers

## 📄 License

MIT License - See LICENSE file for details

## 🙋 Support

For issues or questions, please check:
- API Documentation: `https://employee-management-system-fn7d.onrender.com/docs`
- PROJECT_STRUCTURE.md for detailed architecture
- README.md for comprehensive information

---

**Happy coding! 🎉**
