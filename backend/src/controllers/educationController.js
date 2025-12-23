import { query, pool } from '../config/database.js';

export const completeTopic = async (req, res) => {
    const { topicId } = req.body;
    const userId = req.user.userId;
    const REWARD_AMOUNT = 50; // Brotos for completing a topic

    if (!topicId) {
        return res.status(400).json({ error: 'Topic ID is required' });
    }

    try {
        // Check if already completed
        const existingResult = await query('SELECT id FROM user_education_progress WHERE user_id = $1 AND topic_id = $2', [userId, topicId]);

        if (existingResult.rows.length > 0) {
            return res.json({
                success: true,
                firstTime: false,
                message: 'Topic already completed',
                brotosEarned: 0
            });
        }

        // Transaction: Mark as complete & Add Brotos
        // Using a proper client transaction for atomicity
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(`
                INSERT INTO user_education_progress (user_id, topic_id, brotos_earned)
                VALUES ($1, $2, $3)
            `, [userId, topicId, REWARD_AMOUNT]);

            await client.query(`
                UPDATE user_profile 
                SET coins = coins + $1 
                WHERE user_id = $2
            `, [REWARD_AMOUNT, userId]);

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        res.json({
            success: true,
            firstTime: true,
            message: 'Topic completed! Brotos awarded.',
            brotosEarned: REWARD_AMOUNT
        });

    } catch (error) {
        console.error('Error completing topic:', error);
        res.status(500).json({ error: 'Failed to complete topic' });
    }
};

export const getProgress = async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await query('SELECT topic_id, completed_at FROM user_education_progress WHERE user_id = $1', [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting education progress:', error);
        res.status(500).json({ error: 'Failed to get progress' });
    }
};
