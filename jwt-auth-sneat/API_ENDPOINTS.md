# Documentation des Endpoints API

## Configuration

### Backend
- **URL Base**: `https://localhost:7053/api`
- **Framework**: ASP.NET Core avec Identity
- **Authentification**: JWT Bearer Token
- **Base de données**: MySQL
- **CORS**: Configuré pour `http://localhost:3000` et `http://localhost:5173`

### Frontend
- **URL Base configurée**: `https://localhost:7053/api` (dans `src/services/api.js`)
- **Client HTTP**: Axios avec intercepteurs JWT

---

## Authentification

### Endpoints AuthController

#### 1. POST `/api/auth/register`
**Description**: Créer un nouveau compte utilisateur

**Authentification**: Non requise

**Body (RegisterDto)**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string"
}
```

**Réponse Succès (200)**:
```json
{
  "message": "Utilisateur créé avec succès"
}
```

**Réponse Erreur (400)**:
```json
{
  "errors": [
    {
      "code": "string",
      "description": "string"
    }
  ]
}
```

**Frontend**: `authAPI.register(userData)`

---

#### 2. POST `/api/auth/login`
**Description**: Se connecter et obtenir un token JWT

**Authentification**: Non requise

**Body (LoginDto)**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Réponse Succès (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "john_doe",
  "email": "john@example.com",
  "roles": ["User", "Admin"]
}
```

**Réponse Erreur (401)**:
```json
{
  "message": "Nom d'utilisateur ou mot de passe incorrect"
}
```

**OU**:
```json
{
  "message": "Votre compte est désactivé. Contactez l'administrateur."
}
```

**Frontend**: `authAPI.login(credentials)`

**Notes**:
- Le backend vérifie que `EmailConfirmed` est `true`
- Le token contient les claims: Sub, Email, Jti, NameIdentifier, Name, et Roles

---

#### 3. GET `/api/auth/me`
**Description**: Obtenir les informations de l'utilisateur connecté

**Authentification**: Requise (Bearer Token)

**Réponse Succès (200)**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "roles": ["User"]
}
```

**Frontend**: `authAPI.getCurrentUser()`

**⚠️ ATTENTION**: Cet endpoint n'existe PAS dans le backend actuel !

---

## Gestion des Utilisateurs

### Endpoints UsersController

#### 1. GET `/api/users/list`
**Description**: Récupérer la liste de tous les utilisateurs

**Authentification**: Requise (Bearer Token)

**Réponse Succès (200)**:
```json
[
  {
    "id": "uuid-string",
    "userName": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailConfirmed": true,
    "roles": ["User", "Admin"]
  }
]
```

**Frontend**: `usersAPI.getAll()`

---

#### 2. GET `/api/users/profile`
**Description**: Récupérer le profil de l'utilisateur connecté

**Authentification**: Requise (Bearer Token)

**Réponse Succès (200)**:
```json
{
  "userName": "john_doe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["User"]
}
```

**Réponse Erreur (401)**:
```json
{
  "message": "Token invalide - username introuvable"
}
```

**Frontend**: Non utilisé actuellement (équivalent de `authAPI.getCurrentUser()`)

---

#### 3. GET `/api/users/{id}`
**Description**: Récupérer un utilisateur par son ID

**Authentification**: Requise (Bearer Token)

**Frontend**: `usersAPI.getById(id)`

**⚠️ ATTENTION**: Cet endpoint n'existe PAS dans le backend actuel !

---

#### 4. POST `/api/users/create`
**Description**: Créer un nouvel utilisateur (Admin uniquement)

**Authentification**: Requise (Bearer Token) + Rôle Admin

**Body (RegisterDto)**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string"
}
```

**Réponse Succès (200)**:
```json
{
  "message": "User created successfully",
  "userId": "uuid-string"
}
```

**Réponse Erreur (400)**:
```json
{
  "message": "Username 'john_doe' is already taken"
}
```

**Frontend**: `usersAPI.create(userData)`

**Notes**:
- L'utilisateur créé a automatiquement `EmailConfirmed = true`
- Requiert le rôle Admin

---

#### 5. PUT `/api/users/update/{id}`
**Description**: Mettre à jour un utilisateur existant (Admin uniquement)

**Authentification**: Requise (Bearer Token) + Rôle Admin

**Paramètres URL**:
- `id`: ID de l'utilisateur (string/uuid)

**Body (UpdateUserDto)**:
```json
{
  "email": "newemail@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "emailConfirmed": true,
  "password": "NewPassword123!"  // Optionnel
}
```

**Réponse Succès (200)**:
```json
{
  "message": "User updated successfully"
}
```

