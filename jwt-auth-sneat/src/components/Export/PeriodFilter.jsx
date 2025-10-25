import { Calendar } from 'lucide-react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths, format } from 'date-fns';

const PeriodFilter = ({ onPeriodChange, selectedPeriod }) => {
    const periods = [
        {
            id: 'all',
            label: 'Tout',
            getRange: () => ({ dateFrom: null, dateTo: null })
        },
        {
            id: 'today',
            label: "Aujourd'hui",
            getRange: () => {
                const today = new Date();
                return {
                    dateFrom: format(today, 'yyyy-MM-dd'),
                    dateTo: format(today, 'yyyy-MM-dd')
                };
            }
        },
        {
            id: 'yesterday',
            label: 'Hier',
            getRange: () => {
                const yesterday = subDays(new Date(), 1);
                return {
                    dateFrom: format(yesterday, 'yyyy-MM-dd'),
                    dateTo: format(yesterday, 'yyyy-MM-dd')
                };
            }
        },
        {
            id: 'last7days',
            label: '7 derniers jours',
            getRange: () => ({
                dateFrom: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
                dateTo: format(new Date(), 'yyyy-MM-dd')
            })
        },
        {
            id: 'last30days',
            label: '30 derniers jours',
            getRange: () => ({
                dateFrom: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
                dateTo: format(new Date(), 'yyyy-MM-dd')
            })
        },
        {
            id: 'thisWeek',
            label: 'Cette semaine',
            getRange: () => ({
                dateFrom: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
                dateTo: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
            })
        },
        {
            id: 'thisMonth',
            label: 'Ce mois',
            getRange: () => ({
                dateFrom: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
                dateTo: format(endOfMonth(new Date()), 'yyyy-MM-dd')
            })
        },
        {
            id: 'lastMonth',
            label: 'Mois dernier',
            getRange: () => {
                const lastMonth = subMonths(new Date(), 1);
                return {
                    dateFrom: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
                    dateTo: format(endOfMonth(lastMonth), 'yyyy-MM-dd')
                };
            }
        },
        {
            id: 'last3months',
            label: '3 derniers mois',
            getRange: () => ({
                dateFrom: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
                dateTo: format(new Date(), 'yyyy-MM-dd')
            })
        },
        {
            id: 'last6months',
            label: '6 derniers mois',
            getRange: () => ({
                dateFrom: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
                dateTo: format(new Date(), 'yyyy-MM-dd')
            })
        },
    ];

    const handlePeriodClick = (period) => {
        const range = period.getRange();
        onPeriodChange(period.id, range);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Filtres rapides de période</h3>
            </div>
            <div className="flex flex-wrap gap-2">
                {periods.map((period) => (
                    <button
                        key={period.id}
                        onClick={() => handlePeriodClick(period)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedPeriod === period.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {period.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PeriodFilter;
