import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    itemsPerPageOptions = [5, 10, 20, 50]
}) => {
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Générer les numéros de page à afficher
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Afficher toutes les pages si moins de maxPagesToShow
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Logique pour afficher les pages avec ellipses
            if (currentPage <= 3) {
                // Début: 1 2 3 4 ... last
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Fin: 1 ... last-3 last-2 last-1 last
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Milieu: 1 ... current-1 current current+1 ... last
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            flexWrap: 'wrap',
            gap: '1rem'
        }}>
            {/* Items per page selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Afficher
                </label>
                <select
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="input-field"
                    style={{
                        width: 'auto',
                        padding: '0.375rem 0.75rem',
                        fontSize: '0.875rem'
                    }}
                >
                    {itemsPerPageOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    éléments ({startItem}-{endItem} sur {totalItems})
                </span>
            </div>

            {/* Pagination controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* First page button */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    style={{
                        padding: '0.5rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.375rem',
                        backgroundColor: 'var(--bg-secondary)',
                        color: currentPage === 1 ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                    }}
                    title="Première page"
                >
                    <ChevronsLeft size={16} />
                </button>

                {/* Previous page button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                        padding: '0.5rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.375rem',
                        backgroundColor: 'var(--bg-secondary)',
                        color: currentPage === 1 ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                    }}
                    title="Page précédente"
                >
                    <ChevronLeft size={16} />
                </button>

                {/* Page numbers */}
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {pageNumbers.map((page, index) => {
                        if (page === '...') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    style={{
                                        padding: '0.5rem 0.75rem',
                                        color: 'var(--text-tertiary)',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    ...
                                </span>
                            );
                        }

                        return (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                style={{
                                    padding: '0.5rem 0.75rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '0.375rem',
                                    backgroundColor: currentPage === page ? 'var(--color-primary-600)' : 'var(--bg-secondary)',
                                    color: currentPage === page ? 'white' : 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: currentPage === page ? 600 : 400,
                                    minWidth: '2.5rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                {/* Next page button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                        padding: '0.5rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.375rem',
                        backgroundColor: 'var(--bg-secondary)',
                        color: currentPage === totalPages ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                    }}
                    title="Page suivante"
                >
                    <ChevronRight size={16} />
                </button>

                {/* Last page button */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    style={{
                        padding: '0.5rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.375rem',
                        backgroundColor: 'var(--bg-secondary)',
                        color: currentPage === totalPages ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                    }}
                    title="Dernière page"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
