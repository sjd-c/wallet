'use client';
import { useEffect, useRef, useState } from 'react';
import { BASE } from '@/lib/utils';

// Registers the service worker and shows a banner when a new version is waiting.
export default function UpdateBanner() {
  const [visible, setVisible] = useState(false);
  const swReg = useRef(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register(BASE + '/sw.js').then(reg => {
      swReg.current = reg;
      if (reg.waiting && reg.active) setVisible(true);
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) setVisible(true);
        });
      });
    }).catch(() => {});
    let reloading = false;
    const onChange = () => {
      if (reloading) return;
      reloading = true;
      location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onChange);
    return () => navigator.serviceWorker.removeEventListener('controllerchange', onChange);
  }, []);

  function applyUpdate() {
    if (swReg.current && swReg.current.waiting) swReg.current.waiting.postMessage('SKIP_WAITING');
  }

  if (!visible) return null;
  return <div id="update-banner" onClick={applyUpdate}><i className="ti ti-refresh"></i> Nuova versione disponibile — tocca per aggiornare</div>;
}
