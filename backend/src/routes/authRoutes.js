import express from 'express';
import { register, login, getCurrentUser, completeFirstLogin } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.post('/complete-first-login', authenticateToken, completeFirstLogin);

export default router;
