import { query } from './src/config/database.js';

async function run() {
    try {
        console.log("Creating comprehensive badge system...\n");

        // Insert badges
        await query(`
            INSERT INTO badges (name, description, icon, category, unlock_condition, xp_bonus, coins_bonus, rarity, is_active)
            VALUES 
            -- Mission completion badges
            ('Primer Paso', 'Completa tu primera misión ecológica', '🌱', 'missions', '{"missions_completed": 1}', 10, 5, 'common', true),
            ('Eco Principiante', 'Completa 5 misiones', '🌿', 'missions', '{"missions_completed": 5}', 20, 10, 'common', true),
            ('Activista Verde', 'Completa 10 misiones', '🪴', 'missions', '{"missions_completed": 10}', 30, 20, 'uncommon', true),
            ('Guardián Ambiental', 'Completa 25 misiones', '🌳', 'missions', '{"missions_completed": 25}', 50, 40, 'rare', true),
            ('Héroe Ecológico', 'Completa 50 misiones', '🏆', 'missions', '{"missions_completed": 50}', 100, 80, 'epic', true),
            ('Maestro Verde', 'Completa 100 misiones', '👑', 'missions', '{"missions_completed": 100}', 200, 150, 'legendary', true),
            
            -- Level badges
            ('Aprendiz Eco', 'Alcanza el nivel 3', '📚', 'level', '{"level": 3}', 15, 10, 'common', true),
            ('Estudiante Verde', 'Alcanza el nivel 5', '🎓', 'level', '{"level": 5}', 25, 20, 'uncommon', true),
            ('Experto Ambiental', 'Alcanza el nivel 10', '🔬', 'level', '{"level": 10}', 50, 40, 'rare', true),
            ('Sabio Ecológico', 'Alcanza el nivel 20', '🧙', 'level', '{"level": 20}', 100, 80, 'epic', true),
            
            -- Streak badges
            ('Constancia Inicial', 'Mantén una racha de 3 días', '🔥', 'streak', '{"streak_days": 3}', 15, 10, 'common', true),
            ('Semana Verde', 'Mantén una racha de 7 días', '⚡', 'streak', '{"streak_days": 7}', 30, 25, 'uncommon', true),
            ('Compromiso Total', 'Mantén una racha de 14 días', '💎', 'streak', '{"streak_days": 14}', 60, 50, 'rare', true),
            ('Dedicación Absoluta', 'Mantén una racha de 30 días', '🌟', 'streak', '{"streak_days": 30}', 120, 100, 'epic', true),
            
            -- Questionnaire badges
            ('Consciente', 'Completa tu primer cuestionario de huella', '📊', 'questionnaire', '{"questionnaire_completed": 1}', 20, 15, 'common', true),
            ('Analista Verde', 'Completa 3 cuestionarios', '📈', 'questionnaire', '{"questionnaire_completed": 3}', 40, 30, 'uncommon', true)
        `);

        console.log("✅ Badge system created successfully!\n");

        // Show created badges
        const badges = await query("SELECT id, name, category, rarity, xp_bonus, coins_bonus FROM badges ORDER BY category, xp_bonus");

        console.log("Created badges:");
        let currentCategory = '';
        badges.rows.forEach(b => {
            if (b.category !== currentCategory) {
                currentCategory = b.category;
                console.log(`\n${currentCategory.toUpperCase()}:`);
            }
            console.log(`  [${b.rarity.padEnd(10)}] ${b.name.padEnd(30)} (+${b.xp_bonus}XP, +${b.coins_bonus} Brotos)`);
        });

        console.log(`\n✅ Total: ${badges.rows.length} badges created`);

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

run();
