# 🚀 Quick Start - JWT Auth Sneat

## Pour Démarrer Rapidement

### 1️⃣ Démarrer le Serveur Frontend

```bash
cd C:\Users\info\Desktop\walid\jwtauth\jwt-auth-sneat
npm run dev
```

📍 **URL** : http://localhost:3000/

---

### 2️⃣ Démarrer le Backend

```bash
cd C:\Projets\Auth\JwtAuth
# Commande pour démarrer votre backend .NET
```

---

## 📋 État Actuel du Projet

### ✅ Fonctionnalités Complètes

- **Authentification JWT** : Login, logout, persistance de session
- **Mode Dark/Light** : Toggle dans le header, persisté dans localStorage
- **Sidebar Rétractable** : Bouton toggle sous le logo (desktop uniquement)
- **Toast Notifications** : 4 types (success, error, info, warning)
- **CRUD Utilisateurs** : Créer, lire, modifier, supprimer avec modale élégante
- **CRUD Rôles** : Gestion complète des rôles
- **Gestion des Permissions** : Assignation de rôles aux utilisateurs
- **Animations Fluides** : Transitions partout (300ms)
- **Responsive** : Mobile, tablette, desktop

---

## 🗂️ Fichiers de Documentation

Lisez ces fichiers pour comprendre où vous en êtes :

1. **SESSION_NOTES.md** 📝
   - Notes détaillées de la dernière session
   - Résumé de ce qui a été fait aujourd'hui
   - Prochaines tâches suggérées

2. **PROJECT_PLAN.md** 📊
   - Plan complet du projet
   - Historique des versions
   - Tâches complétées et à faire

3. **UX_UI_GUIDE.md** 📖
   - Guide d'utilisation des composants UX/UI
   - Exemples de code
   - Bonnes pratiques

4. **API_ENDPOINTS.md** 🔗
   - Documentation de tous les endpoints backend
   - Exemples de requêtes/réponses
   - Authentification requise

---

## 🎯 Dernières Modifications (19 octobre 2025)

### Sidebar Rétractable
- ✅ Variables CSS : `--sidebar-width-expanded`, `--sidebar-width-collapsed`
- ✅ Bouton toggle avec icônes `ChevronsLeft`/`ChevronsRight`
- ✅ Tooltips au survol en mode collapsed
- ✅ Logo intelligent (texte masqué en mode collapsed)
- ✅ Persistance dans localStorage (clé: `sidebarCollapsed`)
- ✅ Compatible dark/light mode

**Pour tester** :
1. Ouvrir sur desktop (≥1024px)
2. Cliquer sur le bouton sous le logo
3. La sidebar se réduit à 70px
4. Passer la souris sur les icônes → tooltips apparaissent

### Modale de Suppression d'Utilisateur
- ✅ Modale élégante avec icône `AlertTriangle`
- ✅ Affichage des infos utilisateur (avatar, nom, email)
- ✅ Toast de succès/erreur
- ✅ État de chargement sur le bouton

**Pour tester** :
1. Aller sur la page Utilisateurs
2. Cliquer sur l'icône Corbeille (rouge)
3. Modale s'affiche avec les détails
4. Cliquer "Supprimer" → toast de confirmation

---

## 🔑 Clés localStorage

Le projet utilise ces clés dans localStorage :

- `theme` : Mode dark/light ("dark" ou "light")
- `sidebarCollapsed` : État de la sidebar (true/false)
- `token` : JWT token d'authentification
- `user` : Informations utilisateur (JSON)

---

## 💡 Astuces pour Continuer

### Si vous voulez ajouter une nouvelle page :

1. Créer le fichier dans `src/pages/MaPage.jsx`
2. Ajouter la route dans `src/App.jsx`
3. Ajouter le menu item dans `src/components/Layout/Layout.jsx` (array `menuItems`)
4. Utiliser les variables CSS pour les couleurs (compatibilité dark mode)

### Si vous voulez ajouter une notification toast :

```javascript
import { useToast } from '../context/ToastContext';

const MaPage = () => {
  const toast = useToast();

  const handleAction = () => {
    toast.success('Opération réussie !');
    // ou toast.error(), toast.info(), toast.warning()
  };
};
```

### Si vous voulez ajouter un bouton avec loading :

```javascript
const [loading, setLoading] = useState(false);

<button
  className={`btn-primary ${loading ? 'btn-loading' : ''}`}
  disabled={loading}
>
  {loading ? 'Chargement...' : 'Action'}
</button>
```

---

## 🎨 Variables CSS Importantes

Utilisez toujours les variables CSS pour garantir la compatibilité dark/light :

```css
/* Couleurs de fond */
var(--bg-primary)
var(--bg-secondary)
var(--bg-tertiary)

/* Couleurs de texte */
var(--text-primary)
var(--text-secondary)
var(--text-tertiary)

/* Bordures */
var(--border-color)

/* Couleur primaire (violet) */
var(--color-primary-600)

/* Sidebar */
var(--sidebar-width-expanded)
var(--sidebar-width-collapsed)
var(--sidebar-transition)
```

---

## 🐛 En Cas de Problème

### Le serveur ne démarre pas ?
```bash
npm install
npm run dev
```

### Erreur de connexion avec le backend ?
1. Vérifier que le backend est démarré
2. Vérifier l'URL dans `src/services/api.js`
3. Vérifier que CORS est activé sur le backend

### Le mode dark ne fonctionne pas sur une nouvelle page ?
- Assurez-vous d'utiliser les variables CSS `var(--text-primary)` etc.
- Ne jamais mettre de couleurs en dur (ex: `#111827`)

### La sidebar ne se réduit pas ?
- Vérifier que vous êtes sur desktop (≥1024px)
- Vérifier dans DevTools : localStorage.getItem('sidebarCollapsed')
- La fonctionnalité ne marche QUE sur desktop

---

## 📞 Support

Si vous avez des questions, consultez :
- **SESSION_NOTES.md** : Notes de la dernière session
- **PROJECT_PLAN.md** : Plan complet du projet
- **UX_UI_GUIDE.md** : Guide des composants
- **API_ENDPOINTS.md** : Documentation API

---

## 🎉 Prêt à Continuer !

Vous êtes prêt à reprendre le travail là où vous vous êtes arrêté.

**Prochaines tâches suggérées** (voir PROJECT_PLAN.md) :
1. Améliorer la gestion des erreurs API
2. Ajouter la validation des formulaires
3. Créer une page 404 personnalisée
4. Ajouter la recherche fonctionnelle

Bon développement ! 🚀

---

**Dernière mise à jour** : 19 octobre 2025, 01:40 AM
