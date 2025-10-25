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

## 🎯 Dernières Modifications

### 🐛 Correction Erreur Backend RapportVenteController (25 octobre 2025 - Session 6)

**Problème résolu dans le backend** :

Le backend ne compilait pas à cause d'une erreur de type dans `RapportVenteController.cs`.

**Erreur** :
```
Impossible d'appliquer l'opérateur '??' aux opérandes de type
'<anonymous type: int totalVentes, decimal poidsTotalBrut, ...>'
et '<anonymous type: int totalVentes, int poidsTotalBrut, ...>'
```

**Localisation** :
- Fichier: `C:\Projets\Auth\JwtAuth\JwtAuth\Controllers\RapportVenteController.cs`
- Lignes: 151-163 (méthode `GetGlobalStats`)

**Solution appliquée** :
Changement des valeurs par défaut de `0` (int) en `0m` (decimal) pour les propriétés suivantes :
- `poidsTotalBrut`
- `poidsTotalPese`
- `chiffreAffaires`
- `montantRegle`
- `soldeRestant`
- `prixMoyenKg`

**Résultat** :
- ✅ Backend compile avec succès
- ✅ 0 erreur de compilation
- ✅ 74 warnings (normaux, concernent la nullabilité)

**Fichier modifié** :
- `RapportVenteController.cs:151-163`

**Pour tester** :
1. Ouvrir un terminal dans `C:\Projets\Auth\JwtAuth\JwtAuth`
2. Exécuter `dotnet build` → Devrait compiler sans erreur
3. Exécuter `dotnet run` → Backend démarre sur https://localhost:7053
4. Tester l'endpoint `GET /api/rapportvente/stats/global` via Swagger

---

### 🆕 Tableau de Bord Réceptions Complet (24 octobre 2025 - Session 5)

**Nouvelle page complète de suivi des réceptions avec visualisations** :

- ✅ **Statistiques Clés** : 4 cartes (Nombre vergers, Nombre variétés, Total réceptionné, Stock station)
- ✅ **Graphique à Barres** : Visualisation du poids total par variété (% du global)
- ✅ **Tableau Récapitulatif** : Données groupées par variété avec totaux
- ✅ **Filtres Multi-Select** : Recherche + filtres sur variété, verger, station
- ✅ **Export Complet** : Impression, Excel, PDF avec traçabilité utilisateur
- ✅ **Temps Relatif** : Affichage "il y a X min/h/j" pour dernière MAJ
- ✅ **Auto-Refresh** : Rafraîchissement automatique toutes les 3 minutes
- ✅ **Formatage Avancé** : Séparateurs de milliers, conversion kg→T
- ✅ **Pagination Dynamique** : S'adapte aux filtres en temps réel

**Graphique à barres horizontales** :
- Palette de 8 couleurs distinctes
- Pourcentage par rapport au total global (somme = 100%)
- Affichage du tonnage exact à côté de chaque barre
- Animation fluide au chargement

**Export PDF avec traçabilité** :
- Nom d'utilisateur qui télécharge le document
- Date d'export
- Nombre de réceptions exportées
- Tableau formaté en paysage

**Auto-refresh intelligent** :
- Mise à jour toutes les 3 minutes sans recharger la page
- Pas de spinner lors du refresh automatique
- Données toujours à jour en arrière-plan

**Fichiers créés/modifiés** :
- `src/pages/Receptions.jsx` : +1000 lignes (page complète)
- `src/services/api.js` : Ajout endpoints receptionsAPI
- `src/App.jsx` : Route /receptions
- `src/components/Layout/Layout.jsx` : Menu "Gestion Réception"
- `package.json` : Installation xlsx, jspdf, jspdf-autotable, react-select

**Pour tester** :
1. Se connecter en tant que super-user
2. Aller sur "Gestion Réception → Réceptions"
3. Observer le graphique et les statistiques
4. Utiliser les filtres multi-select
5. Exporter en PDF → Vérifier le nom d'utilisateur
6. Attendre 3 minutes → Données se rafraîchissent automatiquement

---

### 🆕 Page Stock avec Filtres Multi-Select (21 octobre 2025 - Session 4)

**Système complet de gestion de stock pour la Coopérative Zaouia** :

- ✅ **Tableau Réorganisé** : 12 colonnes (Variété, Producteur, Verger, Poid Ini, Poid Jr, Total Reception, Conditionnement, Sold Station, Estimation Verger, Sold Verger, Station, MAJ)
- ✅ **Concaténation Verger** : Réf + Nom dans une seule colonne (ex: "4901 - DOMAIN SAAOUDA")
- ✅ **Pourcentage Conditionnement** : Calcul automatique du % conditionné par rapport à la réception
- ✅ **Filtres Multi-Select** : Sélection multiple pour Variété, Verger, Station (react-select)
- ✅ **Barre de Recherche** : Recherche globale sur Producteur, Verger, Variété
- ✅ **Ligne de Total** : Calcul automatique des totaux pour toutes les colonnes numériques
- ✅ **Affichage en Tonnes** : Conversion kg → T automatique
- ✅ **Lecture Seule** : Tableau optimisé pour l'affichage (colonne Actions supprimée)
- ✅ **Pagination Intelligente** : S'adapte aux filtres en temps réel

