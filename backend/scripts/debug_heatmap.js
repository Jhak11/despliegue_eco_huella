import db from '../src/config/database.js';

function checkHistory() {
    console.log('🔍 Checking Mission History...');

    const history = db.prepare(`
        SELECT id, user_id, challenge_id, completed_at 
        FROM mission_history 
        ORDER BY completed_at DESC 
        LIMIT 5
    `).all();

    console.log('Recent Mission History Entries:');
    console.table(history);

    const heatmap = db.prepare(`
            SELECT 
                strftime('%Y-%m-%d', completed_at) as date,
                COUNT(*) as count
            FROM mission_history
            GROUP BY date
    `).all();

    console.log('Heatmap Aggregation Result:');
    console.table(heatmap);
}

checkHistory();
