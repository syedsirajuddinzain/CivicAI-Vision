import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, role, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // If initial auth check is running and no stored user exists yet, wait briefly
  if (loading && !user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">Verifying credentials...</p>
      </div>
    );
  }

  // 1. Unauthenticated users -> Redirect to Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2. Role check
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Role mismatch: redirect to user's authorized home area
    if (role === 'citizen') {
      return <Navigate to="/my-reports" replace state={{ unauthorized: true }} />;
    }
    if (role === 'worker') {
      return <Navigate to="/worker" replace state={{ unauthorized: true }} />;
    }
    if (role === 'authority') {
      return <Navigate to="/authority" replace state={{ unauthorized: true }} />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
