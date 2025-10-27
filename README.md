# JWT Auth - Application de Gestion Coopérative

Application complète de gestion pour coopérative agricole avec authentification JWT, gestion des stocks, exports et ventes locales.

## 📁 Structure du Projet (Monorepo)

```
jwtauth/
├── backend/              # Backend ASP.NET Core Web API
│   ├── Controllers/      # Contrôleurs API
│   ├── Models/          # Modèles de données
│   ├── Data/            # DbContext et configuration EF Core
│   ├── Migrations/      # Migrations Entity Framework
│   └── Program.cs       # Point d'entrée de l'application
│
└── jwt-auth-sneat/      # Frontend React avec Vite
    ├── src/
    │   ├── components/  # Composants réutilisables
    │   ├── pages/       # Pages de l'application
    │   ├── services/    # Services API
    │   └── context/     # Context React (Auth, Toast, Theme)
    └── public/          # Ressources statiques
```

## 🚀 Installation et Démarrage

### Prérequis

- **Node.js** (v18+)
- **.NET SDK** (v6.0+)
- **MySQL** (v8.0+)

### 1️⃣ Base de Données

```bash
# Créer la base de données
mysql -u root -p
CREATE DATABASE jwtauthdb;
EXIT;
```

### 2️⃣ Backend (.NET)

```bash
cd backend

# Restaurer les packages NuGet
dotnet restore

# Appliquer les migrations
dotnet ef database update

# Démarrer le backend
dotnet run --launch-profile http
```

Le backend sera disponible sur : **http://localhost:5000**
Swagger UI : **http://localhost:5000/swagger**

### 3️⃣ Frontend (React)

```bash
cd jwt-auth-sneat

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

Le frontend sera disponible sur : **http://localhost:5173**

## 📦 Fonctionnalités

### ✅ Authentification & Autorisation
- Login/Logout avec JWT
- Gestion des utilisateurs
- Gestion des rôles et permissions
- Session persistante

### 📊 Modules Métier
- **Dashboard** : Vue d'ensemble des statistiques
- **Stock** : Gestion du stock avec filtres multi-select
- **Réceptions** : Suivi des réceptions avec graphiques
- **Exports** : Gestion des dossiers d'export avec statistiques avancées
- **Ventes Locales** : Tableau de bord des ventes avec analyse par acheteur/variété

### 🎨 Interface Utilisateur
- Mode Dark/Light avec persistance
- Sidebar rétractable
- Toast notifications (success, error, info, warning)
- Animations fluides
- Responsive (mobile, tablette, desktop)

### 📈 Exports & Rapports
- Export Excel avec formatage
- Export PDF avec tableaux
- Impression directe
- Traçabilité utilisateur

## 🔧 Configuration

### Backend (appsettings.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=jwtauthdb;Uid=root;Pwd=yourpassword;"
  },
  "JwtSettings": {
    "Secret": "VotreCléSecrèteTrèsLongueEtSécurisée123456789",
    "Issuer": "JwtAuthApi",
    "Audience": "JwtAuthApiUsers",
    "ExpirationInMinutes": 60
  }
}
```

### Frontend (src/services/api.js)

```javascript
const API_URL = 'http://localhost:5000/api';
```

## 📚 Documentation

- **QUICK_START.md** : Guide de démarrage rapide
- **API_ENDPOINTS.md** : Documentation des endpoints API
- **UX_UI_GUIDE.md** : Guide des composants UI
- **PROJECT_PLAN.md** : Plan et historique du projet

## 🛠️ Technologies Utilisées

### Backend
- ASP.NET Core 6.0+
- Entity Framework Core
- MySQL
- JWT Authentication
- Swagger/OpenAPI

### Frontend
- React 19
- Vite
- React Router
- Axios
- Recharts (graphiques)
- TailwindCSS
- Lucide React (icônes)
- jsPDF + xlsx (exports)

## 🔐 Sécurité

- Authentification JWT avec refresh tokens
- CORS configuré
- Validation des données côté client et serveur
- Protection CSRF
- Gestion des sessions expirées

## 📝 Licence

Projet privé - Coopérative Zaouia

## 👥 Contributeurs

- Backend : .NET API avec Entity Framework
- Frontend : React avec Vite et TailwindCSS

## 📞 Support

Pour toute question, consultez la documentation dans le dossier `/jwt-auth-sneat/`

---

**Dernière mise à jour** : 27 octobre 2025
