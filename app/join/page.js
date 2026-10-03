'use client';
import { useEffect, useState } from 'react';
import { ref, push, set, onValue, serverTimestamp } from 'firebase/database';
import { db } from '@/lib/firebase';
import { BASE } from '@/lib/utils';
import { useToast } from '@/lib/useToast';
import AvatarPicker from '@/components/AvatarPicker';
import Avatar from '@/components/Avatar';
import '../host/setup/setup.css';
import './join.css';

const REQ_KEY = 'yc_join_req';

export default function Join() {
  const [reqId, setReqId] = useState(undefined);  // undefined = still reading localStorage
  const [req, setReq] = useState(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [sending, setSending] = useState(false);
  const [toastEl, showToast] = useToast();

  useEffect(() => { setReqId(localStorage.getItem(REQ_KEY)); }, []);

  useEffect(() => {
    if (!reqId) return;
    return onValue(ref(db, 'joinRequests/' + reqId), snap => {
      if (!snap.exists()) { forget(); return; }
      setReq(snap.val());
    });
  }, [reqId]);

  function forget() {
    localStorage.removeItem(REQ_KEY);
    setReqId(null); setReq(null);
  }

  async function sendRequest() {
    const n = name.trim();
    if (!n) { showToast('Scrivi il tuo nome'); return; }
    if (!avatar) { showToast('Scegli il tuo avatar'); return; }
    setSending(true);
    try {
      const r = push(ref(db, 'joinRequests'));
      await set(r, { name: n, avatar, status: 'pending', createdAt: serverTimestamp() });
      localStorage.setItem(REQ_KEY, r.key);
      setReqId(r.key);
    } catch (e) {
      showToast('Errore: ' + e.message);
    } finally {
      setSending(false);
    }
  }

  if (reqId === undefined || (reqId && !req)) {
    return <div className="join-center"><i className="ti ti-loader-2" style={{ fontSize: 28, color: '#ccc', animation: 'spin .8s linear infinite' }}></i></div>;
  }

  if (req?.status === 'pending') {
    return (
      <div className="join-center">
        <Avatar name={req.name} avatar={req.avatar} size={96} />
        <div className="join-title">Ciao, {req.name.split(' ')[0]}!</div>
        <div className="join-sub">Richiesta inviata.<br />Aspetta che la Banca ti approvi: questa pagina si aggiornerà da sola.</div>
        <div className="join-wait"><i className="ti ti-hourglass"></i> in attesa di approvazione</div>
      </div>
    );
  }

  if (req?.status === 'approved') {
    const link = location.origin + BASE + '/?id=' + req.playerId;
    return (
      <div className="join-center">
        <Avatar name={req.name} avatar={req.avatar} size={96} />
        <div className="join-title">Sei dentro, {req.name.split(' ')[0]}!</div>
        <div className="join-sub">La Banca ti ha approvato. Questo è il tuo portafoglio YousCoin: salva il link e non condividerlo.</div>
        <div className="success-link" style={{ width: '100%' }}>
          <div className="success-link-lbl"><i className="ti ti-link"></i> il tuo link privato</div>
          <div className="success-link-url">{link}</div>
        </div>
        <a className="copy-btn join-open" href={BASE + '/?id=' + req.playerId} onClick={() => localStorage.removeItem(REQ_KEY)}>
          <i className="ti ti-wallet"></i> Apri il portafoglio
        </a>
      </div>
    );
  }

  if (req?.status === 'rejected') {
    return (
      <div className="join-center">
        <i className="ti ti-user-x" style={{ fontSize: 52, color: '#ccc' }}></i>
        <div className="join-title">Richiesta non approvata</div>
        <div className="join-sub">Parla con la Banca e riprova.</div>
        <button className="new-player-btn" onClick={forget}>Invia una nuova richiesta</button>
      </div>
    );
  }

  return (
    <div className="join-shell">
      <div className="hdr">
        <img src={BASE + '/icons/youscoin-coin.png'} alt="" style={{ width: 28, height: 28 }} />
        <span className="hdr-title">Unisciti alla nostra Banca</span>
      </div>

      <div className="form-area">
        <div className="form-group">
          <div className="form-lbl">come ti chiami?</div>
          <input className="form-inp" type="text" placeholder="es. Marco Rossi" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <div className="form-lbl">scegli il tuo avatar</div>
          <AvatarPicker value={avatar} onChange={setAvatar} />
        </div>

        <button className="create-btn" disabled={sending} onClick={sendRequest} style={{ marginTop: 8 }}>
          {sending
            ? <><i className="ti ti-loader-2" style={{ animation: 'spin .8s linear infinite' }}></i> Invio...</>
            : <><i className="ti ti-send"></i> Chiedi di entrare</>}
        </button>
        <p className="join-note">La Banca riceverà la tua richiesta. Appena approvata, avrai il tuo portafoglio YousCoin personale.</p>
      </div>

      {toastEl}
    </div>
  );
}
