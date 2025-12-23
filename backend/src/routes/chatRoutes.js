import express from 'express';
import { getHook, chatMessage } from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public route for hook (or protected, decided to make it public for ease, but app is mostly protected)
// Let's make it protected to consistently use auth if user is logged in
router.get('/hook', authenticateToken, getHook);
router.post('/message', authenticateToken, chatMessage);

export default router;
