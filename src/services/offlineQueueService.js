/**
 * CivicAI - Offline & Poor Network Queue Service
 * 
 * Intercepts submissions when device is disconnected, queues report payload in localStorage,
 * and allows one-tap submission when connectivity is restored.
 */

const STORAGE_KEY = 'civic_ai_offline_queue';

/**
 * Check current online status
 */
export function isOnline() {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }
  return true;
}

/**
 * Retrieve all pending offline reports
 */
export function getPendingReports() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Failed to parse offline queue:', err);
    return [];
  }
}

/**
 * Save report to offline queue
 */
export function savePendingReport(reportData) {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const queue = getPendingReports();
    const pendingItem = {
      ...reportData,
      tempId: `OFFLINE-${Date.now()}`,
      queuedAt: new Date().toISOString(),
      queuedFormattedTime: new Date().toLocaleTimeString(),
    };
    queue.push(pendingItem);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));

    // Dispatch event
    window.dispatchEvent(new CustomEvent('civic_offline_queue_updated'));
    return pendingItem;
  } catch (err) {
    console.warn('Failed to save to offline queue:', err);
    return null;
  }
}

/**
 * Remove a specific report from offline queue
 */
export function removePendingReport(tempId) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const queue = getPendingReports();
    const filtered = queue.filter((item) => item.tempId !== tempId);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('civic_offline_queue_updated'));
  } catch (err) {
    console.warn('Failed to remove pending report:', err);
  }
}

/**
 * Clear all pending reports
 */
export function clearPendingReports() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('civic_offline_queue_updated'));
}

/**
 * Hook or listener helper for connectivity change
 */
export function subscribeConnectivity(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
