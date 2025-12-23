import { query } from '../config/database.js';
import * as gamificationService from '../services/gamificationService.js';

/**
 * Get user's gamified profile
 */
export async function getGamifiedProfile(req, res) {
    try {
        const userId = req.user.userId;

        const stats = await gamificationService.getUserStats(userId);

        if (!stats) {
            return res.status(404).json({ error: 'Perfil no encontrado' });
        }

        res.json(stats);
    } catch (error) {
        console.error('Get gamified profile error:', error);
        res.status(500).json({ error: 'Error al obtener perfil gamificado' });
    }
}

/**
 * Heal Golemino
 */
export async function healGolemino(req, res) {
    try {
        const userId = req.user.userId;
        const HEAL_COST = 50; // Cost in Brotos

        const userResult = await query('SELECT coins FROM user_profile WHERE user_id = $1', [userId]);
        const user = userResult.rows[0];

        if (user.coins < HEAL_COST) {
            return res.status(400).json({ error: 'No tienes suficientes Brotos' });
        }

        // Ideally wrap in transaction, but for now sequential await is okay for this scale
        // NOTE: In production, use client = await pool.connect() and BEGIN/COMMIT
        await query('UPDATE user_profile SET coins = coins - $1, golemino_status = $2, last_golemino_interaction = CURRENT_TIMESTAMP WHERE user_id = $3', [HEAL_COST, 'healthy', userId]);

        res.json({ success: true, message: '¡Golemino curado!', cost: HEAL_COST });
    } catch (error) {
        console.error('Heal golemino error:', error);
        res.status(500).json({ error: 'Error al curar a Golemino' });
    }
}

/**
 * Update gamified profile (name, avatar, age)
 */
export async function updateGamifiedProfile(req, res) {
    try {
        const userId = req.user.userId;
        const { name, avatar, age } = req.body;

        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            values.push(name);
        }
        if (avatar !== undefined) {
            updates.push(`avatar = $${paramIndex++}`);
            values.push(avatar);
        }
        if (age !== undefined) {
            updates.push(`age = $${paramIndex++}`);
            values.push(age);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No hay datos para actualizar' });
        }

        values.push(userId);

        await query(`
      UPDATE user_profile 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${paramIndex}
    `, values);

        const updatedStats = await gamificationService.getUserStats(userId);
        res.json(updatedStats);
    } catch (error) {
        console.error('Update gamified profile error:', error);
        res.status(500).json({ error: 'Error al actualizar perfil' });
    }
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(req, res) {
    try {
        const { limit = 10, type = 'level' } = req.query;

        let orderBy = 'level DESC, experience DESC';
        if (type === 'missions') {
            orderBy = 'total_missions_completed DESC';
        } else if (type === 'streak') {
            orderBy = 'streak_days DESC';
        }

        let sql = `
      SELECT 
        up.user_id,
        up.name,
        up.avatar,
        up.level,
        up.experience,
        up.rank,
        up.rank_icon,
        up.total_missions_completed,
        up.streak_days
      FROM user_profile up
    `;

        if (type === 'weekly') {
            // Calculate start of week (Sunday)
            const now = new Date();
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            startOfWeek.setHours(0, 0, 0, 0);

            sql = `
                SELECT 
                    up.user_id,
                    up.name, 
                    up.avatar, 
                    up.rank,
                    up.rank_icon,
                    COALESCE(SUM(mh.xp_earned), 0) as weekly_xp
                FROM user_profile up
                LEFT JOIN mission_history mh ON up.user_id = mh.user_id 
                    AND mh.completed_at >= '${startOfWeek.toISOString()}'
                GROUP BY up.user_id
                ORDER BY weekly_xp DESC
            `;
        } else {
            sql += ` ORDER BY ${orderBy}`;
        }

        const limitVal = parseInt(limit);
        const result = await query(`${sql} LIMIT $1`, [limitVal]);
        res.json(result.rows);
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Error al obtener ranking' });
    }
}

/**
 * Get all levels configuration
 */
export async function getLevels(req, res) {
    try {
        const result = await query('SELECT * FROM levels ORDER BY level ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Get levels error:', error);
        res.status(500).json({ error: 'Error al obtener niveles' });
    }
}

/**
 * Get all ranks configuration
 */
export async function getRanks(req, res) {
    try {
        const result = await query('SELECT * FROM ranks ORDER BY min_level ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Get ranks error:', error);
        res.status(500).json({ error: 'Error al obtener rangos' });
    }
}

/**
 * Get user's badges
 */
export async function getUserBadges(req, res) {
    try {
        const userId = req.user.userId;

        const result = await query(`
      SELECT 
        b.*,
        ub.unlocked_at,
        ub.is_equipped
      FROM badges b
      JOIN user_badges ub ON b.id = ub.badge_id
      WHERE ub.user_id = $1
      ORDER BY ub.unlocked_at DESC
    `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Get user badges error:', error);
        res.status(500).json({ error: 'Error al obtener insignias' });
    }
}

/**
 * Get all available badges
 */
export async function getAllBadges(req, res) {
    try {
        const userId = req.user.userId;

        const result = await query(`
      SELECT 
        b.*,
        CASE WHEN ub.id IS NOT NULL THEN 1 ELSE 0 END as unlocked
      FROM badges b
      LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = $1
      WHERE b.is_active = TRUE
      ORDER BY b.rarity, b.category
    `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Get all badges error:', error);
        res.status(500).json({ error: 'Error al obtener insignias' });
    }
}

/**
 * Equip a badge
 */
export async function equipBadge(req, res) {
    try {
        const userId = req.user.userId;
        const { badgeId } = req.params;

        // Unequip all badges
        await query(`
      UPDATE user_badges 
      SET is_equipped = FALSE 
      WHERE user_id = $1
    `, [userId]);

        // Equip selected badge
        const result = await query(`
      UPDATE user_badges 
      SET is_equipped = TRUE 
      WHERE user_id = $1 AND badge_id = $2
    `, [userId, badgeId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Insignia no encontrada o no desbloqueada' });
        }

        res.json({ message: 'Insignia equipada correctamente' });
    } catch (error) {
        console.error('Equip badge error:', error);
        res.status(500).json({ error: 'Error al equipar insignia' });
    }
}

/**
 * Get rewards history
 */
export async function getRewardsHistory(req, res) {
    try {
        const userId = req.user.userId;
        const { limit = 20 } = req.query;

        const result = await query(`
      SELECT * FROM rewards_history
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [userId, parseInt(limit)]);

        res.json(result.rows);
    } catch (error) {
        console.error('Get rewards history error:', error);
        res.status(500).json({ error: 'Error al obtener historial de recompensas' });
    }
}
