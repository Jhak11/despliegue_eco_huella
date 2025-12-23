import { query } from './src/config/database.js';
import * as gamificationService from './src/services/gamificationService.js';

async function run() {
    try {
        console.log("Testing badge unlock system...\n");
        const userId = 1;

        // Check current profile
        const profileBefore = await query("SELECT * FROM user_profile WHERE user_id = $1", [userId]);
        console.log("User stats:");
        console.log(`  Level: ${profileBefore.rows[0].level}`);
        console.log(`  Missions: ${profileBefore.rows[0].total_missions_completed}`);
        console.log(`  Streak: ${profileBefore.rows[0].streak_days}`);

        // Trigger badge check
        console.log("\nTriggering badge check...");
        const newBadges = await gamificationService.checkAndUnlockBadges(userId);

        console.log(`\nResult: ${newBadges.length} new badges unlocked`);
        if (newBadges.length > 0) {
            newBadges.forEach(b => {
                console.log(`  ✅ ${b.name} (+${b.xp_bonus}XP, +${b.coins_bonus} Brotos)`);
            });
        }

        // Check unlocked badges
        const userBadgesRes = await query(`
            SELECT b.name, b.xp_bonus, b.coins_bonus, ub.unlocked_at
            FROM user_badges ub 
            JOIN badges b ON ub.badge_id = b.id 
            WHERE ub.user_id = $1
            ORDER BY ub.unlocked_at DESC
        `, [userId]);

        console.log(`\nTotal unlocked badges: ${userBadgesRes.rows.length}`);
        if (userBadgesRes.rows.length > 0) {
            userBadgesRes.rows.forEach(b => {
                console.log(`  - ${b.name}`);
            });
        }

        // Check updated profile
        const profileAfter = await query("SELECT level, experience, coins FROM user_profile WHERE user_id = $1", [userId]);
        console.log("\nProfile after unlock:");
        console.log(`  Level: ${profileAfter.rows[0].level}`);
        console.log(`  XP: ${profileAfter.rows[0].experience}`);
        console.log(`  Coins: ${profileAfter.rows[0].coins}`);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

run();
