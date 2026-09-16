/**
 * components/ui/Spinner.tsx
 * ─────────────────────────────────────────────────────────────
 * Indicateur de chargement réutilisable.
 * Taille et couleur configurables via props.
 */

interface SpinnerProps {
  /** Taille en pixels (défaut: 24) */
  size?: number;
  /** Classe Tailwind de couleur de bordure (défaut: border-amber-700) */
  colorClass?: string;
  className?: string;
}

export function Spinner({ size = 24, colorClass = 'border-amber-700', className = '' }: SpinnerProps) {
  return (
    <div
      className={`rounded-full border-[3px] border-t-transparent animate-spin ${colorClass} ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Chargement..."
    />
  );
}

/** Spinner centré plein écran — pour les pages en cours de chargement */
export function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <Spinner size={32} className="text-emerald-400" />
    </div>
  );
}
