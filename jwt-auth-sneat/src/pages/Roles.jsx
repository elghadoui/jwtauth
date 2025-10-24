import { useState, useEffect } from 'react';
import { rolesAPI, usersAPI, getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import { validateField, commonSchemas } from '../utils/validation';
import { Plus, Trash2, Users, Shield, X, AlertCircle } from 'lucide-react';
import Pagination from '../components/Pagination';

const Roles = () => {
    const toast = useToast();
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [roleError, setRoleError] = useState('');
    const [selectedRole, setSelectedRole] = useState(null);
    const [showUsersModal, setShowUsersModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(9);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [rolesRes, usersRes] = await Promise.all([
                rolesAPI.getAll(),
                usersAPI.getAll(),
            ]);

            // Gérer si les rôles sont des objets ou des strings
            const rolesData = rolesRes.data.map(role =>
                typeof role === 'string' ? role : role.name
            );
            setRoles(rolesData);
            setUsers(usersRes.data);
        } catch (error) {
            console.error('Erreur lors du chargement des rôles:', error);
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

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
            toast.error('Veuillez corriger les erreurs dans le formulaire');
            return;
        }

        try {
            await rolesAPI.create(newRole);
            toast.success(`Le rôle "${newRole}" a été créé avec succès`);
            loadData();
            setShowModal(false);
            setNewRole('');
            setRoleError('');
        } catch (error) {
            console.error('Erreur lors de la création du rôle:', error);
            toast.error(getErrorMessage(error));
        }
    };

    const handleDeleteRole = async (roleName) => {
        const userCount = getUserCountByRole(roleName);

        if (userCount > 0) {
            const usersWithRole = users.filter((user) => user.roles?.includes(roleName));
            const userNames = usersWithRole.map(u => u.userName).join(', ');
            toast.error(
                `Impossible de supprimer le rôle "${roleName}".\n` +
                `Il est actuellement assigné à ${userCount} utilisateur(s): ${userNames}.\n` +
                `Veuillez d'abord retirer ce rôle de tous les utilisateurs.`
            );
            return;
        }

        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${roleName}"?`)) {
            try {
                await rolesAPI.delete(roleName);
                toast.success(`Le rôle "${roleName}" a été supprimé avec succès`);
                loadData();
            } catch (error) {
                console.error('Erreur lors de la suppression du rôle:', error);
                toast.error(getErrorMessage(error));
            }
        }
    };

    const getUserCountByRole = (roleName) => {
        return users.filter((user) => user.roles?.includes(roleName)).length;
    };

    const viewUsersInRole = (roleName) => {
        setSelectedRole(roleName);
        setShowUsersModal(true);
    };

    const getRoleColor = (index) => {
        const colors = [
            { bg: '#ede9fe', text: '#7c3aed' },
            { bg: '#dbeafe', text: '#1e40af' },
            { bg: '#d1fae5', text: '#065f46' },
            { bg: '#fed7aa', text: '#92400e' },
            { bg: '#f3e8ff', text: '#6b21a8' },
            { bg: '#fce7f3', text: '#9f1239' },
        ];
        return colors[index % colors.length];
    };

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

    const usersInSelectedRole = selectedRole
        ? users.filter((user) => user.roles?.includes(selectedRole))
        : [];

    // Pagination
    const totalPages = Math.ceil(roles.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRoles = roles.slice(startIndex, endIndex);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        Rôles
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gérer les rôles et permissions</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    Créer un Rôle
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total des Rôles</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{roles.length}</h3>
                        </div>
                        <div style={{
                            width: '3rem',
                            height: '3rem',
                            backgroundColor: 'var(--color-primary-600)',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Shield size={24} style={{ color: 'white' }} />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Utilisateurs Assignés</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{users.length}</h3>
                        </div>
                        <div style={{
                            width: '3rem',
                            height: '3rem',
                            backgroundColor: '#10b981',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Users size={24} style={{ color: 'white' }} />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Rôles Actifs</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{roles.length}</h3>
                        </div>
                        <div style={{
                            width: '3rem',
                            height: '3rem',
                            backgroundColor: '#3b82f6',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Shield size={24} style={{ color: 'white' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Roles Grid */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', padding: '1.5rem' }}>
                    {paginatedRoles.map((role, index) => {
                    const colors = getRoleColor(index);
                    return (
                        <div key={role} className="card" style={{ transition: 'all 0.2s' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{
                                        width: '2.5rem',
                                        height: '2.5rem',
                                        backgroundColor: colors.bg,
                                        color: colors.text,
                                        borderRadius: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '0.75rem'
                                    }}>
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{role}</h3>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            {getUserCountByRole(role)} utilisateur(s)
                                        </p>
                                    </div>
                                </div>
                                {role !== 'Admin' && (
                                    <button
                                        onClick={() => handleDeleteRole(role)}
                                        style={{
                                            padding: '0.5rem',
                                            color: 'var(--text-tertiary)',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                                <button
                                    onClick={() => viewUsersInRole(role)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.875rem',
                                        color: 'var(--color-primary-600)',
                                        fontWeight: 500,
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0.5rem'
                                    }}
                                >
                                    <Users size={16} style={{ marginRight: '0.5rem' }} />
                                    Voir les utilisateurs
                                </button>
                            </div>
                        </div>
                    );
                })}
                </div>

                {/* Pagination */}
                {roles.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={roles.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(newItemsPerPage) => {
                            setItemsPerPage(newItemsPerPage);
                            setCurrentPage(1);
                        }}
                        itemsPerPageOptions={[6, 9, 12, 18]}
                    />
                )}
            </div>

            {/* Empty State */}
            {roles.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Shield size={48} style={{ margin: '0 auto', color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        Aucun rôle trouvé
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Commencez par créer votre premier rôle
                    </p>
                    <button onClick={() => setShowModal(true)} className="btn-primary">
                        <Plus size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
                        Créer un Rôle
                    </button>
                </div>
            )}

            {/* Create Role Modal */}
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
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Créer un Rôle</h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setNewRole('');
                                }}
                                style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateRole} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                    Nom du Rôle
                                </label>
                                <input
                                    type="text"
                                    value={newRole}
                                    onChange={handleRoleChange}
                                    className="input-field"
                                    style={{
                                        borderColor: roleError ? '#ef4444' : 'var(--border-color)'
                                    }}
                                    placeholder="Ex: Moderator, Manager..."
                                />
                                {roleError ? (
                                    <div style={{
                                        marginTop: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: '#ef4444',
                                        fontSize: '0.875rem'
                                    }}>
                                        <AlertCircle size={14} />
                                        <span>{roleError}</span>
                                    </div>
                                ) : (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                        Le nom du rôle doit être unique et sans espaces
                                    </p>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                                    Créer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setNewRole('');
                                        setRoleError('');
                                    }}
                                    className="btn-secondary"
                                    style={{ flex: 1 }}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Users in Role Modal */}
            {showUsersModal && (
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
                        maxWidth: '48rem',
                        width: '100%',
                        padding: '1.5rem',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                Utilisateurs avec le rôle "{selectedRole}"
                            </h2>
                            <button
                                onClick={() => {
                                    setShowUsersModal(false);
                                    setSelectedRole(null);
                                }}
                                style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {usersInSelectedRole.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {usersInSelectedRole.map((user) => (
                                    <div
                                        key={user.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '1rem',
                                            backgroundColor: 'var(--bg-tertiary)',
                                            borderRadius: '0.5rem',
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
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
                                                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                                    {user.userName}
                                                </p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</p>
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '0.125rem 0.625rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            backgroundColor: user.emailConfirmed ? '#d1fae5' : 'var(--bg-tertiary)',
                                            color: user.emailConfirmed ? '#065f46' : 'var(--text-primary)'
                                        }}>
                                            {user.emailConfirmed ? 'Actif' : 'Inactif'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <Users size={48} style={{ margin: '0 auto', color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    Aucun utilisateur avec ce rôle
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Roles;