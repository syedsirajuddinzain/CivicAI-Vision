import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getStoredUser,
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  getCurrentUser,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Synchronously initialize from localStorage to preserve session across browser refresh
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  // Background token validation
  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((validatedUser) => {
        if (mounted && validatedUser) {
          setUser(validatedUser);
        }
      })
      .catch(() => {
        // Fallback to local stored user
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    // Listen to storage events across tabs
    const handleStorageChange = () => {
      setUser(getStoredUser());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('civic_auth_changed', handleStorageChange);

    return () => {
      mounted = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('civic_auth_changed', handleStorageChange);
    };
  }, []);

  const login = async (email, password) => {
    const userData = await authLogin(email, password);
    setUser(userData);
    window.dispatchEvent(new Event('civic_auth_changed'));
    return userData;
  };

  const register = async (data) => {
    const userData = await authRegister(data);
    setUser(userData);
    window.dispatchEvent(new Event('civic_auth_changed'));
    return userData;
  };

  const logout = () => {
    authLogout();
    setUser(null);
    window.dispatchEvent(new Event('civic_auth_changed'));
  };

  // Quick role switcher for demo testing
  const switchRole = async (targetRole) => {
    let email = 'citizen@civicai.gov';
    let password = 'Citizen123!';

    if (targetRole === 'authority') {
      email = 'road.authority@civicai.gov';
      password = 'Authority123!';
    } else if (targetRole === 'worker') {
      email = 'worker@civicai.gov';
      password = 'Worker123!';
    }

    return await login(email, password);
  };

  const value = {
    user,
    role: user?.role || 'anonymous',
    isAuthenticated: Boolean(user && user.role),
    loading,
    login,
    register,
    logout,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
