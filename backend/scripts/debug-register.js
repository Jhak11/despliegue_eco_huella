const API_URL = 'http://localhost:3000/api';

async function debugRegister() {
    const testEmail = `debug_${Date.now()}@test.com`;
    console.log(`Testing registration with: ${testEmail}`);

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: 'Password123!',
                name: 'Debug User',
                age: 25
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.status === 500) {
            console.log('Detected 500 error. Check if backend log shows specific PG error.');
        }
    } catch (error) {
        console.error('Fetch error:', error.message);
    }
}

debugRegister();
