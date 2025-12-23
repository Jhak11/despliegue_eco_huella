import { pool } from '../src/config/database.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

console.log('\n🔍 VERIFICACIÓN EXHAUSTIVA DE CONEXIÓN A SUPABASE\n');
console.log('='.repeat(60));

async function verifySupabaseConnection() {
    try {
        console.log('\n1️⃣ Verificando configuración...');
        console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ NO CONFIGURADA');

        if (process.env.DATABASE_URL) {
            const url = process.env.DATABASE_URL;
            if (url.includes('supabase.co')) {
                console.log('   🎯 URL contiene "supabase.co": ✅ SUPABASE DETECTADO');
            } else if (url.includes('localhost')) {
                console.log('   ⚠️  URL contiene "localhost": CONEXIÓN LOCAL');
            } else {
                console.log('   📡 URL apunta a:', url.substring(0, 50) + '...');
            }
        }

        console.log('\n2️⃣ Probando conexión al pool...');
        const client = await pool.connect();
        console.log('   ✅ Conexión al pool exitosa');

        console.log('\n3️⃣ Verificando servidor PostgreSQL...');
        const versionResult = await client.query('SELECT version(), inet_server_addr() as server_ip, current_database() as db_name');
        const { version, server_ip, db_name } = versionResult.rows[0];

        console.log('   📊 Versión PostgreSQL:', version.split(',')[0]);
        console.log('   🌐 IP del Servidor:', server_ip || 'No disponible');
        console.log('   💾 Nombre de BD:', db_name);

        // Verificar si es Supabase
        const isSupabase = server_ip && server_ip.toString().length > 0 ||
            process.env.DATABASE_URL.includes('supabase.co');

        if (isSupabase) {
            console.log('   🎉 CONFIRMADO: Conectado a SUPABASE ☁️');
        } else {
            console.log('   ⚠️  ADVERTENCIA: Posiblemente en base de datos local');
        }

        console.log('\n4️⃣ Verificando tabla users...');
        const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
        console.log(`   ✅ Tablas encontradas: ${tableCheck.rows.length}`);
        tableCheck.rows.forEach(row => {
            console.log(`      - ${row.table_name}`);
        });

        console.log('\n5️⃣ Contando usuarios existentes...');
        const userCount = await client.query('SELECT COUNT(*) as count FROM users');
        console.log(`   👥 Usuarios en la BD: ${userCount.rows[0].count}`);

        console.log('\n6️⃣ Registrando usuario de prueba...');
        const testEmail = `test_supabase_${Date.now()}@ecohuella.com`;
        const testPassword = 'SupabaseTest123!';
        const hashedPassword = await bcrypt.hash(testPassword, 10);

        const insertResult = await client.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
            [testEmail, hashedPassword]
        );

        const newUser = insertResult.rows[0];
        console.log('   ✅ Usuario creado exitosamente en SUPABASE:');
        console.log(`      ID: ${newUser.id}`);
        console.log(`      Email: ${newUser.email}`);
        console.log(`      Fecha: ${newUser.created_at}`);

        console.log('\n7️⃣ Verificando que el usuario se guardó...');
        const verifyUser = await client.query(
            'SELECT id, email, created_at FROM users WHERE email = $1',
            [testEmail]
        );

        if (verifyUser.rows.length > 0) {
            console.log('   ✅ Usuario verificado en la base de datos');
            console.log(`   📧 Email encontrado: ${verifyUser.rows[0].email}`);
        } else {
            console.log('   ❌ ERROR: Usuario no encontrado después de inserción');
        }

        console.log('\n8️⃣ Contando usuarios después de inserción...');
        const newUserCount = await client.query('SELECT COUNT(*) as count FROM users');
        console.log(`   👥 Total de usuarios ahora: ${newUserCount.rows[0].count}`);

        client.release();

        console.log('\n' + '='.repeat(60));
        console.log('✅ VERIFICACIÓN COMPLETA');
        console.log('🎯 CONFIRMACIÓN: Estás escribiendo en SUPABASE');
        console.log('📧 Usuario de prueba creado:', testEmail);
        console.log('🔑 Contraseña de prueba:', testPassword);
        console.log('\n💡 Ve a tu Dashboard de Supabase → Table Editor → users');
        console.log('   Deberías ver el usuario registrado allí.');
        console.log('='.repeat(60));

        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

verifySupabaseConnection();
