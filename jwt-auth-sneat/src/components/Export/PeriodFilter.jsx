import { Calendar, Package, X, Building } from 'lucide-react';
import { useState } from 'react';
import Select from 'react-select';

const PeriodFilter = ({
    onPeriodChange,
    selectedPeriod,
    // Props pour le filtre de variétés
    varietes = [],
    selectedVarietes = [],
    onVarietesChange,
    loadingVarietes = false,
    // Props pour le filtre de stations
    stations = [],
    selectedStations = [],
    onStationsChange,
    loadingStations = false
}) => {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const handleDateFromChange = (e) => {
        const newDateFrom = e.target.value;
        setDateFrom(newDateFrom);
        onPeriodChange('custom', {
            dateFrom: newDateFrom || null,
            dateTo: dateTo || null
        });
    };

    const handleDateToChange = (e) => {
        const newDateTo = e.target.value;
        setDateTo(newDateTo);
        onPeriodChange('custom', {
            dateFrom: dateFrom || null,
            dateTo: newDateTo || null
        });
    };

    const handleShowAll = () => {
        setDateFrom('');
        setDateTo('');
        onPeriodChange('all', { dateFrom: null, dateTo: null });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Filtres rapides</h3>
            </div>

            <div className="flex flex-wrap items-end gap-4">
                {/* Date de début */}
                <div className="flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date début
                    </label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={handleDateFromChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Date de fin */}
                <div className="flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date fin
                    </label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={handleDateToChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Bouton Tout */}
                <div className="flex-shrink-0">
                    <button
                        onClick={handleShowAll}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        title="Réinitialiser les filtres de date"
                    >
                        <X className="w-4 h-4" />
                        Afficher tout
                    </button>
                </div>

                {/* Filtre de variétés */}
                {onVarietesChange && (
                    <div className="flex-1 min-w-[300px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-green-600" />
                                <span>Variétés</span>
                                {selectedVarietes.length > 0 && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                        {selectedVarietes.length}
                                    </span>
                                )}
                            </div>
                        </label>
                        <Select
                            isMulti
                            value={selectedVarietes}
                            onChange={onVarietesChange}
                            options={varietes}
                            isLoading={loadingVarietes}
                            placeholder="Toutes les variétés..."
                            noOptionsMessage={() => "Aucune variété disponible"}
                            loadingMessage={() => "Chargement..."}
                            isClearable
                            className="react-select-container"
                            classNamePrefix="react-select"
                            styles={{
                                control: (base, state) => ({
                                    ...base,
                                    minHeight: '42px',
                                    borderColor: state.isFocused ? '#10b981' : '#d1d5db',
                                    boxShadow: state.isFocused ? '0 0 0 1px #10b981' : 'none',
                                    '&:hover': {
                                        borderColor: '#10b981'
                                    }
                                }),
                                multiValue: (base) => ({
                                    ...base,
                                    backgroundColor: '#10b981',
                                }),
                                multiValueLabel: (base) => ({
                                    ...base,
                                    color: 'white',
                                    fontWeight: '500',
                                }),
                                multiValueRemove: (base) => ({
                                    ...base,
                                    color: 'white',
                                    ':hover': {
                                        backgroundColor: '#059669',
                                        color: 'white',
                                    }
                                })
                            }}
                        />
                    </div>
                )}

                {/* Filtre de stations */}
                {onStationsChange && (
                    <div className="flex-1 min-w-[300px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-orange-600" />
                                <span>Stations</span>
                                {selectedStations.length > 0 && (
                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                                        {selectedStations.length}
                                    </span>
                                )}
                            </div>
                        </label>
                        <Select
                            isMulti
                            value={selectedStations}
                            onChange={onStationsChange}
                            options={stations}
                            isLoading={loadingStations}
                            placeholder="Toutes les stations..."
                            noOptionsMessage={() => "Aucune station disponible"}
                            loadingMessage={() => "Chargement..."}
                            isClearable
                            className="react-select-container"
                            classNamePrefix="react-select"
                            styles={{
                                control: (base, state) => ({
                                    ...base,
                                    minHeight: '42px',
                                    borderColor: state.isFocused ? '#f97316' : '#d1d5db',
                                    boxShadow: state.isFocused ? '0 0 0 1px #f97316' : 'none',
                                    '&:hover': {
                                        borderColor: '#f97316'
                                    }
                                }),
                                multiValue: (base) => ({
                                    ...base,
                                    backgroundColor: '#f97316',
                                }),
                                multiValueLabel: (base) => ({
                                    ...base,
                                    color: 'white',
                                    fontWeight: '500',
                                }),
                                multiValueRemove: (base) => ({
                                    ...base,
                                    color: 'white',
                                    ':hover': {
                                        backgroundColor: '#ea580c',
                                        color: 'white',
                                    }
                                })
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PeriodFilter;
