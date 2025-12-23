import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

// Register new user
export async function register(req, res) {
    try {
        const { email, password, name, age } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        // Check if user already exists
        const emailCheck = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(409).json({ error: 'El email ya está registrado' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert user (simplified table)
        // PostgreSQL: Use RETURNING id to get the inserted ID
        const userResult = await query(`
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      RETURNING id
    `, [email, passwordHash]);

        const userId = userResult.rows[0].id;

        // Create gamified profile
        await query(`
      INSERT INTO user_profile (user_id, name, age)
      VALUES ($1, $2, $3)
    `, [userId, name || null, age || null]);

        // Generate JWT
        const token = jwt.sign(
            { userId, email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Get created user with profile
        const fullUserResult = await query(`
      SELECT 
        u.id, 
        u.email, 
        u.is_first_login,
        u.created_at,
        up.name,
        up.avatar,
        up.age,
        up.level,
        up.experience,
        up.coins,
        up.rank,
        up.rank_icon
      FROM users u
      LEFT JOIN user_profile up ON u.id = up.user_id
      WHERE u.id = $1
    `, [userId]);

        const user = fullUserResult.rows[0];

        res.status(201).json({ user, token });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }


}


// Login user
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        // Find user
        const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Update last login
        await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Get user with profile
        const fullUserResult = await query(`
      SELECT 
        u.id, 
        u.email, 
        u.is_first_login,
        u.created_at,
        up.name,
        up.avatar,
        up.age,
        up.level,
        up.experience,
        up.coins,
        up.rank,
        up.rank_icon
      FROM users u
      LEFT JOIN user_profile up ON u.id = up.user_id
      WHERE u.id = $1
    `, [user.id]);

        res.json({ user: fullUserResult.rows[0], token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
}

// Get current user
export async function getCurrentUser(req, res) {
    try {
        const userResult = await query(`
      SELECT 
        u.id, 
        u.email, 
        u.is_first_login,
        u.created_at,
        up.name,
        up.avatar,
        up.age,
        up.level,
        up.experience,
        up.coins,
        up.rank,
        up.rank_icon,
        up.total_missions_completed,
        up.streak_days,
        up.current_footprint,
        up.regional_footprint
      FROM users u
      LEFT JOIN user_profile up ON u.id = up.user_id
      WHERE u.id = $1
    `, [req.user.userId]);

        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Get latest carbon footprint if exists
        const latestResult = await query(`
      SELECT total_footprint, created_at
      FROM questionnaire_results
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [user.id]);

        const latestData = latestResult.rows[0];

        res.json({
            ...user,
            latest_footprint: latestData?.total_footprint || null,
            last_calculation: latestData?.created_at || null
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
}

// Mark first login as complete
export async function completeFirstLogin(req, res) {
    try {
        await query('UPDATE users SET is_first_login = FALSE WHERE id = $1', [req.user.userId]);
        res.json({ message: 'Primera sesión completada' });
    } catch (error) {
        console.error('Complete first login error:', error);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
}
