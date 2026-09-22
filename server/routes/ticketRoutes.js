import express from 'express';
import {
  createTicket,
  getTickets,
  getMyTickets,
  getTicketById,
  deleteTicket,
  assignWorker,
  startTask,
  submitResolution,
  approveResolution,
  requestRework,
  updateStatus,
} from '../controllers/ticketController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { requireAuth, requireRole, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/tickets - Citizen or Guest reports an issue
router.post('/', upload.single('image'), optionalAuth, createTicket);

// GET /api/tickets/my - Authenticated citizen gets their own reports
router.get('/my', requireAuth, requireRole('citizen', 'authority'), getMyTickets);

// GET /api/tickets - Role-filtered tickets (Authority: department, Worker: assigned, Citizen: own)
router.get('/', optionalAuth, getTickets);

// GET /api/tickets/:id - Single ticket details with role verification
router.get('/:id', optionalAuth, getTicketById);

// DELETE /api/tickets/:id - ONLY Authority can remove a completed/processed task
router.delete('/:id', requireAuth, requireRole('authority'), deleteTicket);

// PATCH /api/tickets/:id/assign-worker - ONLY Authority assigns field workers
router.patch('/:id/assign-worker', requireAuth, requireRole('authority'), assignWorker);

// PATCH /api/tickets/:id/start-task and /:id/start - Worker starts task -> In Progress
router.patch('/:id/start-task', requireAuth, requireRole('worker', 'authority'), startTask);
router.patch('/:id/start', requireAuth, requireRole('worker', 'authority'), startTask);

// POST /api/tickets/:id/resolution - Worker uploads completion photo -> Pending Verification
router.post(
  '/:id/resolution',
  upload.single('resolutionPhoto'),
  requireAuth,
  requireRole('worker', 'authority'),
  submitResolution
);

// PATCH & POST /api/tickets/:id/approve-resolution - Authority approves resolution -> Resolved
router.patch(
  '/:id/approve-resolution',
  requireAuth,
  requireRole('authority'),
  approveResolution
);
router.post(
  '/:id/approve-resolution',
  requireAuth,
  requireRole('authority'),
  approveResolution
);

// PATCH & POST /api/tickets/:id/request-rework - Authority requests rework -> Rework Required
router.patch(
  '/:id/request-rework',
  requireAuth,
  requireRole('authority'),
  requestRework
);
router.post(
  '/:id/request-rework',
  requireAuth,
  requireRole('authority'),
  requestRework
);

// PATCH /api/tickets/:id/status - Status override (Authority / Worker)
router.patch('/:id/status', requireAuth, requireRole('authority', 'worker'), updateStatus);

export default router;
