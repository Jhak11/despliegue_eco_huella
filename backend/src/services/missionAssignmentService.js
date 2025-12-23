import { query } from '../config/database.js';

/**
 * Mission Assignment Service
 * Intelligent assignment based on user preferences and behavior
 */

/**
 * Get or create user mission preferences
 */
export async function getUserPreferences(userId) {
  let result = await query('SELECT * FROM user_mission_preferences WHERE user_id = $1', [userId]);
  let prefs = result.rows[0];

  if (!prefs) {
    // Create default preferences
    await query('INSERT INTO user_mission_preferences (user_id) VALUES ($1)', [userId]);
    result = await query('SELECT * FROM user_mission_preferences WHERE user_id = $1', [userId]);
    prefs = result.rows[0];
  }

  return prefs;
}

/**
 * Decision tree to select mission difficulty
 * Based on user experience and completion rate
 */
export function selectMissionDifficulty(userPrefs) {
  const isNewUser = (userPrefs.total_missions_completed || 0) < 5;
  const completionRate = userPrefs.completion_rate || 0;

  if (isNewUser) {
    // New users start with easy missions
    return 'easy';
  } else {
    if (completionRate >= 0.7) {
      // High performers get medium/hard missions
      return Math.random() > 0.5 ? 'medium' : 'hard';
    } else if (completionRate >= 0.4) {
      // Average performers get easy/medium
      return Math.random() > 0.5 ? 'easy' : 'medium';
    } else {
      // Low performers stick to easy
      return 'easy';
    }
  }
}

/**
 * Get category with least completions (for mandatory mission)
 */
export function getLeastCompletedCategory(userPrefs) {
  const categories = [
    { id: 1, count: userPrefs.energy_completed || 0 },
    { id: 2, count: userPrefs.water_completed || 0 },
    { id: 3, count: userPrefs.transport_completed || 0 },
    { id: 4, count: userPrefs.food_completed || 0 },
    { id: 5, count: userPrefs.waste_completed || 0 }
  ];

  // Sort by count ascending
  categories.sort((a, b) => a.count - b.count);

  return categories[0].id;
}

/**
 * Get priority order of categories (least completed first)
 */
export function getCategoryPriority(userPrefs) {
  const categories = [
    { id: 1, count: userPrefs.energy_completed || 0 },
    { id: 2, count: userPrefs.water_completed || 0 },
    { id: 3, count: userPrefs.transport_completed || 0 },
    { id: 4, count: userPrefs.food_completed || 0 },
    { id: 5, count: userPrefs.waste_completed || 0 }
  ];

  // Sort by count ascending, then randomize ties
  categories.sort((a, b) => {
    if (a.count === b.count) return Math.random() - 0.5;
    return a.count - b.count;
  });

  return categories.map(c => c.id);
}

/**
 * Get missions assigned in last N days
 */
export async function getRecentMissionIds(userId, days = 7) {
  // PostgreSQL interval syntax
  const result = await query(`
    SELECT DISTINCT challenge_id
    FROM user_missions
    WHERE user_id = $1 AND pool_date >= CURRENT_DATE - ($2 || ' days')::INTERVAL
  `, [userId, days]);

  return result.rows.map(m => m.challenge_id);
}

/**
 * Generate daily mandatory mission
 */
export async function generateMandatoryMission(userId) {
  const prefs = await getUserPreferences(userId);
  const categoryId = getLeastCompletedCategory(prefs);
  const difficulty = selectMissionDifficulty(prefs);
  const recentIds = await getRecentMissionIds(userId, 3); // Avoid last 3 days

  // Ensure recentIds matches ID type (assuming integer)
  const recentIdsInt = recentIds.map(id => parseInt(id));

  // Get a mission from the least completed category
  // Using NOT = ANY($1) 
  let result = await query(`
    SELECT * FROM challenges
    WHERE category_id = $1
      AND difficulty = $2
      AND mission_type = 'daily'
      AND is_active = TRUE
      AND ($3::int[] IS NULL OR id != ALL($3::int[]))
    ORDER BY RANDOM()
    LIMIT 1
  `, [categoryId, difficulty, recentIdsInt.length ? recentIdsInt : null]);

  let mission = result.rows[0];

  // Fallback: Any difficulty if preferred not found
  if (!mission) {
    result = await query(`
      SELECT * FROM challenges
      WHERE category_id = $1
        AND mission_type = 'daily'
        AND is_active = TRUE
        AND ($2::int[] IS NULL OR id != ALL($2::int[]))
      ORDER BY RANDOM()
      LIMIT 1
    `, [categoryId, recentIdsInt.length ? recentIdsInt : null]);
    mission = result.rows[0];
  }

  return mission;
}

