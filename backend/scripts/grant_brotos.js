import db from '../src/config/database.js';

const TARGET_EMAIL = 'jhakesnayderr@gmail.com';
const GRANT_AMOUNT = 10000;

function grantBrotos() {
    console.log(`Looking for user with email: ${TARGET_EMAIL}`);

    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(TARGET_EMAIL);

    if (!user) {
        console.error(` User not found: ${TARGET_EMAIL}`);
        return;
    }

    console.log(`User found (ID: ${user.id}). Granting ${GRANT_AMOUNT} Brotos...`);

    const result = db.prepare(`
        UPDATE user_profile 
        SET coins = coins + ? 
        WHERE user_id = ?
    `).run(GRANT_AMOUNT, user.id);

    if (result.changes > 0) {
        console.log(`Success! Added ${GRANT_AMOUNT} Brotos to user ID ${user.id}.`);

        // Verify new balance
        const profile = db.prepare('SELECT coins FROM user_profile WHERE user_id = ?').get(user.id);
        console.log(`New Balance: ${profile.coins} Brotos`);
    } else {
        console.error('Failed to update balance.');
    }
}

grantBrotos();
