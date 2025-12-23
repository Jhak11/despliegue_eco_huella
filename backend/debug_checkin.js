import { query } from './src/config/database.js';

async function run() {
    try {
        console.log("Testing check-in...");
        const userId = 1;

        // Create a weekly mission
        const chalRes = await query("SELECT id FROM challenges WHERE mission_type = 'weekly' LIMIT 1");
        if (chalRes.rows.length === 0) {
            console.log("No weekly challenges found!");
            return;
        }
        const challengeId = chalRes.rows[0].id;
        console.log("Challenge ID:", challengeId);

        const today = new Date().toISOString().split('T')[0];
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() + 7);

        // Delete existing
        await query("DELETE FROM user_missions WHERE user_id = $1 AND challenge_id = $2", [userId, challengeId]);

        // Insert weekly mission
        const insertRes = await query(`
            INSERT INTO user_missions (user_id, challenge_id, mission_type, is_mandatory, pool_date, expires_at, max_progress, status, progress)
            VALUES ($1, $2, 'weekly', false, $3, $4, 7, 'active', 0)
            RETURNING id
        `, [userId, challengeId, today, weekEnd.toISOString()]);

        const missionId = insertRes.rows[0].id;
        console.log("Created Mission ID:", missionId);

        // Test check-in
        const checkInRes = await query(`
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

        const mission = checkInRes.rows[0];
        console.log("Mission object keys:", Object.keys(mission));
        console.log("mission.current_progress:", mission.current_progress);
        console.log("mission.progress:", mission.progress);
        console.log("mission.max_progress:", mission.max_progress);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

run();
