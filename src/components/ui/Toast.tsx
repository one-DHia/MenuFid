'use client';

/**
 * components/ui/Toast.tsx
 * ─────────────────────────────────────────────────────────────
 * Système de notifications toast léger — remplace tous les alert().
 *
 * Usage :
 *   const { showToast } = useToast();
 *   showToast('Sauvegardé !', 'success');
 *   showToast('Une erreur est survenue.', 'error');
 *
 * Le provider <ToastProvider> doit entourer l'app dans layout.tsx
 * — ou utiliser le hook directement si le contexte est déjà monté.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

// ─── Context ──────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Hook ─────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast doit être utilisé dans un <ToastProvider>');
  }
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Zone d'affichage des toasts — coin inférieur droit */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Toast individuel ─────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  // Auto-dismiss après 3.5 secondes
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const styles: Record<ToastType, string> = {
    success: 'bg-emerald-900 text-emerald-50 border-emerald-700',
    error:   'bg-red-900 text-red-50 border-red-700',
    info:    'bg-slate-900 text-slate-50 border-slate-700',
  };

  const Icon = toast.type === 'success' ? CheckCircle
    : toast.type === 'error' ? XCircle
    : Info;

  return (
    <div
      className={`
        pointer-events-auto flex items-center gap-3
        px-4 py-3 rounded-2xl border shadow-xl
        text-sm font-semibold max-w-sm
        animate-[slideInRight_0.2s_ease-out]
        ${styles[toast.type]}
      `}
    >
      <Icon className="h-4 w-4 flex-shrink-0 opacity-80" />
      <span className="flex-grow">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="opacity-60 hover:opacity-100 transition ml-1"
        aria-label="Fermer la notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