/**
 * Generate pool of 3 optional daily missions
 */
export async function generateDailyPool(userId) {
  const prefs = await getUserPreferences(userId);
  const difficulty = selectMissionDifficulty(prefs);
  const categoryPriority = getCategoryPriority(prefs);
  const recentIds = await getRecentMissionIds(userId, 7); // Avoid last 7 days

  // Simplified Logic: 3 Random missions, preferably from different categories
  const pool = [];
  const usedIds = new Set(recentIds.map(id => parseInt(id)));

  // Categories to try (randomize order)
  const shuffledCategories = categoryPriority.sort(() => 0.5 - Math.random());

  for (let i = 0; i < 5 && pool.length < 3; i++) {
    const currentUsedIds = Array.from(usedIds);

    // Try getting a mission from a category (or random if we ran out of specific prefs)
    // If we still have categories to try, add filter
    if (i < shuffledCategories.length) {
      const categoryId = shuffledCategories[i];
      // Try specific difficulty first
      const result = await query(`
                SELECT * FROM challenges 
                WHERE category_id = $1 
                AND difficulty = $2
                AND mission_type = 'daily' 
                AND is_active = TRUE 
                AND ($3::int[] IS NULL OR id != ALL($3::int[]))
                ORDER BY RANDOM() 
                LIMIT 1
             `, [categoryId, difficulty, currentUsedIds.length ? currentUsedIds : null]);

      const specificMission = result.rows[0];

      if (specificMission) {
        pool.push(specificMission);
        usedIds.add(specificMission.id);
        continue;
      }
    }

    // Fallback: Just get ANY valid daily mission
    const fallbackResult = await query(`
            SELECT * FROM challenges 
            WHERE mission_type = 'daily' 
            AND is_active = TRUE 
            AND ($1::int[] IS NULL OR id != ALL($1::int[]))
            ORDER BY RANDOM() 
            LIMIT 1
        `, [currentUsedIds.length ? currentUsedIds : null]);

    const fallback = fallbackResult.rows[0];
    if (fallback) {
      pool.push(fallback);
      usedIds.add(fallback.id);
    } else {
      // DB likely empty or exhausted
      break;
    }
  }

  return pool;
}

/**
 * Generate pool of weekly missions (Random)
 */
export async function generateWeeklyPool(userId) {
  const recentIds = await getRecentMissionIds(userId, 30); // Avoid last month
  const recentIdsInt = recentIds.map(id => parseInt(id));

  // Completely random selection for weekly
  const result = await query(`
    SELECT * FROM challenges
    WHERE mission_type = 'weekly'
      AND is_active = TRUE
      AND ($1::int[] IS NULL OR id != ALL($1::int[]))
    ORDER BY RANDOM()
    LIMIT 1
  `, [recentIdsInt.length ? recentIdsInt : null]);

  return result.rows;
}

/**
 * Assign daily missions to user
 * Called automatically at 00:00 or manually
 */
