import express from 'express';
import { getWards } from '../controllers/wardController.js';

const router = express.Router();

router.get('/', getWards);

export default router;
