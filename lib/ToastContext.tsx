import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

// Globálny Toast kontext
const ToastContext = React.createContext<{
  showToast: (message: string, type: 'success' | 'error') => void;
} | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const toastElement = toast && (
    <div className={`fixed top-8 right-8 z-[999999] pointer-events-none flex items-center gap-4 px-6 py-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right-8 duration-500 ${
      toast.type === 'success' 
        ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white border-brand-orange/50 shadow-brand-orange/20' 
        : 'bg-gradient-to-r from-rose-900 to-rose-800 text-white border-rose-400/30 shadow-rose-500/20'
    }`}>
      {/* Svietiaca animácia */}
      <div className={`absolute inset-0 rounded-2xl opacity-20 ${
        toast.type === 'success' ? 'bg-gradient-to-r from-brand-orange to-orange-500 animate-pulse' : 'bg-gradient-to-r from-rose-400 to-pink-400 animate-pulse'
      }`}></div>
      
      <div className="relative flex items-center gap-4 pointer-events-auto">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          toast.type === 'success' ? 'bg-brand-orange/20 text-brand-orange' : 'bg-rose-500/20 text-rose-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
        </div>
        
        <div className="flex-1">
          <div className="font-semibold text-sm text-white/95 tracking-normal">{toast.message}</div>
        </div>
        
        <button 
          onClick={() => setToast(null)} 
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 border border-white/20"
        >
          <X size={16} strokeWidth={2} className="text-white/80" />
        </button>
      </div>
    </div>
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && createPortal(toastElement, document.body)}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
