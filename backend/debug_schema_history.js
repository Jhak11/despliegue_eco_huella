import { query } from './src/config/database.js';

async function run() {
    try {
        console.log("Starting debug schema mission_history...");

        const cols = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'mission_history'");
        console.log("Columns in mission_history:", cols.rows.map(r => r.column_name));

        const cols2 = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'user_missions'");
        console.log("Columns in user_missions:", cols2.rows.map(r => r.column_name));

        process.exit(0);
    } catch (error) {
        console.error("Top level error:", error);
        process.exit(1);
    }
}

run();
