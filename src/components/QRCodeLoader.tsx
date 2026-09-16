'use client';

import React, { useMemo } from 'react';

export interface QRCodeLoaderProps {
  /** Taille du loader en pixels (défaut: 64) */
  size?: number;
  /** Couleur principale du QR code (défaut: '#0f172a') */
  color?: string;
  /** Couleur de la ligne de scan (défaut: '#f59e0b' - Ambre MenuFid) */
  scanColor?: string;
  /** Texte optionnel sous le loader */
  label?: string;
  /** Classes Tailwind / CSS additionnelles */
  className?: string;
}

const QRCodeLoader: React.FC<QRCodeLoaderProps> = ({
  size = 64,
  color = '#0f172a',
  scanColor = '#f59e0b',
  label,
  className = '',
}) => {
  // Génération déterministe des petits blocs pour éviter les erreurs d'hydratation
  const blocks = useMemo(() => {
    return Array.from({ length: 100 })
      .map((_, i) => ({
        x: (i % 10) * 10,
        y: Math.floor(i / 10) * 10,
        id: i,
      }))
      .filter(({ x, y }) => {
        // Exclure les zones des 3 repères (yeux du QR code)
        const isTopLeft = x < 40 && y < 40;
        const isTopRight = x > 50 && y < 40;
        const isBottomLeft = x < 40 && y > 50;

        if (isTopLeft || isTopRight || isBottomLeft) return false;

        // Formule déterministe pour créer un motif naturel de QR code
        return ((x * 13 + y * 7) % 10) > 3;
      })
      .map((block) => ({
        ...block,
        animationDelay: `${((block.id * 7) % 20) * 0.1}s`,
      }));
  }, []);

  return (
    <div className={`inline-flex flex-col items-center justify-center gap-3 ${className}`}>
      <div style={{ position: 'relative', width: size, height: size }}>
        {/* Keyframe Animations */}
        <style>
          {`
            @keyframes qr-flash {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.2; }
            }
            @keyframes qr-scan {
              0% { top: -5%; opacity: 0; }
              15% { opacity: 1; }
              85% { opacity: 1; }
              100% { top: 105%; opacity: 0; }
            }
            .qr-module {
              animation: qr-flash 1.3s infinite ease-in-out;
            }
            .qr-scan-line {
              position: absolute;
              left: 0;
              width: 100%;
              height: 2.5px;
              background-color: ${scanColor};
              box-shadow: 0 0 12px 2px ${scanColor};
              animation: qr-scan 1.9s infinite linear;
              z-index: 10;
              border-radius: 2px;
            }
          `}
        </style>

        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill={color}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Œil Supérieur Gauche */}
          <path d="M0,0 h30 v30 h-30 z M5,5 h20 v20 h-20 z M10,10 h10 v10 h-10 z" fillRule="evenodd" />

          {/* Œil Supérieur Droit */}
          <path d="M70,0 h30 v30 h-30 z M75,5 h20 v20 h-20 z M80,10 h10 v10 h-10 z" fillRule="evenodd" />

          {/* Œil Inférieur Gauche */}
          <path d="M0,70 h30 v30 h-30 z M5,75 h20 v20 h-20 z M10,80 h10 v10 h-10 z" fillRule="evenodd" />

          {/* Blocs de données (clignotants) */}
          {blocks.map((block) => (
            <rect
              key={block.id}
              x={block.x}
              y={block.y}
              width="10"
              height="10"
              className="qr-module"
              style={{ animationDelay: block.animationDelay }}
            />
          ))}
        </svg>

        {/* Ligne laser du scanner */}
        <div className="qr-scan-line" />
      </div>

      {label && (
        <span className="font-mono text-xs tracking-widest uppercase font-semibold text-slate-500 animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
};

export default QRCodeLoader;
