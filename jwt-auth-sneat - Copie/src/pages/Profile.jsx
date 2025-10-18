import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import { User, Mail, Shield, Calendar, Eye, EyeOff, Save, X } from 'lucide-react';

const Profile = () => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [changePassword, setChangePassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        loadUserDetails();
    }, []);

    const loadUserDetails = async () => {
        try {
            // Charger les détails complets de l'utilisateur
            const response = await usersAPI.getAll();
            const currentUser = response.data.find(u => u.userName === user.username);
            if (currentUser) {
                setUserDetails(currentUser);
                setFormData({
                    firstName: currentUser.firstName || '',
                    lastName: currentUser.lastName || '',
                    email: currentUser.email || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
            }
        } catch (error) {
            console.error('Erreur lors du chargement du profil:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation du mot de passe si on veut le changer
            if (changePassword) {
                if (!formData.newPassword) {
                    alert('Veuillez entrer un nouveau mot de passe');
                    setLoading(false);
                    return;
                }
                if (formData.newPassword !== formData.confirmPassword) {
                    alert('Les nouveaux mots de passe ne correspondent pas');
                    setLoading(false);
                    return;
                }
                if (formData.newPassword.length < 6) {
                    alert('Le mot de passe doit contenir au moins 6 caractères');
                    setLoading(false);
                    return;
                }
            }

            const dataToSend = {
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                emailConfirmed: userDetails.emailConfirmed,
            };

            if (changePassword && formData.newPassword) {
                dataToSend.password = formData.newPassword;
            }

            await usersAPI.update(userDetails.id, dataToSend);

            alert('Profil mis à jour avec succès !');
            setEditMode(false);
            setChangePassword(false);
            setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
            await loadUserDetails();
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            alert('Erreur lors de la mise à jour du profil');
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setEditMode(false);
        setChangePassword(false);
        if (userDetails) {
            setFormData({
                firstName: userDetails.firstName || '',
                lastName: userDetails.lastName || '',
                email: userDetails.email || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        }
    };

    if (!userDetails) {
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '64rem', margin: '0 auto' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Mon Profil
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Gérez vos informations personnelles</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Profile Card */}
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '7rem',
                        height: '7rem',
                        backgroundColor: 'var(--color-primary-600)',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: 'white'
                    }}>
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        {userDetails.firstName && userDetails.lastName
                            ? `${userDetails.firstName} ${userDetails.lastName}`
                            : user?.username
                        }
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                        @{user?.username}
                    </p>

                    {/* Roles Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                        {userDetails.roles?.map((role) => (
                            <span
                                key={role}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    backgroundColor: '#ede9fe',
                                    color: '#7c3aed'
                                }}
                            >
                                {role}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Info Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '3rem',
                                height: '3rem',
                                backgroundColor: '#dbeafe',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Mail size={20} style={{ color: '#1e40af' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email</p>
                                <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{userDetails.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '3rem',
                                height: '3rem',
                                backgroundColor: '#f0fdf4',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Shield size={20} style={{ color: '#15803d' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Statut</p>
                                <p style={{ fontWeight: 500, color: userDetails.emailConfirmed ? '#15803d' : '#dc2626' }}>
                                    {userDetails.emailConfirmed ? 'Compte Actif' : 'Compte Inactif'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Informations Personnelles
                    </h3>
                    {!editMode && (
                        <button
                            onClick={() => setEditMode(true)}
                            className="btn-primary"
                        >
                            Modifier
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                                disabled={!editMode}
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
                                disabled={!editMode}
                            />
                        </div>
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
                            disabled={!editMode}
                            required
                        />
                    </div>

                    {editMode && (
                        <div style={{
                            padding: '1rem',
                            backgroundColor: 'var(--bg-primary)',
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
                                            setFormData({ ...formData, newPassword: '', confirmPassword: '' });
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
                                    Changer mon mot de passe
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
                                                type={showNewPassword ? 'text' : 'password'}
                                                value={formData.newPassword}
                                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                                className="input-field"
                                                style={{ paddingRight: '2.5rem' }}
                                                placeholder="Minimum 6 caractères"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '0.75rem',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: 'var(--text-secondary)',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '0.25rem'
                                                }}
                                            >
                                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                                                    color: 'var(--text-secondary)',
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

                    {editMode && (
                        <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                                style={{ flex: 1 }}
                            >
                                {loading ? 'Enregistrement...' : (
                                    <>
                                        <Save size={18} style={{ marginRight: '0.5rem' }} />
                                        Enregistrer
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="btn-secondary"
                                style={{ flex: 1 }}
                            >
                                <X size={18} style={{ marginRight: '0.5rem' }} />
                                Annuler
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Profile;