**Réponse Erreur (404)**:
```json
{
  "message": "User with ID 'xxx' not found"
}
```

**Frontend**: `usersAPI.update(id, userData)`

**Notes**:
- Le champ `password` est optionnel
- Si fourni, le mot de passe sera changé
- Le username ne peut PAS être modifié

---

#### 6. DELETE `/api/users/delete/{id}`
**Description**: Supprimer un utilisateur (Admin uniquement)

**Authentification**: Requise (Bearer Token) + Rôle Admin

**Paramètres URL**:
- `id`: ID de l'utilisateur (string/uuid)

**Réponse Succès (200)**:
```json
{
  "message": "User deleted successfully"
}
```

**Réponse Erreur (404)**:
```json
{
  "message": "User with ID 'xxx' not found"
}
```

**Frontend**: `usersAPI.delete(id)`

---

#### 7. POST `/api/users/assign-role`
**Description**: Assigner un rôle à un utilisateur (Admin uniquement)

**Authentification**: Requise (Bearer Token) + Rôle Admin

**Body (AssignRoleRequest)**:
```json
{
  "userId": "uuid-string",
  "roleName": "Admin"
}
```

**Réponse Succès (200)**:
```json
{
  "message": "Role 'Admin' assigned successfully to user 'john_doe'"
}
```

**Réponse Erreur (400)**:
```json
{
  "message": "User 'john_doe' already has role 'Admin'"
}
```

**Frontend**: `usersAPI.assignRole(userId, roleName)`

**Notes**:
- Vérifie que le rôle existe
- Vérifie que l'utilisateur n'a pas déjà ce rôle

---

#### 8. POST `/api/users/remove-role`
**Description**: Retirer un rôle d'un utilisateur (Admin uniquement)

**Authentification**: Requise (Bearer Token) + Rôle Admin

**Body (AssignRoleRequest)**:
```json
{
  "userId": "uuid-string",
  "roleName": "Admin"
}
```

**Réponse Succès (200)**:
```json
{
  "message": "Role 'Admin' removed successfully from user 'john_doe'"
}
```

**Réponse Erreur (400)**:
```json
{
  "message": "User 'john_doe' does not have role 'Admin'"
}
```

**Frontend**: `usersAPI.removeRole(userId, roleName)`

---

## Gestion des Rôles

### Endpoints RolesController

#### 1. GET `/api/roles/list`
**Description**: Récupérer la liste de tous les rôles

**Authentification**: Requise (Bearer Token)

**Réponse Succès (200)**:
```json
["Admin", "User", "Manager"]
```

**Frontend**: `rolesAPI.getAll()`

---

#### 2. POST `/api/roles/create`
**Description**: Créer un nouveau rôle (Admin uniquement)

**Authentification**: Requise (Bearer Token) + Rôle Admin

**Body (CreateRoleDto)**:
```json
{
  "roleName": "Manager"
}
```

**Réponse Succès (200)**:
```json
{
  "message": "Rôle 'Manager' créé avec succès"
}
```

**Réponse Erreur (400)**:
```json
{
  "message": "Ce rôle existe déjà"
}
```

**Frontend**: `rolesAPI.create(roleName)`

---

#### 3. DELETE `/api/roles/delete/{roleName}`
**Description**: Supprimer un rôle (Admin uniquement)

**Authentification**: Requise (Bearer Token) + Rôle Admin

**Paramètres URL**:
- `roleName`: Nom du rôle (string)

**Réponse Succès (200)**:
```json
{
  "message": "Rôle supprimé avec succès"
}
```

**Frontend**: `rolesAPI.delete(roleName)`

**⚠️ ATTENTION**: L'implémentation de cet endpoint n'est pas visible dans le code fourni !

---

#### 4. POST `/api/roles/assign`
**Description**: Assigner un rôle à un utilisateur (Admin uniquement)

**Authentification**: Requise (Bearer Token) + Rôle Admin

**Body (AssignRoleDto)**:
```json
{
  "username": "john_doe",
  "roleName": "Admin"
}
```

**Réponse Succès (200)**:
```json
{
  "message": "Rôle 'Admin' attribué à john_doe"
}
```

**Frontend**: Non utilisé (utilise `usersAPI.assignRole()` à la place)

**Notes**:
- Cette méthode utilise le username au lieu de userId
- Préférer `/api/users/assign-role` qui utilise userId

---

#### 5. POST `/api/roles/remove`
**Description**: Retirer un rôle d'un utilisateur (Admin uniquement)

**Authentification**: Requise (Bearer Token) + Rôle Admin

**Body (AssignRoleDto)**:
```json
{
  "username": "john_doe",
  "roleName": "Admin"
}
```

