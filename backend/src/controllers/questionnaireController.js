import { query } from '../config/database.js';
import { questionnaireStructure, calculateCarbonFootprint } from '../utils/carbonCalculator.js';
import * as gamificationService from '../services/gamificationService.js';

// Get questionnaire structure
export function getQuestionnaire(req, res) {
    try {
        res.json({
            questions: questionnaireStructure,
            disclaimer: 'Este cuestionario se basa en las metodologías del IPCC (2006, 2019), el GHG Protocol, y factores regionales reportados por la CEPAL, FAO y ministerios ambientales de Latinoamérica. Los valores presentados son estimaciones educativas y comparativas.'
        });
    } catch (error) {
        console.error('Get questionnaire error:', error);
        res.status(500).json({ error: 'Error al obtener cuestionario' });
    }
}

// Submit questionnaire and calculate footprint
export async function submitQuestionnaire(req, res) {
    try {
        const { answers } = req.body;
        const userId = req.user.userId;

        // Validate answers
        if (!answers || typeof answers !== 'object') {
            return res.status(400).json({ error: 'Respuestas inválidas' });
        }

        // Check all questions are answered
        const requiredQuestions = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11'];
        const missingQuestions = requiredQuestions.filter(q => answers[q] === undefined);

        if (missingQuestions.length > 0) {
            return res.status(400).json({
                error: 'Faltan respuestas',
                missing: missingQuestions
            });
        }

        // Calculate carbon footprint
        const results = calculateCarbonFootprint(answers);

        // Save results to database
        const insertResult = await query(`
      INSERT INTO questionnaire_results 
      (user_id, transport_score, energy_score, food_score, waste_score, water_score, total_footprint, answers)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
            userId,
            results.transport,
            results.energy,
            results.food,
            results.waste,
            results.water,
            results.total,
            JSON.stringify(answers)
        ]);

        const resultId = insertResult.rows[0].id;

        // Get user profile for comparison
        const profileResult = await query('SELECT regional_footprint, base_footprint, current_footprint FROM user_profile WHERE user_id = $1', [userId]);
        const profile = profileResult.rows[0];

        // Update user profile with footprint
        const isFirstCalculation = !profile.base_footprint;

        if (isFirstCalculation) {
            // First calculation - set as base
            await query(`
        UPDATE user_profile 
        SET base_footprint = $1, current_footprint = $2, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $3
      `, [results.total, results.total, userId]);
        } else {
            // Update current footprint
            await query(`
        UPDATE user_profile 
        SET current_footprint = $1, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2
      `, [results.total, userId]);
        }

        // Grant rewards for completing questionnaire
        const xpReward = 25;
        const coinsReward = 15;

        const xpResult = await gamificationService.addExperience(userId, xpReward, 'questionnaire');
        await gamificationService.addCoins(userId, coinsReward, 'questionnaire');

        // Check for badges
        const newBadges = await gamificationService.checkAndUnlockBadges(userId);

        res.json({
            id: resultId,
            results,
            comparison: {
                regional_baseline: profile.regional_footprint,
                difference: results.total - profile.regional_footprint,
                percentage: ((results.total / profile.regional_footprint - 1) * 100).toFixed(1),
                base_footprint: profile.base_footprint,
                is_first_calculation: isFirstCalculation
            },
            rewards: {
                xp: xpReward,
                coins: coinsReward,
                leveledUp: xpResult.leveledUp,
                newLevel: xpResult.newLevel,
                newBadges
            }
        });
    } catch (error) {
        console.error('Submit questionnaire error:', error);
        res.status(500).json({ error: 'Error al procesar cuestionario' });
    }
}

// Get questionnaire results history
export async function getResults(req, res) {
    try {
        const userId = req.user.userId;
        const { limit = 10 } = req.query;

        const result = await query(`
      SELECT id, transport_score, energy_score, food_score, waste_score, water_score, 
             total_footprint, created_at
      FROM questionnaire_results
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [userId, parseInt(limit)]);

        res.json(result.rows);
    } catch (error) {
        console.error('Get results error:', error);
        res.status(500).json({ error: 'Error al obtener resultados' });
    }
}

// Get specific result details
export async function getResultById(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const result = await query(`
      SELECT * FROM questionnaire_results
      WHERE id = $1 AND user_id = $2
    `, [id, userId]);

        const data = result.rows[0];

        if (!data) {
            return res.status(404).json({ error: 'Resultado no encontrado' });
        }

        // Parse answers JSON
        data.answers = JSON.parse(data.answers);

        res.json(data);
    } catch (error) {
        console.error('Get result error:', error);
        res.status(500).json({ error: 'Error al obtener resultado' });
    }
}
