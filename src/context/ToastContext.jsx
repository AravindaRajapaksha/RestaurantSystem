/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, Info, Lock, Mail, ShoppingCart, Trash2, Pencil, AlertCircle, X } from 'lucide-react';
import './Toast.css';

const ToastContext = createContext();

const resolveToastIcon = (type, icon) => {
  const key = String(icon || '').toUpperCase();

  switch (key) {
    case 'LOCK':
      return <Lock size={18} />;
    case 'CART':
      return <ShoppingCart size={18} />;
    case 'MAIL':
      return <Mail size={18} />;
    case 'EDIT':
      return <Pencil size={18} />;
    case 'DEL':
      return <Trash2 size={18} />;
    case 'ERR':
      return <AlertCircle size={18} />;
    case 'OK':
    case 'G':
      return <CheckCircle2 size={18} />;
    default:
      if (type === 'error') return <AlertCircle size={18} />;
      if (type === 'info') return <Info size={18} />;
      return <CheckCircle2 size={18} />;
  }
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', icon = '') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, icon }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className="toast-icon">{resolveToastIcon(toast.type, toast.icon)}</span>
            <span className="toast-message">{toast.message}</span>
            <button
              className="toast-close"
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
