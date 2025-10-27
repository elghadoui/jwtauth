import { Scale, Boxes } from 'lucide-react';

const ExportStatsCards = ({ stats, loading }) => {
    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        return num.toLocaleString('fr-FR');
    };

    const formatWeight = (weight) => {
        if (!weight && weight !== 0) return '0 kg';
        return `${formatNumber(Math.round(weight))} kg`;
    };

    const cards = [
        {
            title: 'Total Palettes',
            value: formatNumber(stats?.totalPalettes),
            icon: Boxes,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50',
        },
        {
            title: 'Poids Total',
            value: formatWeight(stats?.totalPoids),
            icon: Scale,
            color: 'bg-orange-500',
            bgColor: 'bg-orange-50',
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${card.bgColor}`}>
                            <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
            ))}
        </div>
    );
};

export default ExportStatsCards;
