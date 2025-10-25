import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

// Graphique en ligne pour l'évolution temporelle
export const TimelineChart = ({ data, loading }) => {
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
                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#FFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                />
                <Legend />
                <Line type="monotone" dataKey="totalDossiers" stroke="#3B82F6" strokeWidth={2} name="Dossiers" />
                <Line type="monotone" dataKey="totalPalettes" stroke="#10B981" strokeWidth={2} name="Palettes" />
                <Line type="monotone" dataKey="totalPoids" stroke="#F59E0B" strokeWidth={2} name="Poids (kg)" />
            </LineChart>
        </ResponsiveContainer>
    );
};

// Graphique en camembert pour les pays
export const CountryPieChart = ({ data, loading }) => {
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
        name: item.nompay || item.codpay || 'Inconnu',
        value: item.totalPoids || 0
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
                    formatter={(value) => `${value.toLocaleString('fr-FR')} kg`}
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

// Graphique en barres pour les produits
export const ProductBarChart = ({ data, loading }) => {
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

    const chartData = data.slice(0, 10).map(item => ({
        name: (item.produit || item.codvar || 'Inconnu').substring(0, 15),
        palettes: item.totalPalettes || 0,
        poids: (item.totalPoids || 0) / 1000 // Convertir en tonnes
    }));

    return (
        <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '11px' }} angle={-45} textAnchor="end" height={80} />
                <YAxis yAxisId="left" stroke="#3B82F6" style={{ fontSize: '12px' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" style={{ fontSize: '12px' }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#FFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="palettes" fill="#3B82F6" name="Palettes" />
                <Bar yAxisId="right" dataKey="poids" fill="#F59E0B" name="Poids (tonnes)" />
            </BarChart>
        </ResponsiveContainer>
    );
};

// Graphique en barres pour les stations
export const StationBarChart = ({ data, loading }) => {
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

    const chartData = data.map(item => ({
        name: item.station || 'Inconnu',
        dossiers: item.totalDossiers || 0,
        palettes: item.totalPalettes || 0,
        poids: (item.totalPoids || 0) / 1000 // Convertir en tonnes
    }));

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#FFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                />
                <Legend />
                <Bar dataKey="dossiers" fill="#3B82F6" name="Dossiers" />
                <Bar dataKey="palettes" fill="#10B981" name="Palettes" />
                <Bar dataKey="poids" fill="#F59E0B" name="Poids (tonnes)" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default { TimelineChart, CountryPieChart, ProductBarChart, StationBarChart };
