import { query } from './src/config/database.js';
import assignmentService from './src/services/missionAssignmentService.js';

async function run() {
    try {
        console.log("Starting final verification...");
        const res = await query("SELECT id FROM users LIMIT 1");
        if (res.rows.length === 0) {
            console.log("No users found.");
            return;
        }
        const userId = res.rows[0].id;
        console.log("Using User ID:", userId);

        // Test assignDailyMissions
        try {
            console.log("Testing assignDailyMissions...");
            const result = await assignmentService.assignDailyMissions(userId);
            console.log("Assign Result:", JSON.stringify(result, null, 2));
        } catch (e) {
            console.error("Assign Failed:", e);
        }

        process.exit(0);

    } catch (error) {
        console.error("Top level error:", error);
        process.exit(1);
    }
}

run();
