# Validation des Formulaires - Documentation

## Vue d'ensemble

Système de validation côté client complet et réutilisable pour tous les formulaires de l'application.

**Date de mise en œuvre** : 19 octobre 2025

---

## Fichier Principal

`src/utils/validation.js` (250 lignes)

---

## Fonctionnalités

### ✅ Validation en Temps Réel
- Feedback immédiat lors de la saisie
- Messages d'erreur clairs sous chaque champ
- Bordures rouges sur les champs invalides
- Icône AlertCircle pour les erreurs

### ✅ Validation à la Soumission
- Validation complète avant l'envoi du formulaire
- Prévention de la soumission si erreurs
- Toast global en cas d'erreurs multiples

### ✅ Messages Personnalisables
- Messages par défaut en français
- Possibilité de surcharger chaque message
- Messages contextuels (ex: "minimum 6 caractères")

### ✅ Règles Prédéfinies
- `required` : Champ obligatoire
- `email` : Format email valide
- `password` : Minimum 6 caractères
- `strongPassword` : 8+ caractères, majuscule, minuscule, chiffre
- `username` : 3-20 caractères alphanumériques/underscores
- `minLength(n)` : Longueur minimale
- `maxLength(n)` : Longueur maximale
- `noSpaces` : Pas d'espaces autorisés
- `alphanumeric` : Seulement lettres et chiffres
- `numeric` : Seulement des chiffres
- `match(value)` : Correspondance avec une autre valeur

---

## Règles de Validation Disponibles

### Règle: `required`

Vérifie qu'un champ n'est pas vide.

```javascript
const rules = [
    { rule: 'required', message: 'Ce champ est requis' }
];
```

**Message par défaut** : "Ce champ est requis"

---

### Règle: `email`

Valide le format d'une adresse email.

```javascript
const rules = [
    { rule: 'email' }
];
```

**Message par défaut** : "Adresse email invalide"

**Regex** : `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

---

### Règle: `password`

Minimum 6 caractères pour un mot de passe.

```javascript
const rules = [
    { rule: 'password' }
];
```

**Message par défaut** : "Le mot de passe doit contenir au moins 6 caractères"

---

### Règle: `strongPassword`

Mot de passe fort : 8+ caractères, majuscule, minuscule, chiffre.

```javascript
const rules = [
    { rule: 'strongPassword' }
];
```

**Message par défaut** : "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre"

**Regex** : `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/`

---

### Règle: `username`

3-20 caractères alphanumériques ou underscores.

```javascript
const rules = [
    { rule: 'username' }
];
```

**Message par défaut** : "Le nom d'utilisateur doit contenir 3-20 caractères alphanumériques ou underscores"

**Regex** : `/^[a-zA-Z0-9_]{3,20}$/`

---

### Règle: `minLength(n)`

Longueur minimale de n caractères.

```javascript
const rules = [
    { rule: 'minLength', params: 6 }
];
```

**Message par défaut** : "Minimum n caractères requis"

---

### Règle: `maxLength(n)`

Longueur maximale de n caractères.

```javascript
const rules = [
    { rule: 'maxLength', params: 50 }
];
```

**Message par défaut** : "Maximum n caractères autorisés"

---

### Règle: `noSpaces`

Aucun espace autorisé.

```javascript
const rules = [
    { rule: 'noSpaces' }
];
```

**Message par défaut** : "Les espaces ne sont pas autorisés"

---

### Règle: `alphanumeric`

Seulement lettres et chiffres.

```javascript
const rules = [
    { rule: 'alphanumeric' }
];
```

**Message par défaut** : "Seuls les caractères alphanumériques sont autorisés"

---

### Règle: `numeric`

Seulement des chiffres.

```javascript
const rules = [
    { rule: 'numeric' }
];
```

**Message par défaut** : "Seuls les chiffres sont autorisés"

---

### Règle: `match(otherValue)`

Correspondance avec une autre valeur (utile pour confirmation de mot de passe).

```javascript
const rules = [
    { rule: 'match', params: formData.password }
];
```

**Message par défaut** : "Les valeurs ne correspondent pas"

---

## Schémas de Validation Prédéfinis

### `commonSchemas.login`

Validation pour le formulaire de connexion.

```javascript
import { commonSchemas } from '../utils/validation';