export async function assignDailyMissions(userId) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const poolDate = `${year}-${month}-${day}`;

  // Check if already assigned today
  const existingResult = await query(`
    SELECT COUNT(*) as count FROM user_missions
    WHERE user_id = $1 AND pool_date = $2 AND mission_type = 'daily'
  `, [userId, poolDate]);

  if (parseInt(existingResult.rows[0].count) > 0) {
    return { message: 'Missions already assigned for today' };
  }

  // Generate missions
  const mandatory = await generateMandatoryMission(userId);
  const poolMissions = await generateDailyPool(userId);

  // Expires at end of today local time
  const expiresAt = new Date();
  expiresAt.setHours(23, 59, 59, 999);

  // Assign mandatory mission
  if (mandatory) {
    await query(`
        INSERT INTO user_missions (user_id, challenge_id, mission_type, is_mandatory, pool_date, expires_at, max_progress)
        VALUES ($1, $2, 'daily', true, $3, $4, 1)
      `, [userId, mandatory.id, poolDate, expiresAt.toISOString()]);
  }

  // Assign pool missions (not accepted yet)
  for (const mission of poolMissions) {
    await query(`
        INSERT INTO user_missions (user_id, challenge_id, mission_type, is_mandatory, pool_date, expires_at, max_progress)
        VALUES ($1, $2, 'daily', false, $3, $4, 1)
      `, [userId, mission.id, poolDate, expiresAt.toISOString()]);
  }

  // Update user preferences
  await query(`
    UPDATE user_mission_preferences
    SET total_missions_assigned = total_missions_assigned + $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $2
  `, [1 + poolMissions.length, userId]);

  return {
    mandatory,
    pool: poolMissions,
    expiresAt: expiresAt.toISOString()
  };
}

/**
 * Assign weekly missions to user
 * Called automatically on Sundays at 00:00 or manually
 */
export async function assignWeeklyMissions(userId) {
  const today = new Date();

  // Calculate start of week (Sunday)
  const dayOfWeek = today.getDay(); // 0 is Sunday
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const year = startOfWeek.getFullYear();
  const month = String(startOfWeek.getMonth() + 1).padStart(2, '0');
  const day = String(startOfWeek.getDate()).padStart(2, '0');
  const poolDate = `${year}-${month}-${day}`;

  // Check if already assigned this week
  const existingResult = await query(`
    SELECT COUNT(*) as count FROM user_missions
    WHERE user_id = $1 AND pool_date = $2 AND mission_type = 'weekly'
  `, [userId, poolDate]);

  if (parseInt(existingResult.rows[0].count) > 0) {
    return { message: 'Missions already assigned for this week' };
  }

  // Generate weekly pool
  const pool = await generateWeeklyPool(userId);

  // Expires at end of Saturday (6 days after Sunday)
  const expiresAt = new Date(startOfWeek);
  expiresAt.setDate(startOfWeek.getDate() + 6);
  expiresAt.setHours(23, 59, 59, 999);

  for (const mission of pool) {
    await query(`
        INSERT INTO user_missions (user_id, challenge_id, mission_type, is_mandatory, pool_date, expires_at, max_progress)
        VALUES ($1, $2, 'weekly', false, $3, $4, 7)
      `, [userId, mission.id, poolDate, expiresAt.toISOString()]);
  }

  return {
    pool,
    expiresAt: expiresAt.toISOString()
  };
}

/**
 * Update user preferences after mission completion
 */
export async function updatePreferencesAfterCompletion(userId, categoryId) {
  const categoryMap = {
    1: 'energy_completed',
    2: 'water_completed',
    3: 'transport_completed',
    4: 'food_completed',
    5: 'waste_completed'
  };

  const column = categoryMap[categoryId];

  if (column) {
    // Note: Parameterizing column names is not supported directly in SQL. 
    // Since input is controlled via mapped int map, it's safe.
    await query(`
      UPDATE user_mission_preferences
      SET ${column} = ${column} + 1,
          total_missions_completed = total_missions_completed + 1,
          completion_rate = CAST(total_missions_completed + 1 AS REAL) / CAST(NULLIF(total_missions_assigned, 0) AS REAL),
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `, [userId]);
  }
}

export default {
  getUserPreferences,
  selectMissionDifficulty,
  getLeastCompletedCategory,
  getCategoryPriority,
  getRecentMissionIds,
  generateMandatoryMission,
  generateDailyPool,
  generateWeeklyPool,
  assignDailyMissions,
  assignWeeklyMissions,
  updatePreferencesAfterCompletion
};
