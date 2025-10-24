# Gestion des Erreurs API - Documentation

## Vue d'ensemble

Ce document décrit le système complet de gestion des erreurs API implémenté dans l'application JWT Auth Sneat.

**Date de mise en œuvre** : 19 octobre 2025

---

## Fonctionnalités Principales

### 1. Retry Automatique sur Erreurs Réseau

Le système retry automatiquement les requêtes qui échouent en raison d'erreurs réseau ou serveur.

**Fichier** : `src/services/api.js`

**Configuration** :
- `MAX_RETRIES` : 3 tentatives
- `RETRY_DELAY` : 1 seconde (délai initial)
- **Exponential Backoff** : Le délai double à chaque tentative
  - 1ère retry : 1 seconde
  - 2ème retry : 2 secondes
  - 3ème retry : 4 secondes

**Conditions de Retry** :
- ✅ Erreurs réseau (pas de réponse du serveur)
- ✅ Erreurs timeout
- ✅ Erreurs serveur 5xx (sauf 501)
- ❌ Erreurs client 4xx (pas de retry)

**Code clé** :
```javascript
const shouldRetry = (error) => {
    if (!error.response) return true; // Erreur réseau
    const status = error.response.status;
    return status >= 500 && status !== 501; // Erreur serveur
};
```

---

### 2. Timeout de Requêtes

Toutes les requêtes ont un timeout de **30 secondes** pour éviter les blocages.

```javascript
const api = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30 secondes
});
```

---

### 3. Messages d'Erreur Utilisateur-Friendly

La fonction `getErrorMessage(error)` convertit les erreurs techniques en messages compréhensibles.

**Fichier** : `src/services/api.js:82-152`

#### Types d'Erreurs Gérées

##### Erreurs Réseau
- `ECONNABORTED` → "La requête a pris trop de temps. Veuillez réessayer."
- `Network Error` → "Impossible de se connecter au serveur. Vérifiez votre connexion internet."
- Autres → "Erreur de connexion. Veuillez vérifier votre connexion internet."

##### Erreurs HTTP

| Code | Message |
|------|---------|
| 400 | Requête invalide. Veuillez vérifier les données saisies. |
| 401 | Session expirée. Veuillez vous reconnecter. |
| 403 | Vous n'avez pas les permissions nécessaires pour effectuer cette action. |
| 404 | La ressource demandée n'existe pas. |
| 409 | Cette ressource existe déjà ou il y a un conflit. |
| 422 | Les données fournies sont invalides. |
| 500 | Erreur serveur. Veuillez réessayer plus tard. |
| 502 | Le serveur est temporairement indisponible. |
| 503 | Service temporairement indisponible. Veuillez réessayer dans quelques instants. |

##### Extraction des Messages du Backend

Le système extrait intelligemment les messages d'erreur du backend :

```javascript
// Priorité :
1. data (si string)
2. data.message
3. data.errors (erreurs de validation ASP.NET)
4. data.title
5. Message par défaut selon le code HTTP
```

**Exemple d'erreurs ASP.NET** :
```json
{
  "errors": {
    "Email": ["L'email est requis"],
    "Password": ["Le mot de passe doit contenir au moins 6 caractères"]
  }
}
```
→ Converti en : "L'email est requis. Le mot de passe doit contenir au moins 6 caractères"

---

### 4. Type de Toast selon l'Erreur

La fonction `getErrorType(error)` détermine automatiquement le type de toast à afficher.

```javascript
export const getErrorType = (error) => {
    if (!error.response) return 'warning'; // Erreur réseau
    const status = error.response.status;
    if (status >= 500) return 'error'; // Erreur serveur
    if (status === 401 || status === 403) return 'warning'; // Auth
    return 'error'; // Autres
};
```

---

## Utilisation dans les Pages

### Importation

```javascript
import { usersAPI, getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
```

### Pattern Recommandé

```javascript
const MyComponent = () => {
    const toast = useToast();

    const handleAction = async () => {
        try {
            await usersAPI.create(data);
            toast.success('Utilisateur créé avec succès');
        } catch (error) {
            console.error('Erreur lors de la création:', error);
            toast.error(getErrorMessage(error));
        }
    };
};
```

---

## Pages Mises à Jour

### ✅ Users.jsx

**Modifications** :
- ✅ Remplacement de tous les `alert()` par des toasts
- ✅ Utilisation de `getErrorMessage()` dans tous les catch
- ✅ Messages de succès après chaque opération
- ✅ Gestion d'erreur dans `loadData()`
- ✅ Gestion d'erreur dans `handleSubmit()`
- ✅ Gestion d'erreur dans `confirmDelete()`
- ✅ Gestion d'erreur dans `handleToggleRole()`

**Lignes modifiées** : 2, 62, 74-131, 155, 265

---

### ✅ Roles.jsx

**Modifications** :
- ✅ Import de `getErrorMessage` et `useToast`
- ✅ Gestion d'erreur dans `loadData()`
- ✅ Validation du nom de rôle avant création
- ✅ Messages de succès après création/suppression
- ✅ Vérification intelligente avant suppression (si des utilisateurs ont le rôle)

**Lignes modifiées** : 2-3, 7, 35, 44-58, 61-79

**Amélioration notable** :
```javascript
const handleDeleteRole = async (roleName) => {
    const userCount = getUserCountByRole(roleName);

    if (userCount > 0) {
        toast.warning(`Impossible de supprimer le rôle "${roleName}".
                       ${userCount} utilisateur(s) possède(nt) ce rôle.`);
        return;
    }
    // ... suppression
};
```

---

### ✅ Profile.jsx

