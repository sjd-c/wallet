'use client';
import { useEffect, useRef, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import { BASE, fmtDate, doConfetti } from '@/lib/utils';
import UpdateBanner from '@/components/UpdateBanner';
import Avatar from '@/components/Avatar';
import AvatarPicker from '@/components/AvatarPicker';
import './wallet.css';

const OB_LAST = 2;

export default function Wallet() {
  const [view, setView] = useState('loading');
  const [pid, setPid] = useState(null);
  const [player, setPlayer] = useState(null);
  const [bump, setBump] = useState(0);
  const [notif, setNotif] = useState('');
  const [obStep, setObStep] = useState(0);
  const [iosHint, setIosHint] = useState(false);
  const [avEdit, setAvEdit] = useState(null);     // { value } while the avatar sheet is open
  const [avSaving, setAvSaving] = useState(false);
  const notifTimer = useRef();

  useEffect(() => {
    const id = new URLSearchParams(location.search).get('id');
    if (!id) { setView('error'); return; }
    setPid(id);

    // Manifest dinamico con start_url personalizzato per PWA
    const m = {
      name: "YousCoin",
      short_name: "YousCoin",
      start_url: BASE + "/?id=" + id,
      scope: BASE + "/",
      display: "standalone",
      background_color: "#f7fffe",
      theme_color: "#1D9E75",
      icons: [
        { src: location.origin + BASE + "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
        { src: location.origin + BASE + "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
      ]
    };
    const blob = new Blob([JSON.stringify(m)], { type: "application/manifest+json" });
    document.querySelector('link[rel="manifest"]')?.setAttribute('href', URL.createObjectURL(blob));

    let prev = null;
    let first = true;
    return onValue(ref(db, 'players/' + id), s => {
      const d = s.val();
      if (!d) { setView('error'); return; }
      setPlayer(d);

      const nb = d.balance || 0;
      if (prev !== null && nb !== prev) setBump(b => b + 1);
      if (prev !== null && nb > prev) {
        const note = d.lastTx ? d.lastTx.note : '';
        setNotif('+' + (nb - prev) + ' YousCoin ricevuti! 🎉' + (note ? ' — "' + note + '"' : ''));
        clearTimeout(notifTimer.current);
        notifTimer.current = setTimeout(() => setNotif(''), 6000);
        doConfetti();
      }
      prev = nb;

      if (first) {
        first = false;
        setView(localStorage.getItem('yc_onboarded_' + id) ? 'main' : 'onboarding');
      }
    }, () => setView('error'));
  }, []);

  // iOS install hint
  useEffect(() => {
    if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone && !localStorage.getItem('yc_ih')) {
      const t = setTimeout(() => setIosHint(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  function dismissHint() {
    setIosHint(false);
    localStorage.setItem('yc_ih', '1');
  }

  function finishOnboarding() {
    localStorage.setItem('yc_onboarded_' + pid, '1');
    setView('main');
  }
  const obGoto = n => setObStep(Math.max(0, Math.min(OB_LAST, n)));
  const obNext = () => (obStep < OB_LAST ? obGoto(obStep + 1) : finishOnboarding());

  async function saveAvatar() {
    if (!avEdit.value) return;
    setAvSaving(true);
    try {
      await set(ref(db, 'players/' + pid + '/avatar'), avEdit.value);
      setAvEdit(null);
    } catch (e) {
      alert('Errore: ' + e.message);
    } finally {
      setAvSaving(false);
    }
  }

  const balance = player ? player.balance || 0 : 0;

  return (
    <>
      <UpdateBanner />

      {view === 'loading' && (
        <div id="loading">
          <img className="splash-logo" src={BASE + '/icons/youscoin.png'} alt="YousCoin" />
          <div className="splash-title">YousCoin</div>
          <div className="splash-sub">Caricamento...</div>
        </div>
      )}

      {view === 'error' && (
        <div id="error">
          <div className="err-icon"><i className="ti ti-link-off"></i></div>
          <h2>Link non valido</h2>
          <p>Controlla il link che ti è stato condiviso<br />o contatta la Banca.</p>
        </div>
      )}

      {view === 'onboarding' && (
        <div id="onboarding">
          <button className="ob-skip" style={{ visibility: obStep === OB_LAST ? 'hidden' : 'visible' }} onClick={finishOnboarding}>Salta</button>
          <div className="ob-track" style={{ transform: 'translateX(-' + (obStep * 33.3333) + '%)' }}>
            <div className="ob-slide">
              <div className="ob-coin"><img src={BASE + '/icons/youscoin-coin.png'} alt="YousCoin" /></div>
              <h1>Benvenuto in YousCoin!</h1>
              <p className="ob-lead">La moneta ufficiale del gruppo. La Banca la usa per premiare le sfide, i giochi, i piani biblici e tante altre cose.</p>
              <div className="ob-tag">Ciao, {player.name.split(' ')[0]}! 👋</div>
            </div>
            <div className="ob-slide">
              <h1 style={{ fontSize: 23 }}>Come funziona</h1>
              <div className="ob-rule-list">
                <div className="ob-rule">
                  <div className="ob-rule-ic a">🎯</div>
                  <div className="ob-rule-tx"><b>Guadagni</b> YousCoin vincendo giochi o completando sfide.</div>
                </div>
                <div className="ob-rule">
                  <div className="ob-rule-ic b">📊</div>
                  <div className="ob-rule-tx">Il tuo saldo si aggiorna <b>in tempo reale</b> ogni volta che la Banca ti invia YousCoin.</div>
                </div>
                <div className="ob-rule">
                  <div className="ob-rule-ic c">🏆</div>
                  <div className="ob-rule-tx">Accumula più YousCoin per <b>salire in classifica</b>.</div>
                </div>
              </div>
            </div>
            <div className="ob-slide">
              <h1 style={{ fontSize: 23 }}>Il tuo saldo di partenza</h1>
              <div className="ob-bal-card">
                <div className="ob-bal-lbl">Saldo attuale</div>
                <div className="ob-bal-num">{balance}</div>
                <div className="ob-bal-sub">YousCoin</div>
              </div>
              <p className="ob-lead">Da qui in poi, ogni YousCoin che ricevi apparirà qui — pronto per iniziare?</p>
            </div>
          </div>
          <div className="ob-dots">
            {[0, 1, 2].map(i => <div key={i} className={'ob-dot' + (i === obStep ? ' on' : '')} />)}
          </div>
          <div className="ob-foot">
            <button className={'ob-back' + (obStep > 0 ? ' show' : '')} onClick={() => obGoto(obStep - 1)}>Indietro</button>
            <button className={'ob-cta' + (obStep === OB_LAST ? ' gold' : '')} onClick={obNext}>
              {obStep === OB_LAST ? 'Apri il portafoglio 🚀' : 'Continua'}
            </button>
          </div>
        </div>
      )}

      {view === 'main' && (
        <div id="main">
          <div className="hdr">
            <button className="hdr-av-btn" onClick={() => setAvEdit({ value: null })} aria-label="Cambia avatar">
              <Avatar id={pid} name={player.name} avatar={player.avatar} size={36} />
              <span className="hdr-av-edit"><i className="ti ti-pencil"></i></span>
            </button>
            <span className="hdr-name">{player.name}</span>
            <span className="hdr-tag">portafoglio</span>
          </div>

          {notif && (
            <div id="notif">
              <i className="ti ti-confetti"></i>
              <span id="notif-text">{notif}</span>
            </div>
          )}

          <div className="bal-card">
            <div className="bal-lbl">💰 saldo attuale</div>
            <div key={bump} className={'bal-num' + (bump ? ' bump' : '')}>{balance}</div>
            <div className="bal-coin">YousCoin</div>
          </div>

          <div className="sec-lbl">cronologia</div>
          <History history={player.history} />
        </div>
      )}

      {avEdit && (
        <div className="av-sheet-bg" onClick={e => { if (e.target === e.currentTarget) setAvEdit(null); }}>
          <div className="av-sheet">
            <div className="av-sheet-hdr">
              <span className="av-sheet-title">Scegli il tuo avatar</span>
              <button className="ios-close" onClick={() => setAvEdit(null)} aria-label="Chiudi"><i className="ti ti-x"></i></button>
            </div>
            <AvatarPicker value={avEdit.value} onChange={v => setAvEdit({ value: v })} />
            <button className="av-save" disabled={!avEdit.value || avSaving} onClick={saveAvatar}>
              <i className="ti ti-check"></i> {avSaving ? 'Salvataggio...' : 'Salva avatar'}
            </button>
          </div>
        </div>
      )}

      {iosHint && (
        <div id="ios-hint">
          <div className="ios-row">
            <i className="ti ti-device-mobile-down" style={{ fontSize: 22, color: 'var(--primary)' }}></i>
            <span className="ios-text">Installa YousCoin sulla schermata Home!</span>
            <button className="ios-close" onClick={dismissHint} aria-label="Chiudi"><i className="ti ti-x"></i></button>
          </div>
          <div className="ios-steps">Tocca <strong>Condividi</strong> ↗ poi <strong>Aggiungi alla schermata Home</strong></div>
        </div>
      )}
    </>
  );
}

function History({ history }) {
  if (!history) {
    return <div className="tx-list"><div className="empty">Nessuna transazione ancora</div></div>;
  }
  const txs = Object.entries(history).sort(([, a], [, b]) => (b.timestamp || 0) - (a.timestamp || 0));
  return (
    <div className="tx-list">
      {txs.slice(0, 50).map(([key, tx]) => {
        const pos = tx.amount >= 0;
        return (
          <div className="tx-item" key={key}>
            <div className={'tx-ic ' + (pos ? 'in' : 'out')}><i className={'ti ti-arrow-' + (pos ? 'up' : 'down')}></i></div>
            <div className="tx-inf">
              <div className="tx-title">{tx.note || '—'}</div>
              <div className="tx-date">{fmtDate(tx.timestamp)}</div>
            </div>
            <div className={'tx-val ' + (pos ? 'pos' : 'neg')}>{(pos ? '+' : '') + tx.amount}</div>
          </div>
        );
      })}
    </div>
  );
}
