import { query } from './src/config/database.js';
import assignmentService from './src/services/missionAssignmentService.js';

async function run() {
    try {
        console.log("Starting debug schema...");

        // Check user_missions columns
        const cols = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'user_missions'");
        console.log("Columns in user_missions:", cols.rows.map(r => r.column_name));

        // Check user_mission_preferences columns
        const prefsCols = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'user_mission_preferences'");
        console.log("Columns in user_mission_preferences:", prefsCols.rows.map(r => r.column_name));

        process.exit(0);
    } catch (error) {
        console.error("Top level error:", error);
        process.exit(1);
    }
}

run();
