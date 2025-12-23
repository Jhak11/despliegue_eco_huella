import db from '../config/database.js';

/**
 * Update health for all users based on inactivity
 * Should be run daily via cron job
 */
export function updateAllGoleminoHealth() {
    try {
        const users = db.prepare(`
            SELECT user_id, golemino_health, last_golemino_interaction 
            FROM user_profile
        `).all();

        const now = new Date();
        let updatedCount = 0;

        users.forEach(user => {
            const lastInteraction = new Date(user.last_golemino_interaction);
            const daysSinceInteraction = Math.floor((now - lastInteraction) / (1000 * 60 * 60 * 24));

            if (daysSinceInteraction >= 1) {
                // Reduce health by 20 per day of inactivity
                const healthReduction = daysSinceInteraction * 20;
                const newHealth = Math.max(0, user.golemino_health - healthReduction);
                const newStatus = calculateHealthStatus(newHealth);

                db.prepare(`
                    UPDATE user_profile 
                    SET golemino_health = ?,
                        golemino_status = ?
                    WHERE user_id = ?
                `).run(newHealth, newStatus, user.user_id);

                updatedCount++;
            }
        });

        console.log(`✅ Updated health for ${updatedCount} Goleminos`);
        return { success: true, updatedCount };
    } catch (error) {
        console.error('Error updating Golemino health:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Calculate health status based on health percentage
 */
function calculateHealthStatus(health) {
    if (health >= 80) return 'healthy';
    if (health >= 60) return 'sick_mild';
    if (health >= 40) return 'sick_moderate';
    if (health >= 20) return 'sick_severe';
    return 'sick_critical';
}

/**
 * Get health statistics for all Goleminos
 */
export function getGoleminoHealthStats() {
    try {
        const stats = db.prepare(`
            SELECT 
                golemino_status,
                COUNT(*) as count
            FROM user_profile
            GROUP BY golemino_status
        `).all();

        const phaseStats = db.prepare(`
            SELECT 
                golemino_phase,
                COUNT(*) as count
            FROM user_profile
            GROUP BY golemino_phase
        `).all();

        return {
            healthStats: stats,
            phaseStats: phaseStats
        };
    } catch (error) {
        console.error('Error getting Golemino stats:', error);
        return null;
    }
}
