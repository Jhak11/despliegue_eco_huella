import express from 'express';
import {
    getQuestionnaire,
    submitQuestionnaire,
    getResults,
    getResultById
} from '../controllers/questionnaireController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All questionnaire routes require authentication
router.use(authenticateToken);

router.get('/', getQuestionnaire);
router.post('/submit', submitQuestionnaire);
router.get('/results', getResults);
router.get('/results/:id', getResultById);

export default router;
