import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

export const authService = {
    checkAuth: () => axios.get(`${API_URL}/auth/me`),
    register: (name, email, password) => axios.post(`${API_URL}/auth/register`, { name, email, password }),
    login: (email, password) => axios.post(`${API_URL}/auth/login`, { email, password }),
    logout: () => axios.post(`${API_URL}/auth/logout`),
    updateProfile: (name) => axios.put(`${API_URL}/auth/profile`, { name })
};
