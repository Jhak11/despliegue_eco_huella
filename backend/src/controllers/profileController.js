import { query } from '../config/database.js';

// Get user profile
export async function getProfile(req, res) {
    try {
        const result = await query(`
      SELECT id, email, name, avatar, age, regional_footprint, created_at
      FROM users WHERE id = $1
    `, [req.user.userId]);

        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
}

// Update user profile
export async function updateProfile(req, res) {
    try {
        const { name, avatar, age } = req.body;
        const userId = req.user.userId;

        // Build update query dynamically
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            values.push(name);
        }
        if (avatar !== undefined) {
            updates.push(`avatar = $${paramIndex++}`);
            values.push(avatar);
        }
        if (age !== undefined) {
            updates.push(`age = $${paramIndex++}`);
            values.push(age);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No hay datos para actualizar' });
        }

        values.push(userId);

        await query(`
      UPDATE users SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
    `, values);

        // Get updated user
        const result = await query(`
      SELECT id, email, name, avatar, age, regional_footprint, created_at
      FROM users WHERE id = $1
    `, [userId]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Error al actualizar perfil' });
    }
}
