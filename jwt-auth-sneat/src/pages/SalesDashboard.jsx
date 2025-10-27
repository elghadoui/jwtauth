import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { salesAPI, getErrorMessage } from '../services/api';
import SalesStatsCards from '../components/Sales/SalesStatsCards';
import { SalesTimelineChart, PriceTimelineChart, VarieteBarChart, SalesStationPieChart, AveragePriceChart } from '../components/Sales/SalesCharts';
import AcheteurListCard from '../components/Sales/AcheteurListCard';
import VarieteListCard from '../components/Sales/VarieteListCard';
import PeriodFilter from '../components/Export/PeriodFilter';
import Pagination from '../components/Pagination';
import { ShoppingCart, TrendingUp, RefreshCw, Download, Search, Filter, X, Calendar, Building, Package, Users, Eye, DollarSign } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Select from 'react-select';

const SalesDashboard = () => {
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [timelineData, setTimelineData] = useState([]);
    const [priceTimelineData, setPriceTimelineData] = useState([]);
    const [statsByStation, setStatsByStation] = useState([]);
    const [statsByVariete, setStatsByVariete] = useState([]);
    const [statsByAcheteur, setStatsByAcheteur] = useState([]);
    const [averagePriceData, setAveragePriceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('all');
    const [dateFilters, setDateFilters] = useState({ dateFrom: null, dateTo: null });
    const [timelinePeriod, setTimelinePeriod] = useState('week');
    const [activeTab, setActiveTab] = useState('sales'); // 'sales' ou 'price'

    // Filtre de variétés pour toute la page (filtre rapide)
    const [selectedVarietesGlobal, setSelectedVarietesGlobal] = useState([]);

    // Filtre de stations pour toute la page (filtre rapide)
    const [selectedStationsGlobal, setSelectedStationsGlobal] = useState([]);

    // États pour la liste des ventes
    const [sales, setSales] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [listFilters, setListFilters] = useState({
        dateFrom: '',
        dateTo: '',
        station: '',
        codvar: [],
        refach: '',
        codtype: '',
        sortBy: 'date_vente',
        sortOrder: 'desc',
    });

    // Liste des variétés disponibles pour le filtre
    const [varietes, setVarietes] = useState([]);
    const [loadingVarietes, setLoadingVarietes] = useState(false);

    // Liste des stations disponibles pour le filtre
    const [stations, setStations] = useState([]);
    const [loadingStations, setLoadingStations] = useState(false);

    const isSuperUser = user?.roles?.includes('super-user') || user?.roles?.includes('Super-User');

    useEffect(() => {
        if (!isSuperUser) {
            toast.error('Accès refusé. Cette page est réservée aux super-users.');
            navigate('/');
            return;
        }
        loadData();
        loadVarietes();
        loadStations();

        let intervalId;
        if (autoRefresh) {
            intervalId = setInterval(() => {
                loadData(false);
            }, 300000); // 5 minutes
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isSuperUser, autoRefresh, dateFilters, timelinePeriod, selectedVarietesGlobal, selectedStationsGlobal]);

    useEffect(() => {
        if (isSuperUser) {
            loadSalesList();
        }
    }, [currentPage, pageSize, isSuperUser, dateFilters]);

    const loadData = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);

            // Préparer les filtres avec dates, variétés et stations
            const filters = {
                dateFrom: dateFilters.dateFrom,
                dateTo: dateFilters.dateTo
            };

            // Ajouter les variétés si sélectionnées
            if (selectedVarietesGlobal.length > 0) {
                filters.codvar = selectedVarietesGlobal.map(v => v.value).join(',');
            }

            // Ajouter les stations si sélectionnées
            if (selectedStationsGlobal.length > 0) {
                filters.station = selectedStationsGlobal.map(s => s.value).join(',');
            }

            const [globalStats, timeline, priceTimeline, stationStats, varieteStats, acheteurStats, avgPriceData] = await Promise.all([
                salesAPI.getGlobalStats(filters),
                salesAPI.getTimelineStats(timelinePeriod, filters),
                salesAPI.getPriceTimelineStats(timelinePeriod, filters),
                salesAPI.getStatsByStation(filters),
                salesAPI.getStatsByVariete(5, filters),
                salesAPI.getStatsByAcheteur(5, filters),
                salesAPI.getAveragePriceByTypeAndVariete(filters),
            ]);

            setStats(globalStats.data);
            setTimelineData(timeline.data);
            setPriceTimelineData(priceTimeline.data);
            setStatsByStation(stationStats.data);
            setStatsByVariete(varieteStats.data);
            setStatsByAcheteur(acheteurStats.data);
            setAveragePriceData(avgPriceData.data);

            // Debug: Afficher les données de prix
            console.log('Prix Timeline Data:', priceTimeline.data);
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

    const loadVarietes = async () => {
        try {
            setLoadingVarietes(true);
            // Récupérer toutes les variétés avec une limite élevée
            const response = await salesAPI.getStatsByVariete(200, {});

            // Transformer les données en format pour react-select
            const varietesOptions = response.data
                .filter(item => item.codvar && item.varietes)
                .map(item => ({
                    value: item.codvar,
                    label: `${item.codvar} - ${item.varietes}`
                }));

            setVarietes(varietesOptions);
        } catch (error) {
            console.error('Erreur lors du chargement des variétés:', error);
            toast.error('Erreur lors du chargement des variétés');
        } finally {
            setLoadingVarietes(false);
        }
    };

    const loadStations = async () => {
        try {
            setLoadingStations(true);
            // Récupérer toutes les stations
            const response = await salesAPI.getStatsByStation({});

            // Transformer les données en format pour react-select
            const stationsOptions = response.data
                .filter(item => item.station)
                .map(item => ({
                    value: item.station,
                    label: item.station
                }));

            setStations(stationsOptions);
        } catch (error) {
            console.error('Erreur lors du chargement des stations:', error);
            toast.error('Erreur lors du chargement des stations');
        } finally {
            setLoadingStations(false);
        }
    };

    const handleVarietesGlobalChange = (selectedOptions) => {
        setSelectedVarietesGlobal(selectedOptions || []);
    };

    const handleStationsGlobalChange = (selectedOptions) => {
        setSelectedStationsGlobal(selectedOptions || []);
    };

    const handleRefresh = () => {
        toast.info('Actualisation des données...');
        loadData();
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text('Rapport Ventes Locales - Tableau de Bord', 14, 20);

        doc.setFontSize(10);
        doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 14, 28);

        doc.setFontSize(14);
        doc.text('Statistiques Globales', 14, 40);

        const statsData = [
            ['Total Ventes', stats?.totalVentes?.toLocaleString('fr-FR') || '0'],
            ['Poids Total (kg)', ((stats?.poidsTotalPese || 0) / 1000).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' t'],
            ['Chiffre d\'Affaires (DH)', stats?.chiffreAffaires?.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) || '0'],
            ['Montant Réglé (DH)', stats?.montantRegle?.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) || '0'],
            ['Solde Restant (DH)', stats?.soldeRestant?.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) || '0'],
            ['Nombre d\'Acheteurs', stats?.nombreAcheteurs?.toLocaleString('fr-FR') || '0'],
        ];

        autoTable(doc, {
            startY: 45,
            head: [['Indicateur', 'Valeur']],
            body: statsData,
            theme: 'grid',
        });

        doc.save(`rapport-ventes-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Rapport PDF généré avec succès');
    };

    const loadSalesList = async () => {
        try {
            setLoadingList(true);

            // Convertir le tableau de codes variété en chaîne séparée par des virgules
            const codvarString = Array.isArray(listFilters.codvar) && listFilters.codvar.length > 0
                ? listFilters.codvar.join(',')
                : '';

            const response = await salesAPI.getAll({
                ...listFilters,
                codvar: codvarString,
                dateFrom: dateFilters.dateFrom || listFilters.dateFrom,
                dateTo: dateFilters.dateTo || listFilters.dateTo,
                search: searchTerm,
                page: currentPage,
                pageSize,
            });

            setSales(response.data.data);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoadingList(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        loadSalesList();
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setListFilters({
            dateFrom: '',
            dateTo: '',
            station: '',
            codvar: [],
            refach: '',
            codtype: '',
            sortBy: 'date_vente',
            sortOrder: 'desc',
        });
        setCurrentPage(1);
        setTimeout(loadSalesList, 100);
    };

    const handleFilterChange = (key, value) => {
        setListFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSort = (column) => {
        if (listFilters.sortBy === column) {
            setListFilters(prev => ({
                ...prev,
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
            }));
        } else {
            setListFilters(prev => ({
                ...prev,
                sortBy: column,
                sortOrder: 'desc'
            }));
        }
        setCurrentPage(1);
        setTimeout(loadSalesList, 100);
    };

    const getSortIcon = (column) => {
        if (listFilters.sortBy !== column) return null;
        return listFilters.sortOrder === 'asc' ? ' ↑' : ' ↓';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    };

    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    if (!isSuperUser) return null;

    return (
        <div className="p-6">
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">📈 Tableau de Bord Ventes Locales</h1>
                    <p className="text-gray-600">Analyse des ventes avec graphiques interactifs et statistiques détaillées</p>
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
                </div>
            </div>

            {/* Filtres de période, variétés et stations */}
            <PeriodFilter
                selectedPeriod={selectedPeriod}
                onPeriodChange={handlePeriodChange}
                varietes={varietes}
                selectedVarietes={selectedVarietesGlobal}
                onVarietesChange={handleVarietesGlobalChange}
                loadingVarietes={loadingVarietes}
                stations={stations}
                selectedStations={selectedStationsGlobal}
                onStationsChange={handleStationsGlobalChange}
                loadingStations={loadingStations}
            />

            {/* Cartes de statistiques */}
            <SalesStatsCards stats={stats} loading={loading} />

            {/* Graphique d'évolution temporelle + Ventes par stations */}
            <div className="flex gap-6 mb-6">
                {/* Évolution des Ventes/Prix - 70% */}
                <div className="bg-white rounded-lg shadow-sm p-6" style={{ width: '70%' }}>
                    {/* Onglets */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setActiveTab('sales')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        activeTab === 'sales'
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <TrendingUp className="w-4 h-4" />
                                    Évolution des Ventes
                                </button>
                                <button
                                    onClick={() => setActiveTab('price')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        activeTab === 'price'
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <DollarSign className="w-4 h-4" />
                                    Évolution des Prix
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTimelinePeriod('day')}
                                className={`px-3 py-1 rounded text-sm ${
                                    timelinePeriod === 'day'
                                        ? activeTab === 'sales' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Jour
                            </button>
                            <button
                                onClick={() => setTimelinePeriod('week')}
                                className={`px-3 py-1 rounded text-sm ${
                                    timelinePeriod === 'week'
                                        ? activeTab === 'sales' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Semaine
                            </button>
                            <button
                                onClick={() => setTimelinePeriod('month')}
                                className={`px-3 py-1 rounded text-sm ${
                                    timelinePeriod === 'month'
                                        ? activeTab === 'sales' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Mois
                            </button>
                        </div>
                    </div>

                    {/* Contenu des onglets */}
                    {activeTab === 'sales' ? (
                        <SalesTimelineChart data={timelineData} loading={loading} />
                    ) : (
                        <PriceTimelineChart data={priceTimelineData} loading={loading} />
                    )}
                </div>

                {/* Ventes par Station - 30% */}
                <div className="bg-white rounded-lg shadow-sm p-6" style={{ width: '30%' }}>
                    <div className="flex items-center gap-2 mb-4">
                        <Building className="w-5 h-5 text-purple-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Ventes par Station</h2>
                    </div>
                    <SalesStationPieChart data={statsByStation} loading={loading} />
                </div>
            </div>

            {/* Top 5 Variétés, Acheteurs, Prix moyens */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Top Variétés */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="w-5 h-5 text-green-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Top 5 Variétés</h2>
                    </div>
                    <VarieteListCard data={statsByVariete} loading={loading} />
                </div>

                {/* Top Acheteurs */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Top 5 Acheteurs</h2>
                    </div>
                    <AcheteurListCard data={statsByAcheteur} loading={loading} />
                </div>

                {/* Prix moyen par variété */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Prix Moyens</h2>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">Par type et variété</div>
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                        </div>
                    ) : averagePriceData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            Aucune donnée disponible
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {averagePriceData.slice(0, 10).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-900 truncate">
                                            {item.varietes || 'Inconnu'}
                                        </p>
                                        <p className="text-xs text-gray-500">{item.typeEcart || 'Type'}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-2">
                                        <p className="text-sm font-bold text-emerald-600">
                                            {formatNumber(item.prixMoyen)} DH/kg
                                        </p>
                                        <p className="text-xs text-gray-500">{(item.poidsPese / 1000).toFixed(1)}t</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Graphiques détaillés en grille */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Top Variétés - Graphique */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="w-5 h-5 text-green-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Performance des Variétés</h2>
                    </div>
                    <VarieteBarChart data={statsByVariete} loading={loading} />
                </div>

                {/* Prix moyens - Graphique */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Prix Moyens par Type & Variété</h2>
                    </div>
                    <AveragePriceChart data={averagePriceData} loading={loading} />
                </div>
            </div>

            {/* Liste des ventes avec filtres et recherche */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            🛒 Liste des Ventes ({formatNumber(totalCount)})
                        </h2>
                        {(dateFilters.dateFrom || dateFilters.dateTo) && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-blue-700 font-medium">
                                    Filtre de période actif
                                    {dateFilters.dateFrom && dateFilters.dateTo && (
                                        <span className="ml-1 text-xs">
                                            ({new Date(dateFilters.dateFrom).toLocaleDateString('fr-FR')} - {new Date(dateFilters.dateTo).toLocaleDateString('fr-FR')})
                                        </span>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Barre de recherche */}
                    <div className="flex gap-2 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Rechercher par n° vente, acheteur, variété..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Rechercher
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                showFilters ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <Filter className="w-5 h-5" />
                            Filtres
                        </button>
                        <button
                            onClick={handleResetFilters}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            <X className="w-5 h-5" />
                            Réinitialiser
                        </button>
                    </div>

                    {/* Filtres avancés */}
                    {showFilters && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            {(dateFilters.dateFrom || dateFilters.dateTo) && (
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        <strong>Filtre de période rapide actif</strong> - Les dates sont synchronisées avec les statistiques et graphiques.
                                    </p>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        Date début
                                    </label>
                                    <input
                                        type="date"
                                        value={dateFilters.dateFrom || listFilters.dateFrom}
                                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                        disabled={!!dateFilters.dateFrom}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                                            dateFilters.dateFrom ? 'bg-blue-50 cursor-not-allowed opacity-75' : ''
                                        }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        Date fin
                                    </label>
                                    <input
                                        type="date"
                                        value={dateFilters.dateTo || listFilters.dateTo}
                                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                        disabled={!!dateFilters.dateTo}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                                            dateFilters.dateTo ? 'bg-blue-50 cursor-not-allowed opacity-75' : ''
                                        }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Building className="w-4 h-4 inline mr-1" />
                                        Station
                                    </label>
                                    <input
                                        type="text"
                                        value={listFilters.station}
                                        onChange={(e) => handleFilterChange('station', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="Station..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Package className="w-4 h-4 inline mr-1" />
                                        Variétés
                                    </label>
                                    <Select
                                        isMulti
                                        value={varietes.filter(v => listFilters.codvar.includes(v.value))}
                                        onChange={(selectedOptions) => {
                                            const selectedCodes = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
                                            handleFilterChange('codvar', selectedCodes);
                                        }}
                                        options={varietes}
                                        isLoading={loadingVarietes}
                                        placeholder="Sélectionnez une ou plusieurs variétés..."
                                        noOptionsMessage={() => "Aucune variété disponible"}
                                        loadingMessage={() => "Chargement..."}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                minHeight: '42px',
                                                borderColor: '#d1d5db',
                                                '&:hover': {
                                                    borderColor: '#9ca3af'
                                                }
                                            }),
                                            multiValue: (base) => ({
                                                ...base,
                                                backgroundColor: '#3b82f6',
                                            }),
                                            multiValueLabel: (base) => ({
                                                ...base,
                                                color: 'white',
                                            }),
                                            multiValueRemove: (base) => ({
                                                ...base,
                                                color: 'white',
                                                ':hover': {
                                                    backgroundColor: '#2563eb',
                                                    color: 'white',
                                                }
                                            })
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Users className="w-4 h-4 inline mr-1" />
                                        Acheteur
                                    </label>
                                    <input
                                        type="text"
                                        value={listFilters.refach}
                                        onChange={(e) => handleFilterChange('refach', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="Réf acheteur..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type Écart
                                    </label>
                                    <input
                                        type="text"
                                        value={listFilters.codtype}
                                        onChange={(e) => handleFilterChange('codtype', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="Type..."
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={handleSearch}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Appliquer les filtres
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tableau */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    onClick={() => handleSort('numvnt')}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                >
                                    N° Vente{getSortIcon('numvnt')}
                                </th>
                                <th
                                    onClick={() => handleSort('date_vente')}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                >
                                    Date{getSortIcon('date_vente')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acheteur
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Variété
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                                    Poids (kg)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                                    Prix/kg
                                </th>
                                <th
                                    onClick={() => handleSort('montant_vente')}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 text-right"
                                >
                                    Montant (DH){getSortIcon('montant_vente')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                                    Solde
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loadingList ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : sales.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                                        Aucune vente trouvée
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {sales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {sale.numVnt}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {formatDate(sale.dateVente)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                {sale.acheteurs || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                {sale.varietes || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                                                {formatNumber(sale.poidPese)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                                                {formatNumber(sale.prxKg)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                                {formatNumber(sale.montantVente)}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                                                (sale.soldVente || 0) > 0 ? 'text-red-600 font-semibold' : 'text-green-600'
                                            }`}>
                                                {formatNumber(sale.soldVente || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <button
                                                    onClick={() => navigate(`/sales/details/${sale.id}`)}
                                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Voir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Ligne de total */}
                                    <tr className="bg-blue-50 border-t-2 border-blue-200 font-semibold">
                                        <td colSpan="4" className="px-6 py-4 text-sm text-gray-900 text-right">
                                            TOTAL ({sales.length} ventes sur cette page)
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                            {formatNumber(sales.reduce((sum, sale) => sum + (sale.poidPese || 0), 0))}
                                        </td>
                                        <td className="px-6 py-4"></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                                            {formatNumber(sales.reduce((sum, sale) => sum + (sale.montantVente || 0), 0))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600 text-right">
                                            {formatNumber(sales.reduce((sum, sale) => sum + (sale.soldVente || 0), 0))}
                                        </td>
                                        <td className="px-6 py-4"></td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loadingList && sales.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(totalCount / pageSize)}
                        onPageChange={setCurrentPage}
                        itemsPerPage={pageSize}
                        onItemsPerPageChange={(newSize) => {
                            setPageSize(newSize);
                            setCurrentPage(1);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default SalesDashboard;