**Modifications** :
- ✅ Import de `getErrorMessage` et `useToast`
- ✅ Remplacement de tous les `alert()` par des toasts
- ✅ Gestion d'erreur dans `loadUserDetails()`
- ✅ Gestion d'erreur dans `handleSubmit()`

**Lignes modifiées** : 3-4, 9, 50, 62-98

---

### ✅ Login.jsx

**Aucune modification nécessaire** - Utilise déjà `AuthContext` qui a été mis à jour.

---

### ✅ AuthContext.jsx

**Modifications** :
- ✅ Import de `getErrorMessage`
- ✅ Utilisation dans `login()` et `register()`
- ✅ Logs d'erreur améliorés

**Lignes modifiées** : 2, 50, 53, 63, 66

---

## Gestion Spéciale des Erreurs 401

Les erreurs 401 (non authentifié) sont gérées de manière spéciale dans l'intercepteur :

```javascript
if (error.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return Promise.reject(error);
}
```

**Comportement** :
1. Suppression du token et de l'utilisateur du localStorage
2. Redirection automatique vers `/login`
3. Pas de retry pour les 401

---

## Logs de Débogage

Tous les catch incluent maintenant des logs descriptifs :

```javascript
catch (error) {
    console.error('Erreur lors de [opération]:', error);
    toast.error(getErrorMessage(error));
}
```

**Logs de retry** :
```javascript
console.log(`🔄 Retry ${config.retryCount}/${MAX_RETRIES} pour ${config.url}`);
```

---

## Tests Recommandés

### Scénarios à Tester

1. **Erreur Réseau**
   - Désactiver le backend
   - Vérifier le retry automatique (3 tentatives)
   - Vérifier le message : "Impossible de se connecter au serveur..."

2. **Erreur Timeout**
   - Simuler un backend lent (>30s)
   - Vérifier le message : "La requête a pris trop de temps..."

3. **Erreur 400 (Bad Request)**
   - Envoyer des données invalides
   - Vérifier le message d'erreur du backend

4. **Erreur 401 (Non authentifié)**
   - Se connecter avec un mauvais token
   - Vérifier la redirection vers `/login`

5. **Erreur 403 (Forbidden)**
   - Tester une action sans permissions
   - Vérifier le message : "Vous n'avez pas les permissions..."

6. **Erreur 404 (Not Found)**
   - Tenter d'accéder à une ressource inexistante
   - Vérifier le message : "La ressource demandée n'existe pas"

7. **Erreur 409 (Conflict)**
   - Créer un utilisateur avec un username existant
   - Vérifier le message du backend

8. **Erreur 500 (Server Error)**
   - Simuler une erreur serveur
   - Vérifier le retry automatique (3 tentatives)
   - Vérifier le message : "Erreur serveur..."

---

## Bonnes Pratiques

### ✅ À FAIRE

```javascript
// ✅ Bon : Utiliser getErrorMessage()
catch (error) {
    console.error('Erreur descriptive:', error);
    toast.error(getErrorMessage(error));
}

// ✅ Bon : Messages de succès explicites
toast.success(`L'utilisateur ${username} a été créé avec succès`);

// ✅ Bon : Validation avant l'appel API
if (!formData.email) {
    toast.error('L\'email est requis');
    return;
}
```

### ❌ À ÉVITER

```javascript
// ❌ Mauvais : Utiliser alert()
catch (error) {
    alert('Erreur');
}

// ❌ Mauvais : Messages génériques
toast.error('Une erreur est survenue');

// ❌ Mauvais : Ignorer les erreurs
catch (error) {
    console.error(error);
}
```

---

## Configuration Personnalisable

Dans `src/services/api.js` :

```javascript
// Nombre maximum de retry
const MAX_RETRIES = 3; // Modifier selon vos besoins

// Délai initial entre les retry (en ms)
const RETRY_DELAY = 1000; // 1 seconde

// Timeout des requêtes (en ms)
timeout: 30000, // 30 secondes
```

---

## Avantages du Nouveau Système

1. **Résilience** : Retry automatique sur erreurs temporaires
2. **UX Améliorée** : Messages clairs et compréhensibles
3. **Débogage Facile** : Logs descriptifs partout
4. **Consistance** : Gestion uniforme dans toute l'app
5. **Maintenabilité** : Code centralisé dans `api.js`
6. **Feedback Visuel** : Toasts au lieu d'alerts
7. **Timeout Protection** : Pas de requêtes infinies

---

## Statistiques

**Fichiers modifiés** : 6
- `src/services/api.js` : +90 lignes
- `src/pages/Users.jsx` : ~10 modifications
- `src/pages/Roles.jsx` : ~8 modifications
- `src/pages/Profile.jsx` : ~6 modifications
- `src/context/AuthContext.jsx` : ~4 modifications

**Suppressions** :
- ❌ 15+ `alert()` remplacés par des toasts
- ❌ Messages d'erreur génériques

**Ajouts** :
- ✅ Fonction `getErrorMessage()` (70 lignes)
- ✅ Fonction `getErrorType()` (16 lignes)
- ✅ Retry automatique avec exponential backoff
- ✅ Timeout de 30 secondes
- ✅ 20+ messages de succès

---

## Prochaines Améliorations Possibles

1. **Indicateur de Retry** : Afficher "Tentative 2/3..." dans un toast
2. **Mode Offline** : Détecter la perte de connexion et afficher un bandeau
3. **Queue de Requêtes** : Mettre en file d'attente les requêtes échouées pour retry ultérieur
4. **Logging Sentry** : Envoyer les erreurs à un service de monitoring
5. **Taux de Succès** : Tracker le taux de réussite des requêtes

---

**Dernière mise à jour** : 19 octobre 2025, 02:30 AM
**Auteur** : Claude Code (Sonnet 4.5)
