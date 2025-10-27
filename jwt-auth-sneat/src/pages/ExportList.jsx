import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { exportAPI, getErrorMessage } from '../services/api';
import Pagination from '../components/Pagination';
import { Search, Filter, X, Eye, FileDown, Ship, Globe, Package, Calendar, Building, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ExportList = () => {
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const [exports, setExports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Filtres
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        navire: '',
        codpay: '',
        station: '',
        rsclient: '',
        codvar: '',
        refexp: '',
        exporter: '',
        sortBy: 'dtedep',
        sortOrder: 'desc',
    });

    const isSuperUser = user?.roles?.includes('super-user') || user?.roles?.includes('Super-User');

    useEffect(() => {
        if (!isSuperUser) {
            toast.error('Accès refusé. Cette page est réservée aux super-users.');
            navigate('/');
            return;
        }
        loadData();
    }, [currentPage, pageSize, isSuperUser]);

    const loadData = async () => {
        try {
            setLoading(true);

            const response = await exportAPI.getAll({
                ...filters,
                search: searchTerm,
                page: currentPage,
                pageSize,
            });

            setExports(response.data.data);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        loadData();
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setFilters({
            dateFrom: '',
            dateTo: '',
            navire: '',
            codpay: '',
            station: '',
            rsclient: '',
            codvar: '',
            refexp: '',
            exporter: '',
            sortBy: 'dtedep',
            sortOrder: 'desc',
        });
        setCurrentPage(1);
        setTimeout(loadData, 100);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    };

    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return num.toLocaleString('fr-FR');
    };

    const exportToExcel = () => {
        const data = exports.map(exp => ({
            'N° Dossier': exp.numdos,
            'N° TC': exp.numtc,
            'Navire': exp.navire,
            'Date Départ': formatDate(exp.dtedep),
            'Pays': exp.nompay,
            'Client': exp.rsclient,
            'Exportateur': exp.exporter,
            'Produit': exp.produit,
            'Variété': exp.codvar,
            'Palettes': exp.nbrpal,
            'Colis': exp.nbrcol,
            'Poids (kg)': exp.pdscom,
            'Station': exp.stations,
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Exports');

        // Auto-ajustement des colonnes
        const colWidths = Object.keys(data[0] || {}).map(key => ({
            wch: Math.max(key.length, 15)
        }));
        ws['!cols'] = colWidths;

        XLSX.writeFile(wb, `exports_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Export Excel généré avec succès');
    };

    const exportToPDF = () => {
        const doc = new jsPDF('landscape');

        // Titre
        doc.setFontSize(18);
        doc.text('Liste des Dossiers d\'Export', 14, 15);

        // Info
        doc.setFontSize(10);
        doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} - Total: ${formatNumber(totalCount)} dossiers`, 14, 22);

        // Tableau
        const tableData = exports.map(exp => [
            exp.numdos || '-',
            exp.navire || '-',
            formatDate(exp.dtedep),
            exp.nompay || '-',
            (exp.rsclient || '-').substring(0, 25),
            (exp.produit || '-').substring(0, 20),
            formatNumber(exp.nbrpal),
            formatNumber(exp.nbrcol),
            formatNumber(exp.pdscom),
        ]);

        autoTable(doc, {
            startY: 28,
            head: [['N° Dossier', 'Navire', 'Date', 'Pays', 'Client', 'Produit', 'Pal.', 'Colis', 'Poids (kg)']],
            body: tableData,
            theme: 'striped',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [59, 130, 246] },
        });

        doc.save(`exports-liste-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Export PDF généré avec succès');
    };

    const handleSort = (column) => {
        if (filters.sortBy === column) {
            setFilters(prev => ({
                ...prev,
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                sortBy: column,
                sortOrder: 'desc'
            }));
        }
        setCurrentPage(1);
        setTimeout(loadData, 100);
    };

    const getSortIcon = (column) => {
        if (filters.sortBy !== column) return null;
        return filters.sortOrder === 'asc' ? ' ↑' : ' ↓';
    };

    if (!isSuperUser) return null;

    return (
        <div className="p-6">
            {/* En-tête */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Liste des Dossiers d'Export</h1>
                        <p className="text-gray-600">{formatNumber(totalCount)} dossiers au total</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={exportToExcel}
                            disabled={exports.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            <FileDown className="w-5 h-5" />
                            Excel
                        </button>
                        <button
                            onClick={exportToPDF}
                            disabled={exports.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            <FileText className="w-5 h-5" />
                            PDF
                        </button>
                    </div>
                </div>

                {/* Barre de recherche */}
                <div className="flex gap-2 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Rechercher par n° dossier, TC, navire, client, exportateur..."
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Date début
                                </label>
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Date fin
                                </label>
                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Ship className="w-4 h-4 inline mr-1" />
                                    Navire
                                </label>
                                <input
                                    type="text"
                                    value={filters.navire}
                                    onChange={(e) => handleFilterChange('navire', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Nom du navire..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Globe className="w-4 h-4 inline mr-1" />
                                    Code Pays
                                </label>
                                <input
                                    type="text"
                                    value={filters.codpay}
                                    onChange={(e) => handleFilterChange('codpay', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Code pays..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Building className="w-4 h-4 inline mr-1" />
                                    Station
                                </label>
                                <input
                                    type="text"
                                    value={filters.station}
                                    onChange={(e) => handleFilterChange('station', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Station..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Client
                                </label>
                                <input
                                    type="text"
                                    value={filters.rsclient}
                                    onChange={(e) => handleFilterChange('rsclient', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Client..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Package className="w-4 h-4 inline mr-1" />
                                    Variété
                                </label>
                                <input
                                    type="text"
                                    value={filters.codvar}
                                    onChange={(e) => handleFilterChange('codvar', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Code variété..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Exportateur
                                </label>
                                <input
                                    type="text"
                                    value={filters.exporter}
                                    onChange={(e) => handleFilterChange('exporter', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Exportateur..."
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
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    onClick={() => handleSort('numdos')}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                >
                                    N° Dossier{getSortIcon('numdos')}
                                </th>
                                <th
                                    onClick={() => handleSort('navire')}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                >
                                    Navire / N° TC{getSortIcon('navire')}
                                </th>
                                <th
                                    onClick={() => handleSort('dtedep')}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                >
                                    Date Départ{getSortIcon('dtedep')}
                                </th>
                                <th
                                    onClick={() => handleSort('nompay')}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                >
                                    Pays{getSortIcon('nompay')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Exportateur
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Produit
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                                    Palettes
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                                    Colis
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                                    Poids (kg)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="11" className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : exports.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="px-6 py-12 text-center text-gray-500">
                                        Aucun dossier trouvé
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {exports.map((exp) => (
                                        <tr key={exp.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {exp.numdos}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{exp.navire || '-'}</span>
                                                    <span className="text-xs text-gray-500">TC: {exp.numtc || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {formatDate(exp.dtedep)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {exp.nompay || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                {exp.exporter || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                {exp.rsclient || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                {exp.produit || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                                                {formatNumber(exp.nbrpal)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                                                {formatNumber(exp.nbrcol)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                                {formatNumber(exp.pdscom)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <button
                                                    onClick={() => navigate(`/exports/details/${exp.id}`)}
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
                                        <td colSpan="7" className="px-6 py-4 text-sm text-gray-900 text-right">
                                            TOTAL ({formatNumber(exports.length)} dossiers sur cette page)
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                            {formatNumber(exports.reduce((sum, exp) => sum + (exp.nbrpal || 0), 0))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                            {formatNumber(exports.reduce((sum, exp) => sum + (exp.nbrcol || 0), 0))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                                            {formatNumber(exports.reduce((sum, exp) => sum + (exp.pdscom || 0), 0))}
                                        </td>
                                        <td className="px-6 py-4"></td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && exports.length > 0 && (
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

export default ExportList;
