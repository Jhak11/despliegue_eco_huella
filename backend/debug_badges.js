import { query } from './src/config/database.js';

async function run() {
    try {
        console.log("Checking badges setup...");

        // Check if badges table has data
        const badgesRes = await query("SELECT COUNT(*) as count FROM badges");
        console.log("Total badges in DB:", badgesRes.rows[0].count);

        if (badgesRes.rows[0].count === 0) {
            console.log("\n⚠️  No badges found! Creating sample badges...");

            // Create sample badges
            await query(`
                INSERT INTO badges (name, description, icon, category, unlock_condition, xp_bonus, coins_bonus, rarity, is_active)
                VALUES 
                ('Primer Paso', 'Completa tu primera misión', '🌱', 'missions', '{"missions_completed": 1}', 10, 5, 'common', true),
                ('Eco Novato', 'Alcanza el nivel 3', '🎯', 'level', '{"level": 3}', 20, 10, 'common', true),
                ('Racha de 3', 'Mantén una racha de 3 días', '🔥', 'streak', '{"streak_days": 3}', 15, 8, 'common', true),
                ('Racha de 7', 'Mantén una racha de 7 días', '🔥', 'streak', '{"streak_days": 7}', 30, 20, 'rare', true),
                ('Explorador', 'Completa el cuestionario de huella', '📊', 'questionnaire', '{"questionnaire_completed": 1}', 25, 15, 'common', true)
            `);
            console.log("✅ Sample badges created!");
        } else {
            // Show existing badges
            const badges = await query("SELECT id, name, unlock_condition FROM badges LIMIT 5");
            console.log("\nExisting badges:");
            badges.rows.forEach(b => {
                console.log(`  - ${b.name}: ${b.unlock_condition}`);
            });
        }

        // Check user profile
        const userId = 1;
        const profileRes = await query("SELECT * FROM user_profile WHERE user_id = $1", [userId]);
        const profile = profileRes.rows[0];

        if (profile) {
            console.log("\nUser profile:");
            console.log(`  Level: ${profile.level}`);
            console.log(`  Missions completed: ${profile.total_missions_completed}`);
            console.log(`  Streak: ${profile.streak_days} days`);

            // Check unlocked badges
            const userBadgesRes = await query(`
                SELECT b.name 
                FROM user_badges ub 
                JOIN badges b ON ub.badge_id = b.id 
                WHERE ub.user_id = $1
            `, [userId]);

            console.log(`\nUnlocked badges: ${userBadgesRes.rows.length}`);
            if (userBadgesRes.rows.length > 0) {
                userBadgesRes.rows.forEach(b => console.log(`  - ${b.name}`));
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

run();
