import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Backend .NET API

// Configuration pour retry automatique
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 seconde

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 secondes
});

// Fonction pour déterminer si on doit retry
const shouldRetry = (error) => {
    // Retry sur erreurs réseau ou timeout
    if (!error.response) {
        return true;
    }

    // Retry sur erreurs serveur (5xx) sauf 501
    const status = error.response.status;
    return status >= 500 && status !== 501;
};

// Fonction pour attendre avant retry
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Initialiser le compteur de retry si pas déjà fait
        config.retryCount = config.retryCount || 0;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs avec retry
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;

        // Gestion des erreurs 401 (non authentifié)
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // Retry automatique si applicable
        if (config && shouldRetry(error) && config.retryCount < MAX_RETRIES) {
            config.retryCount += 1;

            // Attendre avant de retry (exponential backoff)
            const retryDelay = RETRY_DELAY * Math.pow(2, config.retryCount - 1);
            await delay(retryDelay);

            console.log(`🔄 Retry ${config.retryCount}/${MAX_RETRIES} pour ${config.url}`);

            return api(config);
        }

        return Promise.reject(error);
    }
);

// Fonction helper pour extraire un message d'erreur clair
export const getErrorMessage = (error) => {
    // Erreur réseau (pas de réponse du serveur)
    if (!error.response) {
        if (error.code === 'ECONNABORTED') {
            return 'La requête a pris trop de temps. Veuillez réessayer.';
        }
        if (error.message === 'Network Error') {
            return 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
        }
        return 'Erreur de connexion. Veuillez vérifier votre connexion internet.';
    }

    // Erreur HTTP avec réponse du serveur
    const { status, data } = error.response;

    // Essayer d'extraire le message d'erreur du backend
    let message = '';

    if (typeof data === 'string') {
        message = data;
    } else if (data?.message) {
        message = data.message;
    } else if (data?.errors) {
        // Gestion des erreurs de validation ASP.NET
        if (typeof data.errors === 'object') {
            const errorMessages = Object.values(data.errors).flat();
            message = errorMessages.join('. ');
        } else {
            message = JSON.stringify(data.errors);
        }
    } else if (data?.title) {
        message = data.title;
    }

    // Si pas de message spécifique, utiliser un message par défaut selon le code
    if (!message) {
        switch (status) {
            case 400:
                message = 'Requête invalide. Veuillez vérifier les données saisies.';
                break;
            case 401:
                message = 'Session expirée. Veuillez vous reconnecter.';
                break;
            case 403:
                message = 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.';
                break;
            case 404:
                message = 'La ressource demandée n\'existe pas.';
                break;
            case 409:
                message = 'Cette ressource existe déjà ou il y a un conflit.';
                break;
            case 422:
                message = 'Les données fournies sont invalides.';
                break;
            case 500:
                message = 'Erreur serveur. Veuillez réessayer plus tard.';
                break;
            case 502:
                message = 'Le serveur est temporairement indisponible.';
                break;
            case 503:
                message = 'Service temporairement indisponible. Veuillez réessayer dans quelques instants.';
                break;
            default:
                message = `Erreur ${status}. Une erreur inattendue s'est produite.`;
        }
    }

    return message;
};

// Fonction helper pour déterminer le type de toast selon l'erreur
export const getErrorType = (error) => {
    if (!error.response) {
        return 'warning'; // Erreur réseau
    }

    const status = error.response.status;

    if (status >= 500) {
        return 'error'; // Erreur serveur
    }

    if (status === 401 || status === 403) {
        return 'warning'; // Erreur d'authentification
    }

    return 'error'; // Autres erreurs
};

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

// Stock API
export const stockAPI = {
    getAll: () => api.get('/stock/list'),
    getById: (id) => api.get(`/stock/${id}`),
    create: (stockData) => api.post('/stock/create', stockData),
    update: (id, stockData) => api.put(`/stock/update/${id}`, stockData),
    delete: (id) => api.delete(`/stock/delete/${id}`),
    sync: (apiUrl) => api.post('/stock/sync', { apiUrl }),
    getStats: () => api.get('/stock/stats'),
};

// Receptions API
export const receptionsAPI = {
    getAll: () => api.get('/tbreception/list'),
    getStats: () => api.get('/tbreception/stats'),
};

