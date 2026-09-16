'use client';

import dynamic from 'next/dynamic';
import QRCodeLoader from './QRCodeLoader';

const WorldMapClient = dynamic(() => import('./WorldMapClient'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '850px',
        margin: '0 auto',
        backgroundColor: '#F5F5F0',
        border: '2px solid #1A1A1A',
        borderRadius: '16px',
        padding: '40px 20px',
        minHeight: '260px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <QRCodeLoader
        size={64}
        color="#1A1A1A"
        scanColor="#f59e0b"
        label="CHARGEMENT DE LA CARTE..."
      />
    </div>
  ),
});

export default function WorldMap() {
  return <WorldMapClient />;
}
