import { query } from '../config/database.js';
import * as gamificationService from '../services/gamificationService.js';

/**
 * Get available challenges for user
 */
export async function getAvailableChallenges(req, res) {
    try {
        const userId = req.user.userId;
        const { category_id } = req.query;

        let sql = `
      SELECT c.*, cc.name as category_name, cc.icon as category_icon, cc.color as category_color
      FROM challenges c
      JOIN challenge_categories cc ON c.category_id = cc.id
      WHERE c.is_active = TRUE
    `;

        const params = [];
        let paramIndex = 1;

        if (category_id) {
            sql += ` AND c.category_id = $${paramIndex++}`;
            params.push(category_id);
        }

        sql += ' ORDER BY c.difficulty, c.xp_reward DESC';

        const result = await query(sql, params);

        res.json(result.rows);
    } catch (error) {
        console.error('Get available challenges error:', error);
        res.status(500).json({ error: 'Error al obtener retos disponibles' });
    }
}

/**
 * Get user's active missions
 */
export async function getActiveMissions(req, res) {
    try {
        const userId = req.user.userId;

        const result = await query(`
      SELECT 
        um.*,
        c.title,
        c.description,
        c.difficulty,
        c.xp_reward,
        c.coins_reward,
        c.co2_impact,
        cc.name as category_name,
        cc.icon as category_icon,
        cc.color as category_color
      FROM user_missions um
      JOIN challenges c ON um.challenge_id = c.id
      JOIN challenge_categories cc ON c.category_id = cc.id
      WHERE um.user_id = $1 AND um.status = 'active'
      ORDER BY um.assigned_at DESC
    `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Get active missions error:', error);
        res.status(500).json({ error: 'Error al obtener misiones activas' });
    }
}

/**
 * Get mission history
 */
export async function getMissionHistory(req, res) {
    try {
        const userId = req.user.userId;
        const { limit = 20 } = req.query;

        const result = await query(`
      SELECT 
        mh.*,
        c.title,
        c.description,
        cc.name as category_name,
        cc.icon as category_icon
      FROM mission_history mh
      JOIN challenges c ON mh.challenge_id = c.id
      JOIN challenge_categories cc ON c.category_id = cc.id
      WHERE mh.user_id = $1
      ORDER BY mh.completed_at DESC
      LIMIT $2
    `, [userId, parseInt(limit)]);

        res.json(result.rows);
    } catch (error) {
        console.error('Get mission history error:', error);
        res.status(500).json({ error: 'Error al obtener historial de misiones' });
    }
}

/**
 * Get mission heatmap data (GitHub style)
 */
export async function getMissionHeatmap(req, res) {
    try {
        const userId = req.user.userId;

        // Group by date (YYYY-MM-DD) count
        // PostgreSQL: TO_CHAR(completed_at, 'YYYY-MM-DD')
        const result = await query(`
            SELECT 
                TO_CHAR(completed_at, 'YYYY-MM-DD') as date,
                COUNT(*) as count
            FROM mission_history
            WHERE user_id = $1
            AND completed_at >= CURRENT_DATE - INTERVAL '365 days'
            GROUP BY date
        `, [userId]);

        // Convert to object map for easy lookup { "2023-10-25": 5 }
        const heatmapMap = {};
        result.rows.forEach(item => {
            heatmapMap[item.date] = parseInt(item.count);
        });

        res.json(heatmapMap);
    } catch (error) {
        console.error('Get mission heatmap error:', error);
        res.status(500).json({ error: 'Error al obtener mapa de calor' });
    }
}

/**
 * Assign a challenge to user
 */
export async function assignChallenge(req, res) {
    try {
        const userId = req.user.userId;
        const { challengeId } = req.params;

        // Check if challenge exists
        const challengeResult = await query('SELECT * FROM challenges WHERE id = $1 AND is_active = TRUE', [challengeId]);
        const challenge = challengeResult.rows[0];

        if (!challenge) {
            return res.status(404).json({ error: 'Reto no encontrado' });
        }

        // Check if user already has this mission active
        const existingMissionResult = await query(`
      SELECT id FROM user_missions 
      WHERE user_id = $1 AND challenge_id = $2 AND status = 'active'
    `, [userId, challengeId]);

        if (existingMissionResult.rows.length > 0) {
            return res.status(400).json({ error: 'Ya tienes esta misión activa' });
        }

        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + challenge.duration_days);

        // Assign mission
        const insertResult = await query(`
      INSERT INTO user_missions (user_id, challenge_id, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [userId, challengeId, expiresAt.toISOString()]);

        const missionId = insertResult.rows[0].id;

        // Get the created mission
        const missionResult = await query(`
      SELECT 
        um.*,
        c.title,
        c.description,
        c.xp_reward,
        c.coins_reward,
        cc.name as category_name,
        cc.icon as category_icon
      FROM user_missions um
      JOIN challenges c ON um.challenge_id = c.id
      JOIN challenge_categories cc ON c.category_id = cc.id
      WHERE um.id = $1
    `, [missionId]);

        res.status(201).json(missionResult.rows[0]);
    } catch (error) {
        console.error('Assign challenge error:', error);
        res.status(500).json({ error: 'Error al asignar misión' });
    }
}

/**
 * Complete a mission
 */
export async function completeMission(req, res) {
    try {
        const userId = req.user.userId;
        const { missionId } = req.params;

        // Get mission
        const missionResult = await query(`
      SELECT um.*, c.xp_reward, c.coins_reward, c.co2_impact, c.category_id as challenge_id
      FROM user_missions um
      JOIN challenges c ON um.challenge_id = c.id
      WHERE um.id = $1 AND um.user_id = $2 AND um.status = 'active'
    `, [missionId, userId]);

        const mission = missionResult.rows[0];

        if (!mission) {
            return res.status(404).json({ error: 'Misión no encontrada o ya completada' });
        }

        // Update mission status
        await query(`
      UPDATE user_missions 
      SET status = 'completed', 
          completed_at = CURRENT_TIMESTAMP,
          xp_earned = $1,
          coins_earned = $2
      WHERE id = $3
    `, [mission.xp_reward, mission.coins_reward, missionId]);

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

        // Grant rewards
        const xpResult = await gamificationService.addExperience(userId, mission.xp_reward, 'mission');
        await gamificationService.addCoins(userId, mission.coins_reward, 'mission');

        // Update streak
        const newStreak = await gamificationService.updateStreak(userId);

        // Update rank
        const newRank = await gamificationService.updateUserRank(userId);

        // Check for new badges
        const newBadges = await gamificationService.checkAndUnlockBadges(userId);

        res.json({
            message: 'Misión completada exitosamente',
            rewards: {
                xp: mission.xp_reward,
                coins: mission.coins_reward,
                co2_saved: mission.co2_impact,
                leveledUp: xpResult.leveledUp,
                newLevel: xpResult.newLevel,
                newStreak,
                newRank,
                newBadges
            }
        });
    } catch (error) {
        console.error('Complete mission error:', error);
        res.status(500).json({ error: 'Error al completar misión' });
    }
}

/**
 * Skip a mission
 */
export async function skipMission(req, res) {
    try {
        const userId = req.user.userId;
        const { missionId } = req.params;

        const result = await query(`
      UPDATE user_missions 
      SET status = 'skipped'
      WHERE id = $1 AND user_id = $2 AND status = 'active'
    `, [missionId, userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Misión no encontrada' });
        }

        res.json({ message: 'Misión omitida' });
    } catch (error) {
        console.error('Skip mission error:', error);
        res.status(500).json({ error: 'Error al omitir misión' });
    }
}

/**
 * Get challenge categories
 */
export async function getCategories(req, res) {
    try {
        const result = await query('SELECT * FROM challenge_categories');
        res.json(result.rows);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
}

/**
 * Get daily recommended missions
 */
export async function getDailyMissions(req, res) {
    try {
        const userId = req.user.userId;

        // Get 3 random challenges from different categories
        // Postgres: RANDOM() works
        const result = await query(`
      SELECT c.*, cc.name as category_name, cc.icon as category_icon, cc.color as category_color
      FROM challenges c
      JOIN challenge_categories cc ON c.category_id = cc.id
      WHERE c.is_active = TRUE
      AND c.id NOT IN (
        SELECT challenge_id FROM user_missions 
        WHERE user_id = $1 AND status = 'active'
      )
      ORDER BY RANDOM()
      LIMIT 3
    `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Get daily missions error:', error);
        res.status(500).json({ error: 'Error al obtener misiones diarias' });
    }
}


