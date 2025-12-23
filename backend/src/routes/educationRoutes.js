import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { completeTopic, getProgress } from '../controllers/educationController.js';

const router = express.Router();

router.post('/complete', authenticateToken, completeTopic);
router.get('/progress', authenticateToken, getProgress);

export default router;
