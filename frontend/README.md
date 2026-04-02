# Perfect Systems Frontend

This directory contains the React frontend for the Perfect Systems HR Management System.

## 🛠️ Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```
   
   To expose to the local network:
   ```bash
   npm run dev -- --host
   ```

## 📁 Project Structure

```
src/
├── api/             # API configuration (Axios)
├── components/      # Reusable UI components
├── context/         # React Context (Auth, Chat)
├── pages/           # Application pages/views
├── App.jsx          # Main application component
└── main.jsx         # Entry point
```

## 🌐 API Integration

The frontend is configured to connect to the backend at `http://{hostname}:8000/api/v1`. This allows it to work seamlessly on both `localhost` and network IPs.

## 🎨 Theme

The application supports system-aware light and dark modes using Tailwind's `dark:` modifiers.
