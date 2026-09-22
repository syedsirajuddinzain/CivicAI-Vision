import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import MyReports from './pages/MyReports';
import ReportDetails from './pages/ReportDetails';
import AuthorityDashboard from './pages/AuthorityDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            {/* Public routes */}
            <Route index element={<HomePage />} />
            <Route path="report" element={<ReportPage />} />
            <Route path="login" element={<LoginPage />} />

            {/* Citizen Protected Routes */}
            <Route
              path="my-reports"
              element={
                <ProtectedRoute allowedRoles={['citizen', 'authority']}>
                  <MyReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-reports/:ticketId"
              element={
                <ProtectedRoute allowedRoles={['citizen', 'authority']}>
                  <ReportDetails />
                </ProtectedRoute>
              }
            />

            {/* Authority Protected Route */}
            <Route
              path="authority"
              element={
                <ProtectedRoute allowedRoles={['authority']}>
                  <AuthorityDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={['authority']}>
                  <AuthorityDashboard />
                </ProtectedRoute>
              }
            />

            {/* Worker Protected Route */}
            <Route
              path="worker"
              element={
                <ProtectedRoute allowedRoles={['worker', 'authority']}>
                  <WorkerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
