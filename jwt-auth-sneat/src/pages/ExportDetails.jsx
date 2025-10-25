import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { exportAPI, getErrorMessage } from '../services/api';
import { ArrowLeft, Ship, Globe, Package, User, Calendar, Building, Truck, FileText, Scale, Boxes } from 'lucide-react';

const ExportDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const [dossier, setDossier] = useState(null);
    const [loading, setLoading] = useState(true);

    const isSuperUser = user?.roles?.includes('super-user') || user?.roles?.includes('Super-User');

    useEffect(() => {
        if (!isSuperUser) {
            toast.error('Accès refusé. Cette page est réservée aux super-users.');
            navigate('/');
            return;
        }
        loadDossier();
    }, [id, isSuperUser]);

    const loadDossier = async () => {
        try {
            setLoading(true);
            const response = await exportAPI.getById(id);
            setDossier(response.data);
        } catch (error) {
            toast.error(getErrorMessage(error));
            navigate('/exports/list');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return num.toLocaleString('fr-FR');
    };

    if (!isSuperUser) return null;

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (!dossier) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <p className="text-gray-500">Dossier non trouvé</p>
                    <button
                        onClick={() => navigate('/exports/list')}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                    >
                        Retour à la liste
                    </button>
                </div>
            </div>
        );
    }

    const InfoCard = ({ icon: Icon, title, value, iconColor = 'text-blue-600', bgColor = 'bg-blue-50' }) => (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${bgColor}`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <p className="text-base font-semibold text-gray-900 break-words">{value || '-'}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6">
            {/* En-tête */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/exports/list')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Retour à la liste
                </button>

                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
                    <h1 className="text-3xl font-bold mb-2">Dossier d'Export</h1>
                    <p className="text-blue-100 text-lg">N° {dossier.numdos}</p>
                </div>
            </div>

            {/* Informations principales */}
            <div className="space-y-6">
                {/* Section 1: Identifiants */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        Identifiants
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoCard
                            icon={FileText}
                            title="N° Dossier"
                            value={dossier.numdos}
                            iconColor="text-blue-600"
                            bgColor="bg-blue-50"
                        />
                        <InfoCard
                            icon={FileText}
                            title="N° TC"
                            value={dossier.numtc}
                            iconColor="text-purple-600"
                            bgColor="bg-purple-50"
                        />
                        <InfoCard
                            icon={FileText}
                            title="Réf. Exportateur"
                            value={dossier.refexp}
                            iconColor="text-green-600"
                            bgColor="bg-green-50"
                        />
                    </div>
                </div>

                {/* Section 2: Transport */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Ship className="w-5 h-5 text-gray-600" />
                        Transport
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoCard
                            icon={Ship}
                            title="Navire"
                            value={dossier.navire}
                            iconColor="text-cyan-600"
                            bgColor="bg-cyan-50"
                        />
                        <InfoCard
                            icon={Calendar}
                            title="Date de Départ"
                            value={formatDate(dossier.dtedep)}
                            iconColor="text-orange-600"
                            bgColor="bg-orange-50"
                        />
                        <InfoCard
                            icon={Truck}
                            title="Type Transport"
                            value={dossier.typtrp}
                            iconColor="text-gray-600"
                            bgColor="bg-gray-50"
                        />
                        <InfoCard
                            icon={User}
                            title="Transitaire"
                            value={dossier.transite}
                            iconColor="text-indigo-600"
                            bgColor="bg-indigo-50"
                        />
                        <InfoCard
                            icon={Truck}
                            title="Transporteur"
                            value={dossier.transpor}
                            iconColor="text-yellow-600"
                            bgColor="bg-yellow-50"
                        />
                    </div>
                </div>

                {/* Section 3: Destination */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-gray-600" />
                        Destination
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoCard
                            icon={Globe}
                            title="Code Pays"
                            value={dossier.codpay}
                            iconColor="text-blue-600"
                            bgColor="bg-blue-50"
                        />
                        <InfoCard
                            icon={Globe}
                            title="Nom Pays"
                            value={dossier.nompay}
                            iconColor="text-green-600"
                            bgColor="bg-green-50"
                        />
                        <InfoCard
                            icon={Globe}
                            title="Code Destination"
                            value={dossier.coddes}
                            iconColor="text-purple-600"
                            bgColor="bg-purple-50"
                        />
                    </div>
                </div>

                {/* Section 4: Parties */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-600" />
                        Parties
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard
                            icon={User}
                            title="Client"
                            value={dossier.rsclient}
                            iconColor="text-blue-600"
                            bgColor="bg-blue-50"
                        />
                        <InfoCard
                            icon={User}
                            title="Exportateur"
                            value={dossier.exporter}
                            iconColor="text-green-600"
                            bgColor="bg-green-50"
                        />
                    </div>
                </div>

                {/* Section 5: Produit */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-gray-600" />
                        Produit
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoCard
                            icon={Package}
                            title="Code Variété"
                            value={dossier.codvar}
                            iconColor="text-green-600"
                            bgColor="bg-green-50"
                        />
                        <InfoCard
                            icon={Package}
                            title="Produit"
                            value={dossier.produit}
                            iconColor="text-emerald-600"
                            bgColor="bg-emerald-50"
                        />
                    </div>
                </div>

                {/* Section 6: Quantités */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-gray-600" />
                        Quantités
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                            <div className="flex items-center gap-3 mb-2">
                                <Boxes className="w-6 h-6 text-blue-600" />
                                <p className="text-sm font-medium text-gray-500">Palettes</p>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{formatNumber(dossier.nbrpal)}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                            <div className="flex items-center gap-3 mb-2">
                                <Package className="w-6 h-6 text-green-600" />
                                <p className="text-sm font-medium text-gray-500">Colis</p>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{formatNumber(dossier.nbrcol)}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
                            <div className="flex items-center gap-3 mb-2">
                                <Scale className="w-6 h-6 text-orange-600" />
                                <p className="text-sm font-medium text-gray-500">Poids Commercial (kg)</p>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{formatNumber(dossier.pdscom)}</p>
                        </div>
                    </div>
                </div>

                {/* Section 7: Station */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Building className="w-5 h-5 text-gray-600" />
                        Station
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard
                            icon={Building}
                            title="Station"
                            value={dossier.stations}
                            iconColor="text-purple-600"
                            bgColor="bg-purple-50"
                        />
                        <InfoCard
                            icon={Calendar}
                            title="Date de Création"
                            value={formatDate(dossier.dateCreation)}
                            iconColor="text-gray-600"
                            bgColor="bg-gray-50"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportDetails;
