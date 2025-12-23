import { pool } from './src/config/database.js';

console.log('\n🔍 Verificando conexión a la base de datos...\n');

async function testConnection() {
    try {
        // Verificar configuración del pool
        console.log('📋 Configuración del Pool:');
        console.log('   Host:', pool.options.host || 'No definido');
        console.log('   Database:', pool.options.database || 'No definido');
        console.log('   Connection String:', pool.options.connectionString ? '✅ Configurada' : '❌ No configurada');
        console.log('   SSL:', pool.options.ssl ? '✅ Habilitado' : '❌ Deshabilitado');

        // Intentar conexión
        console.log('\n🔌 Intentando conexión...');
        const client = await pool.connect();

        // Query para verificar el host de la BD
        const hostResult = await client.query('SELECT inet_server_addr() as host, current_database() as database, version() as version');
        console.log('\n✅ Conexión exitosa a:');
        console.log('   Host IP:', hostResult.rows[0].host || 'localhost');
        console.log('   Database:', hostResult.rows[0].database);
        console.log('   Versión:', hostResult.rows[0].version.split(',')[0]);

        // Verificar si es Supabase
        const isSupabase = hostResult.rows[0].host && hostResult.rows[0].host.toString().includes('supabase');
        console.log('\n🎯 Conectado a:', isSupabase ? 'SUPABASE ☁️' : 'Base de datos LOCAL 💻');

        // Contar usuarios
        const userCount = await client.query('SELECT COUNT(*) FROM users');
        console.log('\n📊 Usuarios en la BD:', userCount.rows[0].count);

        client.release();
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Error de conexión:', err.message);
        console.error('Stack:', err.stack);
        process.exit(1);
    }
}

testConnection();