// Export API
export const exportAPI = {
    // Récupérer tous les dossiers d'export avec filtres et pagination
    getAll: (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);
        if (filters.navire) params.append('navire', filters.navire);
        if (filters.codpay) params.append('codpay', filters.codpay);
        if (filters.station) params.append('station', filters.station);
        if (filters.rsclient) params.append('rsclient', filters.rsclient);
        if (filters.codvar) params.append('codvar', filters.codvar);
        if (filters.refexp) params.append('refexp', filters.refexp);
        if (filters.exporter) params.append('exporter', filters.exporter);
        if (filters.search) params.append('search', filters.search);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
        if (filters.page) params.append('page', filters.page);
        if (filters.pageSize) params.append('pageSize', filters.pageSize);

        return api.get(`/dossierexport/list?${params.toString()}`);
    },

    // Récupérer un dossier par son ID
    getById: (id) => api.get(`/dossierexport/${id}`),

    // Récupérer les statistiques globales
    getGlobalStats: (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);
        if (filters.station) params.append('station', filters.station);

        return api.get(`/dossierexport/stats?${params.toString()}`);
    },

    // Récupérer les statistiques temporelles
    getTimelineStats: (period = 'month', filters = {}) => {
        const params = new URLSearchParams();

        params.append('period', period);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);

        return api.get(`/dossierexport/stats/timeline?${params.toString()}`);
    },

    // Récupérer les statistiques par pays
    getStatsByCountry: (limit = 10, filters = {}) => {
        const params = new URLSearchParams();

        params.append('limit', limit);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);

        return api.get(`/dossierexport/stats/by-country?${params.toString()}`);
    },

    // Récupérer les statistiques par produit
    getStatsByProduct: (limit = 10, filters = {}) => {
        const params = new URLSearchParams();

        params.append('limit', limit);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);

        return api.get(`/dossierexport/stats/by-product?${params.toString()}`);
    },

    // Récupérer les statistiques par navire
    getStatsByNavire: (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);

        return api.get(`/dossierexport/stats/by-navire?${params.toString()}`);
    },

    // Récupérer les statistiques par station
    getStatsByStation: (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);

        return api.get(`/dossierexport/stats/by-station?${params.toString()}`);
    },

    // Récupérer les statistiques par client
    getStatsByClient: (limit = 10, filters = {}) => {
        const params = new URLSearchParams();

        params.append('limit', limit);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);

        return api.get(`/dossierexport/stats/by-client?${params.toString()}`);
    },
};

// Sales API (Ventes Locales)
export const salesAPI = {
    // Récupérer toutes les ventes avec filtres et pagination
    getAll: (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);
        if (filters.station) params.append('station', filters.station);
        if (filters.codvar) params.append('codvar', filters.codvar);
        if (filters.refach) params.append('refach', filters.refach);
        if (filters.codtype) params.append('codtype', filters.codtype);
        if (filters.search) params.append('search', filters.search);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
        if (filters.page) params.append('page', filters.page);
        if (filters.pageSize) params.append('pageSize', filters.pageSize);

        return api.get(`/rapportvente?${params.toString()}`);
    },

    // Récupérer une vente par son ID
    getById: (id) => api.get(`/rapportvente/${id}`),

    // Récupérer les statistiques globales
    getGlobalStats: (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);

        return api.get(`/rapportvente/stats/global?${params.toString()}`);
    },

    // Récupérer les statistiques temporelles
    getTimelineStats: (period = 'week', filters = {}) => {
        const params = new URLSearchParams();

        params.append('period', period);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);

        return api.get(`/rapportvente/stats/timeline?${params.toString()}`);
    },

    // Récupérer les statistiques par station
    getStatsByStation: (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);

        return api.get(`/rapportvente/stats/by-station?${params.toString()}`);
    },

    // Récupérer les statistiques par variété
    getStatsByVariete: (limit = 5, filters = {}) => {
        const params = new URLSearchParams();

        params.append('limit', limit);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);

        return api.get(`/rapportvente/stats/by-variete?${params.toString()}`);
    },

    // Récupérer les statistiques par acheteur
    getStatsByAcheteur: (limit = 5, filters = {}) => {
        const params = new URLSearchParams();

        params.append('limit', limit);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);

        return api.get(`/rapportvente/stats/by-acheteur?${params.toString()}`);
    },

    // Récupérer les prix moyens par type et variété
    getAveragePriceByTypeAndVariete: (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);

        return api.get(`/rapportvente/stats/average-price?${params.toString()}`);
    },

    // Récupérer l'évolution des prix moyens
    getPriceTimelineStats: (period = 'week', filters = {}) => {
        const params = new URLSearchParams();

        params.append('period', period);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);
        if (filters.codvar) params.append('codvar', filters.codvar);

        return api.get(`/rapportvente/stats/price-timeline?${params.toString()}`);
    },
};

export default api;