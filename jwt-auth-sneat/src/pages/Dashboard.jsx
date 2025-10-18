import { useState, useEffect } from 'react';
import { Users, Shield, UserCheck, TrendingUp } from 'lucide-react';
import { usersAPI, rolesAPI } from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRoles: 0,
        activeUsers: 0,
        growth: 12.5,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [usersResponse, rolesResponse] = await Promise.all([
                usersAPI.getAll(),
                rolesAPI.getAll(),
            ]);

            // Gérer si les rôles sont des objets ou des strings
            const rolesCount = Array.isArray(rolesResponse.data)
                ? rolesResponse.data.length
                : 0;

            setStats({
                totalUsers: usersResponse.data.length,
                totalRoles: rolesCount,
                activeUsers: usersResponse.data.filter(u => u.emailConfirmed).length,
                growth: 12.5,
            });
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, title, value, color, trend }) => (
        <div className="card" style={{ transition: 'all 0.2s', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>{title}</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{value}</h3>
                    {trend && (
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', color: '#10b981' }}>
                            <TrendingUp size={16} style={{ marginRight: '0.25rem' }} />
                            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>+{trend}%</span>
                            <span style={{ color: '#6b7280', fontSize: '0.75rem', marginLeft: '0.25rem' }}>ce mois</span>
                        </div>
                    )}
                </div>
                <div style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    backgroundColor: color,
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon size={28} style={{ color: 'white' }} />
                </div>
            </div>
        </div>
    );

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
            <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                    Dashboard
                </h1>
                <p style={{ color: '#6b7280' }}>Aperçu de votre système</p>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem'
            }}>
                <StatCard
                    icon={Users}
                    title="Total Utilisateurs"
                    value={stats.totalUsers}
                    color="var(--color-primary-600)"
                    trend={stats.growth}
                />
                <StatCard
                    icon={Shield}
                    title="Total Rôles"
                    value={stats.totalRoles}
                    color="#10b981"
                />
                <StatCard
                    icon={UserCheck}
                    title="Utilisateurs Actifs"
                    value={stats.activeUsers}
                    color="#3b82f6"
                />
                <StatCard
                    icon={TrendingUp}
                    title="Croissance"
                    value={`${stats.growth}%`}
                    color="#f59e0b"
                />
            </div>

            {/* Charts Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem'
            }}>
                {/* Activity Chart */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>
                            Activité Récente
                        </h2>
                        <select className="input-field" style={{ width: 'auto', fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}>
                            <option>Cette semaine</option>
                            <option>Ce mois</option>
                            <option>Cette année</option>
                        </select>
                    </div>
                    <div style={{
                        height: '16rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.5rem'
                    }}>
                        <p style={{ color: '#6b7280' }}>Graphique d'activité</p>
                    </div>
                </div>

                {/* Users Distribution */}
                <div className="card">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>
                            Distribution des Rôles
                        </h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { label: 'Admin', value: 25, color: 'var(--color-primary-600)' },
                            { label: 'User', value: 60, color: '#3b82f6' },
                            { label: 'Moderator', value: 15, color: '#10b981' }
                        ].map((role, idx) => (
                            <div key={idx}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                    <span style={{ color: '#6b7280' }}>{role.label}</span>
                                    <span style={{ fontWeight: 500, color: '#111827' }}>{role.value}%</span>
                                </div>
                                <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '0.5rem' }}>
                                    <div style={{
                                        backgroundColor: role.color,
                                        height: '0.5rem',
                                        borderRadius: '9999px',
                                        width: `${role.value}%`,
                                        transition: 'width 0.3s'
                                    }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;