import { query } from '../config/database.js';
import * as gamificationService from '../services/gamificationService.js';
import * as assignmentService from '../services/missionAssignmentService.js';
// Export imported legacy controller methods
export {
    getAvailableChallenges,
    getActiveMissions,
    getMissionHistory,
    assignChallenge,
    skipMission,
    getCategories,
    getDailyMissions
} from './missionsController.js';

/**
 * Get today's missions (mandatory + pool)
 */
export async function getTodayMissions(req, res) {
    try {
        const userId = req.user.userId;
        // Use local YYYY-MM-DD to match assignment service
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;

        // Get or assign today's missions
        let missionsResult = await query(`
      SELECT 
        um.*,
        c.title,
        c.description,
        c.difficulty,
        c.xp_reward,
        c.coins_reward,
        c.co2_impact,
        c.direct_benefits,
        cc.name as category_name,
        cc.icon as category_icon,
        cc.color as category_color
      FROM user_missions um
      JOIN challenges c ON um.challenge_id = c.id
      JOIN challenge_categories cc ON c.category_id = cc.id
      WHERE um.user_id = $1 
        AND um.pool_date = $2 
        AND um.mission_type = 'daily'
    `, [userId, today]);

        let missions = missionsResult.rows;

        // If no missions for today, assign them
        if (missions.length === 0) {
            await assignmentService.assignDailyMissions(userId);

            // Fetch the newly assigned missions
            missionsResult = await query(`
        SELECT 
          um.*,
          c.title,
          c.description,
          c.difficulty,
          c.xp_reward,
          c.coins_reward,
          c.co2_impact,
          c.direct_benefits,
          cc.name as category_name,
          cc.icon as category_icon,
          cc.color as category_color
        FROM user_missions um
        JOIN challenges c ON um.challenge_id = c.id
        JOIN challenge_categories cc ON c.category_id = cc.id
        WHERE um.user_id = $1 
          AND um.pool_date = $2 
          AND um.mission_type = 'daily'
      `, [userId, today]);
            missions = missionsResult.rows;
        }

        // Parse direct_benefits JSON
        missions = missions.map(m => ({
            ...m,
            direct_benefits: m.direct_benefits ? JSON.parse(m.direct_benefits) : {}
        }));

        // Separate mandatory and pool
        // Handle boolean or integer (legacy)
        const mandatory = missions.find(m => m.is_mandatory === true || m.is_mandatory === 1);
        const pool = missions.filter(m => m.is_mandatory === false || m.is_mandatory === 0);

        // Calculate time remaining
        const expiresAt = new Date(year, month - 1, day, 23, 59, 59, 999);

        const nowMs = new Date().getTime();
        const expiresMs = expiresAt.getTime();
        const hoursRemaining = Math.max(0, Math.floor((expiresMs - nowMs) / (1000 * 60 * 60)));

        res.json({
            mandatory,
            pool,
            expiresAt: expiresAt.toISOString(),
            hoursRemaining
        });
    } catch (error) {
        console.error('Get today missions error:', error);
        res.status(500).json({ error: 'Error al obtener misiones del día' });
    }
}

/**
 * Get this week's missions
 */
export async function getWeeklyMissions(req, res) {
    try {
        const userId = req.user.userId;
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekStartStr = weekStart.toISOString().split('T')[0];

        // Get or assign this week's missions
        let missionsResult = await query(`
      SELECT 
        um.*,
        c.title,
        c.description,
        c.difficulty,
        c.xp_reward,
        c.coins_reward,
        c.co2_impact,
        c.direct_benefits,
        cc.name as category_name,
        cc.icon as category_icon,
        cc.color as category_color
      FROM user_missions um
      JOIN challenges c ON um.challenge_id = c.id
      JOIN challenge_categories cc ON c.category_id = cc.id
      WHERE um.user_id = $1 
        AND um.pool_date = $2 
        AND um.mission_type = 'weekly'
    `, [userId, weekStartStr]);

        let missions = missionsResult.rows;

        // If no missions for this week, assign them
        if (missions.length === 0) {
            await assignmentService.assignWeeklyMissions(userId);

            missionsResult = await query(`
        SELECT 
          um.*,
          c.title,
          c.description,
          c.difficulty,
          c.xp_reward,
          c.coins_reward,
          c.co2_impact,
          c.direct_benefits,
          cc.name as category_name,
          cc.icon as category_icon,
          cc.color as category_color
        FROM user_missions um
        JOIN challenges c ON um.challenge_id = c.id
        JOIN challenge_categories cc ON c.category_id = cc.id
        WHERE um.user_id = $1 
          AND um.pool_date = $2 
          AND um.mission_type = 'weekly'
      `, [userId, weekStartStr]);
            missions = missionsResult.rows;
        }

        // Parse direct_benefits JSON
        missions = missions.map(m => ({
            ...m,
            direct_benefits: m.direct_benefits ? JSON.parse(m.direct_benefits) : {}
        }));

        // Calculate time remaining
        const expiresAt = new Date(weekStart);
        expiresAt.setDate(expiresAt.getDate() + 7);
        expiresAt.setHours(23, 59, 59);
        const now = new Date();
        const daysRemaining = Math.max(0, Math.floor((expiresAt - now) / (1000 * 60 * 60 * 24)));

        res.json({
            pool: missions,
            expiresAt: expiresAt.toISOString(),
            daysRemaining
        });
    } catch (error) {
        console.error('Get weekly missions error:', error);
        res.status(500).json({ error: 'Error al obtener misiones semanales' });
    }
}

