import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { receptionsAPI, getErrorMessage } from '../services/api';
import { Package, TrendingUp, Layers, AlertCircle, Filter, Inbox, FileDown, Printer, FileSpreadsheet } from 'lucide-react';
import Pagination from '../components/Pagination';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Receptions = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [receptions, setReceptions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Fonction pour formater les nombres avec des espaces entre les milliers
    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return num.toLocaleString('fr-FR');
    };

    // Fonction pour calculer le temps écoulé
    const getTimeAgo = (date) => {
        if (!date) return '-';

        const now = new Date();
        const updateDate = new Date(date);
        const diffInSeconds = Math.floor((now - updateDate) / 1000);

        if (diffInSeconds < 60) {
            return `il y a ${diffInSeconds}s`;
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `il y a ${diffInMinutes} min`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `il y a ${diffInHours}h`;
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `il y a ${diffInDays}j`;
        }

        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) {
            return `il y a ${diffInWeeks} sem`;
        }

        const diffInMonths = Math.floor(diffInDays / 30);
        return `il y a ${diffInMonths} mois`;
    };

    // Filtres (multi-select)
    const [searchTerm, setSearchTerm] = useState('');
    const [filterVariete, setFilterVariete] = useState([]);
    const [filterVerger, setFilterVerger] = useState([]);
    const [filterStation, setFilterStation] = useState([]);

    // Vérifier si l'utilisateur est super-user
    const isSuperUser = user?.roles?.includes('super-user') || user?.roles?.includes('Super-User');

    useEffect(() => {
        if (!isSuperUser) {
            toast.error('Accès refusé. Cette page est réservée aux super-users.');
            return;
        }
        loadData();

        // Rafraîchissement automatique toutes les 3 minutes (180000 ms)
        const intervalId = setInterval(() => {
            loadData(false); // false = pas de spinner de chargement
        }, 180000);

        // Nettoyage de l'intervalle lors du démontage du composant
        return () => clearInterval(intervalId);
    }, [isSuperUser]);

    const loadData = async (showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }

            const [receptionsRes, statsRes] = await Promise.all([
                receptionsAPI.getAll(),
                receptionsAPI.getStats(),
            ]);

            setReceptions(receptionsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Erreur lors du chargement des réceptions:', error);
            // Afficher l'erreur seulement si ce n'est pas un rafraîchissement automatique
            if (showLoading) {
                toast.error(getErrorMessage(error));
            }
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
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
    const uniqueVarietes = [...new Set(receptions.map(r => r.nomvar).filter(Boolean))].sort()
        .map(v => ({ value: v, label: v }));

    // Concaténer refver et nomver pour créer une option unique
    const uniqueVergers = [...new Set(receptions.map(r => {
        if (r.refver && r.nomver) {
            return `${r.refver} - ${r.nomver}`;
        } else if (r.refver) {
            return r.refver.toString();
        } else if (r.nomver) {
            return r.nomver;
        }
        return null;
    }).filter(Boolean))].sort()
        .map(v => ({ value: v, label: v }));

    const uniqueStations = [...new Set(receptions.map(r => r.station).filter(Boolean))].sort()
        .map(s => ({ value: s, label: s }));

    // Filtrer les données
    const filteredReceptions = receptions.filter(reception => {
        const matchSearch = searchTerm === '' ||
            (reception.producteur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             reception.nomver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             reception.nomvar?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchVariete = filterVariete.length === 0 ||
            filterVariete.some(v => v.value === reception.nomvar);

        // Vérifier si la réception correspond à un des vergers sélectionnés (refver - nomver)
        const receptionVerger = reception.refver && reception.nomver
            ? `${reception.refver} - ${reception.nomver}`
            : reception.refver?.toString() || reception.nomver || '';
        const matchVerger = filterVerger.length === 0 ||
            filterVerger.some(v => v.value === receptionVerger);

        const matchStation = filterStation.length === 0 ||
            filterStation.some(s => s.value === reception.station);

        return matchSearch && matchVariete && matchVerger && matchStation;
    });

    // Calculer les totaux pour les données filtrées
    const totals = filteredReceptions.reduce((acc, reception) => ({
        pdrecjr: acc.pdrecjr + (reception.pdrecjr || 0),
        pdrectotal: acc.pdrectotal + (reception.pdrectotal || 0),
        pdcond: acc.pdcond + (reception.pdcond || 0),
        stockstat: acc.stockstat + (reception.stockstat || 0),
        estima: acc.estima + (reception.estima || 0),
        soldverg: acc.soldverg + (reception.soldverg || 0),
    }), {
        pdrecjr: 0,
        pdrectotal: 0,
        pdcond: 0,
        stockstat: 0,
        estima: 0,
        soldverg: 0,
    });

    // Grouper par variété
    const groupedByVariete = receptions.reduce((acc, reception) => {
        const variete = reception.nomvar || 'Non spécifié';
        if (!acc[variete]) {
            acc[variete] = {
                variete,
                count: 0,
                pdrecjr: 0,
                pdrectotal: 0,
                pdcond: 0,
                stockstat: 0,
                estima: 0,
                soldverg: 0,
            };
        }
        acc[variete].count += 1;
        acc[variete].pdrecjr += reception.pdrecjr || 0;
        acc[variete].pdrectotal += reception.pdrectotal || 0;
        acc[variete].pdcond += reception.pdcond || 0;
        acc[variete].stockstat += reception.stockstat || 0;
        acc[variete].estima += reception.estima || 0;
        acc[variete].soldverg += reception.soldverg || 0;
        return acc;
    }, {});

    const varieteGroups = Object.values(groupedByVariete).sort((a, b) =>
        b.pdrectotal - a.pdrectotal
    );

    // Pagination
    const totalPages = Math.ceil(filteredReceptions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedReceptions = filteredReceptions.slice(startIndex, endIndex);

    // Réinitialiser la page lors du changement de filtre
    const handleFilterChange = (setter) => (value) => {
        setter(value);
        setCurrentPage(1);
    };

    // Fonction d'export Excel
    const exportToExcel = () => {
        try {
            // Préparer les données pour l'export
            const dataToExport = filteredReceptions.map(reception => ({
                'Variété': reception.nomvar || 'Non spécifié',
                'Producteur': reception.producteur || '-',
                'Verger': reception.refver && reception.nomver ? `${reception.refver} - ${reception.nomver}` : reception.refver?.toString() || reception.nomver || '-',
                'Pd Reç Jour (T)': (reception.pdrecjr / 1000).toFixed(2),
                'Pd Reç Total (T)': (reception.pdrectotal / 1000).toFixed(2),
                'Pd Condi (T)': (reception.pdcond / 1000).toFixed(2),
                'Taux Condi (%)': reception.pdcond && reception.pdrectotal && reception.pdrectotal > 0 ? ((reception.pdcond / reception.pdrectotal) * 100).toFixed(1) : '-',
                'Stock Station (T)': (reception.stockstat / 1000).toFixed(2),
                'Estimation (T)': (reception.estima / 1000).toFixed(2),
                'Solde Verger (T)': (reception.soldverg / 1000).toFixed(2),
                'Station': reception.station || 'zaouia',
                'Dernière MAJ': reception.dtupdate ? new Date(reception.dtupdate).toLocaleString('fr-FR') : '-'
            }));

            // Créer la feuille Excel
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Réceptions');

            // Générer le fichier
            const fileName = `receptions_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);

            toast.success(`Export Excel réussi ! ${filteredReceptions.length} réception(s) exportée(s).`);
        } catch (error) {
            console.error('Erreur lors de l\'export Excel:', error);
            toast.error('Erreur lors de l\'export Excel');
        }
    };

    // Fonction d'export PDF
    const exportToPDF = () => {
        try {
            const doc = new jsPDF('l', 'mm', 'a4'); // Orientation paysage

            // Titre
            doc.setFontSize(16);
            doc.text('Tableau de Bord - Réceptions', 14, 15);

            // Date et informations
            doc.setFontSize(10);
            doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 22);
            doc.text(`Exporté par: ${user?.username || user?.email || 'Utilisateur'}`, 14, 27);
            doc.text(`${filteredReceptions.length} réception(s)`, 14, 32);

            // Préparer les données pour le tableau
            const tableData = filteredReceptions.map(reception => [
                reception.nomvar || 'Non spécifié',
                reception.producteur || '-',
                reception.refver && reception.nomver ? `${reception.refver} - ${reception.nomver}` : reception.refver?.toString() || reception.nomver || '-',
                (reception.pdrecjr / 1000).toFixed(2) + 'T',
                (reception.pdrectotal / 1000).toFixed(2) + 'T',
                (reception.pdcond / 1000).toFixed(2) + 'T',
                (reception.stockstat / 1000).toFixed(2) + 'T',
                (reception.estima / 1000).toFixed(2) + 'T',
                (reception.soldverg / 1000).toFixed(2) + 'T',
                reception.station || 'zaouia'
            ]);

            // Ajouter le tableau avec autoTable
            autoTable(doc, {
                head: [['Variété', 'Producteur', 'Verger', 'Pd Reç Jour', 'Pd Reç Total', 'Pd Condi', 'Stock Station', 'Estimation', 'Solde Verger', 'Station']],
                body: tableData,
                startY: 37,
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [99, 102, 241], textColor: 255 },
                columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 25 },
                    2: { cellWidth: 35 },
                    3: { cellWidth: 20, halign: 'right' },
                    4: { cellWidth: 20, halign: 'right' },
                    5: { cellWidth: 20, halign: 'right' },
                    6: { cellWidth: 22, halign: 'right' },
                    7: { cellWidth: 20, halign: 'right' },
                    8: { cellWidth: 22, halign: 'right' },
                    9: { cellWidth: 18 }
                }
            });

            // Sauvegarder le PDF
            const fileName = `receptions_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            toast.success(`Export PDF réussi ! ${filteredReceptions.length} réception(s) exportée(s).`);
        } catch (error) {
            console.error('Erreur lors de l\'export PDF:', error);
            toast.error('Erreur lors de l\'export PDF');
        }
    };

    // Fonction d'impression
    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        Tableau de Bord - Réceptions
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Suivi des réceptions par verger et variété
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={handlePrint}
                        className="btn-secondary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Printer size={18} />
                        <span>Imprimer</span>
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="btn-secondary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <FileSpreadsheet size={18} />
                        <span>Excel</span>
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="btn-secondary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <FileDown size={18} />
                        <span>PDF</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    Nombre de Vergers
                                </p>
                                <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                    {uniqueVergers.length}
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
                                <Inbox size={24} style={{ color: '#7c3aed' }} />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    Nombre de Variétés
                                </p>
                                <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                    {uniqueVarietes.length}
                                </p>
                            </div>
                            <div style={{
                                width: '3rem',
                                height: '3rem',
                                backgroundColor: '#fef3c7',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <TrendingUp size={24} style={{ color: '#f59e0b' }} />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    Total Réceptionné
                                </p>
                                <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                    {formatNumber((stats.totalCumultg / 1000)?.toFixed(2))} T
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
                                <Package size={24} style={{ color: '#3b82f6' }} />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    Stock Station Total
                                </p>
                                <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                    {formatNumber((stats.totalStockstat / 1000)?.toFixed(2))} T
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
                                <Layers size={24} style={{ color: '#059669' }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tableau groupé par variété avec graphique */}
            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.5rem' }}>
                {/* Graphique à barres */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                        Poids Total par Variété
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {varieteGroups.map((group, index) => {
                            const totalGlobal = varieteGroups.reduce((sum, g) => sum + g.pdrectotal, 0);
                            const percentage = totalGlobal > 0 ? (group.pdrectotal / totalGlobal) * 100 : 0;

                            // Palette de couleurs
                            const colors = [
                                '#6366f1', // Indigo
                                '#3b82f6', // Blue
                                '#10b981', // Green
                                '#f59e0b', // Amber
                                '#ef4444', // Red
                                '#8b5cf6', // Violet
                                '#ec4899', // Pink
                                '#14b8a6', // Teal
                            ];
                            const color = colors[index % colors.length];

                            return (
                                <div key={group.variete} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                            {group.variete}
                                        </span>
                                        <span style={{ fontWeight: 600, color: color }}>
                                            {(group.pdrectotal / 1000).toFixed(2)}T
                                        </span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '24px',
                                        backgroundColor: 'var(--bg-tertiary)',
                                        borderRadius: '0.375rem',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            width: `${percentage}%`,
                                            height: '100%',
                                            backgroundColor: color,
                                            borderRadius: '0.375rem',
                                            transition: 'width 0.5s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            paddingRight: '0.5rem'
                                        }}>
                                            {percentage > 15 && (
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    color: 'white'
                                                }}>
                                                    {percentage.toFixed(0)}%
                                                </span>
                                            )}
                                        </div>
                                        {percentage <= 15 && percentage > 0 && (
                                            <span style={{
                                                position: 'absolute',
                                                right: '0.5rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                color: 'var(--text-secondary)'
                                            }}>
                                                {percentage.toFixed(0)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tableau récapitulatif */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            Récapitulatif par Variété
                        </h2>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Variété</th>
                                <th style={{ textAlign: 'center', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Nb Vergers</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Pd Reç Jour</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Pd Reç Total</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Pd Condi</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Stock Station</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Estimation</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Solde Verger</th>
                            </tr>
                        </thead>
                        <tbody>
                            {varieteGroups.map((group) => (
                                <tr key={group.variete} style={{ borderBottom: '1px solid var(--border-color)' }}>
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
                                            {group.variete}
                                        </span>
                                    </td>
                                    {/* Nombre de vergers */}
                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {group.count}
                                    </td>
                                    {/* Pd Reç Jour */}
                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                                        {(group.pdrecjr / 1000).toFixed(2)}T
                                    </td>
                                    {/* Pd Reç Total */}
                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#3b82f6' }}>
                                        {(group.pdrectotal / 1000).toFixed(2)}T
                                    </td>
                                    {/* Pd Condi */}
                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>
                                                {(group.pdcond / 1000).toFixed(2)}T
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                                {group.pdcond && group.pdrectotal && group.pdrectotal > 0
                                                    ? `${((group.pdcond / group.pdrectotal) * 100).toFixed(1)}%`
                                                    : '-'}
                                            </span>
                                        </div>
                                    </td>
                                    {/* Stock Station */}
                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#059669' }}>
                                        {(group.stockstat / 1000).toFixed(2)}T
                                    </td>
                                    {/* Estimation */}
                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                                        {(group.estima / 1000).toFixed(2)}T
                                    </td>
                                    {/* Solde Verger */}
                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#ea580c' }}>
                                        {(group.soldverg / 1000).toFixed(2)}T
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            </div>

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
                                {filteredReceptions.length} résultat{filteredReceptions.length > 1 ? 's' : ''} trouvé{filteredReceptions.length > 1 ? 's' : ''}
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

            {/* Receptions Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Variété</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Producteur</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Verger</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Pd Reç Jour</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Pd Reç Total</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Pd Condi</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Stock Station</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Estimation</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Solde Verger</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Station</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Dernière MAJ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedReceptions.map((reception) => (
                                <tr key={reception.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
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
                                            {reception.nomvar || 'Non spécifié'}
                                        </span>
                                    </td>
                                    {/* Producteur */}
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                            {reception.producteur || '-'}
                                        </p>
                                    </td>
                                    {/* Verger (Réf - Nom) */}
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                                        {reception.refver && reception.nomver
                                            ? `${reception.refver} - ${reception.nomver}`
                                            : reception.refver?.toString() || reception.nomver || '-'}
                                    </td>
                                    {/* Poids Reçu Jour */}
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                                        {reception.pdrecjr ? `${(reception.pdrecjr / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Poids Reçu Total */}
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#3b82f6', textAlign: 'right' }}>
                                        {reception.pdrectotal ? `${(reception.pdrectotal / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Poids Conditionné */}
                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>
                                                {reception.pdcond ? `${(reception.pdcond / 1000).toFixed(2)}T` : '0T'}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                                {reception.pdcond && reception.pdrectotal && reception.pdrectotal > 0
                                                    ? `${((reception.pdcond / reception.pdrectotal) * 100).toFixed(1)}%`
                                                    : '-'}
                                            </span>
                                        </div>
                                    </td>
                                    {/* Stock Station */}
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#059669', textAlign: 'right' }}>
                                        {reception.stockstat ? `${(reception.stockstat / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Estimation */}
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                                        {reception.estima ? `${(reception.estima / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Solde Verger */}
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#ea580c', textAlign: 'right' }}>
                                        {reception.soldverg ? `${(reception.soldverg / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Station */}
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                                        {reception.station || 'zaouia'}
                                    </td>
                                    {/* Dernière Mise à Jour */}
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                                        {getTimeAgo(reception.dtupdate)}
                                    </td>
                                </tr>
                            ))}

                            {/* Ligne de Total */}
                            {filteredReceptions.length > 0 && (
                                <tr style={{
                                    borderTop: '2px solid var(--border-color)',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    fontWeight: 'bold'
                                }}>
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }} colSpan="3">
                                        TOTAL ({filteredReceptions.length} entrée{filteredReceptions.length > 1 ? 's' : ''})
                                    </td>
                                    {/* Poids Reçu Jour */}
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>
                                        {totals.pdrecjr ? `${(totals.pdrecjr / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Poids Reçu Total */}
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#3b82f6', textAlign: 'right' }}>
                                        {totals.pdrectotal ? `${(totals.pdrectotal / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Poids Conditionné */}
                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {totals.pdcond ? `${(totals.pdcond / 1000).toFixed(2)}T` : '0T'}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                                                {totals.pdcond && totals.pdrectotal && totals.pdrectotal > 0
                                                    ? `${((totals.pdcond / totals.pdrectotal) * 100).toFixed(1)}%`
                                                    : '-'}
                                            </span>
                                        </div>
                                    </td>
                                    {/* Stock Station */}
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#059669', textAlign: 'right' }}>
                                        {totals.stockstat ? `${(totals.stockstat / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Estimation */}
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>
                                        {totals.estima ? `${(totals.estima / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Solde Verger */}
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#ea580c', textAlign: 'right' }}>
                                        {totals.soldverg ? `${(totals.soldverg / 1000).toFixed(2)}T` : '0T'}
                                    </td>
                                    {/* Station + MAJ */}
                                    <td style={{ padding: '0.75rem 1rem' }} colSpan="2"></td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {receptions.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <Inbox size={48} style={{ margin: '0 auto', color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
                            <p style={{ color: 'var(--text-secondary)' }}>Aucune réception enregistrée</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {filteredReceptions.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredReceptions.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(newItemsPerPage) => {
                            setItemsPerPage(newItemsPerPage);
                            setCurrentPage(1);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default Receptions;
