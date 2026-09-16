'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface Props {
  fps?: number;
  qrbox?: number;
  qrCodeSuccessCallback: (decodedText: string) => void;
  qrCodeErrorCallback?: (errorMessage: string) => void;
}

const qrcodeRegionId = 'html5qr-code-full-region';

export default function Html5QrcodePlugin(props: Props) {
  const { t } = useLanguage();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasStarted, setHasStarted] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const scanner = new Html5Qrcode(qrcodeRegionId);
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        setErrorText(null);
        await scanner.start(
          { facingMode: facingMode }, // Force back camera by default
          {
            fps: props.fps || 10,
            qrbox: { width: props.qrbox || 250, height: props.qrbox || 250 },
          },
          (decodedText) => {
            if (isMounted) {
              props.qrCodeSuccessCallback(decodedText);
            }
          },
          () => {
            // Ignorer les erreurs d'analyse par trame
          }
        );
        if (isMounted) setHasStarted(true);
      } catch (err: any) {
        console.warn('[Html5Qrcode back camera error, fallback]:', err);
        // Si la caméra arrière n'existe pas (ex: laptop), on essaie sans contrainte
        try {
          await scanner.start(
            { facingMode: 'user' },
            {
              fps: props.fps || 10,
              qrbox: { width: props.qrbox || 250, height: props.qrbox || 250 },
            },
            (decodedText) => {
              if (isMounted) props.qrCodeSuccessCallback(decodedText);
            },
            () => {}
          );
          if (isMounted) setHasStarted(true);
        } catch (fallbackErr: any) {
          if (isMounted) {
            setErrorText('Impossible d\'accéder à la caméra. Vérifiez les autorisations de votre navigateur.');
          }
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scanner.isScanning) {
        scanner.stop().then(() => {
          scanner.clear();
        }).catch((err) => {
          console.error('Error stopping scanner:', err);
        });
      } else {
        scanner.clear();
      }
      scannerRef.current = null;
    };
  }, [facingMode, props]);

  const toggleCamera = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
    }
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between px-2">
        <span className="text-[11px] font-black uppercase text-neutral-600 flex items-center gap-1">
          <Camera className="w-3.5 h-3.5" />
          <span>{t('camera_label', 'Caméra')} : {facingMode === 'environment' ? t('camera_rear', 'Arrière') : t('camera_selfie', 'Avant (Selfie)')}</span>
        </span>

        <button
          type="button"
          onClick={toggleCamera}
          className="neo-category-pill text-[10px] py-1 px-2.5 flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>{t('switch_camera', 'Changer de caméra')}</span>
        </button>
      </div>

      <div
        id={qrcodeRegionId}
        className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border-2 border-black bg-black min-h-[260px] relative"
      />

      {errorText && (
        <p className="text-xs font-bold text-red-600 text-center">{errorText}</p>
      )}
    </div>
  );
}
