# Guide d'utilisation - Améliorations UX/UI

## Vue d'ensemble

Ce projet inclut désormais un système complet d'améliorations UX/UI avec animations, notifications toast, états de chargement et feedback visuel amélioré.

---

## 🎨 Système de Notifications Toast

### Import et utilisation

```javascript
import { useToast } from '../context/ToastContext';

function MyComponent() {
    const toast = useToast();

    const handleAction = () => {
        // Notification de succès
        toast.success('Opération réussie !');

        // Notification d'erreur
        toast.error('Une erreur s'est produite');

        // Notification d'information
        toast.info('Voici une information importante');

        // Notification d'avertissement
        toast.warning('Attention, vérifiez vos données');
    };
}
```

### Options avancées

```javascript
// Durée personnalisée (en millisecondes)
toast.success('Message', 3000); // Disparaît après 3 secondes

// Toast qui ne disparaît pas automatiquement
toast.info('Message important', 0);
```

### Types de notifications

| Type | Méthode | Couleur | Usage |
|------|---------|---------|-------|
| Success | `toast.success()` | Vert (#10b981) | Opération réussie |
| Error | `toast.error()` | Rouge (#ef4444) | Erreur, échec |
| Info | `toast.info()` | Bleu (#3b82f6) | Information |
| Warning | `toast.warning()` | Orange (#f59e0b) | Avertissement |

---

## ⚡ Animations et Transitions

### Classes d'animation disponibles

#### 1. **Spin (rotation)**
```jsx
<div className="spinner animate-spin"></div>
```

#### 2. **Slide In Down**
```jsx
<div className="animate-slideInDown">
    Contenu qui apparaît du haut
</div>
```

#### 3. **Slide In/Out Right**
```jsx
// Entrée
<div className="animate-slideInRight">Toast</div>

// Sortie
<div className="animate-slideOutRight">Toast</div>
```

#### 4. **Fade In/Out**
```jsx
<div className="animate-fadeIn">Apparition en fondu</div>
<div className="animate-fadeOut">Disparition en fondu</div>
```

#### 5. **Scale In (Zoom)**
```jsx
<div className="animate-scaleIn">Modal qui s'agrandit</div>
```

#### 6. **Pulse**
```jsx
<div className="animate-pulse">Élément pulsant</div>
```

### Modales avec animations

```jsx
// Backdrop
<div className="modal-backdrop">
    {/* Contenu de la modale */}
    <div className="modal-content card">
        <h2>Ma Modale</h2>
    </div>
</div>
```

---

## 🔄 États de Chargement

### 1. **Spinners**

```jsx
// Spinner standard
<div className="spinner"></div>

// Différentes tailles
<div className="spinner spinner-sm"></div>  {/* Petit */}
<div className="spinner spinner-md"></div>  {/* Moyen */}
<div className="spinner spinner-lg"></div>  {/* Grand */}
```

### 2. **Boutons avec loading**

```jsx
<button
    className={`btn-primary ${isLoading ? 'btn-loading' : ''}`}
    disabled={isLoading}
>
    {isLoading ? 'Chargement...' : 'Envoyer'}
</button>
```

**Résultat** : Le texte devient transparent et un spinner blanc apparaît au centre du bouton.

### 3. **Loading Overlay (plein écran)**

```jsx
{isLoading && (
    <div className="loading-overlay">
        <div className="spinner spinner-lg"></div>
    </div>
)}
```

### 4. **Skeleton Loaders**

Pour le chargement des données :

```jsx
// Texte skeleton
<div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
<div className="skeleton skeleton-text" style={{ width: '60%' }}></div>

// Titre skeleton
<div className="skeleton skeleton-title"></div>

// Avatar skeleton
<div className="skeleton skeleton-avatar"></div>

// Custom skeleton
<div className="skeleton" style={{ height: '200px', width: '100%' }}></div>
```

---

## 🎯 Classes de Boutons

### Boutons disponibles

```jsx
// Bouton primaire (violet)
<button className="btn-primary">Action principale</button>

// Bouton secondaire (gris)
<button className="btn-secondary">Action secondaire</button>

// Bouton danger (rouge)
<button className="btn-danger">Supprimer</button>

// Bouton disabled
<button className="btn-primary" disabled>Désactivé</button>
```

### Effets des boutons

- **Hover** : Déplacement vers le haut (-2px) + ombre plus prononcée
- **Active** : Retour à la position normale
- **Disabled** : Opacité 0.6 + curseur not-allowed

---

## 🎴 Cartes Interactives

### Carte standard (avec hover)

```jsx
<div className="card">
    <h3>Titre de la carte</h3>
    <p>Contenu...</p>
</div>
```

**Effet au survol** : Légère élévation + ombre plus prononcée

### Carte cliquable

```jsx
<div className="card card-interactive" onClick={handleClick}>
    <h3>Carte cliquable</h3>
</div>
```

**Effet au survol** : Élévation plus importante (-4px) + ombre accentuée

---

## 🎨 Variables CSS Personnalisées

### Couleurs de thème

```css
/* Light Mode */
--bg-primary: #f9fafb
--bg-secondary: #ffffff
--bg-tertiary: #f3f4f6
--bg-hover: #f3f4f6

--text-primary: #111827
--text-secondary: #6b7280
--text-tertiary: #9ca3af

--border-color: #e5e7eb
--border-color-hover: #d1d5db

/* Dark Mode */
--bg-primary: #0f172a
--bg-secondary: #1e293b
--bg-tertiary: #334155
--bg-hover: #334155

--text-primary: #f1f5f9
--text-secondary: #cbd5e1
--text-tertiary: #94a3b8

--border-color: #334155
--border-color-hover: #475569
```

### Ombres

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
```

### Couleurs primaires

```css
--color-primary-500: #8b5cf6
--color-primary-600: #7c3aed
--color-primary-700: #6d28d9
```

---

## 💡 Exemples Pratiques

### Exemple 1 : Formulaire avec validation

```jsx
import { useToast } from '../context/ToastContext';

function Form() {
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/data', formData);
            toast.success('Données enregistrées avec succès !');
        } catch (error) {
            toast.error('Erreur lors de l'enregistrement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input className="input-field" />
            <button
                className={`btn-primary ${loading ? 'btn-loading' : ''}`}
                disabled={loading}
            >
                Enregistrer
            </button>
        </form>
    );
}
```

### Exemple 2 : Liste avec skeleton loading

```jsx
function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    if (loading) {
        return (
            <div className="card">
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ marginBottom: '1rem' }}>
                        <div className="skeleton skeleton-avatar"
                             style={{ display: 'inline-block' }} />
                        <div style={{ display: 'inline-block', marginLeft: '1rem' }}>
                            <div className="skeleton skeleton-text"
                                 style={{ width: '200px' }} />
                            <div className="skeleton skeleton-text"
                                 style={{ width: '150px' }} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="card">
            {users.map(user => (
                <UserCard key={user.id} user={user} />
            ))}
        </div>
    );
}
```

### Exemple 3 : Modale animée

```jsx
function Modal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <>
            <div className="modal-backdrop" onClick={onClose} />
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9998
            }}>
                <div className="modal-content card" style={{ width: '500px' }}>
                    <h2>Titre de la modale</h2>
                    <p>Contenu...</p>
                    <button className="btn-primary" onClick={onClose}>
                        Fermer
                    </button>
                </div>
            </div>
        </>
    );
}
```

---

## 🚀 Bonnes Pratiques

### 1. **Toujours utiliser les variables CSS**
```jsx
// ✅ BON
style={{ color: 'var(--text-primary)' }}

