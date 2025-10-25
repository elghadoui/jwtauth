import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { exportAPI, getErrorMessage } from '../services/api';
import ExportStatsCards from '../components/Export/ExportStatsCards';
import { TimelineChart, CountryPieChart, ProductBarChart, StationBarChart } from '../components/Export/ExportCharts';
import PeriodFilter from '../components/Export/PeriodFilter';
import { Ship, Globe, Package, Building, Eye, TrendingUp, RefreshCw, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ExportDashboardImproved = () => {
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [timelineData, setTimelineData] = useState([]);
    const [statsByCountry, setStatsByCountry] = useState([]);
    const [statsByProduct, setStatsByProduct] = useState([]);
    const [statsByNavire, setStatsByNavire] = useState([]);
    const [statsByStation, setStatsByStation] = useState([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('all');
    const [dateFilters, setDateFilters] = useState({ dateFrom: null, dateTo: null });
    const [timelinePeriod, setTimelinePeriod] = useState('month');

    const isSuperUser = user?.roles?.includes('super-user') || user?.roles?.includes('Super-User');

    useEffect(() => {
        if (!isSuperUser) {
            toast.error('Accès refusé. Cette page est réservée aux super-users.');
            navigate('/');
            return;
        }
        loadData();

        let intervalId;
        if (autoRefresh) {
            intervalId = setInterval(() => {
                loadData(false);
            }, 300000); // 5 minutes
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isSuperUser, autoRefresh, dateFilters, timelinePeriod]);

    const loadData = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);

            const filters = {
                dateFrom: dateFilters.dateFrom,
                dateTo: dateFilters.dateTo
            };

            const [globalStats, timeline, countryStats, productStats, navireStats, stationStats] = await Promise.all([
                exportAPI.getGlobalStats(filters),
                exportAPI.getTimelineStats(timelinePeriod, filters),
                exportAPI.getStatsByCountry(10, filters),
                exportAPI.getStatsByProduct(10, filters),
                exportAPI.getStatsByNavire(filters),
                exportAPI.getStatsByStation(filters),
            ]);

            setStats(globalStats.data);
            setTimelineData(timeline.data);
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

    const handlePeriodChange = (periodId, range) => {
        setSelectedPeriod(periodId);
        setDateFilters(range);
    };

    const handleRefresh = () => {
        toast.info('Actualisation des données...');
        loadData();
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        // Titre
        doc.setFontSize(20);
        doc.text('Rapport Export - Tableau de Bord', 14, 20);

        // Date du rapport
        doc.setFontSize(10);
        doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 14, 28);

        // Statistiques globales
        doc.setFontSize(14);
        doc.text('Statistiques Globales', 14, 40);

        const statsData = [
            ['Total Dossiers', stats?.totalDossiers?.toLocaleString('fr-FR') || '0'],
            ['Total Palettes', stats?.totalPalettes?.toLocaleString('fr-FR') || '0'],
            ['Total Colis', stats?.totalColis?.toLocaleString('fr-FR') || '0'],
            ['Poids Total (kg)', stats?.totalPoids?.toLocaleString('fr-FR') || '0'],
            ['Navires', stats?.navireCount?.toLocaleString('fr-FR') || '0'],
            ['Pays Destinations', stats?.paysCount?.toLocaleString('fr-FR') || '0'],
            ['Clients', stats?.clientsCount?.toLocaleString('fr-FR') || '0'],
        ];

        autoTable(doc, {
            startY: 45,
            head: [['Indicateur', 'Valeur']],
            body: statsData,
            theme: 'grid',
        });

        // Top Pays
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Top 10 Pays de Destination', 14, 20);

        const countryData = statsByCountry.map((country, index) => [
            index + 1,
            country.nompay || country.codpay,
            country.totalDossiers?.toLocaleString('fr-FR') || '0',
            country.totalPalettes?.toLocaleString('fr-FR') || '0',
            country.totalPoids?.toLocaleString('fr-FR') || '0',
        ]);

        autoTable(doc, {
            startY: 25,
            head: [['#', 'Pays', 'Dossiers', 'Palettes', 'Poids (kg)']],
            body: countryData,
            theme: 'striped',
        });

        // Top Produits
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Top 10 Produits Exportés', 14, 20);

        const productData = statsByProduct.map((product, index) => [
            index + 1,
            product.produit || product.codvar,
            product.totalDossiers?.toLocaleString('fr-FR') || '0',
            product.totalPalettes?.toLocaleString('fr-FR') || '0',
            product.totalPoids?.toLocaleString('fr-FR') || '0',
        ]);

        autoTable(doc, {
            startY: 25,
            head: [['#', 'Produit', 'Dossiers', 'Palettes', 'Poids (kg)']],
            body: productData,
            theme: 'striped',
        });

        // Sauvegarder
        doc.save(`rapport-export-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Rapport PDF généré avec succès');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    };

    if (!isSuperUser) return null;

    return (
        <div className="p-6">
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Tableau de Bord Export</h1>
                    <p className="text-gray-600">Vue d'ensemble des dossiers d'exportation avec graphiques interactifs</p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        Auto-refresh (5min)
                    </label>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Actualiser
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        Export PDF
                    </button>
                    <button
                        onClick={() => navigate('/exports/list')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Eye className="w-5 h-5" />
                        Voir la liste
                    </button>
                </div>
            </div>

            {/* Filtres de période */}
            <PeriodFilter
                selectedPeriod={selectedPeriod}
                onPeriodChange={handlePeriodChange}
            />

            {/* Cartes de statistiques */}
            <ExportStatsCards stats={stats} loading={loading} />

            {/* Graphique d'évolution temporelle */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Évolution des Exports</h2>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTimelinePeriod('day')}
                            className={`px-3 py-1 rounded text-sm ${
                                timelinePeriod === 'day'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Jour
                        </button>
                        <button
                            onClick={() => setTimelinePeriod('week')}
                            className={`px-3 py-1 rounded text-sm ${
                                timelinePeriod === 'week'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Semaine
                        </button>
                        <button
                            onClick={() => setTimelinePeriod('month')}
                            className={`px-3 py-1 rounded text-sm ${
                                timelinePeriod === 'month'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Mois
                        </button>
                    </div>
                </div>
                <TimelineChart data={timelineData} loading={loading} />
            </div>

            {/* Graphiques en grille */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Répartition par pays (Camembert) */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Répartition par Pays</h2>
                    </div>
                    <CountryPieChart data={statsByCountry} loading={loading} />
                </div>

                {/* Top produits (Barres) */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="w-5 h-5 text-green-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Top 10 Produits</h2>
                    </div>
                    <ProductBarChart data={statsByProduct} loading={loading} />
                </div>
            </div>

            {/* Performance des stations */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Building className="w-5 h-5 text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Performance des Stations</h2>
                </div>
                <StationBarChart data={statsByStation} loading={loading} />
            </div>

            {/* Liste des navires */}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {statsByNavire.slice(0, 9).map((navire, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-100 hover:shadow-md transition-shadow">
                                <div>
                                    <p className="font-semibold text-gray-900">{navire.navire}</p>
                                    <p className="text-sm text-gray-600">
                                        Dernier départ: {formatDate(navire.lastDeparture)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-cyan-600">{navire.totalDossiers}</p>
                                    <p className="text-xs text-gray-500">dossiers</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExportDashboardImproved;