/**
 * Accept a mission from the pool
 */
export async function acceptMission(req, res) {
    try {
        const userId = req.user.userId;
        const { missionId } = req.params;

        // Check if mission exists and belongs to user
        const missionResult = await query(`
      SELECT * FROM user_missions
      WHERE id = $1 AND user_id = $2 AND status = 'active' AND is_mandatory = false
    `, [missionId, userId]);

        if (missionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Misión no encontrada' });
        }

        // Mark as accepted
        await query(`
      UPDATE user_missions
      SET accepted_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [missionId]);

        res.json({ message: 'Misión aceptada' });
    } catch (error) {
        console.error('Accept mission error:', error);
        res.status(500).json({ error: 'Error al aceptar misión' });
    }
}

/**
 * Increment mission progress (Check-in for daily/weekly missions)
 */
export async function incrementMissionProgress(req, res) {
    try {
        const userId = req.user.userId;
        const { missionId } = req.params;

        const missionResult = await query(`
            SELECT um.*, 
                   c.duration_days,
                   c.xp_reward, 
                   c.coins_reward, 
                   c.co2_impact, 
                   c.category_id
            FROM user_missions um
            JOIN challenges c ON um.challenge_id = c.id
            WHERE um.id = $1 AND um.user_id = $2 AND um.status = 'active'
        `, [missionId, userId]);

        const mission = missionResult.rows[0];

        if (!mission) {
            return res.status(404).json({ error: 'Misión no encontrada o no activa' });
        }

        // Check date validation to prevent multiple check-ins same day
        const today = new Date().toISOString().split('T')[0];
        if (mission.last_check_in === today) {
            return res.status(400).json({ error: 'Ya registraste el progreso de hoy' });
        }

        // Update progress
        const newProgress = (mission.progress || 0) + 1;

        await query(`
            UPDATE user_missions 
            SET progress = $1, 
                last_check_in = $2
            WHERE id = $3
        `, [newProgress, today, missionId]);

        // Check if fully completed
        const target = mission.max_progress || 1;

        let completed = false;
        let rewards = null;

        if (newProgress >= target) {
            // Auto complete if progress target reached
            completed = true;
            rewards = await completeMissionLogic(userId, mission);
        }

        res.json({
            message: completed ? '¡Misión completada!' : 'Progreso registrado',
            progress: newProgress,
            target: target,
            completed: completed,
            rewards: rewards
        });

    } catch (error) {
        console.error('Increment progress error:', error);
        res.status(500).json({ error: 'Error al registrar progreso' });
    }
}

/**
 * Helper to process mission completion logic
 */
async function completeMissionLogic(userId, mission) {
    // Update mission status
    await query(`
      UPDATE user_missions 
      SET status = 'completed', 
          completed_at = CURRENT_TIMESTAMP,
          xp_earned = $1,
          coins_earned = $2
      WHERE id = $3
    `, [mission.xp_reward, mission.coins_reward, mission.id]);

    // Add to mission history
    await query(`
      INSERT INTO mission_history (user_id, challenge_id, completed_at, xp_earned, coins_earned, co2_saved)
      VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5)
    `, [userId, mission.challenge_id, mission.xp_reward, mission.coins_reward, mission.co2_impact]);

    // Update user profile stats
    await query(`
      UPDATE user_profile 
      SET total_missions_completed = total_missions_completed + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `, [userId]);

    // Update user preferences
    await assignmentService.updatePreferencesAfterCompletion(userId, mission.category_id);

    // Grant rewards
    const xpResult = await gamificationService.addExperience(userId, mission.xp_reward, 'mission');
    await gamificationService.addCoins(userId, mission.coins_reward, 'mission');

    // Update streak, rank, badges
    const newStreak = await gamificationService.updateStreak(userId);
    const newRank = await gamificationService.updateUserRank(userId);
    const newBadges = await gamificationService.checkAndUnlockBadges(userId);

    return {
        xp: mission.xp_reward,
        coins: mission.coins_reward,
        co2_saved: mission.co2_impact,
        leveledUp: xpResult.leveledUp,
        newLevel: xpResult.newLevel,
        newStreak,
        newRank,
        newBadges
    };
}

/**
 * Complete a mission (Manual trigger)
 */
export async function completeMission(req, res) {
    try {
        const userId = req.user.userId;
        const { missionId } = req.params;

        // Get mission with challenge details
        const missionResult = await query(`
      SELECT um.*, c.xp_reward, c.coins_reward, c.co2_impact, c.category_id
      FROM user_missions um
      JOIN challenges c ON um.challenge_id = c.id
      WHERE um.id = $1 AND um.user_id = $2 AND um.status = 'active'
    `, [missionId, userId]);

        const mission = missionResult.rows[0];

        if (!mission) {
            return res.status(404).json({ error: 'Misión no encontrada o ya completada' });
        }

        // Workaround for undefined challenge_id in mission object if query didn't fetch it explicitly as expected in some legacy code
        // The join brings c.*, so c.id is mission.challenge_id from user_missions or c.id.
        // The previous query `um.*` includes challenge_id. Correct.

        const rewards = await completeMissionLogic(userId, mission);

        res.json({
            message: '¡Misión completada!',
            rewards
        });
    } catch (error) {
        console.error('Complete mission error:', error);
        res.status(500).json({ error: 'Error al completar misión' });
    }
}

/**
 * Get/Update user mission preferences
 */
export async function getPreferences(req, res) {
    try {
        const userId = req.user.userId;
        const prefs = await assignmentService.getUserPreferences(userId);
        res.json(prefs);
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({ error: 'Error al obtener preferencias' });
    }
}

export async function updatePreferences(req, res) {
    try {
        const userId = req.user.userId;
        const { time_availability, zone_type } = req.body;

        await query(`
      UPDATE user_mission_preferences
      SET time_availability = $1,
          zone_type = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $3
    `, [time_availability, zone_type, userId]);

        const prefs = await assignmentService.getUserPreferences(userId);
        res.json(prefs);
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({ error: 'Error al actualizar preferencias' });
    }
}


/**
 * Refresh daily missions pool (Cost: Brotos)
 */
export async function refreshDailyPool(req, res) {
    try {
        const userId = req.user.userId;
        const REFRESH_COST = 20;

        // Check balance
        const userResult = await query('SELECT coins FROM user_profile WHERE user_id = $1', [userId]);
        const user = userResult.rows[0];

        if (!user || user.coins < REFRESH_COST) {
            return res.status(400).json({ error: `Necesitas ${REFRESH_COST} Brotos para refrescar.` });
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;

        // Sequential operations for refresh

        // Deduct coins
        await query('UPDATE user_profile SET coins = coins - $1 WHERE user_id = $2', [REFRESH_COST, userId]);

        // Delete existing pool missions (Active but NOT accepted, type daily, not mandatory)
        await query(`
            DELETE FROM user_missions 
            WHERE user_id = $1 
                AND mission_type = 'daily' 
                AND is_mandatory = false 
                AND pool_date = $2 
                AND accepted_at IS NULL
        `, [userId, today]);

        // Re-generate pool
        const newPool = await assignmentService.generateDailyPool(userId);

        // Insert new missions
        const expiresAt = new Date(now);
        expiresAt.setHours(23, 59, 59, 999);

        for (const mission of newPool) {
            await query(`
                INSERT INTO user_missions (user_id, challenge_id, mission_type, is_mandatory, pool_date, expires_at, max_progress)
                VALUES ($1, $2, 'daily', false, $3, $4, 1)
            `, [userId, mission.id, today, expiresAt.toISOString()]);
        }

        // Return new pool for frontend update
        const refreshedMissionsResult = await query(`
            SELECT 
                um.*,
                c.title,
                c.description,
                c.difficulty,
                c.xp_reward,
                c.coins_reward,
                c.co2_impact,
                c.direct_benefits,
                cc.name as category_name,
                cc.icon as category_icon,
                cc.color as category_color
            FROM user_missions um
            JOIN challenges c ON um.challenge_id = c.id
            JOIN challenge_categories cc ON c.category_id = cc.id
            WHERE um.user_id = $1 
              AND um.pool_date = $2 
              AND um.mission_type = 'daily'
              AND um.is_mandatory = false
              AND um.accepted_at IS NULL
        `, [userId, today]);

        // Parse benefits
        const parsedMissions = refreshedMissionsResult.rows.map(m => ({
            ...m,
            direct_benefits: m.direct_benefits ? JSON.parse(m.direct_benefits) : {}
        }));

        res.json({
            message: 'Misiones refrescadas',
            pool: parsedMissions,
            newBalance: user.coins - REFRESH_COST
        });

    } catch (error) {
        console.error('Refresh pool error:', error);
        res.status(500).json({ error: 'Error al refrescar misiones' });
    }
}
