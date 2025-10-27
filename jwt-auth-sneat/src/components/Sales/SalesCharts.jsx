import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

// Graphique en ligne pour l'évolution temporelle des ventes
export const SalesTimelineChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

    return (
        <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="period" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis yAxisId="left" stroke="#3B82F6" style={{ fontSize: '12px' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#10B981" style={{ fontSize: '12px' }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#FFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name) => {
                        if (name === 'Chiffre d\'Affaires' || name === 'Montant Réglé') {
                            return `${Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH`;
                        }
                        return `${Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`;
                    }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="chiffreAffaires" stroke="#3B82F6" strokeWidth={2} name="Chiffre d'Affaires" />
                <Line yAxisId="left" type="monotone" dataKey="montantRegle" stroke="#10B981" strokeWidth={2} name="Montant Réglé" />
                <Line yAxisId="right" type="monotone" dataKey="poidsPese" stroke="#F59E0B" strokeWidth={2} name="Poids (kg)" />
            </LineChart>
        </ResponsiveContainer>
    );
};

// Graphique en barres pour les variétés
export const VarieteBarChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

    const chartData = data.slice(0, 5).map(item => ({
        name: (item.varietes || item.codvar || 'Inconnu').substring(0, 15),
        poidsPese: (item.poidsPese || 0) / 1000, // Convertir en tonnes
        ca: item.chiffreAffaires || 0,
        prixMoyen: item.prixMoyen || 0
    }));

    return (
        <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '11px' }} angle={-45} textAnchor="end" height={80} />
                <YAxis yAxisId="left" stroke="#10B981" style={{ fontSize: '12px' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#3B82F6" style={{ fontSize: '12px' }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#FFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name) => {
                        if (name === 'CA (DH)') {
                            return `${Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH`;
                        }
                        if (name === 'Poids (tonnes)') {
                            return `${Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} t`;
                        }
                        return Number(value).toLocaleString('fr-FR');
                    }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="poidsPese" fill="#10B981" name="Poids (tonnes)" />
                <Bar yAxisId="right" dataKey="ca" fill="#3B82F6" name="CA (DH)" />
            </BarChart>
        </ResponsiveContainer>
    );
};

// Graphique en camembert pour les stations
export const SalesStationPieChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

    const chartData = data.slice(0, 8).map(item => ({
        name: item.station || 'Inconnu',
        value: item.chiffreAffaires || 0
    }));

    return (
        <ResponsiveContainer width="100%" height={320}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value) => `${Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH`}
                    contentStyle={{
                        backgroundColor: '#FFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

// Graphique en barres pour les prix moyens par type et variété
export const AveragePriceChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

    // Prendre les 10 premiers éléments et créer un label combiné
    const chartData = data.slice(0, 10).map(item => ({
        name: `${(item.varietes || 'Inconnu').substring(0, 10)} - ${(item.typeEcart || 'Type').substring(0, 10)}`,
        prixMoyen: item.prixMoyen || 0,
        poidsPese: (item.poidsPese || 0) / 1000
    }));

    return (
        <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '10px' }} angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#8B5CF6" style={{ fontSize: '12px' }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#FFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name) => {
                        if (name === 'Prix Moyen (DH/kg)') {
                            return `${Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH/kg`;
                        }
                        return Number(value).toLocaleString('fr-FR');
                    }}
                />
                <Legend />
                <Bar dataKey="prixMoyen" fill="#8B5CF6" name="Prix Moyen (DH/kg)" />
            </BarChart>
        </ResponsiveContainer>
    );
};

// Graphique en ligne pour l'évolution des prix
export const PriceTimelineChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-2">Aucune donnée de prix disponible</p>
                    <p className="text-xs text-gray-400">
                        Vérifiez que vos ventes contiennent des prix (PrxKg)
                    </p>
                </div>
            </div>
        );
    }

    console.log('PriceTimelineChart - Data:', data);

    return (
        <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="period" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#8B5CF6" style={{ fontSize: '12px' }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#FFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value) => `${Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH/kg`}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="prixMoyen"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    name="Prix Moyen (DH/kg)"
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default { SalesTimelineChart, PriceTimelineChart, VarieteBarChart, SalesStationPieChart, AveragePriceChart };
