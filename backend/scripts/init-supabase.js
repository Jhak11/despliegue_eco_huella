import { pool, initializeDatabase } from '../src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🚀 Iniciando configuración de Supabase...\n');

async function setupSupabase() {
    try {
        // Verificar que tenemos DATABASE_URL
        if (!process.env.DATABASE_URL) {
            console.error('❌ ERROR: DATABASE_URL no está configurada en el archivo .env');
            console.log('Por favor, añade tu connection string de Supabase al archivo .env');
            process.exit(1);
        }

        console.log('📋 Configuración detectada:');
        console.log('   DATABASE_URL:', process.env.DATABASE_URL.substring(0, 30) + '...');
        console.log('');

        // Test connection
        console.log('🔌 Probando conexión a Supabase...');
        const client = await pool.connect();

        const result = await client.query('SELECT version()');
        console.log('✅ Conexión exitosa!');
        console.log('   PostgreSQL Version:', result.rows[0].version.split(',')[0]);
        console.log('');

        client.release();

        // Initialize database schema
        console.log('📦 Inicializando esquema de base de datos...');
        await initializeDatabase();
        console.log('');

        // Insert seed data for challenges
        console.log('🌱 Insertando datos semilla de challenges...');
        await insertChallenges();
        console.log('');

        // Verify installation
        console.log('🔍 Verificando instalación...');
        await verifySetup();
        console.log('');

        console.log('✅ ¡Supabase configurado exitosamente!');
        console.log('');
        console.log('🎯 Próximos pasos:');
        console.log('   1. Inicia el servidor: npm start');
        console.log('   2. Verifica la conexión: node test-db-connection.js');
        console.log('   3. Accede a tu app y registra un usuario de prueba');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la configuración:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

async function insertChallenges() {
    const client = await pool.connect();

    try {
        // Check if challenges already exist
        const existing = await client.query('SELECT COUNT(*) as count FROM challenges');
        if (existing.rows[0].count > 0) {
            console.log('   ⚠️  Ya existen', existing.rows[0].count, 'challenges en la base de datos.');
            console.log('   Saltando inserción de challenges.');
            return;
        }

        // Insert challenges
        const challenges = [
            // ENERGÍA - Easy
            ['Vampiros Eléctricos', 'Desconecta el microondas, TV y consolas de la pared si no los usas hoy.', 1, 'real_action', 'easy', 1, 10, 5, 0.25, JSON.stringify({ economic: ['Reduce tu factura de luz hasta un 10% anual'], safety: ['Disminuye el riesgo de cortocircuitos por sobrecalentamiento'] }), 'daily'],
            ['Apaga las Luces', 'Asegúrate de apagar todas las luces al salir de una habitación hoy.', 1, 'real_action', 'easy', 1, 10, 5, 0.15, JSON.stringify({ economic: ['Ahorra hasta 15% en iluminación mensual'], comfort: ['Tus focos LED duran hasta 10 veces más'] }), 'daily'],
            ['Luz Natural', 'Usa luz natural en lugar de artificial durante el día.', 1, 'real_action', 'easy', 1, 10, 5, 0.20, JSON.stringify({ health: ['Mejora tu ritmo circadiano y calidad de sueño'], productivity: ['Aumenta concentración y reduce fatiga ocular'] }), 'daily'],

            // ENERGÍA - Medium
            ['Lavado en Frío', 'Usa el ciclo de 30°C o "Eco" en tu lavadora hoy.', 1, 'real_action', 'medium', 1, 15, 10, 0.45, JSON.stringify({ economic: ['El 90% de la energía de lavar es para calentar agua'], comfort: ['Tu ropa dura más tiempo y los colores se conservan mejor'] }), 'daily'],
            ['Termostato Inteligente', 'Reduce 1°C la calefacción o sube 1°C el aire acondicionado.', 1, 'real_action', 'medium', 1, 15, 10, 0.50, JSON.stringify({ economic: ['Ahorras hasta 7% en climatización por cada grado'], comfort: ['Temperatura óptima para dormir: 18-20°C'] }), 'daily'],

            // ENERGÍA - Hard
            ['Día Sin Secadora', 'Seca tu ropa al aire libre o en tendedero interior.', 1, 'real_action', 'hard', 1, 20, 15, 0.80, JSON.stringify({ economic: ['La secadora consume 3-4 kWh por ciclo'], comfort: ['La luz UV del sol desinfecta y elimina olores'] }), 'daily'],

            // AGUA - Easy
            ['Ducha Corta', 'Reduce tu ducha a 5 minutos o menos.', 2, 'real_action', 'easy', 1, 10, 5, 0.30, JSON.stringify({ economic: ['Ahorras hasta 50 litros de agua por ducha'], health: ['Duchas cortas mejoran circulación sanguínea'] }), 'daily'],
            ['Cierra el Grifo', 'Cierra el grifo mientras te cepillas los dientes.', 2, 'real_action', 'easy', 1, 10, 5, 0.10, JSON.stringify({ economic: ['Ahorras 12 litros de agua por vez'], environmental: ['Evitas desperdiciar 4,380 litros al año'] }), 'daily'],

            // AGUA - Medium
            ['Reutiliza Agua', 'Reutiliza el agua de lavar verduras para regar plantas.', 2, 'real_action', 'medium', 1, 15, 10, 0.20, JSON.stringify({ economic: ['Reutilizas hasta 10 litros por día'], environmental: ['Nutrientes del agua de verduras son buenos para plantas'] }), 'daily'],
            ['Lavavajillas Lleno', 'Solo usa el lavavajillas cuando esté completamente lleno.', 2, 'real_action', 'medium', 1, 15, 10, 0.40, JSON.stringify({ economic: ['Lavavajillas lleno es más eficiente que lavar a mano'], time: ['Ahorras 30 minutos vs. lavar a mano'] }), 'daily'],

            // TRANSPORTE - Easy
            ['Camina o Bicicleta', 'Usa transporte activo para un trayecto corto hoy.', 3, 'real_action', 'easy', 1, 15, 10, 0.50, JSON.stringify({ health: ['30 min de caminar quema 150 calorías'], economic: ['Ahorras gasolina y estacionamiento'] }), 'daily'],
            ['Transporte Público', 'Usa bus, metro o tren en lugar de auto particular.', 3, 'real_action', 'easy', 1, 15, 10, 0.60, JSON.stringify({ economic: ['Transporte público es 4x más barato que auto'], productivity: ['Puedes leer o trabajar durante el trayecto'] }), 'daily'],

            // TRANSPORTE - Medium
            ['Comparte Auto', 'Viaja en carpooling o comparte Uber con alguien.', 3, 'real_action', 'medium', 1, 20, 15, 0.80, JSON.stringify({ economic: ['Reduce costos de transporte a la mitad'], social: ['Networking y nuevas amistades'] }), 'daily'],
            ['Combina Viajes', 'Agrupa tus salidas para hacer varios recados en un solo viaje.', 3, 'real_action', 'medium', 1, 20, 15, 1.00, JSON.stringify({ time: ['Ahorra hasta 1 hora al día en desplazamientos'], economic: ['Menos gasolina y desgaste del vehículo'] }), 'daily'],

            // ALIMENTACIÓN - Easy
            ['Reduce Carne Roja', 'Elige pollo, pescado o vegetales en lugar de carne roja hoy.', 4, 'real_action', 'easy', 1, 10, 5, 1.20, JSON.stringify({ health: ['Reduce colesterol y riesgo cardiovascular'], environmental: ['La carne de res produce 10x más CO2 que pollo'] }), 'daily'],
            ['Sin Desperdicios', 'Planifica tus comidas y usa todas las sobras.', 4, 'real_action', 'easy', 1, 10, 5, 0.50, JSON.stringify({ economic: ['Familias ahorran $1,500 USD/año evitando desperdicio'], environmental: ['1/3 de alimentos mundiales se desperdician'] }), 'daily'],

            // ALIMENTACIÓN - Medium
            ['Día Vegetariano', 'Come completamente vegetariano hoy.', 4, 'real_action', 'medium', 1, 20, 15, 2.50, JSON.stringify({ health: ['Dietas plant-based reducen diabetes tipo 2 en 23%'], environmental: ['Produce 50% menos CO2 que dieta con carne'] }), 'daily'],
            ['Compra Local', 'Adquiere alimentos de mercados locales o productores cercanos.', 4, 'real_action', 'medium', 1, 20, 15, 0.80, JSON.stringify({ economic: ['Apoyas economía local y pequeños productores'], quality: ['Alimentos más frescos y de temporada'] }), 'daily'],

            // RESIDUOS - Easy
            ['Separa Residuos', 'Clasifica correctamente orgánicos, reciclables y basura común.', 5, 'real_action', 'easy', 1, 10, 5, 0.30, JSON.stringify({ environmental: ['Reciclar 1 ton de papel salva 17 árboles'], social: ['Facilitas el trabajo de recicladores'] }), 'daily'],
            ['Bolsa Reutilizable', 'Usa tu propia bolsa al ir de compras.', 5, 'real_action', 'easy', 1, 10, 5, 0.10, JSON.stringify({ environmental: ['1 bolsa reutilizable reemplaza 700 bolsas plásticas'], economic: ['Muchas tiendas ofrecen descuentos por traer tu bolsa'] }), 'daily'],

            // RESIDUOS - Medium
            ['Cero Plástico de Un Uso', 'Evita popotes, cubiertos y envases desechables hoy.', 5, 'real_action', 'medium', 1, 15, 10, 0.20, JSON.stringify({ environmental: ['Solo 9% del plástico mundial se recicla'], health: ['Evitas microplásticos que afectan tu organismo'] }), 'daily'],
            ['Compostaje', 'Inicia o mantén una compostera con tus residuos orgánicos.', 5, 'real_action', 'medium', 1, 15, 10, 0.50, JSON.stringify({ environmental: ['Reduce metano en vertederos en 50%'], garden: ['Crea abono natural de alta calidad gratis'] }), 'daily'],

            // EDUCATIVAS
            ['Aprende: Energías Renovables', 'Lee sobre energía solar, eólica o hidroeléctrica (10 min).', 1, 'educational', 'easy', 1, 15, 10, 0, JSON.stringify({ knowledge: ['Comprende el futuro energético del planeta'], empowerment: ['Identifica opciones para tu hogar'] }), 'daily'],
            ['Aprende: Ciclo del Agua', 'Investiga sobre el ciclo del agua y conservación (10 min).', 2, 'educational', 'easy', 1, 15, 10, 0, JSON.stringify({ knowledge: ['Solo 0.3% del agua mundial es potable'], awareness: ['Valora cada gota de agua'] }), 'daily'],

            // MISIONES SEMANALES
            ['Semana Sin Carne', 'Come vegetariano durante 7 días consecutivos.', 4, 'real_action', 'hard', 7, 100, 50, 17.5, JSON.stringify({ health: ['Resetea tu microbioma intestinal'], environmental: ['Ahorra 175 kg de CO2 vs. dieta carnívora'] }), 'weekly'],
            ['Transporte Sostenible Pro', 'Usa solo transporte público, bicicleta o camina toda la semana.', 3, 'real_action', 'hard', 7, 100, 50, 12.0, JSON.stringify({ health: ['Quema hasta 1,500 calorías extra a la semana'], economic: ['Ahorra el 100% de gasolina semanal'] }), 'weekly'],
            ['Cero Residuos', 'Genera cero basura no reciclable durante 7 días.', 5, 'real_action', 'hard', 7, 120, 60, 3.5, JSON.stringify({ awareness: ['Descubres cuánto plástico innecesario usas'], impact: ['Inspiras a otros con tu ejemplo'] }), 'weekly']
        ];

        let inserted = 0;
        for (const challenge of challenges) {
            await client.query(
                `INSERT INTO challenges 
         (title, description, category_id, type, difficulty, duration_days, xp_reward, coins_reward, co2_impact, direct_benefits, mission_type) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                challenge
            );
            inserted++;
        }

        console.log(`   ✅ Insertados ${inserted} challenges exitosamente`);
    } finally {
        client.release();
    }
}

async function verifySetup() {
    const client = await pool.connect();

    try {
        const tables = [
            'users',
            'user_profile',
            'challenges',
            'user_missions',
            'levels',
            'ranks',
            'challenge_categories',
            'badges',
            'user_badges',
            'mission_history',
            'questionnaire_results',
            'golemino_evolution_history',
            'user_education_progress'
        ];

        console.log('   Tablas creadas:');
        for (const table of tables) {
            const result = await client.query(
                `SELECT COUNT(*) as count FROM ${table}`
            );
            console.log(`   ✅ ${table.padEnd(30)} (${result.rows[0].count} registros)`);
        }
    } finally {
        client.release();
    }
}

setupSupabase();
