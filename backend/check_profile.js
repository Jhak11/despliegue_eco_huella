import { query } from './src/config/database.js';

async function run() {
    try {
        console.log("Checking user profile...");
        const userId = 1;

        const res = await query("SELECT * FROM user_profile WHERE user_id = $1", [userId]);
        console.log("Profile:", res.rows[0]);

        if (!res.rows[0]) {
            console.log("Creating default profile for user 1...");
            await query("INSERT INTO user_profile (user_id, name) VALUES ($1, 'Test User')", [userId]);
            console.log("Profile created.");
        }

        process.exit(0);

    } catch (error) {
        console.error("Top level error:", error);
        process.exit(1);
    }
}

run();
