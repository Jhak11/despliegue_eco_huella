import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All profile routes require authentication
router.use(authenticateToken);

router.get('/', getProfile);
router.put('/', updateProfile);

export default router;
