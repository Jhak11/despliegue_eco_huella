import express from 'express';
import {
    getGoleminoStatus,
    feedGolemino,
    healGolemino,
    evolveGolemino,
    getEvolutionHistory,
    petGolemino
} from '../controllers/goleminoController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All Golemino routes require authentication
router.use(authenticateToken);

// Status and info
router.get('/status', getGoleminoStatus);
router.get('/evolution-history', getEvolutionHistory);

// Interactions
router.post('/feed', feedGolemino);
router.post('/heal', healGolemino);
router.post('/pet', petGolemino);
router.post('/evolve', evolveGolemino);

export default router;
