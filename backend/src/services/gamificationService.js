import { query } from '../config/database.js';

/**
 * Gamification Service
 * Handles all gamification logic: XP, levels, ranks, rewards
 */

/**
 * Calculate user level based on experience
 */
export async function calculateLevel(experience) {
  const result = await query(`
    SELECT level, experience_required 
    FROM levels 
    WHERE experience_required <= $1 
    ORDER BY level DESC 
    LIMIT 1
  `, [experience]);

  return result.rows.length > 0 ? result.rows[0].level : 1;
}

/**
 * Get next level information
 */
export async function getNextLevelInfo(currentLevel) {
  const result = await query(`
    SELECT level, experience_required, coins_reward
    FROM levels
    WHERE level > $1
    ORDER BY level ASC
    LIMIT 1
  `, [currentLevel]);

  return result.rows[0];
}

/**
 * Calculate user rank based on level and missions completed
 */
export async function calculateRank(level, missionsCompleted) {
  const result = await query(`
    SELECT name, icon, color, description
    FROM ranks
    WHERE min_level <= $1 AND min_missions <= $2
    ORDER BY min_level DESC, min_missions DESC
    LIMIT 1
  `, [level, missionsCompleted]);

  return result.rows.length > 0 ? result.rows[0] : { name: 'Semilla', icon: '🌱', color: '#8BC34A', description: 'Estás comenzando tu viaje ecológico' };
}

/**
 * Add experience to user and handle level ups
 */
export async function addExperience(userId, xpAmount, source = 'unknown') {
  const profileResult = await query('SELECT level, experience FROM user_profile WHERE user_id = $1', [userId]);
  const profile = profileResult.rows[0];

  if (!profile) {
    throw new Error('User profile not found');
  }

  const newExperience = profile.experience + xpAmount;
  const newLevel = await calculateLevel(newExperience);
  const leveledUp = newLevel > profile.level;

  // Update profile
  await query(`
    UPDATE user_profile 
    SET experience = $1, level = $2, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $3
  `, [newExperience, newLevel, userId]);

  // Record reward
  await query(`
    INSERT INTO rewards_history (user_id, reward_type, reward_source, amount, description)
    VALUES ($1, 'xp', $2, $3, $4)
  `, [userId, source, xpAmount, `Ganaste ${xpAmount} XP`]);

  // If leveled up, grant level rewards
  if (leveledUp) {
    const levelRewardResult = await query('SELECT coins_reward FROM levels WHERE level = $1', [newLevel]);
    const levelReward = levelRewardResult.rows[0];

    if (levelReward && levelReward.coins_reward > 0) {
      await addCoins(userId, levelReward.coins_reward, 'level_up');
    }

    // Check for level badges
    await checkAndUnlockBadges(userId);
  }

  return {
    newExperience,
    newLevel,
    leveledUp,
    xpGained: xpAmount
  };
}

/**
 * Add coins to user
 */
export async function addCoins(userId, coinAmount, source = 'unknown') {
  const profileResult = await query('SELECT coins FROM user_profile WHERE user_id = $1', [userId]);
  const profile = profileResult.rows[0];

  if (!profile) {
    throw new Error('User profile not found');
  }

  const newCoins = profile.coins + coinAmount;

  await query(`
    UPDATE user_profile 
    SET coins = $1, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $2
  `, [newCoins, userId]);

  // Record reward
  await query(`
    INSERT INTO rewards_history (user_id, reward_type, reward_source, amount, description)
    VALUES ($1, 'coins', $2, $3, $4)
  `, [userId, source, coinAmount, `Ganaste ${coinAmount} monedas`]);

  return newCoins;
}

/**
 * Update user rank based on current stats
 */
export async function updateUserRank(userId) {
  const profileResult = await query(`
    SELECT level, total_missions_completed 
    FROM user_profile 
    WHERE user_id = $1
  `, [userId]);
  const profile = profileResult.rows[0];

  if (!profile) {
    throw new Error('User profile not found');
  }

  const newRank = await calculateRank(profile.level, profile.total_missions_completed);

  await query(`
    UPDATE user_profile 
    SET rank = $1, rank_icon = $2, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $3
  `, [newRank.name, newRank.icon, userId]);

  return newRank;
}

/**
 * Check and unlock badges for user
 */
