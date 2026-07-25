'use client';

/**
 * components/ui/Modal.tsx
 * ─────────────────────────────────────────────────────────────
 * Modal générique avec overlay, animation et fermeture au clic extérieur.
 * Remplace les `confirm()` natifs et les overlays inline dans les pages.
 *
 * Usage :
 *   <Modal isOpen={open} onClose={() => setOpen(false)} title="Confirmation">
 *     <p>Contenu du modal</p>
 *   </Modal>
 */

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Largeur max du panel (défaut: max-w-md) */
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Fermer sur Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Bloquer le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // Overlay semi-transparent
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={(event) => {
        // Fermer si clic sur l'overlay (pas sur le panel)
        if (!panelRef.current?.contains(event.target as Node)) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Panel */}
      <div
        ref={panelRef}
        className={`
          bg-white border border-slate-200 rounded-3xl w-full ${maxWidth}
          p-6 shadow-2xl
          animate-[fadeIn_0.15s_ease-out]
        `}
      >
        {/* Header du modal */}
        <div className="flex items-start justify-between mb-5">
          {title && (
            <h3 className="font-bold text-slate-900 text-lg leading-tight">{title}</h3>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition p-1 hover:bg-slate-50 rounded-lg ml-auto"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

/**
 * Boutons de confirmation standard (Annuler / Confirmer)
 * À utiliser dans le corps d'un Modal pour les actions destructives.
 */
interface ConfirmActionsProps {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  confirmVariant?: 'amber' | 'red';
  isLoading?: boolean;
}

export function ConfirmActions({
  onCancel,
  onConfirm,
  confirmLabel = 'Confirmer',
  confirmVariant = 'amber',
  isLoading = false,
}: ConfirmActionsProps) {
  const confirmStyles = confirmVariant === 'red'
    ? 'bg-red-600 hover:bg-red-500 shadow-red-100'
    : 'bg-amber-700 hover:bg-amber-600 shadow-amber-100';

  return (
    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
      <button
        type="button"
        onClick={onCancel}
        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition"
      >
        Annuler
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isLoading}
        className={`text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition disabled:opacity-50 ${confirmStyles}`}
      >
        {confirmLabel}
      </button>
    </div>
  );
}
