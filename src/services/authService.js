import api, { getAuthToken, setAuthToken } from './api';

const USER_STORAGE_KEY = 'civic_ai_user';

export async function login(email, password) {
  const result = await api.post('/api/auth/login', { email, password });
  if (result?.token) {
    setAuthToken(result.token);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result));
    }
  }
  return result;
}

export async function register(userData) {
  const result = await api.post('/api/auth/register', userData);
  if (result?.token) {
    setAuthToken(result.token);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result));
    }
  }
  return result;
}

export function logout() {
  setAuthToken(null);
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }
}

export function getStoredUser() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser() {
  const token = getAuthToken();
  if (!token) return getStoredUser();

  try {
    const user = await api.get('/api/auth/me');
    if (user && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
    return user;
  } catch (err) {
    return getStoredUser();
  }
}
