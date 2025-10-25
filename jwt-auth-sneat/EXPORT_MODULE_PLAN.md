# 📦 Plan du Module Export - Tableau de Bord

> **Statut** : En planification
> **Date** : 2025-10-25
> **Modèle Backend** : `DossierExport` (C:\Projets\Auth\JwtAuth\JwtAuth\Models\Dossier_Export.cs)

---

## 🎯 Objectif

Créer un tableau de bord complet pour la gestion et visualisation des dossiers d'export avec statistiques en temps réel.

---

## 📊 PARTIE 1 : BACKEND (API .NET)

### 1.1 Contrôleur : `DossierExportController.cs`

#### Endpoints à créer :

##### ✅ Endpoint 1 : Liste des dossiers
```
GET /api/dossierexport/list
```
**Fonctionnalités** :
- [ ] Liste complète des dossiers d'export
- [ ] Filtrage par date (Dtedep - from/to)
- [ ] Filtrage par navire
- [ ] Filtrage par pays (Codpay/Nompay)
- [ ] Filtrage par station
- [ ] Filtrage par exportateur(refexp/exporter)
- [ ] Filtrage par client (Rsclient)
- [ ] Filtrage par produit/variété (Codvar)
- [ ] Tri par date de départ (desc/asc)
- [ ] Pagination (page, pageSize)
- [ ] Recherche globale (numdos, numtc, refexp,exporter,navire,client)

**Paramètres Query** :
- dateFrom, dateTo, navire, codpay, station, rsclient, codvar
- sortBy, sortOrder, page, pageSize, search

---

##### ✅ Endpoint 2 : Statistiques globales
```
GET /api/dossierexport/stats
```
**Données à retourner** :
- [ ] Nombre total de dossiers distincts
- [ ] Total des palettes (sum Nbrpal)
- [ ] Total des colis (sum Nbrcol)
- [ ] Poids commercial total (sum Pdscom)
- [ ] Nombre de navires distincts
- [ ] Nombre de pays de destination distincts
- [ ] Nombre de clients distincts
- [ ] Date du dernier export

**Filtres** :
- [ ] Par période (dateFrom, dateTo)
- [ ] Par station

---

##### ✅ Endpoint 3 : Évolution temporelle
```
GET /api/dossierexport/stats/timeline
```
**Données à retourner** :
- [ ] Exports par jour
- [ ] Exports par semaine
- [ ] Exports par mois
- [ ] Groupement par période (day/week/month)

**Structure de retour** :
```json
{
  "period": "2025-10",
  "totalDossiers": 50,
  "totalPalettes": 1200,
  "totalColis": 3500,
  "totalPoids": 45000.50
}
```

---

##### ✅ Endpoint 4 : Répartition par pays
```
GET /api/dossierexport/stats/by-country
```
**Données à retourner** :
- [ ] Liste des pays avec leurs codes
- [ ] Nombre de dossiers par pays
- [ ] Total palettes par pays
- [ ] Total colis par pays
- [ ] Total poids par pays
- [ ] Tri par volume (desc)
- [ ] Top N pays (paramètre limit)

---

##### ✅ Endpoint 5 : Répartition par produit/variété
```
GET /api/dossierexport/stats/by-product
```
**Données à retourner** :
- [ ] Liste des variétés (Codvar)
- [ ] Nom du produit
- [ ] Nombre de dossiers par variété
- [ ] Total palettes par variété
- [ ] Total colis par variété
- [ ] Total poids par variété
- [ ] Top N produits (paramètre limit)

---

##### ✅ Endpoint 6 : Statistiques par navire
```
GET /api/dossierexport/stats/by-navire
```
**Données à retourner** :
- [ ] Liste des navires
- [ ] Nombre de dossiers par navire
- [ ] Total palettes par navire
- [ ] Total poids par navire
- [ ] Dernière date de départ (Dtedep)
- [ ] Tri par date ou volume

---

##### ✅ Endpoint 7 : Répartition par station
```
GET /api/dossierexport/stats/by-station
```
**Données à retourner** :
- [ ] Liste des stations
- [ ] Nombre de dossiers par station
- [ ] Total palettes par station
- [ ] Total colis par station
- [ ] Total poids par station
- [ ] Performances comparées

---

##### ✅ Endpoint 8 : Détails d'un dossier
```
GET /api/dossierexport/{id}
```
**Données à retourner** :
- [ ] Toutes les informations du dossier
- [ ] Données enrichies si nécessaire

---



### 1.2 Autorisation et Sécurité

