'use client';

import { useEffect } from 'react';

export function ConsoleBlocker() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const noop = () => {};
      ['log', 'debug', 'info', 'warn', 'error'].forEach((method) => {
        // @ts-ignore
        console[method] = noop;
      });

      // Attempt to clear console if a user tries to open devtools
      setInterval(() => {
        console.clear();
      }, 2000);
    }
  }, []);

  return null;
}
