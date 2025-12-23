import { query } from './src/config/database.js';

async function run() {
    try {
        console.log("Testing direct INSERT...");
        const userId = 1;

        // Find a valid challenge ID
        const chalRes = await query("SELECT id FROM challenges LIMIT 1");
        if (chalRes.rows.length === 0) {
            console.log("No challenges found!");
            return;
        }
        const challengeId = chalRes.rows[0].id;
        console.log("Challenge ID:", challengeId);

        const now = new Date().toISOString();
        const today = new Date().toISOString().split('T')[0];

        try {
            await query(`
                INSERT INTO user_missions (user_id, challenge_id, mission_type, is_mandatory, pool_date, expires_at, max_progress)
                VALUES ($1, $2, 'daily', 1, $3, $4, 1)
            `, [userId, challengeId, today, now]);
            console.log("INSERT Success!");
        } catch (e) {
            console.error("INSERT Failed:");
            console.error(e);
        }

        process.exit(0);
    } catch (error) {
        console.error("Top level error:", error);
        process.exit(1);
    }
}

run();
