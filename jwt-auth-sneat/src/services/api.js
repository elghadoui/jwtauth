import axios from 'axios';

const API_URL = 'https://localhost:7053/api'; // Changez selon votre configuration

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getCurrentUser: () => api.get('/users/profile'), // Corrigé: utilise l'endpoint existant du backend
};

// Users API
export const usersAPI = {
    getAll: () => api.get('/users/list'),
    getById: (id) => api.get(`/users/${id}`),
    create: (userData) => api.post('/users/create', userData),
    update: (id, userData) => {
        console.log('Update user - id:', id, 'userData:', userData);
        return api.put(`/users/update/${id}`, userData);
    },
    delete: (id) => api.delete(`/users/delete/${id}`),
    assignRole: (userId, roleName) => {
        console.log('Assign role - userId:', userId, 'roleName:', roleName);
        return api.post('/users/assign-role', { userId, roleName });
    },
    removeRole: (userId, roleName) => {
        console.log('Remove role - userId:', userId, 'roleName:', roleName);
        return api.post('/users/remove-role', { userId, roleName });
    },
};

// Roles API
export const rolesAPI = {
    getAll: () => api.get('/roles/list'),
    create: (roleName) => api.post('/roles/create', { roleName }),
    delete: (roleName) => api.delete(`/roles/delete/${roleName}`),
};

export default api;