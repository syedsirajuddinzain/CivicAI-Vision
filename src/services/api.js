/**
 * CivicAI - Universal Frontend API Client
 * 
 * Supports both Browser SPA and Native Capacitor Android Mobile execution.
 */

export function getApiBaseUrl() {
  if (typeof window === 'undefined') return '';

  const stored = window.localStorage?.getItem('civic_ai_api_url');
  if (stored) return stored.replace(/\/$/, '');

  const envUrl = import.meta.env?.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');

  // Detect Capacitor Native environment
  const isCapacitor =
    Boolean(window.Capacitor?.isNativePlatform?.()) ||
    window.location.protocol === 'capacitor:' ||
    (window.location.hostname === 'localhost' && window.Capacitor);

  if (isCapacitor) {
    // Default Android loopback IP for emulator / local backend
    return 'http://10.0.2.2:5000';
  }

  return '';
}

export function setCustomApiUrl(url) {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (url && url.trim()) {
      window.localStorage.setItem('civic_ai_api_url', url.trim().replace(/\/$/, ''));
    } else {
      window.localStorage.removeItem('civic_ai_api_url');
    }
  }
}

export function getStoredCustomApiUrl() {
  if (typeof window === 'undefined' || !window.localStorage) return '';
  return window.localStorage.getItem('civic_ai_api_url') || '';
}

/**
 * Get stored JWT auth token
 */
export function getAuthToken() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage.getItem('civic_ai_token');
}

/**
 * Store JWT auth token
 */
export function setAuthToken(token) {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (token) {
      window.localStorage.setItem('civic_ai_token', token);
    } else {
      window.localStorage.removeItem('civic_ai_token');
    }
  }
}

/**
 * Core fetch wrapper with JSON and FormData handling
 */
async function request(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${path}`;

  const headers = { ...options.headers };
  const token = getAuthToken();

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is NOT FormData, default to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || `HTTP ${response.status}: Request failed`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data?.data !== undefined ? data.data : data;
  } catch (err) {
    console.error(`[API Error] ${options.method || 'GET'} ${url}:`, err.message);
    throw err;
  }
}

export const api = {
  get: (url, options) => request(url, { method: 'GET', ...options }),
  post: (url, body, options) => request(url, { method: 'POST', body, ...options }),
  patch: (url, body, options) => request(url, { method: 'PATCH', body, ...options }),
  put: (url, body, options) => request(url, { method: 'PUT', body, ...options }),
  delete: (url, options) => request(url, { method: 'DELETE', ...options }),
};

export default api;
