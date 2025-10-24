import { useState, useEffect } from 'react';
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
    ChevronRight,
    Moon,
    Sun,
    ChevronsLeft,
    ChevronsRight,
    Package,
    Inbox,
    FileText,
} from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileDropdown, setProfileDropdown] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    // Responsive hooks
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const isTablet = useMediaQuery('(min-width: 768px)');

    // Charger l'état de la sidebar depuis localStorage
    useEffect(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        if (saved !== null) {
            setIsSidebarCollapsed(JSON.parse(saved));
        }
    }, []);

    // Toggle sidebar collapse (desktop only)
    const toggleSidebarCollapse = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    };

    const menuItems = [
        {
            path: '/dashboard',
            icon: LayoutDashboard,
            label: 'Dashboard'
        },
        {
            id: 'gestion-reception',
            icon: Inbox,
            label: 'Gestion Réception',
            isSection: true,
            children: [
                { path: '/receptions', icon: Inbox, label: 'Réceptions', role: 'super-user' },
                { path: '/stock', icon: Package, label: 'Stock', role: 'super-user' },
            ]
        },
        {
            id: 'user-management',
            icon: Users,
            label: 'Gestion Utilisateur',
            isSection: true,
            children: [
                { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard Utilisateur' },
                { path: '/users', icon: Users, label: 'Utilisateurs' },
                { path: '/roles', icon: Shield, label: 'Rôles' },
            ]
        },
        {
            id: 'export',
            icon: FileText,
            label: 'Export',
            isSection: true,
            children: []
        },
        {
            path: '/settings',
            icon: Settings,
            label: 'Paramètres'
        },
    ];

    // Toggle section expand/collapse
    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    // Calculer la largeur de la sidebar
    const sidebarWidth = isDesktop
        ? (isSidebarCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)')
        : '16rem';

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-primary)' }}>
            {/* Sidebar */}
            <aside
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: sidebarWidth,
                    backgroundColor: 'var(--bg-secondary)',
                    borderRight: '1px solid var(--border-color)',
                    transform: sidebarOpen ? 'translateX(0)' : isDesktop ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'width var(--sidebar-transition), transform 0.3s ease-in-out',
                    zIndex: 50,
                    overflow: 'hidden',
                }}
            >
                {/* Logo */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isDesktop && isSidebarCollapsed ? 'center' : 'space-between',
                    height: '4rem',
                    padding: isDesktop && isSidebarCollapsed ? '0 1rem' : '0 1.5rem',
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'padding var(--sidebar-transition)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: '2rem',
                            height: '2rem',
                            backgroundColor: 'var(--color-primary-600)',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.125rem' }}>S</span>
                        </div>
                        <span style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: 'var(--text-primary)',
                            opacity: isDesktop && isSidebarCollapsed ? 0 : 1,
                            transition: 'opacity var(--sidebar-transition)',
                            whiteSpace: 'nowrap'
                        }}>
                            Sneat
                        </span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        style={{
                            color: 'var(--text-secondary)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: isDesktop ? 'none' : 'block',
                            flexShrink: 0
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Toggle Button (Desktop only) */}
                {isDesktop && (
                    <div style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border-color)'
                    }}>
                        <button
                            onClick={toggleSidebarCollapse}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                                gap: '0.75rem',
                                padding: '0.5rem 0.75rem',
                                backgroundColor: 'var(--bg-tertiary)',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                e.currentTarget.style.borderColor = 'var(--border-color-hover)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                            }}
                        >
                            {isSidebarCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
                            <span style={{
                                opacity: isSidebarCollapsed ? 0 : 1,
                                width: isSidebarCollapsed ? 0 : 'auto',
                                overflow: 'hidden',
                                transition: 'opacity var(--sidebar-transition), width var(--sidebar-transition)',
                                whiteSpace: 'nowrap'
                            }}>
                                Réduire
                            </span>
                        </button>
                    </div>
                )}

                {/* Navigation */}
                <nav style={{ padding: '1rem' }}>
                    {menuItems.map((item) => {
                        // Si c'est une section avec des enfants
                        if (item.isSection) {
                            const isExpanded = expandedSections[item.id];
                            return (
                                <div key={item.id} style={{ marginBottom: '0.5rem' }}>
                                    {/* Section Header */}
                                    <button
                                        onClick={() => toggleSection(item.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            gap: '0.75rem',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '0.5rem',
                                            marginBottom: '0.25rem',
                                            textDecoration: 'none',
                                            transition: 'all 0.2s',
                                            backgroundColor: 'transparent',
                                            color: 'var(--text-primary)',
                                            fontWeight: 600,
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <item.icon size={20} style={{ flexShrink: 0 }} />
                                            <span style={{
                                                opacity: isDesktop && isSidebarCollapsed ? 0 : 1,
                                                width: isDesktop && isSidebarCollapsed ? 0 : 'auto',
                                                overflow: 'hidden',
                                                transition: 'opacity var(--sidebar-transition), width var(--sidebar-transition)',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {item.label}
                                            </span>
                                        </div>
                                        {!isSidebarCollapsed && (
                                            <ChevronRight
                                                size={16}
                                                style={{
                                                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                                    transition: 'transform 0.2s'
                                                }}
                                            />
                                        )}
                                    </button>

                                    {/* Section Children */}
                                    {isExpanded && !isSidebarCollapsed && (
                                        <div style={{ paddingLeft: '1rem' }}>
                                            {item.children.map((child) => {
                                                // Vérifier le rôle si nécessaire
                                                if (child.role && !user?.roles?.includes(child.role) && !user?.roles?.includes('Super-User')) {
                                                    return null;
                                                }
                                                return (
                                                    <Link
                                                        key={child.path}
                                                        to={child.path}
                                                        onClick={() => setSidebarOpen(false)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.75rem',
                                                            padding: '0.5rem 1rem',
                                                            borderRadius: '0.5rem',
                                                            marginBottom: '0.25rem',
                                                            textDecoration: 'none',
                                                            transition: 'all 0.2s',
                                                            backgroundColor: isActive(child.path) ? 'var(--bg-hover)' : 'transparent',
                                                            color: isActive(child.path) ? 'var(--color-primary-600)' : 'var(--text-secondary)',
                                                            fontWeight: isActive(child.path) ? 600 : 400,
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        <child.icon size={18} style={{ flexShrink: 0 }} />
                                                        <span style={{ whiteSpace: 'nowrap' }}>
                                                            {child.label}
                                                        </span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // Sinon, c'est un item simple
                        return (
                            <div
                                key={item.path}
                                style={{ position: 'relative' }}
                                onMouseEnter={() => setHoveredItem(item.path)}
                                onMouseLeave={() => setHoveredItem(null)}
                            >
                                <Link
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: isDesktop && isSidebarCollapsed ? 'center' : 'flex-start',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.5rem',
                                        marginBottom: '0.25rem',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s',
                                        backgroundColor: isActive(item.path) ? 'var(--bg-hover)' : 'transparent',
                                        color: isActive(item.path) ? 'var(--color-primary-600)' : 'var(--text-primary)',
                                        fontWeight: 500,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <item.icon size={20} style={{ flexShrink: 0 }} />
                                    <span style={{
                                        opacity: isDesktop && isSidebarCollapsed ? 0 : 1,
                                        width: isDesktop && isSidebarCollapsed ? 0 : 'auto',
                                        overflow: 'hidden',
                                        transition: 'opacity var(--sidebar-transition), width var(--sidebar-transition)',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {item.label}
                                    </span>
                                </Link>
                                {/* Tooltip */}
                                {isDesktop && isSidebarCollapsed && hoveredItem === item.path && (
                                    <div className="tooltip" style={{ opacity: 1 }}>
                                        {item.label}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                marginLeft: isDesktop
                    ? (isSidebarCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)')
                    : 0,
                transition: 'margin-left var(--sidebar-transition)'
            }}>
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
                                    color: 'var(--text-secondary)',
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
                                backgroundColor: 'var(--bg-tertiary)',
                                borderRadius: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                width: '16rem'
                            }}
                                className="hidden md:flex">
                                <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        marginLeft: '0.5rem',
                                        width: '100%',
                                        fontSize: '0.875rem',
                                        color: 'var(--text-primary)'
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
                                color: 'var(--text-secondary)',
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
                                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                            {user?.username}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {user?.roles?.[0] || 'User'}
                                        </p>
                                    </div>
                                    <ChevronDown size={16} style={{ color: 'var(--text-tertiary)' }} />
                                </button>

                                {/* Dropdown Menu */}
                                {profileDropdown && (
                                    <div style={{
                                        position: 'absolute',
                                        right: 0,
                                        marginTop: '0.5rem',
                                        width: '12rem',
                                        backgroundColor: 'var(--bg-secondary)',
                                        borderRadius: '0.5rem',
                                        boxShadow: 'var(--shadow-lg)',
                                        padding: '0.5rem 0',
                                        zIndex: 50,
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <div style={{
                                            padding: '0.5rem 1rem',
                                            borderBottom: '1px solid var(--border-color)'
                                        }}>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                                {user?.username}
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.email}</p>
                                        </div>
                                        <Link
                                            to="/profile"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.875rem',
                                                color: 'var(--text-primary)',
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