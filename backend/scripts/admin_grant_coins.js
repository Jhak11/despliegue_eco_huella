import db from './database.js';

const EMAIL = 'master@gmail.com';
const AMOUNT = 10000;

try {
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(EMAIL);

    if (!user) {
        console.error(`User with email ${EMAIL} not found.`);
        process.exit(1);
    }

    console.log(`Found user ID: ${user.id} for email ${EMAIL}`);

    const result = db.prepare('UPDATE user_profile SET coins = coins + ? WHERE user_id = ?').run(AMOUNT, user.id);

    if (result.changes > 0) {
        console.log(`Successfully added ${AMOUNT} Brotos to user ${EMAIL}.`);

        // Check new balance
        const profile = db.prepare('SELECT coins FROM user_profile WHERE user_id = ?').get(user.id);
        console.log(`New Balance: ${profile.coins} Brotos`);
    } else {
        console.error('Failed to update user profile (maybe profile does not exist yet?).');
    }

} catch (error) {
    console.error('Error granting coins:', error);
}