- [ ] Ajouter `[Authorize]` sur le contrôleur
- [ ] Définir les rôles autorisés :
  - [ ] "super-user" : accès complet
  - [ ] "export-manager" : lecture + modification
  - [ ] "export-viewer" : lecture seule
- [ ] Validation des entrées utilisateur
- [ ] Gestion des erreurs (try-catch)

---

## 🎨 PARTIE 2 : FRONTEND (React)

### 2.1 Pages à créer

#### Page 1 : `/exports` - Tableau de bord principal
**Composants** :
- [ ] Cartes de statistiques (KPIs)
  - [ ] Total dossiers
  - [ ] Total palettes
  - [ ] Total colis
  - [ ] Poids total
- [ ] Graphique en ligne : Évolution dans le temps
- [ ] Graphique camembert : Répartition par pays
- [ ] Graphique barres : Top 10 produits
- [ ] Tableau récapitulatif

#### Page 2 : `/exports/list` - Liste des dossiers
**Composants** :
- [ ] Tableau avec toutes les colonnes
- [ ] Filtres multiples (date, navire, pays, etc.)
- [ ] Recherche globale
- [ ] Pagination
- [ ] Tri sur colonnes
- [ ] Actions : Voir 
- [ ] Export CSV/Excel


#### Page 5 : `/exports/details/:id` - Détails d'un dossier
**Vue détaillée** :
- [ ] Toutes les informations du dossier
- [ ] Affichage formaté
- [ ] Boutons Retour

---

### 2.2 Composants réutilisables

#### ExportStatsCards.jsx
- [ ] Cartes de statistiques avec icônes
- [ ] Effet de chargement
- [ ] Animation des chiffres

#### ExportChart.jsx
- [ ] Graphiques avec Chart.js ou Recharts
- [ ] Types : Line, Bar, Pie, Doughnut
- [ ] Responsif

#### ExportFilters.jsx
- [ ] Filtres de date (DatePicker)
- [ ] Sélecteurs multiples
- [ ] Recherche
- [ ] Bouton reset

#### ExportTable.jsx
- [ ] Tableau avec tri
- [ ] Pagination
- [ ] Actions par ligne
- [ ] Formatage des données

---

### 2.3 Services API (exportService.js)

```javascript
// Fonctions à créer :
- getAllExports(filters, page, pageSize)
- getExportById(id)
- getGlobalStats(filters)
- getTimelineStats(period, filters)
- getStatsByCountry(limit, filters)
- getStatsByProduct(limit, filters)
- getStatsByNavire(filters)
- getStatsByStation(filters)
```

---

### 2.4 Routes à ajouter

```javascript
// Dans App.jsx ou router
{
  path: '/exports',
  children: [
    { index: true, element: <ExportDashboard /> },
    { path: 'list', element: <ExportList /> },
    { path: 'create', element: <ExportCreate /> },
    { path: 'edit/:id', element: <ExportEdit /> },
    { path: 'details/:id', element: <ExportDetails /> },
  ]
}
```

---

### 2.5 Menu de navigation

- [ ] Ajouter "Exports" dans le menu principal
- [ ] Icône :   🚢
- [ ] Sous-menu :
  - [ ] Tableau de bord
  - [ ] Liste des dossiers
- [ ] Badge avec nombre de dossiers récents

---

## 📈 PARTIE 3 : VISUALISATIONS

### 3.1 Graphiques proposés

#### Graphique 1 : Évolution des exports
- **Type** : Line chart
- **Données** : Nombre de dossiers/palettes par jour/semaine/mois
- **Options** : Sélection de période

#### Graphique 2 : Répartition par pays
- **Type** : Pie/Doughnut chart
- **Données** : Poids ou palettes par pays
- **Options** : Top 5/10/Tous

#### Graphique 3 : Top produits exportés
- **Type** : Bar chart horizontal
- **Données** : Top 10 variétés
- **Options** : Par poids ou nombre

#### Graphique 4 : Performance des stations
- **Type** : Bar chart
- **Données** : Volume par station
- **Options** : Comparaison

#### Graphique 5 : Timeline des navires
- **Type** : Timeline ou Gantt
- **Données** : Départs prévus des navires

---

## 🎛️ PARTIE 4 : FONCTIONNALITÉS AVANCÉES

### 4.1 Filtres et recherche
- [ ] Filtre par plage de dates
- [ ] Filtre multi-critères
- [ ] Recherche en temps réel
- [ ] Sauvegarde des filtres

