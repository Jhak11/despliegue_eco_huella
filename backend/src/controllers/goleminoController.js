import { query } from '../config/database.js';

/**
 * Get Golemino status for the authenticated user
 */
export async function getGoleminoStatus(req, res) {
    try {
        const userId = req.user.userId;

        const result = await query(`
            SELECT 
                up.golemino_phase,
                up.golemino_health,
                up.golemino_status,
                up.last_golemino_interaction,
                up.golemino_fed_count,
                up.coins,
                u.created_at
            FROM user_profile up
            JOIN users u ON up.user_id = u.id
            WHERE up.user_id = $1
        `, [userId]);

        const profile = result.rows[0];

        if (!profile) {
            return res.status(404).json({ error: 'Perfil no encontrado' });
        }

        // Calculate health status label based on percentage
        let healthLabel = 'Excelente';
        if (profile.golemino_health >= 80) healthLabel = 'Excelente';
        else if (profile.golemino_health >= 60) healthLabel = 'Bueno';
        else if (profile.golemino_health >= 40) healthLabel = 'Regular';
        else if (profile.golemino_health >= 20) healthLabel = 'Malo';
        else healthLabel = 'Crítico';

        // Calculate lifetime days - ensure it's never negative
        let lifetime_days = 0;
        if (profile.created_at) {
            const createdAt = new Date(profile.created_at);
            const now = new Date();
            const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
            lifetime_days = Math.max(0, daysDiff); // Ensure non-negative
        }

        // Calculate next evolution progress
        const evolutionCosts = { baby: 500, young: 1500, titan: null };
        const nextCost = evolutionCosts[profile.golemino_phase];
        let evolutionProgress = 0;

        if (nextCost) {
            evolutionProgress = Math.min(100, Math.floor((profile.coins / nextCost) * 100));
        }

        res.json({
            golemino_phase: profile.golemino_phase,
            golemino_health: profile.golemino_health,
            golemino_status: profile.golemino_status,
            last_golemino_interaction: profile.last_golemino_interaction,
            golemino_fed_count: profile.golemino_fed_count,
            coins: profile.coins,
            healthLabel,
            canEvolve: canEvolveToNextPhase(profile.golemino_phase, profile.coins),
            lifetime_days,
            next_evolution_cost: nextCost,
            evolution_progress: evolutionProgress
        });
    } catch (error) {
        console.error('Get Golemino status error:', error);
        res.status(500).json({ error: 'Error al obtener estado de Golemino' });
    }
}

/**
 * Feed Golemino (costs Brotos, restores health)
 */
export async function feedGolemino(req, res) {
    try {
        const userId = req.user.userId;
        const FEED_COST = 20;
        const HEALTH_GAIN = 30;

        const profileResult = await query('SELECT coins, golemino_health FROM user_profile WHERE user_id = $1', [userId]);
        const profile = profileResult.rows[0];

        if (profile.coins < FEED_COST) {
            return res.status(400).json({ error: 'No tienes suficientes Brotos para alimentar a Golemino' });
        }

        const newHealth = Math.min(100, profile.golemino_health + HEALTH_GAIN);
        const newStatus = calculateHealthStatus(newHealth);

        await query(`
            UPDATE user_profile 
            SET coins = coins - $1,
                golemino_health = $2,
                golemino_status = $3,
                last_golemino_interaction = CURRENT_TIMESTAMP,
                golemino_fed_count = golemino_fed_count + 1
            WHERE user_id = $4
        `, [FEED_COST, newHealth, newStatus, userId]);

        res.json({
            success: true,
            message: '¡Golemino alimentado! 🍃',
            healthGained: HEALTH_GAIN,
            newHealth,
            newStatus,
            brotosSpent: FEED_COST
        });
    } catch (error) {
        console.error('Feed Golemino error:', error);
        res.status(500).json({ error: 'Error al alimentar a Golemino' });
    }
}

/**
 * Heal Golemino (costs more Brotos, fully restores health)
 */
export async function healGolemino(req, res) {
    try {
        const userId = req.user.userId;
        const HEAL_COST = 50;

        const profileResult = await query('SELECT coins, golemino_status FROM user_profile WHERE user_id = $1', [userId]);
        const profile = profileResult.rows[0];

        if (profile.coins < HEAL_COST) {
            return res.status(400).json({ error: 'No tienes suficientes Brotos para curar a Golemino' });
        }

        if (profile.golemino_status === 'healthy') {
            return res.status(400).json({ error: 'Golemino ya está sano' });
        }

        await query(`
            UPDATE user_profile 
            SET coins = coins - $1,
                golemino_health = 100,
                golemino_status = 'healthy',
                last_golemino_interaction = CURRENT_TIMESTAMP
            WHERE user_id = $2
        `, [HEAL_COST, userId]);

        res.json({
            success: true,
            message: '¡Golemino curado completamente! 💚',
            brotosSpent: HEAL_COST
        });
    } catch (error) {
        console.error('Heal Golemino error:', error);
        res.status(500).json({ error: 'Error al curar a Golemino' });
    }
}

