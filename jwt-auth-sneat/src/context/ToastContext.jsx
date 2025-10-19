import { createContext, useState, useContext, useCallback } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast doit être utilisé dans ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 5000) => {
        const id = Date.now() + Math.random();
        const toast = {
            id,
            message,
            type, // success, error, info, warning
            duration
        };

        setToasts(prev => [...prev, toast]);

        // Auto-remove après duration
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const success = useCallback((message, duration) => {
        return addToast(message, 'success', duration);
    }, [addToast]);

    const error = useCallback((message, duration) => {
        return addToast(message, 'error', duration);
    }, [addToast]);

    const info = useCallback((message, duration) => {
        return addToast(message, 'info', duration);
    }, [addToast]);

    const warning = useCallback((message, duration) => {
        return addToast(message, 'warning', duration);
    }, [addToast]);

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="toast-icon" style={{ color: '#10b981' }} />;
            case 'error':
                return <XCircle className="toast-icon" style={{ color: '#ef4444' }} />;
            case 'warning':
                return <AlertTriangle className="toast-icon" style={{ color: '#f59e0b' }} />;
            case 'info':
            default:
                return <Info className="toast-icon" style={{ color: '#3b82f6' }} />;
        }
    };

    const getTitle = (type) => {
        switch (type) {
            case 'success':
                return 'Succès';
            case 'error':
                return 'Erreur';
            case 'warning':
                return 'Attention';
            case 'info':
            default:
                return 'Information';
        }
    };

    const value = {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        info,
        warning
    };

    return (
        <ToastContext.Provider value={value}>
            {children}

            {/* Toast Container */}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`toast toast-${toast.type}`}
                    >
                        {getIcon(toast.type)}
                        <div className="toast-content">
                            <div className="toast-title">{getTitle(toast.type)}</div>
                            <div className="toast-message">{toast.message}</div>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="toast-close"
                            aria-label="Fermer"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
