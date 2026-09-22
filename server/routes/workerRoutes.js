import express from 'express';
import {
  getWorkers,
  getWorkerById,
  createWorker,
  removeWorker,
  getWorkerRequests,
  approveWorkerRequest,
  rejectWorkerRequest,
  getRecommended,
} from '../controllers/workerController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/workers - Authority and Worker can view active workers
router.get('/', requireAuth, requireRole('authority', 'worker'), getWorkers);

// POST /api/workers - Authority adds new worker directly
router.post('/', requireAuth, requireRole('authority'), createWorker);

// DELETE /api/workers/:id - Authority removes a worker from active roster
router.delete('/:id', requireAuth, requireRole('authority'), removeWorker);

// GET /api/workers/requests - Authority views pending worker registration requests
router.get('/requests', requireAuth, requireRole('authority'), getWorkerRequests);

// PATCH & POST /api/workers/requests/:id/approve - Authority approves worker request
router.patch('/requests/:id/approve', requireAuth, requireRole('authority'), approveWorkerRequest);
router.post('/requests/:id/approve', requireAuth, requireRole('authority'), approveWorkerRequest);

// PATCH & POST /api/workers/requests/:id/reject - Authority rejects worker request
router.patch('/requests/:id/reject', requireAuth, requireRole('authority'), rejectWorkerRequest);
router.post('/requests/:id/reject', requireAuth, requireRole('authority'), rejectWorkerRequest);

// GET /api/workers/recommended/:ticketId - Authority gets AI worker recommendations
router.get('/recommended/:ticketId', requireAuth, requireRole('authority'), getRecommended);

// GET /api/workers/:id - Worker or Authority views worker details
router.get('/:id', requireAuth, requireRole('authority', 'worker'), getWorkerById);

export default router;
