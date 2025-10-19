import { useState, useEffect } from 'react';
import { usersAPI, rolesAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Search, Plus, Edit, Trash2, Filter, Download, X, Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const Users = () => {
    const toast = useToast();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showRolesModal, setShowRolesModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [assigningRoles, setAssigningRoles] = useState(false);
    const [changePassword, setChangePassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        emailConfirmed: true,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersRes, rolesRes] = await Promise.all([
                usersAPI.getAll(),
                rolesAPI.getAll(),
            ]);

            console.log('=== Données chargées ===');
            console.log('usersRes.data:', usersRes.data);
            console.log('Premier utilisateur:', usersRes.data[0]);
            console.log('Rôles du premier utilisateur:', usersRes.data[0]?.roles);

            setUsers(usersRes.data);

            // Gérer si les rôles sont des objets ou des strings
            const rolesData = rolesRes.data.map(role =>
                typeof role === 'string' ? role : role.name
            );

            console.log('rolesData:', rolesData);
            setRoles(rolesData);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation du mot de passe si on veut le changer
        if (editingUser && changePassword) {
            if (!formData.password) {
                alert('Veuillez entrer un nouveau mot de passe');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                alert('Les mots de passe ne correspondent pas');
                return;
            }
            if (formData.password.length < 6) {
                alert('Le mot de passe doit contenir au moins 6 caractères');
                return;
            }
        }

        // Validation pour création
        if (!editingUser) {
            if (!formData.password) {
                alert('Le mot de passe est requis');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                alert('Les mots de passe ne correspondent pas');
                return;
            }
            if (formData.password.length < 6) {
                alert('Le mot de passe doit contenir au moins 6 caractères');
                return;
            }
        }

        try {
            const dataToSend = {
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                emailConfirmed: formData.emailConfirmed,
            };

            if (editingUser) {
                // Si on change le mot de passe, l'inclure
                if (changePassword && formData.password) {
                    dataToSend.password = formData.password;
                }
                await usersAPI.update(editingUser.id, dataToSend);
            } else {
                // Pour création, inclure username et password
                dataToSend.username = formData.username;
                dataToSend.password = formData.password;
                await usersAPI.create(dataToSend);
            }

            loadData();
            closeModal();
        } catch (error) {
            console.error('Erreur:', error);
            const errorMessage = error.response?.data?.message || 'Erreur lors de l\'enregistrement';
            alert(errorMessage);
        }
    };

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setUserToDelete(null);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        try {
            await usersAPI.delete(userToDelete.id);
            toast.success(`L'utilisateur ${userToDelete.userName} a été supprimé avec succès`);
            loadData();
            closeDeleteModal();
        } catch (error) {
            console.error('Erreur:', error);
            const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression';
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.userName,
                email: user.email,
                password: '',
                confirmPassword: '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                emailConfirmed: user.emailConfirmed ?? true,
            });
            setChangePassword(false); // Reset password change toggle
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
                emailConfirmed: true,
            });
            setChangePassword(false);
        }
        setShowPassword(false);
        setShowConfirmPassword(false);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setChangePassword(false);
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const openRolesModal = (user) => {
        console.log('=== Opening Roles Modal ===');
        console.log('Selected user:', user);
        console.log('User roles:', user.roles);
        console.log('User roles type:', typeof user.roles);
        console.log('Is array:', Array.isArray(user.roles));
        setSelectedUser(user);
        setShowRolesModal(true);
    };

    const closeRolesModal = () => {
        setShowRolesModal(false);
        setSelectedUser(null);
    };

    const handleToggleRole = async (userId, roleName, currentHasRole) => {
        console.log('=== Début handleToggleRole ===');
        console.log('userId:', userId);
        console.log('roleName:', roleName);
        console.log('currentHasRole (from UI):', currentHasRole);

        // Double vérification avec l'état actuel
        const userRoles = selectedUser.roles || [];
        const actualHasRole = Array.isArray(userRoles) && userRoles.some(r => {
            const userRole = typeof r === 'string' ? r.trim().toLowerCase() : '';
            const checkRole = typeof roleName === 'string' ? roleName.trim().toLowerCase() : '';
            return userRole === checkRole;
        });

        console.log('actualHasRole (recheck):', actualHasRole);
        console.log('selectedUser.roles:', selectedUser.roles);

        setAssigningRoles(true);
        try {
            if (actualHasRole) {
                console.log('Tentative de suppression du rôle...');
                const response = await usersAPI.removeRole(userId, roleName);
                console.log('Réponse removeRole:', response);
            } else {
                console.log('Tentative d\'assignation du rôle...');
                const response = await usersAPI.assignRole(userId, roleName);
                console.log('Réponse assignRole:', response);
            }

            console.log('Rechargement des données...');
            await loadData();

            // Mettre à jour l'utilisateur sélectionné avec les nouvelles données
            const updatedUsers = await usersAPI.getAll();
            const updatedUser = updatedUsers.data.find(u => u.id === userId);
            if (updatedUser) {
                console.log('Utilisateur mis à jour:', updatedUser);
                setSelectedUser(updatedUser);
            }

            console.log('=== Succès ===');
        } catch (error) {
            console.error('=== ERREUR COMPLÈTE ===');
            console.error('Error object:', error);
            console.error('Error response:', error.response);
            console.error('Error response data:', error.response?.data);
            console.error('Error response status:', error.response?.status);
            console.error('Error message:', error.message);

            // Afficher l'erreur de manière plus détaillée
            let errorMessage = 'Erreur lors de la modification du rôle';

            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.errors) {
                    errorMessage = JSON.stringify(error.response.data.errors);
                } else {
                    errorMessage = JSON.stringify(error.response.data);
                }
            }

            console.error('Message à afficher:', errorMessage);
            alert(errorMessage);
        } finally {
            setAssigningRoles(false);
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.roles?.includes(filterRole);
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
                <div style={{
                    width: '3rem',
                    height: '3rem',
                    border: '2px solid var(--color-primary-600)',
                    borderTopColor: 'transparent',
                    borderRadius: '9999px',
                    animation: 'spin 1s linear infinite'
                }}></div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        Utilisateurs
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Liste de tous les utilisateurs</p>
                </div>
                <button onClick={() => openModal()} className="btn-primary">
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    Ajouter Utilisateur
                </button>
            </div>

            {/* Filters Card */}
            <div className="card">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {/* Search */}
                        <div style={{ flex: '1 1 300px', position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                            <input
                                type="text"
                                placeholder="Rechercher un utilisateur..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field"
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>

                        {/* Role Filter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Filter size={18} style={{ color: 'var(--text-tertiary)' }} />
                            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="input-field" style={{ width: 'auto' }}>
                                <option value="all">Tous les rôles</option>
                                {roles.map((role) => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>

                        {/* Export */}
                        <button className="btn-secondary">
                            <Download size={18} style={{ marginRight: '0.5rem' }} />
                            Exporter
                        </button>
                    </div>
                </div>
            </div>

            {/* Users Table Card */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Utilisateur</th>
                                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Email</th>
                                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Rôle</th>
                                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Status</th>
                                <th style={{ textAlign: 'right', padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{
                                                width: '2.5rem',
                                                height: '2.5rem',
                                                backgroundColor: 'var(--color-primary-600)',
                                                borderRadius: '9999px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: '0.75rem'
                                            }}>
                                                <span style={{ color: 'white', fontWeight: 500 }}>
                                                    {user.userName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{user.userName}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.firstName} {user.lastName}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.email}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                            {user.roles?.map((role) => (
                                                <span key={role} style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    padding: '0.125rem 0.625rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    backgroundColor: '#ede9fe',
                                                    color: '#7c3aed'
                                                }}>
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '0.125rem 0.625rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            backgroundColor: user.emailConfirmed ? '#d1fae5' : 'var(--bg-tertiary)',
                                            color: user.emailConfirmed ? '#065f46' : 'var(--text-primary)'
                                        }}>
                                            {user.emailConfirmed ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => openRolesModal(user)}
                                                style={{
                                                    padding: '0.5rem',
                                                    color: 'var(--text-secondary)',
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    borderRadius: '0.5rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                title="Gérer les rôles"
                                            >
                                                <Shield size={16} />
                                            </button>
                                            <button
                                                onClick={() => openModal(user)}
                                                style={{
                                                    padding: '0.5rem',
                                                    color: 'var(--text-secondary)',
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    borderRadius: '0.5rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(user)}
                                                style={{
                                                    padding: '0.5rem',
                                                    color: '#ef4444',
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    borderRadius: '0.5rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                title="Supprimer l'utilisateur"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: 'var(--text-secondary)' }}>Aucun utilisateur trouvé</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50,
                    padding: '1rem'
                }}>
                    <div style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '0.5rem',
                        maxWidth: '28rem',
                        width: '100%',
                        padding: '1.5rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                {editingUser ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
                            </h2>
                            <button onClick={closeModal} style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                    Nom d'utilisateur
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            {!editingUser && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        Mot de passe *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="input-field"
                                            style={{ paddingRight: '2.5rem' }}
                                            placeholder="Minimum 6 caractères"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '0.75rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'var(--text-tertiary)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '0.25rem'
                                            }}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!editingUser && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        Confirmer le mot de passe *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="input-field"
                                            style={{ paddingRight: '2.5rem' }}
                                            placeholder="Confirmer le mot de passe"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '0.75rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'var(--text-tertiary)',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '0.25rem'
                                            }}
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {editingUser && (
                                <div style={{
                                    padding: '1rem',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '0.5rem'
                                }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        marginBottom: changePassword ? '1rem' : '0'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={changePassword}
                                            onChange={(e) => {
                                                setChangePassword(e.target.checked);
                                                if (!e.target.checked) {
                                                    setFormData({ ...formData, password: '', confirmPassword: '' });
                                                }
                                            }}
                                            style={{
                                                width: '1.125rem',
                                                height: '1.125rem',
                                                marginRight: '0.75rem',
                                                cursor: 'pointer',
                                                accentColor: 'var(--color-primary-600)'
                                            }}
                                        />
                                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                            Changer le mot de passe
                                        </span>
                                    </label>

                                    {changePassword && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                                    Nouveau mot de passe *
                                                </label>
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                        className="input-field"
                                                        style={{ paddingRight: '2.5rem' }}
                                                        placeholder="Minimum 6 caractères"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        style={{
                                                            position: 'absolute',
                                                            right: '0.75rem',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            color: 'var(--text-tertiary)',
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '0.25rem'
                                                        }}
                                                    >
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                                    Confirmer le nouveau mot de passe *
                                                </label>
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        value={formData.confirmPassword}
                                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                        className="input-field"
                                                        style={{ paddingRight: '2.5rem' }}
                                                        placeholder="Confirmer le mot de passe"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        style={{
                                                            position: 'absolute',
                                                            right: '0.75rem',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            color: 'var(--text-tertiary)',
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '0.25rem'
                                                        }}
                                                    >
                                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div style={{
                                                padding: '0.75rem',
                                                backgroundColor: '#eff6ff',
                                                border: '1px solid #bfdbfe',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.75rem',
                                                color: '#1e40af'
                                            }}>
                                                💡 Le mot de passe doit contenir au moins 6 caractères
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        Prénom
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Status Toggle */}
                            <div style={{
                                padding: '1rem',
                                backgroundColor: formData.emailConfirmed ? '#f0fdf4' : '#fef2f2',
                                border: formData.emailConfirmed ? '1px solid #86efac' : '1px solid #fecaca',
                                borderRadius: '0.5rem',
                                transition: 'all 0.2s'
                            }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}>
                                    <div style={{ position: 'relative', marginRight: '0.75rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.emailConfirmed}
                                            onChange={(e) => setFormData({ ...formData, emailConfirmed: e.target.checked })}
                                            style={{ display: 'none' }}
                                        />
                                        <div style={{
                                            width: '2.75rem',
                                            height: '1.5rem',
                                            backgroundColor: formData.emailConfirmed ? '#22c55e' : '#ef4444',
                                            borderRadius: '9999px',
                                            transition: 'background-color 0.2s',
                                            position: 'relative'
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                top: '0.125rem',
                                                left: formData.emailConfirmed ? '1.375rem' : '0.125rem',
                                                width: '1.25rem',
                                                height: '1.25rem',
                                                backgroundColor: 'white',
                                                borderRadius: '9999px',
                                                transition: 'left 0.2s',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                            }}></div>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            color: formData.emailConfirmed ? '#166534' : '#991b1b',
                                            marginBottom: '0.125rem'
                                        }}>
                                            {formData.emailConfirmed ? 'Compte Actif' : 'Compte Inactif'}
                                        </p>
                                        <p style={{
                                            fontSize: '0.75rem',
                                            color: formData.emailConfirmed ? '#16a34a' : '#dc2626'
                                        }}>
                                            {formData.emailConfirmed
                                                ? "L'utilisateur peut se connecter"
                                                : "L'utilisateur ne peut pas se connecter"}
                                        </p>
                                    </div>
                                    <div style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        backgroundColor: formData.emailConfirmed ? '#22c55e' : '#ef4444',
                                        color: 'white'
                                    }}>
                                        {formData.emailConfirmed ? 'ACTIF' : 'INACTIF'}
                                    </div>
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                                    {editingUser ? 'Modifier' : 'Créer'}
                                </button>
                                <button type="button" onClick={closeModal} className="btn-secondary" style={{ flex: 1 }}>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Roles Management Modal */}
            {showRolesModal && selectedUser && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50,
                    padding: '1rem'
                }}>
                    <div style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '0.5rem',
                        maxWidth: '28rem',
                        width: '100%',
                        padding: '1.5rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Shield size={20} style={{ color: 'var(--color-primary-600)' }} />
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                    Gérer les rôles
                                </h2>
                            </div>
                            <button onClick={closeRolesModal} style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* User Info */}
                        <div style={{
                            padding: '1rem',
                            backgroundColor: 'var(--bg-tertiary)',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{
                                    width: '2.5rem',
                                    height: '2.5rem',
                                    backgroundColor: 'var(--color-primary-600)',
                                    borderRadius: '9999px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '0.75rem'
                                }}>
                                    <span style={{ color: 'white', fontWeight: 500 }}>
                                        {selectedUser.userName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                        {selectedUser.userName}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {selectedUser.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Roles List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                Rôles disponibles
                            </label>
                            {roles.map((role) => {
                                // Vérification plus robuste de la présence du rôle
                                const userRoles = selectedUser.roles || [];
                                const hasRole = Array.isArray(userRoles) && userRoles.some(r => {
                                    // Comparaison insensible à la casse et aux espaces
                                    const userRole = typeof r === 'string' ? r.trim().toLowerCase() : '';
                                    const currentRole = typeof role === 'string' ? role.trim().toLowerCase() : '';
                                    return userRole === currentRole;
                                });

                                console.log('Role check:', {
                                    role,
                                    userRoles,
                                    hasRole,
                                    selectedUserRoles: selectedUser.roles
                                });

                                return (
                                    <label
                                        key={role}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.75rem',
                                            backgroundColor: hasRole ? '#f0fdf4' : 'var(--bg-tertiary)',
                                            border: hasRole ? '1px solid #86efac' : '1px solid var(--border-color)',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={hasRole}
                                            onChange={() => handleToggleRole(selectedUser.id, role, hasRole)}
                                            disabled={assigningRoles}
                                            style={{
                                                width: '1.25rem',
                                                height: '1.25rem',
                                                marginRight: '0.75rem',
                                                cursor: 'pointer',
                                                accentColor: 'var(--color-primary-600)'
                                            }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <p style={{
                                                fontSize: '0.875rem',
                                                fontWeight: 500,
                                                color: hasRole ? '#166534' : 'var(--text-primary)'
                                            }}>
                                                {role}
                                            </p>
                                        </div>
                                        {hasRole && (
                                            <span style={{
                                                fontSize: '0.75rem',
                                                color: '#16a34a',
                                                fontWeight: 500
                                            }}>
                                                ✓ Assigné
                                            </span>
                                        )}
                                    </label>
                                );
                            })}
                        </div>

                        {assigningRoles && (
                            <div style={{
                                padding: '0.75rem',
                                backgroundColor: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '0.5rem',
                                marginBottom: '1rem',
                                fontSize: '0.875rem',
                                color: '#1e40af',
                                textAlign: 'center'
                            }}>
                                Mise à jour des rôles en cours...
                            </div>
                        )}

                        {/* Close Button */}
                        <button
                            onClick={closeRolesModal}
                            className="btn-secondary"
                            style={{ width: '100%' }}
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && userToDelete && (
                <div className="modal-backdrop" onClick={closeDeleteModal}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: '0.5rem',
                            maxWidth: '26rem',
                            width: '100%',
                            padding: '1.5rem',
                            zIndex: 9998,
                            margin: '1rem'
                        }}
                    >
                        {/* Icon Header */}
                        <div style={{
                            width: '4rem',
                            height: '4rem',
                            backgroundColor: '#fef2f2',
                            borderRadius: '9999px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem'
                        }}>
                            <AlertTriangle size={32} style={{ color: '#ef4444' }} />
                        </div>

                        {/* Title */}
                        <h2 style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: 'var(--text-primary)',
                            textAlign: 'center',
                            marginBottom: '0.5rem'
                        }}>
                            Supprimer l'utilisateur
                        </h2>

                        {/* Message */}
                        <p style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                            textAlign: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            Êtes-vous sûr de vouloir supprimer <strong style={{ color: 'var(--text-primary)' }}>{userToDelete.userName}</strong> ?
                            <br />
                            Cette action est irréversible.
                        </p>

                        {/* User Info Card */}
                        <div style={{
                            padding: '1rem',
                            backgroundColor: 'var(--bg-tertiary)',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{
                                    width: '2.5rem',
                                    height: '2.5rem',
                                    backgroundColor: '#ef4444',
                                    borderRadius: '9999px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '0.75rem'
                                }}>
                                    <span style={{ color: 'white', fontWeight: 500 }}>
                                        {userToDelete.userName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                        {userToDelete.userName}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {userToDelete.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={closeDeleteModal}
                                disabled={isDeleting}
                                className="btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className={`btn-danger ${isDeleting ? 'btn-loading' : ''}`}
                                style={{ flex: 1 }}
                            >
                                {isDeleting ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;