/**
 * Evolve Golemino to next phase
 */
export async function evolveGolemino(req, res) {
    try {
        const userId = req.user.userId;

        const profileResult = await query('SELECT golemino_phase, coins FROM user_profile WHERE user_id = $1', [userId]);
        const profile = profileResult.rows[0];

        const evolutionCosts = {
            baby: { next: 'young', cost: 500 },
            young: { next: 'titan', cost: 1500 },
            titan: null
        };

        const evolution = evolutionCosts[profile.golemino_phase];

        if (!evolution) {
            return res.status(400).json({ error: 'Golemino ya está en su fase máxima' });
        }

        if (profile.coins < evolution.cost) {
            return res.status(400).json({
                error: `Necesitas ${evolution.cost} Brotos para evolucionar`,
                required: evolution.cost,
                current: profile.coins
            });
        }

        // Update profile
        await query(`
            UPDATE user_profile 
            SET coins = coins - $1,
                golemino_phase = $2,
                last_golemino_interaction = CURRENT_TIMESTAMP
            WHERE user_id = $3
        `, [evolution.cost, evolution.next, userId]);

        // Record evolution history
        await query(`
            INSERT INTO golemino_evolution_history (user_id, from_phase, to_phase, brotos_spent)
            VALUES ($1, $2, $3, $4)
        `, [userId, profile.golemino_phase, evolution.next, evolution.cost]);

        res.json({
            success: true,
            message: `¡Golemino evolucionó a ${evolution.next.toUpperCase()}! 🎉`,
            fromPhase: profile.golemino_phase,
            toPhase: evolution.next,
            brotosSpent: evolution.cost
        });
    } catch (error) {
        console.error('Evolve Golemino error:', error);
        res.status(500).json({ error: 'Error al evolucionar a Golemino' });
    }
}

/**
 * Get evolution history
 */
export async function getEvolutionHistory(req, res) {
    try {
        const userId = req.user.userId;

        const result = await query(`
            SELECT * FROM golemino_evolution_history
            WHERE user_id = $1
            ORDER BY evolved_at DESC
        `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Get evolution history error:', error);
        res.status(500).json({ error: 'Error al obtener historial de evolución' });
    }
}

/**
 * Pet Golemino (free interaction, small health boost, once per day)
 */
export async function petGolemino(req, res) {
    try {
        const userId = req.user.userId;
        const HEALTH_GAIN = 5;

        const profileResult = await query(`
            SELECT golemino_health, last_golemino_interaction 
            FROM user_profile 
            WHERE user_id = $1
        `, [userId]);
        const profile = profileResult.rows[0];

        // Check if already petted today (only if there was a previous interaction)
        if (profile.last_golemino_interaction) {
            const lastInteraction = new Date(profile.last_golemino_interaction);
            const now = new Date();
            const hoursSinceLastPet = (now - lastInteraction) / (1000 * 60 * 60);

            if (hoursSinceLastPet < 24) {
                return res.status(400).json({
                    error: 'Ya acariciaste a Golemino hoy',
                    nextPetAvailable: new Date(lastInteraction.getTime() + 24 * 60 * 60 * 1000)
                });
            }
        }

        const newHealth = Math.min(100, profile.golemino_health + HEALTH_GAIN);
        const newStatus = calculateHealthStatus(newHealth);

        await query(`
            UPDATE user_profile 
            SET golemino_health = $1,
                golemino_status = $2,
                last_golemino_interaction = CURRENT_TIMESTAMP
            WHERE user_id = $3
        `, [newHealth, newStatus, userId]);

        res.json({
            success: true,
            message: '¡Golemino está feliz! 💚',
            healthGained: HEALTH_GAIN,
            newHealth
        });
    } catch (error) {
        console.error('Pet Golemino error:', error);
        res.status(500).json({ error: 'Error al acariciar a Golemino' });
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateHealthStatus(health) {
    if (health >= 80) return 'healthy';
    if (health >= 60) return 'sick_mild';
    if (health >= 40) return 'sick_moderate';
    if (health >= 20) return 'sick_severe';
    return 'sick_critical';
}

function canEvolveToNextPhase(currentPhase, coins) {
    const evolutionCosts = {
        baby: 500,
        young: 1500,
        titan: null
    };

    const cost = evolutionCosts[currentPhase];
    return cost !== null && coins >= cost;
}
