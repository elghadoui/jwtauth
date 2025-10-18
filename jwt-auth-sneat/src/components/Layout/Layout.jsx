import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import {
    LayoutDashboard,
    Users,
    Shield,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    ChevronDown,
    Moon,
    Sun,
} from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileDropdown, setProfileDropdown] = useState(false);

    // Responsive hooks
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const isTablet = useMediaQuery('(min-width: 768px)');

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/users', icon: Users, label: 'Utilisateurs' },
        { path: '/roles', icon: Shield, label: 'Rôles' },
        { path: '/settings', icon: Settings, label: 'Paramètres' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            <aside
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '16rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRight: '1px solid var(--border-color)',
                    transform: sidebarOpen ? 'translateX(0)' : isDesktop ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.3s ease-in-out',
                    zIndex: 50,
                }}
            >
                {/* Logo */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '4rem',
                    padding: '0 1.5rem',
                    borderBottom: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            width: '2rem',
                            height: '2rem',
                            backgroundColor: 'var(--color-primary-600)',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.125rem' }}>S</span>
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>Sneat</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        style={{
                            color: '#6b7280',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: isDesktop ? 'none' : 'block'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav style={{ padding: '1rem' }}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.5rem',
                                marginBottom: '0.25rem',
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                                backgroundColor: isActive(item.path) ? '#f5f3ff' : 'transparent',
                                color: isActive(item.path) ? 'var(--color-primary-600)' : '#374151',
                                fontWeight: 500
                            }}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                marginLeft: '16rem'
            }}
                className="lg:ml-64 ml-0">
                {/* Header */}
                <header style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border-color)',
                    height: '4rem'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        height: '100%',
                        padding: '0 1.5rem'
                    }}>
                        {/* Left Section */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                style={{
                                    color: '#6b7280',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    display: isDesktop ? 'none' : 'block'
                                }}
                            >
                                <Menu size={24} />
                            </button>

                            {/* Search Bar */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: '#f9fafb',
                                borderRadius: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                width: '16rem'
                            }}
                                className="hidden md:flex">
                                <Search size={18} style={{ color: '#9ca3af' }} />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        marginLeft: '0.5rem',
                                        width: '100%',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Right Section */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                style={{
                                    color: 'var(--text-secondary)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '0.5rem',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title={isDark ? 'Mode clair' : 'Mode sombre'}
                            >
                                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            {/* Notifications */}
                            <button style={{
                                position: 'relative',
                                color: '#6b7280',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.5rem'
                            }}>
                                <Bell size={20} />
                                <span style={{
                                    position: 'absolute',
                                    top: '0',
                                    right: '0',
                                    width: '1rem',
                                    height: '1rem',
                                    backgroundColor: '#ef4444',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    3
                                </span>
                            </button>

                            {/* Profile Dropdown */}
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setProfileDropdown(!profileDropdown)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '0.5rem',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <div style={{
                                        width: '2rem',
                                        height: '2rem',
                                        backgroundColor: 'var(--color-primary-600)',
                                        borderRadius: '9999px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <span style={{ color: 'white', fontWeight: 500, fontSize: '0.875rem' }}>
                                            {user?.username?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: 'left', display: isTablet ? 'block' : 'none' }}>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                                            {user?.username}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                            {user?.roles?.[0] || 'User'}
                                        </p>
                                    </div>
                                    <ChevronDown size={16} style={{ color: '#9ca3af' }} />
                                </button>

                                {/* Dropdown Menu */}
                                {profileDropdown && (
                                    <div style={{
                                        position: 'absolute',
                                        right: 0,
                                        marginTop: '0.5rem',
                                        width: '12rem',
                                        backgroundColor: 'white',
                                        borderRadius: '0.5rem',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        padding: '0.5rem 0',
                                        zIndex: 50,
                                        border: '1px solid #e5e7eb'
                                    }}>
                                        <div style={{
                                            padding: '0.5rem 1rem',
                                            borderBottom: '1px solid #f3f4f6'
                                        }}>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>
                                                {user?.username}
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{user?.email}</p>
                                        </div>
                                        <Link
                                            to="/profile"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.875rem',
                                                color: '#374151',
                                                textDecoration: 'none',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onClick={() => setProfileDropdown(false)}
                                        >
                                            <Settings size={16} style={{ marginRight: '0.5rem' }} />
                                            Mon Profil
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                width: '100%',
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.875rem',
                                                color: '#dc2626',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'background-color 0.2s'
                                            }}
                                        >
                                            <LogOut size={16} style={{ marginRight: '0.5rem' }} />
                                            Déconnexion
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.5rem'
                }}>
                    <Outlet />
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && !isDesktop && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 40
                    }}
                />
            )}
        </div>
    );
};

export default Layout;