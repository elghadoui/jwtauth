import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { exportAPI, getErrorMessage } from '../services/api';
import ExportStatsCards from '../components/Export/ExportStatsCards';
import { Ship, Globe, Package, Building, Eye, Calendar } from 'lucide-react';

const ExportDashboard = () => {
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [statsByCountry, setStatsByCountry] = useState([]);
    const [statsByProduct, setStatsByProduct] = useState([]);
    const [statsByNavire, setStatsByNavire] = useState([]);
    const [statsByStation, setStatsByStation] = useState([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const isSuperUser = user?.roles?.includes('super-user') || user?.roles?.includes('Super-User');

    useEffect(() => {
        if (!isSuperUser) {
            toast.error('Accès refusé. Cette page est réservée aux super-users.');
            navigate('/');
            return;
        }
        loadData();

        // Auto-refresh toutes les 5 minutes
        let intervalId;
        if (autoRefresh) {
            intervalId = setInterval(() => {
                loadData(false);
            }, 300000); // 5 minutes
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isSuperUser, autoRefresh]);

    const loadData = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);

            const [globalStats, countryStats, productStats, navireStats, stationStats] = await Promise.all([
                exportAPI.getGlobalStats(),
                exportAPI.getStatsByCountry(10),
                exportAPI.getStatsByProduct(10),
                exportAPI.getStatsByNavire(),
                exportAPI.getStatsByStation(),
            ]);

            setStats(globalStats.data);
            setStatsByCountry(countryStats.data);
            setStatsByProduct(productStats.data);
            setStatsByNavire(navireStats.data);
            setStatsByStation(stationStats.data);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return num.toLocaleString('fr-FR');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    };

    const getMaxValue = (data, key) => {
        if (!data || data.length === 0) return 1;
        return Math.max(...data.map(item => item[key] || 0));
    };

    const renderStatBar = (item, maxValue, valueKey, labelKey) => {
        const percentage = maxValue > 0 ? (item[valueKey] / maxValue) * 100 : 0;
        return (
            <div key={item[labelKey]} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item[labelKey] || 'N/A'}</span>
                    <span className="text-sm font-semibold text-gray-900">{formatNumber(item[valueKey])}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    if (!isSuperUser) return null;

    return (
        <div className="p-6">
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord Export</h1>
                    <p className="text-gray-600">Vue d'ensemble des dossiers d'exportation</p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        Auto-refresh (5min)
                    </label>
                    <button
                        onClick={() => navigate('/exports/list')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Eye className="w-5 h-5" />
                        Voir la liste
                    </button>
                </div>
            </div>

            {/* Cartes de statistiques */}
            <ExportStatsCards stats={stats} loading={loading} />

            {/* Graphiques et statistiques détaillées */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top pays */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Top 10 Pays de Destination</h2>
                    </div>
                    {loading ? (
                        <div className="animate-pulse space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-8 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    ) : statsByCountry.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
                    ) : (
                        <div>
                            {statsByCountry.map((country) =>
                                renderStatBar(country, getMaxValue(statsByCountry, 'totalPoids'), 'totalPoids', 'nompay')
                            )}
                        </div>
                    )}
                </div>

                {/* Top produits */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="w-5 h-5 text-green-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Top 10 Produits Exportés</h2>
                    </div>
                    {loading ? (
                        <div className="animate-pulse space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-8 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    ) : statsByProduct.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
                    ) : (
                        <div>
                            {statsByProduct.map((product) =>
                                renderStatBar(product, getMaxValue(statsByProduct, 'totalPoids'), 'totalPoids', 'produit')
                            )}
                        </div>
                    )}
                </div>

                {/* Navires */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Ship className="w-5 h-5 text-cyan-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Navires Récents</h2>
                    </div>
                    {loading ? (
                        <div className="animate-pulse space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-12 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    ) : statsByNavire.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
                    ) : (
                        <div className="space-y-3">
                            {statsByNavire.slice(0, 8).map((navire, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{navire.navire}</p>
                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Dernier départ: {formatDate(navire.lastDeparture)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-blue-600">{formatNumber(navire.totalDossiers)}</p>
                                        <p className="text-xs text-gray-500">dossiers</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stations */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Building className="w-5 h-5 text-purple-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Performance des Stations</h2>
                    </div>
                    {loading ? (
                        <div className="animate-pulse space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-8 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    ) : statsByStation.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
                    ) : (
                        <div>
                            {statsByStation.map((station) =>
                                renderStatBar(station, getMaxValue(statsByStation, 'totalPoids'), 'totalPoids', 'station')
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExportDashboard;