**Fichiers modifiés** :
- `src/pages/Stock.jsx` : +400 lignes (filtres, multi-select, totaux)
- `BACKEND_STOCK_MODEL.md` : Ajout du champ `conditionnement`
- `package.json` : Installation de react-select

**Pour tester** :
1. Se connecter en tant que super-user
2. Aller sur "Réception → Stock"
3. Utiliser les filtres multi-select pour sélectionner plusieurs variétés
4. Observer les totaux qui se mettent à jour automatiquement
5. Vérifier le % de conditionnement sous chaque tonnage

---

### 🆕 Menu Hiérarchique avec Sections (21 octobre 2025 - Session 4)

**Navigation organisée avec sections repliables** :

- ✅ **Sections Expandables** : Clic pour ouvrir/fermer les sections
- ✅ **Icône Animée** : Flèche (►) qui tourne (▼) à l'ouverture
- ✅ **Hiérarchie Visuelle** : Sous-items indentés avec bordure gauche
- ✅ **Indicateur Actif** : Section en surbrillance si elle contient la page active
- ✅ **Compatible Sidebar Rétractée** : Tooltips et comportement adapté

**Structure du menu** :
```
📊 Dashboard
📦 Réception
   └─ Stock
👥 Gestion Utilisateur
   ├─ Dashboard Utilisateur
   ├─ Utilisateurs
   └─ Rôles
⚙️ Paramètres
```

**Fichiers modifiés** :
- `src/components/Layout/Layout.jsx` : +200 lignes (système de sections)

**Pour tester** :
1. Cliquer sur "Réception" → Section se déploie
2. Cliquer à nouveau → Section se replie
3. Observer l'animation de la flèche
4. Rétracter la sidebar → Sections se comportent comme des items normaux

---

### 🆕 Validation des Formulaires (19 octobre 2025 - Session 3)

**Système complet de validation côté client** :

- ✅ **Validation en Temps Réel** : Feedback immédiat lors de la saisie
- ✅ **Messages User-Friendly** : Erreurs claires sous chaque champ
- ✅ **Bordures Rouges** : Indication visuelle des champs invalides
- ✅ **11 Règles Prédéfinies** : required, email, password, username, etc.
- ✅ **4 Schémas Réutilisables** : login, user, password, role
- ✅ **Icônes AlertCircle** : Meilleure accessibilité

**Fichiers modifiés** :
- `src/utils/validation.js` : +250 lignes (nouveau fichier central)
- `src/pages/Login.jsx` : Validation complète temps réel
- `src/pages/Roles.jsx` : Validation du nom de rôle

**Documentation** : Voir `FORM_VALIDATION.md` pour tous les détails

**Pour tester** :
1. Page Login → Essayer de soumettre sans remplir → Messages d'erreur inline
2. Créer un rôle → Taper un nom avec espaces → Erreur en temps réel
3. Taper moins de 3 caractères dans username → Message "minimum 3 caractères"

---

### 🆕 Gestion des Erreurs API (19 octobre 2025 - Session 3)

**Nouveau système complet de gestion d'erreurs** :

- ✅ **Retry Automatique** : 3 tentatives avec exponential backoff (1s, 2s, 4s)
- ✅ **Messages User-Friendly** : Conversion automatique des erreurs techniques
- ✅ **Timeout** : 30 secondes pour toutes les requêtes
- ✅ **Toasts au lieu d'Alerts** : Meilleure UX dans toutes les pages
- ✅ **Gestion Réseau** : Détection des problèmes de connexion
- ✅ **Logs Améliorés** : Messages descriptifs dans la console

**Fichiers modifiés** :
- `src/services/api.js` : +90 lignes (fonctions `getErrorMessage()` et retry)
- `src/pages/Users.jsx` : Tous les alerts remplacés par toasts
- `src/pages/Roles.jsx` : Validation et messages améliorés
- `src/pages/Profile.jsx` : Gestion d'erreur complète
- `src/context/AuthContext.jsx` : Utilise `getErrorMessage()`

**Documentation** : Voir `ERROR_HANDLING.md` pour tous les détails

**Pour tester** :
1. Désactiver le backend → Message de retry automatique
2. Créer un utilisateur avec des données invalides → Message clair d'erreur
3. Supprimer un rôle avec utilisateurs assignés → Warning intelligent

---

### Sidebar Rétractable (19 octobre 2025 - Session 2)
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

### Modale de Suppression d'Utilisateur (19 octobre 2025 - Session 2)
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

**Dernière mise à jour** : 25 octobre 2025, Session 6

---

## 🎯 Prochaines Tâches Suggérées

1. **Dashboard Principal** : Créer des widgets et statistiques globales (vue d'ensemble)
2. **Page Conditionnement** : Créer une nouvelle page pour suivre le conditionnement
3. **Page Expéditions** : Créer une page pour gérer les expéditions/livraisons
4. **Graphiques Avancés** : Ajouter des graphiques de tendance temporelle (Chart.js ou Recharts)
5. **Notifications en Temps Réel** : WebSocket pour les mises à jour live
6. **Export Global** : Exporter toutes les données (stock + réceptions) en un seul fichier
7. **Filtres de Date** : Ajouter des filtres de plage de dates sur les réceptions
8. **Indicateurs KPI** : Taux de conditionnement moyen, productivité, etc.

À demain ! 👋
