import express from 'express';
import {
    getAvailableChallenges,
    getActiveMissions,
    getMissionHistory,
    getMissionHeatmap, // Import new function
    assignChallenge,
    skipMission,
    getCategories,
    getDailyMissions
} from '../controllers/missionsController.js';
import {
    getTodayMissions,
    getWeeklyMissions,
    acceptMission,
    completeMission,
    incrementMissionProgress,

    getPreferences,
    updatePreferences,
    refreshDailyPool
} from '../controllers/enhancedMissionsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All mission routes require authentication
router.use(authenticateToken);

// Enhanced missions endpoints (new)
router.get('/today', getTodayMissions);
router.get('/weekly', getWeeklyMissions);
router.post('/accept/:missionId', acceptMission);
router.post('/complete/:missionId', completeMission);
router.post('/progress/:missionId', incrementMissionProgress);

// User preferences
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.post('/refresh-pool', refreshDailyPool);

// Original endpoints (backward compatibility)
router.get('/challenges', getAvailableChallenges);
router.get('/daily', getDailyMissions);
router.get('/categories', getCategories);
router.get('/active', getActiveMissions);
router.get('/history', getMissionHistory);
router.get('/heatmap', getMissionHeatmap); // New route
router.post('/assign/:challengeId', assignChallenge);
router.post('/skip/:missionId', skipMission);

export default router;
