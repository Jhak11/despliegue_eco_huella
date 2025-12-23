import express from 'express';
import {
    getGamifiedProfile,
    updateGamifiedProfile,
    getLeaderboard,
    getLevels,
    getRanks,
    getUserBadges,
    getAllBadges,
    equipBadge,
    getRewardsHistory
} from '../controllers/gamificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All gamification routes require authentication
router.use(authenticateToken);

// Profile
router.get('/profile', getGamifiedProfile);
router.put('/profile', updateGamifiedProfile);

// Leaderboard
router.get('/leaderboard', getLeaderboard);

// Levels and Ranks
router.get('/levels', getLevels);
router.get('/ranks', getRanks);

// Badges
router.get('/badges/user', getUserBadges);
router.get('/badges/all', getAllBadges);
router.post('/badges/equip/:badgeId', equipBadge);

// Rewards
router.get('/rewards/history', getRewardsHistory);

export default router;