### 4.2 Export de données
- [ ] Export CSV
- [ ] Export Excel
- [ ] Export PDF
- [ ] Impression

### 4.3 Auto-refresh
- [ ] Rafraîchissement automatique des stats (130s/5min)
- [ ] Indicateur de mise à jour
- [ ] Option on/off

### 4.4 Notifications
- [ ] Alerte nouveau dossier
- [ ] Alerte départ navire proche
- [ ] Alerte modification

---

## 🎨 PARTIE 5 : DESIGN ET UX

### 5.1 Palette de couleurs
- [ ] Bleu : Navigation/Navires
- [ ] Vert : Statistiques positives
- [ ] Orange : Alertes/En cours
- [ ] Rouge : Suppression/Erreurs

### 5.2 Icônes
- [ ] 📦 Dossiers
- [ ] 🚢 Navires
- [ ] 🌍 Pays
- [ ] 📊 Statistiques
- [ ] 🏭 Stations
- [ ] 🍎 Produits

### 5.3 Responsive
- [ ] Mobile : Cartes empilées
- [ ] Tablette : Grille 2 colonnes
- [ ] Desktop : Grille complète

---

## ✅ CHECKLIST DE RÉALISATION

### Phase 1 : Backend (Priorité HAUTE)
- [ ] Créer DossierExportController.cs
- [ ] Endpoint: GET /list avec filtres
- [ ] Endpoint: GET /stats globales
- [ ] Endpoint: GET /stats/timeline
- [ ] Endpoint: GET /stats/by-country
- [ ] Endpoint: GET /stats/by-product
- [ ] Endpoint: GET /stats/by-navire
- [ ] Endpoint: GET /stats/by-station
- [ ] Endpoint: GET /{id}
- [ ] Tester tous les endpoints dans Swagger

### Phase 2 : Services Frontend (Priorité HAUTE)
- [ ] Créer exportService.js
- [ ] Implémenter toutes les fonctions API
- [ ] Gestion des erreurs

### Phase 3 : Composants de base (Priorité HAUTE)
- [ ] ExportStatsCards
- [ ] ExportChart
- [ ] ExportFilters
- [ ] ExportTable

### Phase 4 : Pages principales (Priorité MOYENNE)
- [ ] ExportDashboard (tableau de bord)
- [ ] ExportList (liste)
- [ ] ExportCreate (création)
- [ ] ExportEdit (modification)
- [ ] ExportDetails (détails)

### Phase 5 : Intégration (Priorité MOYENNE)
- [ ] Ajouter routes
- [ ] Ajouter au menu
- [ ] Tester navigation
- [ ] Gestion des permissions

### Phase 6 : Finalisation (Priorité BASSE)
- [ ] Auto-refresh
- [ ] Export CSV/Excel
- [ ] Notifications
- [ ] Tests utilisateurs
- [ ] Documentation

---

## 🔧 CONFIGURATION REQUISE

### Backend
- .NET 9.0
- Entity Framework Core
- MySQL
- JWT Authentication

### Frontend
- React 18+
- React Router
- Chart.js ou Recharts
- Date-fns ou Day.js
- Axios

### Packages à installer
```bash
# Backend (si nécessaire)
dotnet add package AutoMapper
dotnet add package ClosedXML (pour export Excel)

# Frontend
npm install recharts
npm install date-fns
npm install react-datepicker
```

---

## 📝 NOTES ET REMARQUES

### Points à clarifier :
1. [ ] Quels rôles peuvent créer/modifier/supprimer des dossiers ? PERSONNE NE PEUT CREE OU MODIFIER LES DOSSIER LES DONNEES SONT EN LECTURE seule.
2. [ ] Y a-t-il des règles métier spécifiques ? lecture seule.
3. [ ] Faut-il un historique des modifications ? NON.
4. [ ] Export automatique vers un système externe ? NON.
5. [ ] Validation de cohérence des données ?

### Améliorations futures possibles :
- Génération automatique de documents (BL, factures)
- Intégration avec système de tracking
- Dashboard temps réel avec WebSockets

---

## 🚀 PRÊT À DÉMARRER ?

**Modifiez ce fichier selon vos besoins, puis dites-moi quand vous êtes prêt !**

Vous pouvez :
- ✏️ Cocher/décocher les fonctionnalités voulues
- ✏️ Ajouter de nouveaux endpoints
- ✏️ Modifier les noms de routes
- ✏️ Ajuster les priorités
- ✏️ Ajouter des notes spécifiques

Une fois vos modifications terminées, je réaliserai le code selon votre plan personnalisé !
