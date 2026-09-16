'use client';

import React from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { useLanguage } from '@/lib/i18n';

// URL d'un fichier TopoJSON standard contenant les frontières du monde
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const DistributionMap: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div style={styles.container}>
      {/* Carte du monde en mode rectangle compact */}
      <ComposableMap 
        projection="geoMercator" 
        projectionConfig={{ scale: 115, center: [0, 15] }}
        width={800}
        height={320}
        style={{ width: "100%", height: "auto", maxHeight: "300px" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              // On identifie la France et l'Algérie
              const name = geo.properties.name;
              const isFrance = name === "France";
              const isAlgeria = name === "Algeria";
              const isHighlighted = isFrance || isAlgeria;
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isHighlighted ? "#000000" : "#E2E4E8"} // Noir pour la France et l'Algérie, Gris clair pour le reste
                  stroke="#FFFFFF" // Bordures blanches pour séparer les pays
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: isHighlighted ? "#000000" : "#D1D5DB" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Boîte de légende (Bottom Right) */}
      <div style={styles.legendBox}>
        <div style={styles.legendTitle}>2 {t('distributions', 'distributions')}</div>
        <div style={styles.legendSubtitle}>{t('across_2_countries', 'dans 2 pays')}</div>
      </div>
    </div>
  );
};

// Styles CSS en ligne pour reproduire le design rectangle compact
const styles = {
  container: {
    position: 'relative' as const,
    width: '100%',
    maxWidth: '850px',
    margin: '0 auto',
    backgroundColor: '#F5F5F0', // Couleur de fond légèrement crème
    border: '2px solid #1A1A1A', // Bordure noire nette
    borderRadius: '16px',
    padding: '8px 12px',
    overflow: 'hidden' as const,
    maxHeight: '320px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendBox: {
    position: 'absolute' as const,
    bottom: '16px',
    right: '16px',
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #1A1A1A',
    borderRadius: '10px',
    padding: '8px 14px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.06)',
  },
  legendTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: '1.2',
  },
  legendSubtitle: {
    fontSize: '11px',
    color: '#6B7280',
    marginTop: '2px',
  }
};

export default DistributionMap;
