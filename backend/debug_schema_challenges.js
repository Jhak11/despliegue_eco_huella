import { query } from './src/config/database.js';

async function run() {
    try {
        console.log("Starting debug schema challenges...");

        const chal = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'challenges'");
        console.log("Columns in challenges:", chal.rows.map(r => r.column_name));

        const cat = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'challenge_categories'");
        console.log("Columns in challenge_categories:", cat.rows.map(r => r.column_name));

        process.exit(0);
    } catch (error) {
        console.error("Top level error:", error);
        process.exit(1);
    }
}

run();
