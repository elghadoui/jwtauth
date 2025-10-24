import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { stockAPI, getErrorMessage } from '../services/api';
import { Package, RefreshCw, Plus, Edit, Trash2, TrendingUp, Layers, X, AlertCircle, Filter } from 'lucide-react';
import Pagination from '../components/Pagination';
import Select from 'react-select';

const Stock = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [stocks, setStocks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingStock, setEditingStock] = useState(null);
    const [apiUrl, setApiUrl] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Filtres (multi-select)
    const [searchTerm, setSearchTerm] = useState('');
    const [filterVariete, setFilterVariete] = useState([]);
    const [filterVerger, setFilterVerger] = useState([]); // Concaténation refver + nomver
    const [filterStation, setFilterStation] = useState([]);

    const [formData, setFormData] = useState({
        refver: null,
        refverreel: null,
        nomprod: '',
        nomver: '',
        poidini: null,
        pdjr: null,
        cumultg: null,
        conditionnement: null,
        stockstat: null,
        estimat: null,
        soldverge: null,
        codvar: null,
        nomvar: '',
        user: '',
        station: 'COOPERATIVE ZAOUIA',
        activ: 'Station de Conditionnement',
        camp: '24-25',
    });

    // Vérifier si l'utilisateur est super-user
    const isSuperUser = user?.roles?.includes('super-user') || user?.roles?.includes('Super-User');

    useEffect(() => {
        if (!isSuperUser) {
            toast.error('Accès refusé. Cette page est réservée aux super-users.');
            return;
        }
        loadData();
    }, [isSuperUser]);

    const loadData = async () => {
        try {
            const [stocksRes, statsRes] = await Promise.all([
                stockAPI.getAll(),
                stockAPI.getStats(),
            ]);

            setStocks(stocksRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Erreur lors du chargement du stock:', error);
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        if (!apiUrl.trim()) {
            toast.error('Veuillez entrer une URL d\'API valide');
            return;
        }

        setSyncing(true);
        try {
            const response = await stockAPI.sync(apiUrl);
            toast.success(response.data.message || 'Synchronisation réussie');
            setShowSyncModal(false);
            setApiUrl('');
            await loadData();
        } catch (error) {
            console.error('Erreur lors de la synchronisation:', error);
            toast.error(getErrorMessage(error));
        } finally {
            setSyncing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingStock) {
                await stockAPI.update(editingStock.id, formData);
                toast.success('Stock mis à jour avec succès');
            } else {
                await stockAPI.create(formData);
                toast.success('Stock créé avec succès');
            }

            loadData();
            closeModal();
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
            toast.error(getErrorMessage(error));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            return;
        }

        try {
            await stockAPI.delete(id);
            toast.success('Stock supprimé avec succès');
            loadData();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            toast.error(getErrorMessage(error));
        }
    };

    const openModal = (stock = null) => {
        if (stock) {
            setEditingStock(stock);
            setFormData({
                refver: stock.refver,
                refverreel: stock.refverreel,
                nomprod: stock.nomprod,
                nomver: stock.nomver,
                poidini: stock.poidini,
                pdjr: stock.pdjr,
                cumultg: stock.cumultg,
                conditionnement: stock.conditionnement,
                stockstat: stock.stockstat,
                estimat: stock.estimat,
                soldverge: stock.soldverge,
                codvar: stock.codvar,
                nomvar: stock.nomvar || '',
                user: stock.user || '',
                station: stock.station || 'ZAOUIA',
                activ: stock.activ || 'Station de Conditionnement',
                camp: stock.camp || '24-25',
            });
        } else {
            setEditingStock(null);
            setFormData({
                refver: null,
                refverreel: null,
                nomprod: '',
                nomver: '',
                poidini: null,
                pdjr: null,
                cumultg: null,
                conditionnement: null,
                stockstat: null,
                estimat: null,
                soldverge: null,
                codvar: null,
                nomvar: '',
                user: '',
                station: 'COOPERATIVE ZAOUIA',
                activ: 'Station de Conditionnement',
                camp: '24-25',
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingStock(null);
    };

    // Si pas super-user, afficher message d'accès refusé
    if (!isSuperUser) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '50vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <AlertCircle size={64} style={{ color: '#ef4444' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    Accès Refusé
                </h2>
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
                    Cette page est réservée aux utilisateurs avec le rôle <strong>super-user</strong>.
                </p>
            </div>
        );
    }

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

    // Extraire les options uniques pour les filtres
    const uniqueVarietes = [...new Set(stocks.map(s => s.nomvar).filter(Boolean))].sort()
        .map(v => ({ value: v, label: v }));

    // Concaténer refver et nomver pour créer une option unique
    const uniqueVergers = [...new Set(stocks.map(s => {
        if (s.refver && s.nomver) {
            return `${s.refver} - ${s.nomver}`;
        } else if (s.refver) {
            return s.refver.toString();
        } else if (s.nomver) {
            return s.nomver;
        }
        return null;
    }).filter(Boolean))].sort()
        .map(v => ({ value: v, label: v }));

    const uniqueStations = [...new Set(stocks.map(s => s.station).filter(Boolean))].sort()
        .map(s => ({ value: s, label: s }));

    // Filtrer les données
    const filteredStocks = stocks.filter(stock => {
        const matchSearch = searchTerm === '' ||
            (stock.nomprod?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             stock.nomver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             stock.nomvar?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchVariete = filterVariete.length === 0 ||
            filterVariete.some(v => v.value === stock.nomvar);

        // Vérifier si le stock correspond à un des vergers sélectionnés (refver - nomver)
        const stockVerger = stock.refver && stock.nomver
            ? `${stock.refver} - ${stock.nomver}`
            : stock.refver?.toString() || stock.nomver || '';
        const matchVerger = filterVerger.length === 0 ||
            filterVerger.some(v => v.value === stockVerger);

        const matchStation = filterStation.length === 0 ||
            filterStation.some(s => s.value === stock.station);

        return matchSearch && matchVariete && matchVerger && matchStation;
    });

    // Calculer les totaux pour les données filtrées
    const totals = filteredStocks.reduce((acc, stock) => ({
        poidini: acc.poidini + (stock.poidini || 0),
        pdjr: acc.pdjr + (stock.pdjr || 0),
        cumultg: acc.cumultg + (stock.cumultg || 0),
        conditionnement: acc.conditionnement + (stock.conditionnement || 0),
        stockstat: acc.stockstat + (stock.stockstat || 0),
        estimat: acc.estimat + (stock.estimat || 0),
        soldverge: acc.soldverge + (stock.soldverge || 0),
    }), {
        poidini: 0,
        pdjr: 0,
        cumultg: 0,
        conditionnement: 0,
        stockstat: 0,
        estimat: 0,
        soldverge: 0,
    });

    // Pagination
    const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedStocks = filteredStocks.slice(startIndex, endIndex);

    // Réinitialiser la page lors du changement de filtre
    const handleFilterChange = (setter) => (value) => {
        setter(value);
        setCurrentPage(1);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        Gestion du Stock - Coopérative Zaouia
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Campagne {stats?.camp || '24-25'} - Station de Conditionnement
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => setShowSyncModal(true)} className="btn-secondary">
                        <RefreshCw size={18} style={{ marginRight: '0.5rem' }} />
                        Synchroniser API
                    </button>
                    <button onClick={() => openModal()} className="btn-primary">
                        <Plus size={18} style={{ marginRight: '0.5rem' }} />
                        Ajouter Article
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    Total Articles
                                </p>
                                <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                    {stats.totalItems}
                                </p>
                            </div>
                            <div style={{
                                width: '3rem',
                                height: '3rem',
                                backgroundColor: '#ede9fe',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Package size={24} style={{ color: '#7c3aed' }} />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    Poids Initial Total
                                </p>
                                <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                    {stats.totalPoidini?.toFixed(2)} kg
                                </p>
                            </div>
                            <div style={{
                                width: '3rem',
                                height: '3rem',
                                backgroundColor: '#dbeafe',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Layers size={24} style={{ color: '#3b82f6' }} />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    Stock Statique Total
                                </p>
                                <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                    {stats.totalStockstat?.toFixed(2)} kg
                                </p>
                            </div>
                            <div style={{
                                width: '3rem',
                                height: '3rem',
                                backgroundColor: '#d1fae5',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <TrendingUp size={24} style={{ color: '#059669' }} />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    Cumul Total Général
                                </p>
                                <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                    {stats.totalCumultg?.toFixed(2)} kg
                                </p>
                            </div>
                            <div style={{
                                width: '3rem',
                                height: '3rem',
                                backgroundColor: '#fed7aa',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Package size={24} style={{ color: '#ea580c' }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtres et Recherche */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Barre de recherche */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={20} style={{ color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Rechercher par producteur, verger ou variété..."
                            value={searchTerm}
                            onChange={(e) => handleFilterChange(setSearchTerm)(e.target.value)}
                            className="input-field"
                            style={{ flex: 1 }}
                        />
                    </div>

                    {/* Filtres par combo */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        {/* Filtre Variété */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Variété
                            </label>
                            <Select
                                isMulti
                                value={filterVariete}
                                onChange={(selected) => handleFilterChange(setFilterVariete)(selected || [])}
                                options={uniqueVarietes}
                                placeholder="Toutes les variétés"
                                className="react-select-container"
                                classNamePrefix="react-select"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        backgroundColor: 'var(--bg-primary)',
                                        borderColor: 'var(--border-color)',
                                        minHeight: '38px',
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        backgroundColor: 'var(--bg-secondary)',
                                        zIndex: 100,
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        backgroundColor: state.isFocused ? 'var(--bg-tertiary)' : 'transparent',
                                        color: 'var(--text-primary)',
                                    }),
                                    multiValue: (base) => ({
                                        ...base,
                                        backgroundColor: 'var(--color-primary-100)',
                                    }),
                                    multiValueLabel: (base) => ({
                                        ...base,
                                        color: 'var(--color-primary-700)',
                                    }),
                                }}
                            />
                        </div>

                        {/* Filtre Verger (Réf + Nom) */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Verger (Réf - Nom)
                            </label>
                            <Select
                                isMulti
                                value={filterVerger}
                                onChange={(selected) => handleFilterChange(setFilterVerger)(selected || [])}
                                options={uniqueVergers}
                                placeholder="Tous les vergers"
                                className="react-select-container"
                                classNamePrefix="react-select"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        backgroundColor: 'var(--bg-primary)',
                                        borderColor: 'var(--border-color)',
                                        minHeight: '38px',
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        backgroundColor: 'var(--bg-secondary)',
                                        zIndex: 100,
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        backgroundColor: state.isFocused ? 'var(--bg-tertiary)' : 'transparent',
                                        color: 'var(--text-primary)',
                                    }),
                                    multiValue: (base) => ({
                                        ...base,
                                        backgroundColor: 'var(--color-primary-100)',
                                    }),
                                    multiValueLabel: (base) => ({
                                        ...base,
                                        color: 'var(--color-primary-700)',
                                    }),
                                }}
                            />
                        </div>

                        {/* Filtre Station */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Station
                            </label>
                            <Select
                                isMulti
                                value={filterStation}
                                onChange={(selected) => handleFilterChange(setFilterStation)(selected || [])}
                                options={uniqueStations}
                                placeholder="Toutes les stations"
                                className="react-select-container"
                                classNamePrefix="react-select"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        backgroundColor: 'var(--bg-primary)',
                                        borderColor: 'var(--border-color)',
                                        minHeight: '38px',
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        backgroundColor: 'var(--bg-secondary)',
                                        zIndex: 100,
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        backgroundColor: state.isFocused ? 'var(--bg-tertiary)' : 'transparent',
                                        color: 'var(--text-primary)',
                                    }),
                                    multiValue: (base) => ({
                                        ...base,
                                        backgroundColor: 'var(--color-primary-100)',
                                    }),
                                    multiValueLabel: (base) => ({
                                        ...base,
                                        color: 'var(--color-primary-700)',
                                    }),
                                }}
                            />
                        </div>
                    </div>

                    {/* Résumé des filtres actifs */}
                    {(searchTerm || filterVariete.length > 0 || filterVerger.length > 0 || filterStation.length > 0) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {filteredStocks.length} résultat{filteredStocks.length > 1 ? 's' : ''} trouvé{filteredStocks.length > 1 ? 's' : ''}
                            </span>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterVariete([]);
                                    setFilterVerger([]);
                                    setFilterStation([]);
                                    setCurrentPage(1);
                                }}
                                style={{
                                    padding: '0.25rem 0.75rem',
                                    fontSize: '0.75rem',
                                    color: 'var(--color-primary-600)',
                                    backgroundColor: 'transparent',
                                    border: '1px solid var(--color-primary-600)',
                                    borderRadius: '0.25rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Réinitialiser les filtres
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Stock Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 300, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Variété</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Producteur</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Verger</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Poid Ini</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Poid Jr</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>T.Reception</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>T.Condi</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>T.Station</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Estimation</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>S.Verger</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Station</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>MAJ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedStocks.map((stock) => (
                                <tr key={stock.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    {/* Variété */}
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            backgroundColor: '#f3e8ff',
                                            color: '#7c3aed'
                                        }}>
                                            {stock.nomvar || 'Non spécifié'}
                                        </span>
                                    </td>
                                    {/* Producteur */}
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                            {stock.nomprod || '-'}
                                        </p>
                                    </td>
                                    {/* Verger (Réf - Nom) */}
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                                        {stock.refver && stock.nomver
                                            ? `${stock.refver} - ${stock.nomver}`
                                            : stock.refver?.toString() || stock.nomver || '-'}
                                    </td>
                                    {/* Poid Ini */}
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right' }}>
                                        {stock.poidini ? `${(stock.poidini / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Poid Jr */}
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                                        {stock.pdjr ? `${(stock.pdjr / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Total Reception (cumultg) */}
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#3b82f6', textAlign: 'right' }}>
                                        {stock.cumultg ? `${(stock.cumultg / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Conditionnement */}
                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>
                                                {stock.conditionnement ? `${(stock.conditionnement / 1000).toFixed(2)}T` : '0T'}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                                {stock.conditionnement && stock.cumultg && stock.cumultg > 0
                                                    ? `${((stock.conditionnement / stock.cumultg) * 100).toFixed(1)}%`
                                                    : '-'}
                                            </span>
                                        </div>
                                    </td>
                                    {/* Sold Station (stockstat) */}
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#059669', textAlign: 'right' }}>
                                        {stock.stockstat ? `${(stock.stockstat / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Estimation Verger */}
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                                        {stock.estimat ? `${(stock.estimat / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Sold Verger */}
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#ea580c', textAlign: 'right' }}>
                                        {stock.soldverge ? `${(stock.soldverge / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Station */}
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                                        {stock.station || 'COOPERATIVE ZAOUIA'}
                                    </td>
                                    {/* Heurs Mise à Jour */}
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                                        {stock.dteupdate ? new Date(stock.dteupdate).toLocaleString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : '-'}
                                    </td>
                                </tr>
                            ))}

                            {/* Ligne de Total */}
                            {filteredStocks.length > 0 && (
                                <tr style={{
                                    borderTop: '2px solid var(--border-color)',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    fontWeight: 'bold'
                                }}>
                                    {/* Variété */}
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }} colSpan="3">
                                        TOTAL ({filteredStocks.length} entrée{filteredStocks.length > 1 ? 's' : ''})
                                    </td>
                                    {/* Poid Ini */}
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>
                                        {totals.poidini ? `${(totals.poidini / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Poid Jr */}
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>
                                        {totals.pdjr ? `${(totals.pdjr / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Total Reception */}
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#3b82f6', textAlign: 'right' }}>
                                        {totals.cumultg ? `${(totals.cumultg / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Conditionnement */}
                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {totals.conditionnement ? `${(totals.conditionnement / 1000).toFixed(2)}T` : '0T'}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                                                {totals.conditionnement && totals.cumultg && totals.cumultg > 0
                                                    ? `${((totals.conditionnement / totals.cumultg) * 100).toFixed(1)}%`
                                                    : '-'}
                                            </span>
                                        </div>
                                    </td>
                                    {/* Sold Station */}
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#059669', textAlign: 'right' }}>
                                        {totals.stockstat ? `${(totals.stockstat / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Estimation Verger */}
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>
                                        {totals.estimat ? `${(totals.estimat / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Sold Verger */}
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#ea580c', textAlign: 'right' }}>
                                        {totals.soldverge ? `${(totals.soldverge / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Station */}
                                    <td style={{ padding: '0.75rem 1rem' }} colSpan="2"></td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {stocks.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <Package size={48} style={{ margin: '0 auto', color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
                            <p style={{ color: 'var(--text-secondary)' }}>Aucun article en stock</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {filteredStocks.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredStocks.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(newItemsPerPage) => {
                            setItemsPerPage(newItemsPerPage);
                            setCurrentPage(1);
                        }}
                    />
                )}
            </div>

            {/* Sync Modal */}
            {showSyncModal && (
                <div className="modal-backdrop" onClick={() => setShowSyncModal(false)} style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '0.5rem',
                        maxWidth: '28rem',
                        width: '100%',
                        padding: '1.5rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                Synchroniser depuis l'API
                            </h2>
                            <button onClick={() => setShowSyncModal(false)} style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                URL de l'API
                            </label>
                            <input
                                type="url"
                                value={apiUrl}
                                onChange={(e) => setApiUrl(e.target.value)}
                                className="input-field"
                                placeholder="https://api.example.com/stock"
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                L'API doit retourner un tableau JSON avec les champs correspondants à la structure stock
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={handleSync}
                                disabled={syncing}
                                className="btn-primary"
                                style={{ flex: 1 }}
                            >
                                {syncing ? 'Synchronisation...' : 'Synchroniser'}
                            </button>
                            <button
                                onClick={() => setShowSyncModal(false)}
                                className="btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-backdrop" onClick={closeModal} style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    overflowY: 'auto'
                }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '0.5rem',
                        maxWidth: '48rem',
                        width: '100%',
                        padding: '1.5rem',
                        margin: '2rem',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                {editingStock ? 'Modifier l\'article' : 'Nouvel article'}
                            </h2>
                            <button onClick={closeModal} style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Row 1 */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        Réf Verger
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.refver || ''}
                                        onChange={(e) => setFormData({ ...formData, refver: e.target.value ? parseInt(e.target.value) : null })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        Réf Verger Réel
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.refverreel || ''}
                                        onChange={(e) => setFormData({ ...formData, refverreel: e.target.value ? parseInt(e.target.value) : null })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        Code Variété
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.codvar || ''}
                                        onChange={(e) => setFormData({ ...formData, codvar: e.target.value ? parseInt(e.target.value) : null })}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        Nom Produit *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nomprod}
                                        onChange={(e) => setFormData({ ...formData, nomprod: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        Nom Verger
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nomver}
                                        onChange={(e) => setFormData({ ...formData, nomver: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Row 3 - Variété */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                    Nom Variété
                                </label>
                                <input
                                    type="text"
                                    value={formData.nomvar}
                                    onChange={(e) => setFormData({ ...formData, nomvar: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            {/* Row 4 - Poids */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        Poids Initial (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.poidini || ''}
                                        onChange={(e) => setFormData({ ...formData, poidini: e.target.value ? parseFloat(e.target.value) : null })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        Poids/Jour (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.pdjr || ''}
                                        onChange={(e) => setFormData({ ...formData, pdjr: e.target.value ? parseFloat(e.target.value) : null })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        Cumul Total (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.cumultg || ''}
                                        onChange={(e) => setFormData({ ...formData, cumultg: e.target.value ? parseFloat(e.target.value) : null })}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Row 5 - Conditionnement et Stock */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        Conditionnement (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.conditionnement || ''}
                                        onChange={(e) => setFormData({ ...formData, conditionnement: e.target.value ? parseFloat(e.target.value) : null })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        Stock Station (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.stockstat || ''}
                                        onChange={(e) => setFormData({ ...formData, stockstat: e.target.value ? parseFloat(e.target.value) : null })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        Estimation Verger (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.estimat || ''}
                                        onChange={(e) => setFormData({ ...formData, estimat: e.target.value ? parseFloat(e.target.value) : null })}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Row 6 - Solde Verger */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        Solde Verger (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.soldverge || ''}
                                        onChange={(e) => setFormData({ ...formData, soldverge: e.target.value ? parseFloat(e.target.value) : null })}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Row 6 - Station info */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        Station
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.station}
                                        onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        Activité
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.activ}
                                        onChange={(e) => setFormData({ ...formData, activ: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Row 7 */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        Campagne
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.camp}
                                        onChange={(e) => setFormData({ ...formData, camp: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                        Utilisateur
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.user}
                                        onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                                    {editingStock ? 'Modifier' : 'Créer'}
                                </button>
                                <button type="button" onClick={closeModal} className="btn-secondary" style={{ flex: 1 }}>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stock;
