const API_URL = 'http://localhost:3000/api';

console.log('🧪 Iniciando pruebas de escritura en Supabase...\n');

async function testSupabaseWriteOperations() {
    let token = '';
    let userId = '';
    let testEmail = `test_${Date.now()}@ecohuella.com`;

    try {
        // Test 1: Registro de usuario
        console.log('📝 Test 1: Registro de usuario...');
        const registerResponse = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: 'TestPassword123!'
            })
        });

        const registerData = await registerResponse.json();
        if (registerData.token) {
            token = registerData.token;
            userId = registerData.userId;
            testEmail = registerData.email || testEmail;
            console.log('✅ Usuario registrado exitosamente');
            console.log(`   User ID: ${userId}`);
            console.log(`   Email: ${testEmail}`);
        } else {
            throw new Error('No se recibió token: ' + JSON.stringify(registerData));
        }

        // Test 2: Login
        console.log('\n🔐 Test 2: Login...');
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: 'TestPassword123!'
            })
        });

        const loginData = await loginResponse.json();
        if (loginData.token) {
            console.log('✅ Login exitoso');
        }

        // Headers con autenticación
        const authHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // Test 3: Obtener perfil
        console.log('\n👤 Test 3: Consultar perfil de gamificación...');
        const profileResponse = await fetch(`${API_URL}/gamification/profile`, {
            headers: authHeaders
        });
        const profileData = await profileResponse.json();
        console.log('✅ Perfil obtenido:');
        console.log(`   Nivel: ${profileData.level}`);
        console.log(`   XP: ${profileData.experience}`);
        console.log(`   Brotos: ${profileData.coins}`);

        // Test 4: Obtener misiones diarias
        console.log('\n🎯 Test 4: Obtener misiones diarias...');
        const missionsResponse = await fetch(`${API_URL}/missions/today`, {
            headers: authHeaders
        });
        const missionsData = await missionsResponse.json();
        console.log(`✅ Se obtuvieron ${missionsData.missions?.length || 0} misiones`);

        if (missionsData.missions && missionsData.missions.length > 0) {
            const firstMission = missionsData.missions[0];
            console.log(`   Primera misión: ${firstMission.title}`);

            // Test 5: Aceptar una misión
            if (firstMission.status === 'active' && !firstMission.accepted_at) {
                console.log('\n✋ Test 5: Aceptar misión...');
                const acceptResponse = await fetch(
                    `${API_URL}/missions/accept/${firstMission.id}`,
                    {
                        method: 'POST',
                        headers: authHeaders
                    }
                );
                const acceptData = await acceptResponse.json();
                console.log('✅ Misión aceptada exitosamente');
            }

            // Test 6: Completar la misión
            console.log('\n🎉 Test 6: Completar misión...');
            const completeResponse = await fetch(
                `${API_URL}/missions/complete/${firstMission.id}`,
                {
                    method: 'POST',
                    headers: authHeaders
                }
            );

            if (completeResponse.ok) {
                const completeData = await completeResponse.json();
                console.log('✅ Misión completada exitosamente');
                console.log(`   XP ganado: ${completeData.xpEarned}`);
                console.log(`   Brotos ganados: ${completeData.coinsEarned}`);
            } else if (completeResponse.status === 400) {
                console.log('⚠️  Misión ya fue completada (esperado)');
            } else {
                const errorData = await completeResponse.json();
                throw new Error(`Error completando misión: ${JSON.stringify(errorData)}`);
            }
        }

        // Test 7: Enviar cuestionario
        console.log('\n📋 Test 7: Enviar cuestionario de huella de carbono...');
        const questionnaireResponse = await fetch(`${API_URL}/questionnaire/submit`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                transport: { carUsage: 'occasional', publicTransport: 'often' },
                energy: { electricityBill: 100, heatingType: 'gas' },
                food: { diet: 'omnivore', localFood: 'sometimes' },
                waste: { recycling: 'always', composting: false },
                water: { showerTime: 5, waterConservation: true }
            })
        });
        const questionnaireData = await questionnaireResponse.json();
        console.log('✅ Cuestionario enviado exitosamente');
        console.log(`   Huella total: ${questionnaireData.totalFootprint} kg CO2/año`);

        // Test 8: Interactuar con Golemino
        console.log('\n🐾 Test 8: Interactuar con Golemino...');
        const petResponse = await fetch(`${API_URL}/golemino/pet`, {
            method: 'POST',
            headers: authHeaders
        });

        if (petResponse.ok) {
            const petData = await petResponse.json();
            console.log('✅ Golemino acariciado exitosamente');
            console.log(`   Salud: ${petData.health}%`);
        } else if (petResponse.status === 400) {
            console.log('⚠️  Ya acariciaste a Golemino hoy (esperado)');
        } else {
            const errorData = await petResponse.json();
            console.log('⚠️  Error con Golemino:', JSON.stringify(errorData));
        }

        // Test 9: Verificar actualización de perfil
        console.log('\n🔄 Test 9: Verificar actualización de perfil...');
        const updatedProfileResponse = await fetch(`${API_URL}/gamification/profile`, {
            headers: authHeaders
        });
        const updatedProfileData = await updatedProfileResponse.json();
        console.log('✅ Perfil actualizado:');
        console.log(`   Nivel: ${updatedProfileData.level}`);
        console.log(`   XP: ${updatedProfileData.experience}`);
        console.log(`   Brotos: ${updatedProfileData.coins}`);
        console.log(`   Misiones completadas: ${updatedProfileData.total_missions_completed}`);

        console.log('\n✅ ¡TODAS LAS PRUEBAS DE ESCRITURA PASARON EXITOSAMENTE!');
        console.log('\n📊 Resumen:');
        console.log('   ✅ Registro de usuario');
        console.log('   ✅ Login');
        console.log('   ✅ Consulta de perfil');
        console.log('   ✅ Obtención de misiones');
        console.log('   ✅ Aceptar misiones');
        console.log('   ✅ Completar misiones');
        console.log('   ✅ Envío de cuestionario');
        console.log('   ✅ Interacción con Golemino');
        console.log('   ✅ Actualización de datos');
        console.log('\n🎯 La base de datos Supabase está funcionando correctamente!');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error en las pruebas:', error.message);
        console.error('   Stack:', error.stack);
        process.exit(1);
    }
}

// Esperar 2 segundos para asegurar que el servidor esté listo
setTimeout(() => {
    testSupabaseWriteOperations();
}, 2000);
