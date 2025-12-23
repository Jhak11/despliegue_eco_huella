import { pool } from '../src/config/database.js';

async function quickCheck() {
    const client = await pool.connect();

    try {
        // Check connection
        const conn = await client.query('SELECT current_database(), inet_server_addr()');
        console.log('Database:', conn.rows[0].current_database);
        console.log('Server IP:', conn.rows[0].inet_server_addr);

        // Count tables
        const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);
        console.log('\nTotal tables:', tables.rows.length);
        tables.rows.forEach(t => console.log('  -', t.table_name));

        // Count users
        const users = await client.query('SELECT COUNT(*) FROM users');
        console.log('\nTotal users:', users.rows[0].count);

        // Show last 3 users
        const lastUsers = await client.query('SELECT id, email, created_at FROM users ORDER BY created_at DESC LIMIT 3');
        console.log('\nLast users:');
        lastUsers.rows.forEach(u => {
            console.log(`  ${u.id}: ${u.email} (${u.created_at})`);
        });

    } finally {
        client.release();
        process.exit(0);
    }
}

quickCheck().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
