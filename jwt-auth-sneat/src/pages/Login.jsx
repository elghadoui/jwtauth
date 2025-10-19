import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const toast = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        rememberMe: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login({
            username: formData.username,
            password: formData.password,
        });

        if (result.success) {
            toast.success('Connexion réussie ! Bienvenue.');
            navigate('/dashboard');
        } else {
            setError(result.message);
            toast.error(result.message || 'Échec de la connexion');
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div style={{ width: '100%', maxWidth: '28rem' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '3rem',
                        height: '3rem',
                        backgroundColor: 'var(--color-primary-600)',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem'
                    }}>
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>S</span>
                    </div>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem'
                    }}>
                        Bienvenue sur Sneat! 👋
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Veuillez vous connecter à votre compte
                    </p>
                </div>

                {/* Card */}
                <div className="card">
                    {error && (
                        <div style={{
                            marginBottom: '1rem',
                            padding: '1rem',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'flex-start'
                        }}>
                            <AlertCircle style={{ color: '#ef4444', marginRight: '0.5rem', flexShrink: 0 }} size={18} />
                            <span style={{ fontSize: '0.875rem', color: '#b91c1c' }}>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Username */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: 'var(--text-primary)',
                                marginBottom: '0.5rem'
                            }}>
                                Nom d'utilisateur
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Entrez votre nom d'utilisateur"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem'
                            }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: 'var(--text-primary)'
                                }}>
                                    Mot de passe
                                </label>
                                <Link
                                    to="/forgot-password"
                                    style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--color-primary-600)',
                                        textDecoration: 'none'
                                    }}
                                >
                                    Mot de passe oublié?
                                </Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input-field"
                                    style={{ paddingRight: '2.5rem' }}
                                    placeholder="Entrez votre mot de passe"
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

                        {/* Remember Me */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                style={{
                                    width: '1rem',
                                    height: '1rem',
                                    accentColor: 'var(--color-primary-600)',
                                    cursor: 'pointer'
                                }}
                            />
                            <label style={{
                                marginLeft: '0.5rem',
                                fontSize: '0.875rem',
                                color: 'var(--text-primary)',
                                cursor: 'pointer'
                            }}>
                                Se souvenir de moi
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`btn-primary ${loading ? 'btn-loading' : ''}`}
                            style={{ width: '100%' }}
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Nouveau sur notre plateforme? </span>
                        <Link
                            to="/register"
                            style={{
                                color: 'var(--color-primary-600)',
                                fontWeight: 500,
                                textDecoration: 'none'
                            }}
                        >
                            Créer un compte
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <p style={{
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    marginTop: '1.5rem'
                }}>
                    © 2024 Sneat. Tous droits réservés.
                </p>
            </div>
        </div>
    );
};

export default Login;