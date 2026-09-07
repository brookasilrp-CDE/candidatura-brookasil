import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      id="toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: {
      bg: 'bg-emerald-900/95 text-emerald-50 border-emerald-700/60 shadow-emerald-950/30',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
    },
    error: {
      bg: 'bg-rose-900/95 text-rose-50 border-rose-700/60 shadow-rose-950/30',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
    },
    info: {
      bg: 'bg-slate-900/95 text-slate-50 border-slate-700/60 shadow-slate-950/30',
      icon: <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
    }
  }[toast.type];

  return (
    <div
      id={`toast-${toast.id}`}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${config.bg}`}
    >
      {config.icon}
      <div className="flex-1 text-sm">
        <p className="font-semibold leading-tight">{toast.title}</p>
        {toast.message && <p className="text-xs opacity-90 mt-1 leading-relaxed">{toast.message}</p>}
      </div>
      <button
        id={`toast-close-${toast.id}`}
        onClick={() => onDismiss(toast.id)}
        className="text-white/70 hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-md"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
