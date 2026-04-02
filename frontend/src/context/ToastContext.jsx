import React, { createContext, useContext, useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info') => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const success = (msg) => addToast(msg, 'success');
    const error = (msg) => addToast(msg, 'error');
    const info = (msg) => addToast(msg, 'info');

    return (
        <ToastContext.Provider value={{ success, error, info }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
                            min-w-[300px] p-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/10
                            flex items-start gap-3 animate-in fade-in slide-in-from-right-8 duration-300
                            ${toast.type === 'success' ? 'bg-emerald-900/90 text-emerald-100' : ''}
                            ${toast.type === 'error' ? 'bg-red-900/90 text-red-100' : ''}
                            ${toast.type === 'info' ? 'bg-blue-900/90 text-blue-100' : ''}
                        `}
                    >
                        {toast.type === 'success' && <CheckCircle className="h-5 w-5 shrink-0" />}
                        {toast.type === 'error' && <AlertCircle className="h-5 w-5 shrink-0" />}
                        {toast.type === 'info' && <Info className="h-5 w-5 shrink-0" />}

                        <div className="flex-1 text-sm font-medium">{toast.message}</div>

                        <button onClick={() => removeToast(toast.id)} className="hover:opacity-75">
                            <X className="h-4 w-4" />
                        </button>

                        <ToastTimer id={toast.id} onRemove={removeToast} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastTimer = ({ id, onRemove }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(id);
        }, 5000); // Auto close after 5s
        return () => clearTimeout(timer);
    }, [id, onRemove]);
    return null;
};
