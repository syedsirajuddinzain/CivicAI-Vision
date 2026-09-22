import api from './api';

export const WORKER_STATUSES = ['Available', 'Assigned', 'Busy', 'Offline'];

/**
 * Fetch workers from backend
 */
export async function getWorkers(filter = {}) {
  const queryParams = new URLSearchParams();
  if (filter.departmentId) queryParams.append('departmentId', filter.departmentId);
  if (filter.wardId) queryParams.append('wardId', filter.wardId);
  if (filter.status) queryParams.append('status', filter.status);

  const qs = queryParams.toString();
  const url = qs ? `/api/workers?${qs}` : '/api/workers';

  const workers = await api.get(url);
  return Array.isArray(workers) ? workers : [];
}

/**
 * Get worker by ID
 */
export async function getWorkerById(workerId) {
  if (!workerId) return null;
  return await api.get(`/api/workers/${workerId}`);
}

/**
 * Add a new worker directly (Authority only)
 */
export async function createWorker(workerData) {
  return await api.post('/api/workers', workerData);
}

/**
 * Remove a worker from active roster (Authority only)
 */
export async function removeWorker(workerId) {
  return await api.delete(`/api/workers/${workerId}`);
}

/**
 * Get pending worker registration requests (Authority only)
 */
export async function getWorkerRequests() {
  const requests = await api.get('/api/workers/requests');
  return Array.isArray(requests) ? requests : [];
}

/**
 * Approve worker registration request (Authority only)
 */
export async function approveWorkerRequest(requestId) {
  return await api.patch(`/api/workers/requests/${requestId}/approve`, {});
}

/**
 * Reject worker registration request (Authority only)
 */
export async function rejectWorkerRequest(requestId) {
  return await api.patch(`/api/workers/requests/${requestId}/reject`, {});
}

/**
 * Get recommended workers for a ticket
 */
export async function getRecommendedWorkers(ticketId) {
  if (!ticketId) return [];
  const workers = await api.get(`/api/workers/recommended/${ticketId}`);
  return Array.isArray(workers) ? workers : [];
}

export const getSavedWorkers = getWorkers;
