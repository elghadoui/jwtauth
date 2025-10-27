import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CountryStatsCard = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="space-y-4">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-12 bg-gray-200 rounded w-1/3"></div>
                        <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                    </div>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gray-200 rounded"></div>
                            <div className="flex-1">
                                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                        </div>
                    ))}
                </div>
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

    // Calculer le total
    const totalPoids = data.reduce((sum, item) => sum + (item.totalPoids || 0), 0);
    const totalDossiers = data.reduce((sum, item) => sum + (item.totalDossiers || 0), 0);

    // Préparer les données pour le graphique donut
    const topCountries = data.slice(0, 4);
    const chartData = topCountries.map(item => ({
        name: item.nompay || item.codpay || 'Inconnu',
        value: item.totalPoids || 0
    }));

    // Couleurs pour le graphique
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

    // Calculer le pourcentage du premier pays
    const topPercentage = totalPoids > 0 ? ((topCountries[0]?.totalPoids / totalPoids) * 100) : 0;

    // Fonction pour obtenir le drapeau emoji ou initiales
    const getCountryFlag = (codpay) => {
        const flags = {
            'FR': '🇫🇷',
            'ES': '🇪🇸',
            'IT': '🇮🇹',
            'DE': '🇩🇪',
            'UK': '🇬🇧',
            'GB': '🇬🇧',
            'US': '🇺🇸',
            'BE': '🇧🇪',
            'NL': '🇳🇱',
            'PT': '🇵🇹',
        };
        return flags[codpay?.toUpperCase()] || codpay?.substring(0, 2).toUpperCase() || '🌍';
    };

    // Couleurs d'icônes pour les pays
    const getIconColor = (index) => {
        const colors = [
            'bg-blue-50 text-blue-600',
            'bg-green-50 text-green-600',
            'bg-orange-50 text-orange-600',
            'bg-purple-50 text-purple-600',
            'bg-pink-50 text-pink-600',
            'bg-cyan-50 text-cyan-600',
        ];
        return colors[index % colors.length];
    };

    // Formatter le poids
    const formatWeight = (weight) => {
        if (weight >= 1000000) {
            return `${(weight / 1000000).toFixed(1)}Mt`;
        } else if (weight >= 1000) {
            return `${(weight / 1000).toFixed(1)}kt`;
        }
        return `${Math.round(weight)}t`;
    };

    // Composant tooltip personnalisé
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{payload[0].name}</p>
                    <p className="text-xs text-gray-600">{formatWeight(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div>
            {/* En-tête */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Destinations Export</h3>
                <p className="text-xs text-gray-500">{formatWeight(totalPoids)} Total Exporté</p>
            </div>

            {/* Statistique principale + Graphique Donut */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                        {totalDossiers.toLocaleString('fr-FR')}
                    </p>
                    <p className="text-sm text-gray-600">Total Dossiers</p>
                </div>

                {/* Graphique Donut */}
                <div className="relative w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={60}
                                paddingAngle={2}
                                dataKey="value"
                                cursor="pointer"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        style={{ outline: 'none' }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: 'transparent' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Pourcentage au centre */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-xl font-bold text-gray-900">{topPercentage.toFixed(0)}%</p>
                        <p className="text-xs text-gray-500">Top Pays</p>
                    </div>
                </div>
            </div>

            {/* Liste des pays */}
            <div className="space-y-3">
                {data.slice(0, 5).map((item, index) => {
                    const countryName = item.nompay || item.codpay || 'Inconnu';
                    const weight = item.totalPoids || 0;
                    const percentage = totalPoids > 0 ? ((weight / totalPoids) * 100) : 0;

                    return (
                        <div key={index} className="flex items-center gap-3">
                            {/* Icône avec drapeau */}
                            <div className={`w-10 h-10 ${getIconColor(index)} rounded-lg flex items-center justify-center text-lg flex-shrink-0`}>
                                {getCountryFlag(item.codpay)}
                            </div>

                            {/* Nom et détails */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {countryName}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatWeight(weight)}
                                </p>
                            </div>

                            {/* Pourcentage */}
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold text-gray-900">
                                    {percentage.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CountryStatsCard;
