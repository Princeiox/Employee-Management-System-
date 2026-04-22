import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Leaves from './pages/Leaves';
import AttendanceHistory from './pages/AttendanceHistory';
import Employees from './pages/Employees';
import LeavesAdmin from './pages/LeavesAdmin';
import AttendanceAdmin from './pages/AttendanceAdmin';
import Reports from './pages/Reports';
import Holidays from './pages/Holidays';
import SalaryAdmin from './pages/SalaryAdmin';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Tasks from './pages/Tasks';
import Chat from './pages/Chat';
import Shortcuts from './pages/Shortcuts';
import ProtectedRoute from './components/ProtectedRoute';

import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ChatProvider } from './context/ChatContext';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ChatProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/" element={<Layout />}>
              <Route index element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="attendance" element={
                <ProtectedRoute>
                  <AttendanceHistory />
                </ProtectedRoute>
              } />
              <Route path="leaves" element={
                <ProtectedRoute>
                  <Leaves />
                </ProtectedRoute>
              } />
              <Route path="holidays" element={
                <ProtectedRoute>
                  <Holidays />
                </ProtectedRoute>
              } />
              <Route path="tasks" element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="profile/:id" element={
                <ProtectedRoute>
                  <PublicProfile />
                </ProtectedRoute>
              } />
              <Route path="chat" element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } />
              <Route path="shortcuts" element={
                <ProtectedRoute>
                  <Shortcuts />
                </ProtectedRoute>
              } />

              {/* HR Routes */}
              <Route path="employees" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <Employees />
                </ProtectedRoute>
              } />
              <Route path="leaves-admin" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <LeavesAdmin />
                </ProtectedRoute>
              } />
              <Route path="attendance-admin" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <AttendanceAdmin />
                </ProtectedRoute>
              } />
              <Route path="salary-admin" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <SalaryAdmin />
                </ProtectedRoute>
              } />
              <Route path="reports" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <Reports />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </ChatProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
