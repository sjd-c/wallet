'use client';
import { useState } from 'react';
import { ref, get, set, push, serverTimestamp } from 'firebase/database';
import { db } from '@/lib/firebase';
import { privateId, randomTail } from '@/lib/utils';
import { useToast } from '@/lib/useToast';
import UpdateBanner from '@/components/UpdateBanner';
import AvatarPicker from '@/components/AvatarPicker';
import './setup.css';

const BASE_URL = 'sjd-c.github.io/wallet/?id=';

export default function Setup() {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [balance, setBalance] = useState('0');
  const [avatar, setAvatar] = useState(null);
  const [tail, setTail] = useState(randomTail);
  const [pickerKey, setPickerKey] = useState(0);
  const [idError, setIdError] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null);   // { name, link }
  const [copied, setCopied] = useState(false);
  const [toastEl, showToast] = useToast();

  function onNameInput(v) {
    setName(v);
    setId(v.trim() ? privateId(v, tail) : '');
    setIdError(false);
  }
  function onIdInput(v) {
    setId(v.toLowerCase().replace(/[^a-z0-9-]/g, ''));
    setIdError(false);
  }

  async function createPlayer() {
    const n = name.trim();
    const pid = id.trim();
    const bal = parseInt(balance) || 0;

    if (!n) { showToast('Inserisci il nome del giocatore'); return; }
    if (!pid) { showToast('Inserisci un ID univoco'); return; }

    setCreating(true);
    try {
      const snap = await get(ref(db, 'players/' + pid));
      if (snap.exists()) {
        setIdError(true);
        setCreating(false);
        return;
      }

      await set(ref(db, 'players/' + pid), { name: n, balance: bal, avatar: avatar || null });

      if (bal > 0) {
        await push(ref(db, 'players/' + pid + '/history'), {
          amount: bal,
          note: 'Saldo iniziale 🚀',
          timestamp: serverTimestamp()
        });
      }

      setCreated({ name: n, link: 'https://' + BASE_URL + pid });
    } catch (e) {
      showToast('Errore: ' + e.message);
      setCreating(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(created.link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => showToast('Copia manuale: ' + created.link));
  }

  function resetForm() {
    setName(''); setId(''); setBalance('0'); setAvatar(null); setPickerKey(k => k + 1); setTail(randomTail());
    setIdError(false); setCreating(false); setCreated(null);
  }

  return (
    <>
      <UpdateBanner />

      <div className="hdr">
        <a href="../" className="back-btn"><i className="ti ti-arrow-left"></i> Pannello</a>
        <span className="hdr-title">Nuovo giocatore ✨</span>
      </div>

      {!created ? (
        <div id="form-section">
          <div className="info-banner">
            <i className="ti ti-info-circle"></i>
            <div>
              <div className="info-title">Come funziona</div>
              <div className="info-sub">Crea il profilo e condividi il link privato col giocatore</div>
            </div>
          </div>

          <div className="form-area">
            <div className="form-group">
              <div className="form-lbl">nome completo</div>
              <input className="form-inp" type="text" placeholder="es. Marco" value={name} onChange={e => onNameInput(e.target.value)} />
            </div>

            <div className="form-group">
              <div className="form-lbl">ID univoco (per il link)</div>
              <input className="form-inp" type="text" placeholder="es. marco" value={id} onChange={e => onIdInput(e.target.value)} />
              <div className="form-hint">generato con un codice casuale, così nessuno può indovinare il link</div>
              {idError && <div className="form-error">ID già in uso, scegliene un altro</div>}
            </div>

            <div className="form-group">
              <div className="form-lbl">saldo iniziale (YousCoin)</div>
              <input className="form-inp" type="number" placeholder="0" min="0" value={balance} onChange={e => setBalance(e.target.value)} />
            </div>

            <div className="form-group">
              <div className="form-lbl">avatar (facoltativo)</div>
              <AvatarPicker key={pickerKey} value={avatar} onChange={setAvatar} />
            </div>

            <div className="link-box">
              <div className="link-lbl">🔗 link privato generato</div>
              <div className="link-url">{BASE_URL}<strong>{id || '...'}</strong></div>
            </div>

            <button className="create-btn" disabled={creating} onClick={createPlayer}>
              {creating
                ? <><i className="ti ti-loader-2" style={{ animation: 'spin .8s linear infinite' }}></i> Creazione...</>
                : <><i className="ti ti-user-check"></i> Crea giocatore</>}
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: '#ccc', fontWeight: 600, marginTop: 10 }}>
              <i className="ti ti-lock" style={{ verticalAlign: '-2px' }}></i> il link sarà l'accesso privato al portafoglio
            </p>
          </div>
        </div>
      ) : (
        <div id="success">
          <div className="success-icon">🎉</div>
          <div className="success-name">{created.name}</div>
          <div className="success-sub">Giocatore creato!<br />Condividi il link privato tramite WhatsApp o messaggio.</div>
          <div className="success-link" style={{ width: '100%' }}>
            <div className="success-link-lbl">🔗 link privato</div>
            <div className="success-link-url">{created.link}</div>
          </div>
          <button className={'copy-btn' + (copied ? ' copied' : '')} onClick={copyLink}>
            {copied ? <><i className="ti ti-check"></i> Copiato!</> : <><i className="ti ti-copy"></i> Copia link</>}
          </button>
          <button className="new-player-btn" onClick={resetForm}>
            <i className="ti ti-user-plus"></i> Aggiungi un altro giocatore
          </button>
          <a href="../" className="back-panel-btn">
            <i className="ti ti-layout-dashboard"></i> Torna al pannello
          </a>
        </div>
      )}

      {toastEl}
    </>
  );
}
