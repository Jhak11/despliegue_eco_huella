import api from './api.js';

// Gamification service
export const gamificationService = {
    // Profile
    async getGamifiedProfile() {
        const response = await api.get('/gamification/profile');
        return response.data;
    },

    async updateGamifiedProfile(data) {
        const response = await api.put('/gamification/profile', data);
        return response.data;
    },

    // Leaderboard
    async getLeaderboard(type = 'level', limit = 10) {
        const response = await api.get(`/gamification/leaderboard?type=${type}&limit=${limit}`);
        return response.data;
    },

    // Levels and Ranks
    async getLevels() {
        const response = await api.get('/gamification/levels');
        return response.data;
    },

    async getRanks() {
        const response = await api.get('/gamification/ranks');
        return response.data;
    },

    // Badges
    async getUserBadges() {
        const response = await api.get('/gamification/badges/user');
        return response.data;
    },

    async getAllBadges() {
        const response = await api.get('/gamification/badges/all');
        return response.data;
    },

    async equipBadge(badgeId) {
        const response = await api.post(`/gamification/badges/equip/${badgeId}`);
        return response.data;
    },

    // Rewards
    async getRewardsHistory(limit = 20) {
        const response = await api.get(`/gamification/rewards/history?limit=${limit}`);
        return response.data;
    }
};

// Missions service
export const missionsService = {
    // Enhanced missions endpoints (new)
    async getTodayMissions() {
        const response = await api.get('/missions/today');
        return response.data;
    },

    async getWeeklyMissions() {
        const response = await api.get('/missions/weekly');
        return response.data;
    },

    async acceptMission(missionId) {
        const response = await api.post(`/missions/accept/${missionId}`);
        return response.data;
    },

    async checkInMission(missionId) {
        const response = await api.post(`/missions/progress/${missionId}`);
        return response.data;
    },

    async refreshDailyPool() {
        const response = await api.post('/missions/refresh-pool');
        return response.data;
    },

    async completeMission(missionId) {
        const response = await api.post(`/missions/complete/${missionId}`);
        return response.data;
    },

    async getPreferences() {
        const response = await api.get('/missions/preferences');
        return response.data;
    },

    async updatePreferences(data) {
        const response = await api.put('/missions/preferences', data);
        return response.data;
    },

    // Original endpoints (backward compatibility)
    async getAvailableChallenges(categoryId = null) {
        const url = categoryId
            ? `/missions/challenges?category_id=${categoryId}`
            : '/missions/challenges';
        const response = await api.get(url);
        return response.data;
    },

    async getDailyMissions() {
        const response = await api.get('/missions/daily');
        return response.data;
    },

    // Categories
    async getCategories() {
        const response = await api.get('/missions/categories');
        return response.data;
    },

    // User missions
    async getActiveMissions() {
        const response = await api.get('/missions/active');
        return response.data;
    },

    async getMissionHistory(limit = 20) {
        const response = await api.get(`/missions/history?limit=${limit}`);
        return response.data;
    },

    async getMissionHeatmap() {
        const response = await api.get('/missions/heatmap');
        return response.data;
    },

    async assignChallenge(challengeId) {
        const response = await api.post(`/missions/assign/${challengeId}`);
        return response.data;
    },

    async skipMission(missionId) {
        const response = await api.post(`/missions/skip/${missionId}`);
        return response.data;
    }
};
