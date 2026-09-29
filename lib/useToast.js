'use client';
import { useRef, useState } from 'react';

export function useToast() {
  const [toast, setToast] = useState({ msg: '', show: false });
  const timer = useRef();
  function showToast(msg) {
    setToast({ msg, show: true });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }
  const toastEl = <div id="toast" className={toast.show ? 'show' : ''}>{toast.msg}</div>;
  return [toastEl, showToast];
}
