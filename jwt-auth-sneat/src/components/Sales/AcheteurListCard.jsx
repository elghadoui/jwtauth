import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const AcheteurListCard = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="space-y-4">
                <p className="text-xs text-gray-400 mb-4">Chargement...</p>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-80 flex items-center justify-center text-gray-500">
                Aucune donnée disponible
            </div>
        );
    }

    // Calculer le total pour les pourcentages
    const totalCA = data.reduce((sum, item) => sum + (item.chiffreAffaires || 0), 0);

    // Fonction pour obtenir les initiales de l'acheteur
    const getInitials = (name) => {
        if (!name) return '?';
        const words = name.trim().split(' ');
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Fonction pour générer une couleur basée sur le nom
    const getColor = (name) => {
        const colors = [
            'bg-blue-500',
            'bg-green-500',
            'bg-purple-500',
            'bg-orange-500',
            'bg-pink-500',
            'bg-indigo-500',
            'bg-cyan-500',
            'bg-teal-500',
            'bg-red-500',
            'bg-yellow-500'
        ];
        const index = (name?.charCodeAt(0) || 0) % colors.length;
        return colors[index];
    };

    // Formatter le montant
    const formatAmount = (amount) => {
        return `${Math.round(amount).toLocaleString('fr-FR')} DH`;
    };

    // Calculer le taux de règlement
    const getPaymentRate = (montantRegle, ca) => {
        if (!ca || ca === 0) return 0;
        return ((montantRegle / ca) * 100).toFixed(1);
    };

    return (
        <div>
            <p className="text-xs text-gray-500 mb-4">Classement par chiffre d'affaires</p>
            <div className="space-y-3">
                {data.slice(0, 5).map((item, index) => {
                    const acheteurName = item.acheteurs || item.refach || 'Inconnu';
                    const ca = item.chiffreAffaires || 0;
                    const percentage = totalCA > 0 ? ((ca / totalCA) * 100) : 0;
                    const paymentRate = getPaymentRate(item.montantRegle, ca);
                    const hasPendingPayment = (item.soldeRestant || 0) > 0;

                    return (
                        <div
                            key={index}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            {/* Avatar avec initiales */}
                            <div
                                className={`w-10 h-10 ${getColor(acheteurName)} rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}
                            >
                                {getInitials(acheteurName)}
                            </div>

                            {/* Nom et détails */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900 text-sm">
                                        {formatAmount(ca)}
                                    </span>
                                    <span
                                        className={`flex items-center gap-0.5 text-xs font-semibold ${
                                            percentage >= 15 ? 'text-green-600' : 'text-orange-600'
                                        }`}
                                    >
                                        {percentage >= 15 ? (
                                            <TrendingUp className="w-3.5 h-3.5" />
                                        ) : (
                                            <TrendingDown className="w-3.5 h-3.5" />
                                        )}
                                        {percentage.toFixed(1)}%
                                    </span>
                                    {hasPendingPayment && (
                                        <AlertCircle className="w-3.5 h-3.5 text-red-500" title="Solde restant" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-600 truncate font-medium">{acheteurName}</p>
                                {hasPendingPayment && (
                                    <p className="text-xs text-red-600 mt-0.5">
                                        Solde: {formatAmount(item.soldeRestant)}
                                    </p>
                                )}
                            </div>

                            {/* Taux de paiement */}
                            <div className="text-right flex-shrink-0">
                                <p className={`text-sm font-bold ${
                                    paymentRate >= 80 ? 'text-green-600' : paymentRate >= 50 ? 'text-orange-600' : 'text-red-600'
                                }`}>
                                    {paymentRate}%
                                </p>
                                <p className="text-xs text-gray-500">payé</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AcheteurListCard;
