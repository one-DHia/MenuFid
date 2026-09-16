'use client';

import { useEffect } from 'react';

export function ConsoleBlocker() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const noop = () => {};
      ['log', 'debug', 'info'].forEach((method) => {
        // @ts-ignore
        console[method] = noop;
      });
    }
  }, []);

  return null;
}