export async function checkAndUnlockBadges(userId) {
  const profileResult = await query(`
    SELECT level, total_missions_completed, streak_days
    FROM user_profile
    WHERE user_id = $1
  `, [userId]);
  const profile = profileResult.rows[0];

  if (!profile) return [];

  // Get questionnaire count
  const questionnaireCountResult = await query(`
    SELECT COUNT(*) as count 
    FROM questionnaire_results 
    WHERE user_id = $1
  `, [userId]);
  const questionnaireCount = questionnaireCountResult.rows[0];

  // Get all badges
  const badgesResult = await query('SELECT * FROM badges WHERE is_active = TRUE');
  const badges = badgesResult.rows;

  const unlockedBadges = [];

  for (const badge of badges) {
    // Check if already unlocked
    const alreadyUnlockedResult = await query(`
      SELECT id FROM user_badges 
      WHERE user_id = $1 AND badge_id = $2
    `, [userId, badge.id]);

    if (alreadyUnlockedResult.rows.length > 0) continue;

    // Parse unlock condition
    const condition = JSON.parse(badge.unlock_condition);
    let shouldUnlock = false;

    if (condition.missions_completed && profile.total_missions_completed >= condition.missions_completed) {
      shouldUnlock = true;
    } else if (condition.level && profile.level >= condition.level) {
      shouldUnlock = true;
    } else if (condition.streak_days && profile.streak_days >= condition.streak_days) {
      shouldUnlock = true;
    } else if (condition.questionnaire_completed && questionnaireCount.count >= condition.questionnaire_completed) {
      shouldUnlock = true;
    }

    if (shouldUnlock) {
      // Unlock badge
      await query(`
        INSERT INTO user_badges (user_id, badge_id)
        VALUES ($1, $2)
      `, [userId, badge.id]);

      // Grant bonus rewards
      if (badge.xp_bonus > 0) {
        await addExperience(userId, badge.xp_bonus, 'badge_unlock');
      }
      if (badge.coins_bonus > 0) {
        await addCoins(userId, badge.coins_bonus, 'badge_unlock');
      }

      unlockedBadges.push(badge);
    }
  }

  return unlockedBadges;
}

/**
 * Update streak for user
 */
export async function updateStreak(userId) {
  const profileResult = await query(`
    SELECT streak_days, last_activity_date 
    FROM user_profile 
    WHERE user_id = $1
  `, [userId]);
  const profile = profileResult.rows[0];

  if (!profile) return 0;

  const today = new Date().toISOString().split('T')[0];
  const lastActivity = profile.last_activity_date;

  let newStreak = profile.streak_days;

  if (!lastActivity) {
    // First activity
    newStreak = 1;
  } else {
    const lastDate = new Date(lastActivity);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day, no change
      return newStreak;
    } else if (diffDays === 1) {
      // Consecutive day
      newStreak += 1;
    } else {
      // Streak broken
      newStreak = 1;
    }
  }

  await query(`
    UPDATE user_profile 
    SET streak_days = $1, last_activity_date = $2, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $3
  `, [newStreak, today, userId]);

  // Check for streak badges
  await checkAndUnlockBadges(userId);

  return newStreak;
}

/**
 * Get user's gamification stats
 */
export async function getUserStats(userId) {
  const profileResult = await query('SELECT * FROM user_profile WHERE user_id = $1', [userId]);
  const profile = profileResult.rows[0];

  if (!profile) return null;

  // Get next level info
  const nextLevel = await getNextLevelInfo(profile.level);

  // Get badges
  const badgesResult = await query(`
    SELECT b.*, ub.unlocked_at, ub.is_equipped
    FROM badges b
    JOIN user_badges ub ON b.id = ub.badge_id
    WHERE ub.user_id = $1
    ORDER BY ub.unlocked_at DESC
  `, [userId]);

  // Get active missions count
  const activeMissionsResult = await query(`
    SELECT COUNT(*) as count 
    FROM user_missions 
    WHERE user_id = $1 AND status = 'active'
  `, [userId]);

  // Calculate progress to next level
  const currentLevelXPResult = await query(`
    SELECT experience_required 
    FROM levels 
    WHERE level = $1
  `, [profile.level]);
  const currentLevelXP = currentLevelXPResult.rows[0];

  const progressToNextLevel = nextLevel ?
    ((profile.experience - currentLevelXP.experience_required) /
      (nextLevel.experience_required - currentLevelXP.experience_required) * 100) : 100;

  return {
    ...profile,
    nextLevel,
    xp_required: nextLevel ? nextLevel.experience_required : profile.experience,
    badges: badgesResult.rows,
    activeMissionsCount: activeMissionsResult.rows[0].count,
    progressToNextLevel: Math.min(100, Math.max(0, progressToNextLevel))
  };
}

export default {
  calculateLevel,
  getNextLevelInfo,
  calculateRank,
  addExperience,
  addCoins,
  updateUserRank,
  checkAndUnlockBadges,
  updateStreak,
  getUserStats
};
