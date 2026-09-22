import express from 'express';
import { analyzeImage, getAiStatus, configureApiKey } from '../controllers/aiController.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// POST /api/ai/analyze - Multipart image upload for vision analysis
router.post('/analyze', upload.single('image'), analyzeImage);

// GET /api/ai/status - Returns active vision engine
router.get('/status', getAiStatus);

// POST /api/ai/configure-key - Configure cloud API keys dynamically
router.post('/configure-key', express.json(), configureApiKey);

export default router;
