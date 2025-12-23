import { query } from './src/config/database.js';
import * as enhancedMissionsController from './src/controllers/enhancedMissionsController.js';

async function run() {
    try {
        console.log("Starting completion debug...");
        const userId = 1;

        // 1. Create a dummy active mission
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toISOString();

        // Get challenge
        const chalRes = await query("SELECT * FROM challenges LIMIT 1");
        const challenge = chalRes.rows[0];
        console.log("Challenge:", challenge);

        // Delete any existing active mission for this challenge today to avoid duplicates
        await query("DELETE FROM user_missions WHERE user_id = $1 AND challenge_id = $2", [userId, challenge.id]);

        // Insert mission
        const insertRes = await query(`
            INSERT INTO user_missions (user_id, challenge_id, mission_type, is_mandatory, pool_date, expires_at, max_progress, status)
            VALUES ($1, $2, 'daily', true, $3, $4, 1, 'active')
            RETURNING id
        `, [userId, challenge.id, today, now]);

        const missionId = insertRes.rows[0].id;
        console.log("Created Mission ID:", missionId);

        // 2. Call completeMission directly (simulating request)
        const req = {
            user: { userId },
            params: { missionId }
        };
        const res = {
            json: (data) => console.log("Response JSON:", JSON.stringify(data, null, 2)),
            status: (code) => {
                console.log("Response Status:", code);
                return { json: (err) => console.error("Response Error:", err) };
            }
        };

        await enhancedMissionsController.completeMission(req, res);

        process.exit(0);
    } catch (error) {
        console.error("Top level error:", error);
        process.exit(1);
    }
}

run();
