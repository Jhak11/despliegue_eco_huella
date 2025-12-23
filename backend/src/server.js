import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import questionnaireRoutes from './routes/questionnaireRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';
import missionsRoutes from './routes/missionsRoutes.js';
import educationRoutes from './routes/educationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import goleminoRoutes from './routes/goleminoRoutes.js';
import { initializeDatabase } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/questionnaire', questionnaireRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/missions', missionsRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/golemino', goleminoRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Carbon Footprint API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

// Start server
const startServer = async () => {
    try {
        await initializeDatabase();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(` Carbon Footprint API running on http://0.0.0.0:${PORT}`);
            console.log(` Health check: http://0.0.0.0:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