**Réponse Succès (200)**:
```json
{
  "message": "Rôle 'Admin' retiré de john_doe"
}
```

**Frontend**: Non utilisé (utilise `usersAPI.removeRole()` à la place)

---

#### 6. GET `/api/roles/user/{username}`
**Description**: Obtenir les rôles d'un utilisateur

**Authentification**: Requise (Bearer Token) + Rôle Admin

**Paramètres URL**:
- `username`: Nom d'utilisateur (string)

**Réponse Succès (200)**:
```json
["User", "Admin"]
```

**Réponse Erreur (404)**:
```json
{
  "message": "Utilisateur non trouvé"
}
```

**Frontend**: Non utilisé actuellement

---

## Problèmes Détectés

### ❌ Endpoints Manquants dans le Backend

1. **GET `/api/auth/me`**
   - Appelé par: `authAPI.getCurrentUser()`
   - Solution: Utiliser `/api/users/profile` à la place

2. **GET `/api/users/{id}`**
   - Appelé par: `usersAPI.getById(id)`
   - Solution: Implémenter cet endpoint dans UsersController

3. **DELETE `/api/roles/delete/{roleName}`**
   - Appelé par: `rolesAPI.delete(roleName)`
   - Solution: Vérifier l'implémentation dans RolesController

### ⚠️ Incohérences à Résoudre

1. **Assign/Remove Role**
   - RolesController utilise `username` (AssignRoleDto)
   - UsersController utilise `userId` (AssignRoleRequest)
   - Frontend utilise UsersController (avec userId) ✅ Correct

2. **HTTPS vs HTTP**
   - Backend configuré pour `https://localhost:7053`
   - Frontend configuré pour `https://localhost:7053`
   - CORS autorise `http://localhost:3000` et `https://localhost:3000`
   - Attention aux certificats SSL en développement

---

## Codes d'Erreur HTTP

| Code | Signification | Utilisation |
|------|--------------|-------------|
| 200 | OK | Requête réussie |
| 400 | Bad Request | Données invalides |
| 401 | Unauthorized | Token manquant/invalide ou login incorrect |
| 403 | Forbidden | Rôle insuffisant |
| 404 | Not Found | Ressource non trouvée |
| 500 | Internal Server Error | Erreur serveur |

---

## Sécurité

### Headers Requis
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Exigences du Mot de Passe (Backend)
- Au moins 6 caractères
- Au moins 1 chiffre
- Au moins 1 minuscule
- Au moins 1 majuscule
- Caractères spéciaux non requis

### JWT Token
- Durée de vie: Configurée dans `appsettings.json` (ExpirationInMinutes)
- Algorithme: HS256
- Claims inclus:
  - `sub`: Username
  - `email`: Email
  - `jti`: Token ID unique
  - `nameid`: User ID
  - `name`: Username
  - `role`: Rôles (multiple)

---

## Initialisation de la Base de Données

Au démarrage du backend, `DbInitializer.Initialize()` crée:
- Rôle "Admin"
- Rôle "User"
- Utilisateur admin par défaut (vérifier DbInitializer.cs pour les credentials)

---

## Recommandations

### À Faire Immédiatement 🔴

1. **Corriger le frontend pour `/api/auth/me`**:
   ```javascript
   // Dans authAPI
   getCurrentUser: () => api.get('/users/profile'), // au lieu de '/auth/me'
   ```

2. **Implémenter GET `/api/users/{id}` dans le backend**:
   ```csharp
   [HttpGet("{id}")]
   [Authorize]
   public async Task<IActionResult> GetUserById(string id) { ... }
   ```

3. **Vérifier l'implémentation de DELETE `/api/roles/delete/{roleName}`**

### À Considérer 🟡

1. Ajouter un endpoint pour changer son propre mot de passe
2. Ajouter un endpoint pour mettre à jour son propre profil
3. Ajouter pagination pour `/api/users/list`
4. Ajouter filtres et recherche pour les utilisateurs
5. Implémenter un système de refresh token

---

## Tests avec Swagger

Le backend expose une interface Swagger à:
```
https://localhost:7053/swagger
```

Vous pouvez y tester tous les endpoints avec authentification JWT.

---

## Fichiers de Configuration

### Frontend: `src/services/api.js`
- Intercepteur pour ajouter le token automatiquement
- Intercepteur pour gérer les erreurs 401 (redirection vers /login)
- Stockage du token dans localStorage

### Backend: `Program.cs`
- Configuration CORS (lignes 92-106)
- Configuration JWT (lignes 31-52)
- Configuration Identity (lignes 20-29)
