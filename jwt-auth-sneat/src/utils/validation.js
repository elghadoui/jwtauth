// Système de validation côté client pour les formulaires

/**
 * Règles de validation disponibles
 */
export const validationRules = {
    required: (value) => {
        if (typeof value === 'string') {
            return value.trim().length > 0;
        }
        return value !== null && value !== undefined && value !== '';
    },

    email: (value) => {
        if (!value) return true; // Skip si vide (utiliser required pour forcer)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },

    minLength: (min) => (value) => {
        if (!value) return true;
        return value.length >= min;
    },

    maxLength: (max) => (value) => {
        if (!value) return true;
        return value.length <= max;
    },

    password: (value) => {
        if (!value) return true;
        // Au moins 6 caractères
        return value.length >= 6;
    },

    strongPassword: (value) => {
        if (!value) return true;
        // Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return strongRegex.test(value);
    },

    username: (value) => {
        if (!value) return true;
        // Alphanumeric et underscore, 3-20 caractères
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(value);
    },

    noSpaces: (value) => {
        if (!value) return true;
        return !/\s/.test(value);
    },

    alphanumeric: (value) => {
        if (!value) return true;
        return /^[a-zA-Z0-9]+$/.test(value);
    },

    numeric: (value) => {
        if (!value) return true;
        return /^\d+$/.test(value);
    },

    match: (otherValue) => (value) => {
        return value === otherValue;
    },
};

/**
 * Messages d'erreur par défaut
 */
export const defaultMessages = {
    required: 'Ce champ est requis',
    email: 'Adresse email invalide',
    minLength: (min) => `Minimum ${min} caractères requis`,
    maxLength: (max) => `Maximum ${max} caractères autorisés`,
    password: 'Le mot de passe doit contenir au moins 6 caractères',
    strongPassword: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre',
    username: 'Le nom d\'utilisateur doit contenir 3-20 caractères alphanumériques ou underscores',
    noSpaces: 'Les espaces ne sont pas autorisés',
    alphanumeric: 'Seuls les caractères alphanumériques sont autorisés',
    numeric: 'Seuls les chiffres sont autorisés',
    match: 'Les valeurs ne correspondent pas',
};

/**
 * Valider un champ unique
 * @param {string} value - Valeur à valider
 * @param {Array} rules - Tableau de règles { rule, message }
 * @returns {string|null} - Message d'erreur ou null si valide
 */
export const validateField = (value, rules = []) => {
    for (const ruleConfig of rules) {
        const { rule, message, params } = ruleConfig;

        let validator;
        let errorMessage;

        // Si rule est une fonction directe
        if (typeof rule === 'function') {
            validator = rule;
            errorMessage = message || 'Valeur invalide';
        }
        // Si rule est un nom de règle prédéfinie
        else if (typeof rule === 'string') {
            if (!validationRules[rule]) {
                console.warn(`Règle de validation inconnue: ${rule}`);
                continue;
            }

            // Si la règle nécessite des paramètres (ex: minLength)
            if (params !== undefined) {
                validator = validationRules[rule](params);
                errorMessage = message || (
                    typeof defaultMessages[rule] === 'function'
                        ? defaultMessages[rule](params)
                        : defaultMessages[rule]
                );
            } else {
                validator = validationRules[rule];
                errorMessage = message || defaultMessages[rule];
            }
        }

        // Exécuter la validation
        if (!validator(value)) {
            return errorMessage;
        }
    }

    return null; // Pas d'erreur
};

/**
 * Valider un objet de formulaire complet
 * @param {Object} formData - Données du formulaire
 * @param {Object} validationSchema - Schema de validation { fieldName: [rules] }
 * @returns {Object} - Objet { errors: {}, isValid: boolean }
 */
export const validateForm = (formData, validationSchema) => {
    const errors = {};

    for (const fieldName in validationSchema) {
        const fieldRules = validationSchema[fieldName];
        const fieldValue = formData[fieldName];

        const error = validateField(fieldValue, fieldRules);

        if (error) {
            errors[fieldName] = error;
        }
    }

    return {
        errors,
        isValid: Object.keys(errors).length === 0,
    };
};

/**
 * Hook personnalisé pour la validation de formulaire (utilisable dans React)
 * À utiliser dans les composants avec useState
 */
export const createFormValidator = (validationSchema) => {
    return (formData) => validateForm(formData, validationSchema);
};

/**
 * Exemples de schemas de validation pré-configurés
 */
export const commonSchemas = {
    login: {
        username: [
            { rule: 'required', message: 'Le nom d\'utilisateur est requis' },
            { rule: 'minLength', params: 3, message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' },
        ],
        password: [
            { rule: 'required', message: 'Le mot de passe est requis' },
            { rule: 'password' },
        ],
    },

    user: {
        username: [
            { rule: 'required', message: 'Le nom d\'utilisateur est requis' },
            { rule: 'username' },
        ],
        email: [
            { rule: 'required', message: 'L\'email est requis' },
            { rule: 'email' },
        ],
        firstName: [
            { rule: 'minLength', params: 2, message: 'Le prénom doit contenir au moins 2 caractères' },
            { rule: 'maxLength', params: 50 },
        ],
        lastName: [
            { rule: 'minLength', params: 2, message: 'Le nom doit contenir au moins 2 caractères' },
            { rule: 'maxLength', params: 50 },
        ],
    },

    password: {
        password: [
            { rule: 'required', message: 'Le mot de passe est requis' },
            { rule: 'password' },
        ],
    },

    role: {
        roleName: [
            { rule: 'required', message: 'Le nom du rôle est requis' },
            { rule: 'minLength', params: 2, message: 'Le nom du rôle doit contenir au moins 2 caractères' },
            { rule: 'maxLength', params: 50 },
            { rule: 'noSpaces', message: 'Le nom du rôle ne doit pas contenir d\'espaces' },
        ],
    },
};

/**
 * Helper pour valider un mot de passe avec confirmation
 * @param {string} password - Mot de passe
 * @param {string} confirmPassword - Confirmation du mot de passe
 * @returns {Object} - { password: error, confirmPassword: error }
 */
export const validatePasswordMatch = (password, confirmPassword) => {
    const errors = {};

    const passwordError = validateField(password, [
        { rule: 'required', message: 'Le mot de passe est requis' },
        { rule: 'password' },
    ]);

    if (passwordError) {
        errors.password = passwordError;
    }

    const confirmError = validateField(confirmPassword, [
        { rule: 'required', message: 'Veuillez confirmer le mot de passe' },
    ]);

    if (confirmError) {
        errors.confirmPassword = confirmError;
    } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    return errors;
};
