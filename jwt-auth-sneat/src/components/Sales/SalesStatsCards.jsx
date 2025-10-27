import { TrendingUp, TrendingDown, DollarSign, Scale, Users, Building } from 'lucide-react';

const SalesStatsCards = ({ stats, loading }) => {
    if (loading || !stats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: 'Poids Total Vendu',
            value: `${((stats.poidsTotalPese || 0) / 1000).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} t`,
            icon: Scale,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            change: '+5.2%',
            changeType: 'increase'
        },
        {
            title: 'Chiffre d\'Affaires',
            value: `${(stats.chiffreAffaires || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH`,
            icon: DollarSign,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            subtitle: `Prix moyen: ${(stats.prixMoyenKg || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH/kg`
        },
        {
            title: 'Montant Réglé',
            value: `${(stats.montantRegle || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH`,
            icon: TrendingUp,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            subtitle: `Solde: ${(stats.soldeRestant || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH`,
            progress: stats.chiffreAffaires > 0 ? ((stats.montantRegle / stats.chiffreAffaires) * 100).toFixed(1) : 0
        },
        {
            title: 'Acheteurs / Stations',
            value: `${stats.nombreAcheteurs || 0} / ${stats.nombreStations || 0}`,
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            subtitle: `${stats.totalVentes || 0} ventes total`
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${card.bgColor}`}>
                            <card.icon className={`w-6 h-6 ${card.color}`} />
                        </div>
                        {card.change && (
                            <div className={`flex items-center gap-1 text-sm font-medium ${
                                card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {card.changeType === 'increase' ? (
                                    <TrendingUp className="w-4 h-4" />
                                ) : (
                                    <TrendingDown className="w-4 h-4" />
                                )}
                                <span>{card.change}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        {card.subtitle && (
                            <p className="text-xs text-gray-500 mt-2">{card.subtitle}</p>
                        )}
                        {card.progress && (
                            <div className="mt-3">
                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                    <span>Taux de recouvrement</span>
                                    <span className="font-semibold">{card.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${card.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SalesStatsCards;