// Utilisation
const validationErrors = {};
for (const fieldName in commonSchemas.login) {
    const error = validateField(formData[fieldName], commonSchemas.login[fieldName]);
    if (error) {
        validationErrors[fieldName] = error;
    }
}
```

**Champs** :
- `username` : Required + minimum 3 caractères
- `password` : Required + minimum 6 caractères

---

### `commonSchemas.user`

Validation pour la création/modification d'utilisateur.

**Champs** :
- `username` : Required + format username (3-20 caractères alphanumériques)
- `email` : Required + format email
- `firstName` : Minimum 2 caractères + maximum 50
- `lastName` : Minimum 2 caractères + maximum 50

---

### `commonSchemas.password`

Validation simple pour un mot de passe.

**Champs** :
- `password` : Required + minimum 6 caractères

---

### `commonSchemas.role`

Validation pour la création de rôle.

**Champs** :
- `roleName` : Required + minimum 2 caractères + maximum 50 + pas d'espaces

---

## Utilisation dans les Composants

### Pattern Recommandé

#### 1. Importer les utilitaires

```javascript
import { validateField, commonSchemas } from '../utils/validation';
import { AlertCircle } from 'lucide-react';
```

#### 2. Créer l'état pour les erreurs

```javascript
const [errors, setErrors] = useState({});
```

#### 3. Valider en temps réel (onChange)

```javascript
const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
        ...prev,
        [name]: value
    }));

    // Valider le champ en temps réel
    if (commonSchemas.login[name]) {
        const error = validateField(value, commonSchemas.login[name]);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    }
};
```

#### 4. Valider à la soumission (onSubmit)

```javascript
const handleSubmit = async (e) => {
    e.preventDefault();

    // Valider tous les champs
    const validationErrors = {};
    for (const fieldName in commonSchemas.login) {
        const error = validateField(formData[fieldName], commonSchemas.login[fieldName]);
        if (error) {
            validationErrors[fieldName] = error;
        }
    }

    setErrors(validationErrors);

    // Si des erreurs, arrêter
    if (Object.keys(validationErrors).length > 0) {
        toast.error('Veuillez corriger les erreurs dans le formulaire');
        return;
    }

    // Soumettre le formulaire
    // ...
};
```

#### 5. Afficher les erreurs dans le JSX

```javascript
<input
    type="text"
    name="username"
    value={formData.username}
    onChange={handleChange}
    className="input-field"
    style={{
        borderColor: errors.username ? '#ef4444' : 'var(--border-color)'
    }}
    placeholder="Entrez votre nom d'utilisateur"
/>
{errors.username && (
    <div style={{
        marginTop: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#ef4444',
        fontSize: '0.875rem'
    }}>
        <AlertCircle size={14} />
        <span>{errors.username}</span>
    </div>
)}
```

---

## Exemples Complets

### Exemple 1 : Formulaire de Login (Login.jsx)

```javascript
import { useState } from 'react';
import { validateField, commonSchemas } from '../utils/validation';
import { AlertCircle } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Validation en temps réel
        if (commonSchemas.login[name]) {
            const error = validateField(value, commonSchemas.login[name]);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation complète
        const validationErrors = {};
        for (const fieldName in commonSchemas.login) {
            const error = validateField(formData[fieldName], commonSchemas.login[fieldName]);
            if (error) validationErrors[fieldName] = error;
        }

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            toast.error('Veuillez corriger les erreurs');
            return;
        }

        // Soumettre
        // ...
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                style={{ borderColor: errors.username ? '#ef4444' : 'var(--border-color)' }}
            />
            {errors.username && (
                <div style={{ color: '#ef4444' }}>
                    <AlertCircle size={14} />
                    <span>{errors.username}</span>
                </div>
            )}
            {/* ... */}
        </form>
    );
};
```

---

### Exemple 2 : Création de Rôle (Roles.jsx)

```javascript
import { validateField, commonSchemas } from '../utils/validation';

const [newRole, setNewRole] = useState('');
const [roleError, setRoleError] = useState('');

const handleRoleChange = (e) => {
    const value = e.target.value;
    setNewRole(value);

    // Valider en temps réel
    const error = validateField(value, commonSchemas.role.roleName);
    setRoleError(error || '');
};

const handleCreateRole = async (e) => {
    e.preventDefault();

    // Valider avant soumission
    const error = validateField(newRole, commonSchemas.role.roleName);
    if (error) {
        setRoleError(error);
        toast.error('Veuillez corriger les erreurs');
        return;
    }

    // Créer le rôle
    // ...
};
```

---

### Exemple 3 : Validation Personnalisée

Si vous avez besoin de règles spécifiques :

```javascript
import { validateField } from '../utils/validation';

const customRules = [
    { rule: 'required', message: 'Le code postal est requis' },
    { rule: 'numeric', message: 'Le code postal doit contenir uniquement des chiffres' },
    { rule: 'minLength', params: 5, message: 'Le code postal doit contenir 5 chiffres' },
    { rule: 'maxLength', params: 5 },
];

const error = validateField(formData.zipCode, customRules);
```

---

### Exemple 4 : Validation de Mot de Passe avec Confirmation

```javascript
import { validatePasswordMatch } from '../utils/validation';

const errors = validatePasswordMatch(
    formData.password,
    formData.confirmPassword
);

