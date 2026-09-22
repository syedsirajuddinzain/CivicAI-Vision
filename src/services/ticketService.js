/**
 * CivicAI - Real Dynamic Ticket Service
 * Interacts with Node.js/Express backend MongoDB endpoints.
 */

import api from './api';

export const TICKET_STATUSES = [
  'Reported',
  'Assigned',
  'In Progress',
  'Pending Verification',
  'Resolved',
  'Rework Required',
  'Rejected',
];

export const SEVERITY_LEVELS = ['Critical', 'High', 'Medium', 'Low'];

/**
 * Fetch all tickets (role-filtered on backend)
 */
export async function getTickets(filter = {}) {
  const queryParams = new URLSearchParams();
  if (filter.citizenId) queryParams.append('citizenId', filter.citizenId);
  if (filter.status && filter.status !== 'All') queryParams.append('status', filter.status);
  if (filter.departmentId) queryParams.append('departmentId', filter.departmentId);
  if (filter.wardId && filter.wardId !== 'All') queryParams.append('wardId', filter.wardId);
  if (filter.search) queryParams.append('search', filter.search);

  const qs = queryParams.toString();
  const url = qs ? `/api/tickets?${qs}` : '/api/tickets';

  const tickets = await api.get(url);
  return Array.isArray(tickets) ? tickets : [];
}

/**
 * Fetch ONLY authenticated citizen's own submitted reports
 */
export async function getMyTickets() {
  const tickets = await api.get('/api/tickets/my');
  return Array.isArray(tickets) ? tickets : [];
}

/**
 * Get single ticket by ID
 */
export async function getTicketById(id) {
  if (!id) return null;
  return await api.get(`/api/tickets/${id}`);
}

/**
 * Create a new civic report ticket in MongoDB
 */
export async function createTicket(ticketData) {
  const payload = {
    issueType: ticketData.issueType,
    description: ticketData.description,
    voiceTranscription: ticketData.voiceTranscription || '',
    severity: ticketData.severity,
    aiConfidence: ticketData.confidence || ticketData.aiConfidence,
    latitude: ticketData.latitude,
    longitude: ticketData.longitude,
    citizenId: ticketData.citizenId,
    image: ticketData.image,
    imageUrl: ticketData.imageUrl,
  };

  return await api.post('/api/tickets', payload);
}

/**
 * Permanently remove/delete a task (Authority only)
 */
export async function deleteTicket(ticketId) {
  return await api.delete(`/api/tickets/${ticketId}`);
}

/**
 * Assign worker to ticket (Authority only)
 */
export async function assignWorkerToTicket(ticketId, workerId) {
  return await api.patch(`/api/tickets/${ticketId}/assign-worker`, { workerId });
}

/**
 * Worker starts task -> Status: In Progress
 */
export async function startTicketTask(ticketId) {
  return await api.patch(`/api/tickets/${ticketId}/start-task`, {});
}

/**
 * Worker submits resolution with completion photo -> Status: Pending Verification
 */
export async function submitResolutionForVerification(ticketId, resolutionData) {
  return await api.post(`/api/tickets/${ticketId}/resolution`, {
    resolutionNote: resolutionData.resolutionNote,
    resolutionPhoto: resolutionData.resolutionPhoto,
  });
}

/**
 * Authority approves resolution -> Status: Resolved
 */
export async function approveResolution(ticketId, authorityNotes = '') {
  return await api.patch(`/api/tickets/${ticketId}/approve-resolution`, {
    authorityNotes,
  });
}

/**
 * Authority requests rework -> Status: Rework Required
 */
export async function requestRework(ticketId, reworkInstructions = '') {
  return await api.patch(`/api/tickets/${ticketId}/request-rework`, {
    reworkInstructions,
  });
}

export async function updateTicketStatus(ticketId, status, extra = {}) {
  return await api.patch(`/api/tickets/${ticketId}/status`, { status, ...extra });
}

export const getSavedTickets = getTickets;
