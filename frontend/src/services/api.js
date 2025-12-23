import axios from 'axios';

// For Vercel deployment, frontend and backend are on the same domain
// So we can use relative paths
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth service
export const authService = {
    async register(userData) {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    async login(credentials) {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    async getCurrentUser() {
        const response = await api.get('/auth/me');
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getStoredUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    }
};

// Profile service
export const profileService = {
    async getProfile() {
        const response = await api.get('/profile');
        return response.data;
    },

    async updateProfile(data) {
        const response = await api.put('/profile', data);
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
    }
};

// Questionnaire service
export const questionnaireService = {
    async getQuestionnaire() {
        const response = await api.get('/questionnaire');
        return response.data;
    },

    async submitQuestionnaire(answers) {
        const response = await api.post('/questionnaire/submit', { answers });
        return response.data;
    },

    async getResults(limit = 10) {
        const response = await api.get(`/questionnaire/results?limit=${limit}`);
        return response.data;
    },

    async getResultById(id) {
        const response = await api.get(`/questionnaire/results/${id}`);
        return response.data;
    }
};

export default api;