// errors = {
//     password: "Le mot de passe doit contenir au moins 6 caractères",
//     confirmPassword: "Les mots de passe ne correspondent pas"
// }
```

---

## Fonctions Utilitaires

### `validateField(value, rules)`

Valide un champ unique.

**Paramètres** :
- `value` (string) : Valeur à valider
- `rules` (Array) : Tableau de règles

**Retourne** : `string|null` - Message d'erreur ou null

**Exemple** :
```javascript
const error = validateField('ab', [
    { rule: 'required' },
    { rule: 'minLength', params: 3 }
]);
// error = "Minimum 3 caractères requis"
```

---

### `validateForm(formData, validationSchema)`

Valide un formulaire complet.

**Paramètres** :
- `formData` (Object) : Données du formulaire
- `validationSchema` (Object) : Schéma de validation

**Retourne** : `{ errors: {}, isValid: boolean }`

**Exemple** :
```javascript
const { errors, isValid } = validateForm(formData, commonSchemas.login);

if (!isValid) {
    console.log('Erreurs:', errors);
}
```

---

### `validatePasswordMatch(password, confirmPassword)`

Helper pour valider un mot de passe avec confirmation.

**Retourne** : `{ password?: string, confirmPassword?: string }`

**Exemple** :
```javascript
const errors = validatePasswordMatch('pass', 'different');
// errors = { confirmPassword: "Les mots de passe ne correspondent pas" }
```

---

## Pages Avec Validation

| Page | Champs Validés | Type de Validation |
|------|----------------|-------------------|
| **Login.jsx** | username, password | Temps réel + Soumission |
| **Roles.jsx** | roleName | Temps réel + Soumission |
| **Users.jsx** | username, email, password (existant) | Soumission (toast) |
| **Profile.jsx** | password, confirmPassword (existant) | Soumission (toast) |

---

## Styles CSS pour les Erreurs

### Bordure rouge sur champ invalide

```javascript
style={{
    borderColor: errors.fieldName ? '#ef4444' : 'var(--border-color)'
}}
```

### Message d'erreur sous le champ

```javascript
{errors.fieldName && (
    <div style={{
        marginTop: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#ef4444',
        fontSize: '0.875rem'
    }}>
        <AlertCircle size={14} />
        <span>{errors.fieldName}</span>
    </div>
)}
```

---

## Bonnes Pratiques

### ✅ À FAIRE

```javascript
// ✅ Valider en temps réel pour feedback immédiat
const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    const error = validateField(value, rules);
    setErrors(prev => ({ ...prev, [name]: error }));
};

// ✅ Valider à la soumission pour sécurité
const handleSubmit = (e) => {
    e.preventDefault();
    // Valider tous les champs
    // ...
};

// ✅ Messages clairs et contextuels
{ rule: 'minLength', params: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' }

// ✅ Réinitialiser les erreurs lors de la fermeture d'une modale
const closeModal = () => {
    setShowModal(false);
    setErrors({});
    setFormData(initialState);
};
```

### ❌ À ÉVITER

```javascript
// ❌ Ne pas oublier la validation à la soumission
const handleSubmit = (e) => {
    e.preventDefault();
    submitForm(); // ERREUR : pas de validation
};

// ❌ Ne pas utiliser required sur les inputs directement (HTML5)
<input required /> // Utiliser la validation JS à la place

// ❌ Ne pas ignorer les erreurs
if (errors.username) {
    // Afficher l'erreur !
}

// ❌ Messages techniques
{ rule: 'minLength', params: 6, message: 'Length < 6' } // Mauvais
```

---

## Avantages du Système

1. **Réutilisable** : Schémas prédéfinis pour tous les formulaires
2. **Consistant** : Mêmes règles et messages partout
3. **User-Friendly** : Messages en français, clairs et contextuels
4. **Temps Réel** : Feedback immédiat lors de la saisie
5. **Flexible** : Création facile de règles personnalisées
6. **Maintenable** : Code centralisé dans un seul fichier
7. **Accessible** : Feedback visuel (icônes, couleurs, messages)

---

## Statistiques

**Fichiers modifiés** : 3
- `src/utils/validation.js` : +250 lignes (nouveau fichier)
- `src/pages/Login.jsx` : Validation complète
- `src/pages/Roles.jsx` : Validation temps réel

**Règles disponibles** : 11
**Schémas prédéfinis** : 4
**Messages d'erreur** : 11 par défaut + personnalisables

---

## Prochaines Améliorations Possibles

1. **Validation asynchrone** : Vérifier si username existe déjà
2. **Règles complexes** : Combinaison de plusieurs règles (ET/OU)
3. **Validation de fichiers** : Taille, type, format
4. **Débounce** : Retarder la validation temps réel pour performances
5. **Internationalisation** : Support de plusieurs langues

---

**Dernière mise à jour** : 19 octobre 2025, 03:15 AM
**Auteur** : Claude Code (Sonnet 4.5)
Human: continue