'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, db } from '@/lib/firebase';
import './bankgate.css';

// Host pages are only for the Banca: a signed-in account listed under hosts/{uid}.
// If no Banca exists yet, the first signed-in account can claim the role (rules enforce this).
export default function BankGate({ children }) {
  const [user, setUser] = useState(undefined);   // undefined = loading, null = signed out
  const [role, setRole] = useState(null);        // 'bank' | 'unclaimed' | 'denied'
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => onAuthStateChanged(auth, async u => {
    setUser(u);
    setRole(null);
    if (!u) return;
    try {
      if ((await get(ref(db, 'hosts/' + u.uid))).exists()) { setRole('bank'); return; }
      const any = await get(ref(db, 'hosts')).catch(() => null);
      setRole(any && !any.exists() ? 'unclaimed' : 'denied');
    } catch {
      setRole('denied');
    }
  }), []);

  async function login(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pw);
    } catch {
      setErr('Email o password non corretti');
    } finally {
      setBusy(false);
    }
  }

  async function claim() {
    setBusy(true); setErr('');
    try {
      await set(ref(db, 'hosts/' + user.uid), { email: user.email || '' });
      setRole('bank');
    } catch (e) {
      setErr('Errore: ' + e.message);
    } finally {
      setBusy(false);
    }
  }

  if (user === undefined || (user && !role)) {
    return <div className="gate"><i className="ti ti-loader-2 gate-spin"></i></div>;
  }

  if (!user) {
    return (
      <form className="gate" onSubmit={login}>
        <div className="gate-ic"><i className="ti ti-building-bank"></i></div>
        <div className="gate-title">Pannello Banca</div>
        <div className="gate-sub">Accedi per gestire giocatori e YousCoin.</div>
        <input className="gate-inp" type="email" autoComplete="username" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="gate-inp" type="password" autoComplete="current-password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} />
        {err && <div className="gate-err">{err}</div>}
        <button className="gate-btn" disabled={busy || !email || !pw}>
          <i className="ti ti-login-2"></i> {busy ? 'Accesso...' : 'Accedi'}
        </button>
      </form>
    );
  }

  if (role === 'unclaimed') {
    return (
      <div className="gate">
        <div className="gate-ic"><i className="ti ti-building-bank"></i></div>
        <div className="gate-title">Attiva la Banca</div>
        <div className="gate-sub">Nessuna Banca è ancora configurata. Rendi <b>{user.email}</b> l'account della Banca: solo lui potrà gestire YousCoin.</div>
        {err && <div className="gate-err">{err}</div>}
        <button className="gate-btn" disabled={busy} onClick={claim}><i className="ti ti-check"></i> Diventa la Banca</button>
        <button className="gate-link" onClick={() => signOut(auth)}>Esci</button>
      </div>
    );
  }

  if (role === 'denied') {
    return (
      <div className="gate">
        <div className="gate-ic"><i className="ti ti-lock"></i></div>
        <div className="gate-title">Accesso non autorizzato</div>
        <div className="gate-sub"><b>{user.email}</b> non è l'account della Banca.</div>
        <button className="gate-link" onClick={() => signOut(auth)}>Esci e cambia account</button>
      </div>
    );
  }

  return children;
}

export function bankSignOut() {
  return signOut(auth);
}
