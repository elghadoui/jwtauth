import { TrendingUp, TrendingDown } from 'lucide-react';

const VarieteListCard = ({ data, loading }) => {
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
    const totalPoids = data.reduce((sum, item) => sum + (item.poidsPese || 0), 0);

    // Fonction pour obtenir les initiales de la variété
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
            'bg-emerald-500',
            'bg-lime-500',
            'bg-amber-500',
            'bg-rose-500',
            'bg-violet-500',
            'bg-sky-500',
            'bg-fuchsia-500',
            'bg-teal-500',
            'bg-orange-500',
            'bg-cyan-500'
        ];
        const index = (name?.charCodeAt(0) || 0) % colors.length;
        return colors[index];
    };

    return (
        <div>
            <p className="text-xs text-gray-500 mb-4">Classement par poids vendu</p>
            <div className="space-y-3">
                {data.slice(0, 5).map((item, index) => {
                    const varieteName = item.varietes || item.codvar || 'Inconnu';
                    const poids = item.poidsPese || 0;
                    const percentage = totalPoids > 0 ? ((poids / totalPoids) * 100) : 0;
                    const isPositive = percentage >= 15;

                    return (
                        <div
                            key={index}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            {/* Avatar avec initiales */}
                            <div
                                className={`w-10 h-10 ${getColor(varieteName)} rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}
                            >
                                {getInitials(varieteName)}
                            </div>

                            {/* Nom et pourcentage */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900 text-sm">
                                        {(poids / 1000).toFixed(2)}t
                                    </span>
                                    <span
                                        className={`flex items-center gap-0.5 text-xs font-semibold ${
                                            isPositive ? 'text-green-600' : 'text-orange-600'
                                        }`}
                                    >
                                        {isPositive ? (
                                            <TrendingUp className="w-3.5 h-3.5" />
                                        ) : (
                                            <TrendingDown className="w-3.5 h-3.5" />
                                        )}
                                        {percentage.toFixed(1)}%
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 truncate font-medium">{varieteName}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Prix moy: {(item.prixMoyen || 0).toFixed(2)} DH/kg
                                </p>
                            </div>

                            {/* CA à droite */}
                            <div className="text-right flex-shrink-0">
                                <p className="text-base font-bold text-gray-900">
                                    {item.chiffreAffaires >= 1000000
                                        ? `${(item.chiffreAffaires / 1000000).toFixed(1)}M`
                                        : item.chiffreAffaires >= 1000
                                        ? `${Math.round(item.chiffreAffaires / 1000)}K`
                                        : `${Math.round(item.chiffreAffaires)}`} DH
                                </p>
                                <p className="text-xs text-gray-500">{item.totalVentes || 0} ventes</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VarieteListCard;