// ❌ MAUVAIS
style={{ color: '#111827' }}
```

### 2. **Utiliser les classes existantes**
```jsx
// ✅ BON
<button className="btn-primary">Action</button>

// ❌ MAUVAIS
<button style={{
    backgroundColor: '#7c3aed',
    color: 'white',
    padding: '0.5rem 1rem'
}}>Action</button>
```

### 3. **Feedback utilisateur systématique**
```jsx
// Toujours notifier l'utilisateur du résultat
try {
    await action();
    toast.success('Succès !');
} catch (error) {
    toast.error('Erreur : ' + error.message);
}
```

### 4. **États de chargement cohérents**
```jsx
// Désactiver les boutons pendant le chargement
<button
    disabled={loading}
    className={`btn-primary ${loading ? 'btn-loading' : ''}`}
>
    {loading ? 'Chargement...' : 'Action'}
</button>
```

---

## 📝 Checklist d'intégration

Lors de la création d'une nouvelle fonctionnalité :

- [ ] Utiliser `toast.success()` pour les opérations réussies
- [ ] Utiliser `toast.error()` pour les erreurs
- [ ] Ajouter `className="btn-loading"` aux boutons de soumission
- [ ] Utiliser skeleton loaders pour le chargement des données
- [ ] Utiliser les variables CSS pour les couleurs
- [ ] Ajouter des animations pour les modales
- [ ] Tester en mode dark ET light
- [ ] Vérifier les états disabled des boutons

---

## 🎓 Ressources

- **Icônes** : [Lucide React](https://lucide.dev)
- **Animations CSS** : Définies dans `src/index.css` (lignes 117-577)
- **Context Toast** : `src/context/ToastContext.jsx`
- **Variables CSS** : `src/index.css` (lignes 19-57)

---

**Dernière mise à jour** : 19 octobre 2025
