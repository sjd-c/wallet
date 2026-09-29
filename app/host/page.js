'use client';
import { useEffect, useRef, useState } from 'react';
import { ref, onValue, push, update, set, remove, increment, serverTimestamp } from 'firebase/database';
import { db } from '@/lib/firebase';
import { palette, initials } from '@/lib/utils';
import { useToast } from '@/lib/useToast';
import UpdateBanner from '@/components/UpdateBanner';
import './host.css';

const byName = players => (a, b) => players[a].name.localeCompare(players[b].name);

export default function Host() {
  const [players, setPlayers] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [send, setSend] = useState(null);       // { tutti, ids: [] } while the send modal is open
  const [stepInput, setStepInput] = useState('10');
  const [nota, setNota] = useState('');
  const [sending, setSending] = useState(false);
  const [edit, setEdit] = useState(null);       // { id, name }
  const [del, setDel] = useState(null);         // { id, name }
  const [resetOpen, setResetOpen] = useState(false);
  const [toastEl, showToast] = useToast();
  const editInp = useRef();

  useEffect(() => onValue(ref(db, 'players'), snap => setPlayers(snap.val() || {})), []);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  useEffect(() => {
    if (edit) setTimeout(() => editInp.current?.focus(), 100);
  }, [!!edit]);

  const ids = players ? Object.keys(players).sort(byName(players)) : [];
  const total = ids.reduce((s, id) => s + (players[id].balance || 0), 0);

  // ── Send ──
  const n = parseInt(stepInput, 10);
  const stepVal = isNaN(n) ? 0 : n;
  const neg = stepVal < 0;

  function openSend(tutti, ids) {
    setSend({ tutti, ids });
    setStepInput('10');
    setNota('');
  }
  function toggleTutti() {
    setSend(s => ({ tutti: !s.tutti, ids: !s.tutti ? [] : s.ids }));
  }
  function toggleChip(id) {
    setSend(s => ({ tutti: false, ids: s.ids.includes(id) ? s.ids.filter(x => x !== id) : [...s.ids, id] }));
  }
  function changeStep(delta) {
    setStepInput(String(stepVal + delta));
  }

  async function confirmSend() {
    if (stepVal === 0) { showToast('Inserisci un valore diverso da 0'); return; }
    const targets = send.tutti ? ids : send.ids;
    if (!targets.length) { showToast('Seleziona almeno un destinatario'); return; }
    setSending(true);
    const note = nota.trim() || '—';
    const updates = {};
    targets.forEach(id => {
      const txKey = push(ref(db, 'players/' + id + '/history')).key;
      updates['players/' + id + '/balance'] = increment(stepVal);
      updates['players/' + id + '/history/' + txKey] = { amount: stepVal, note, timestamp: serverTimestamp() };
      updates['players/' + id + '/lastTx'] = { amount: stepVal, note, timestamp: serverTimestamp() };
    });
    try {
      await update(ref(db), updates);
      setSend(null);
      showToast(targets.length + (targets.length === 1 ? ' giocatore' : ' giocatori') + ' aggiornati ✅');
    } catch (e) {
      showToast('Errore: ' + e.message);
    } finally {
      setSending(false);
    }
  }

  // ── Edit ──
  async function confirmEdit() {
    const newName = edit.name.trim();
    if (!newName) { showToast('Inserisci un nome'); return; }
    try {
      await set(ref(db, 'players/' + edit.id + '/name'), newName);
      setEdit(null);
      showToast('Nome aggiornato ✅');
    } catch (e) { showToast('Errore: ' + e.message); }
  }

  // ── Delete ──
  async function confirmDelete() {
    if (!del) return;
    try {
      await remove(ref(db, 'players/' + del.id));
      setDel(null); showToast('Giocatore eliminato');
    } catch (e) { showToast('Errore: ' + e.message); }
  }

  // ── Reset anno ──
  async function confirmReset() {
    try {
      const updates = {};
      ids.forEach(id => {
        updates['players/' + id + '/balance'] = 0;
        updates['players/' + id + '/history'] = null;
        updates['players/' + id + '/lastTx'] = null;
      });
      await update(ref(db), updates);
      setResetOpen(false); showToast('Anno resettato ✅');
    } catch (e) { showToast('Errore: ' + e.message); }
  }

  const dest = !send ? '—' : send.tutti ? 'Tutti i giocatori'
    : (send.ids.map(id => players[id] ? players[id].name.split(' ')[0] : id).join(', ') || '—');
  const overlayClick = close => e => { if (e.target === e.currentTarget) close(); };

  return (
    <>
      <UpdateBanner />

      <div className="hdr">
        <i className="ti ti-layout-dashboard" style={{ fontSize: 22, color: '#1D9E75' }}></i>
        <span className="hdr-title">Pannello Host</span>
        <a href="setup/" className="new-btn"><i className="ti ti-user-plus"></i> Nuovo giocatore</a>
        <div className="menu-wrap">
          <button className="menu-btn" onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }}><i className="ti ti-dots-vertical"></i></button>
          <div className={'menu-dd' + (menuOpen ? ' open' : '')}>
            <button onClick={() => { setMenuOpen(false); setResetOpen(true); }}><i className="ti ti-refresh"></i> Reset anno</button>
          </div>
        </div>
      </div>

      <div className="summary-row">
        <div className="sum-card">
          <div className="sum-num">{players ? ids.length : '—'}</div>
          <div className="sum-lbl">giocatori</div>
        </div>
        <div className="sum-card">
          <div className="sum-num" style={{ color: '#EF9F27' }}>{players ? total.toLocaleString('it-IT') : '—'}</div>
          <div className="sum-lbl">YousCoin totali</div>
        </div>
      </div>

      <div className="send-all" onClick={() => openSend(true, [])}>
        <i className="ti ti-send"></i>
        <div className="send-all-info">
          <div className="send-all-title">Invia a tutti 🚀</div>
          <div className="send-all-sub">stesso valore per tutti</div>
        </div>
        <button className="send-all-btn">Invia ↗</button>
      </div>

      <div className="sec-lbl">tutti i saldi</div>
      <div id="plist">
        {!players ? <div className="loading-row">Caricamento...</div>
          : !ids.length ? <div className="empty-state"><i className="ti ti-plant-2" style={{ display: 'block', fontSize: 40, color: '#bfe8da', marginBottom: 6 }}></i>Nessun giocatore ancora<br />Tocca <strong>Nuovo</strong> per crearne uno.</div>
          : ids.map(id => {
            const p = players[id];
            const [bg, col] = palette(id);
            return (
              <div className="p-row" key={id}>
                <div className="p-av" style={{ background: bg, color: col }}>{initials(p.name)}</div>
                <span className="p-name"><span>{p.name}</span><button className="edit-btn" onClick={() => setEdit({ id, name: p.name })}><i className="ti ti-pencil"></i></button></span>
                <div style={{ textAlign: 'right', marginRight: 2 }}><div className="p-bal">{p.balance || 0}</div><div className="p-bal-lbl">YC</div></div>
                <button className="send-btn" onClick={() => openSend(false, [id])}>+ invia</button>
                <button className="del-btn" onClick={() => setDel({ id, name: p.name })}><i className="ti ti-trash"></i></button>
              </div>
            );
          })}
      </div>

      {/* Send Modal */}
      <div className={'overlay' + (send ? ' open' : '')} onClick={overlayClick(() => setSend(null))}>
        <div className="modal">
          <div className="modal-hdr">
            <i className="ti ti-coin" style={{ fontSize: 22, color: '#1D9E75' }}></i>
            <span className="modal-title">Invia YousCoin</span>
            <button className="modal-close" onClick={() => setSend(null)}>✕</button>
          </div>
          <div className="form-group">
            <div className="form-lbl">destinatari</div>
            <div className="chip-grid">
              {send && (
                <>
                  <div className={'chip tutti' + (send.tutti ? ' sel' : '')} onClick={toggleTutti}>
                    <div className="chip-av"><i className="ti ti-users" style={{ fontSize: 10 }}></i></div>Tutti
                  </div>
                  {ids.map(id => {
                    const p = players[id];
                    const [bg, col] = palette(id);
                    const isSel = send.ids.includes(id);
                    return (
                      <div key={id} className={'chip' + (isSel ? ' sel' : '')} onClick={() => toggleChip(id)}>
                        <div className="chip-av" style={isSel ? undefined : { background: bg, color: col }}>{initials(p.name)}</div>
                        {p.name.split(' ')[0]}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
          <div className="form-group">
            <div className="form-lbl">valore</div>
            <div className="stepper">
              <button className="step-btn minus" onClick={() => changeStep(-5)}>−</button>
              <div className={'step-display' + (neg ? ' neg' : '')}>
                <input className={'step-num' + (neg ? ' neg' : '')} type="number" step="5" value={stepInput}
                  onFocus={e => e.target.select()} onChange={e => setStepInput(e.target.value)} />
                <div className={'step-lbl' + (neg ? ' neg' : '')}>{neg ? 'prelievo' : 'aggiunta'}</div>
              </div>
              <button className="step-btn" onClick={() => changeStep(+5)}>+</button>
            </div>
          </div>
          <div className="form-group">
            <div className="form-lbl">nota</div>
            <input className="form-inp" type="text" placeholder="es. Premio di gioco 🏆" value={nota} onChange={e => setNota(e.target.value)} />
          </div>
          <div className="preview">
            <div className="prev-lbl">✨ anteprima</div>
            <div className="prev-row">
              <span className="prev-dest">{dest}</span>
              <span className={'prev-val' + (neg ? ' neg' : '')}>{(stepVal >= 0 ? '+' : '') + stepVal + ' YC'}</span>
            </div>
            <div className="prev-note">{nota ? '"' + nota + '"' : ''}</div>
          </div>
          <button className="confirm-btn" disabled={sending} onClick={confirmSend}>
            {sending
              ? <><i className="ti ti-loader-2" style={{ animation: 'spin .8s linear infinite' }}></i> Invio...</>
              : <><i className="ti ti-check"></i> Conferma invio</>}
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <div className={'overlay' + (edit ? ' open' : '')} onClick={overlayClick(() => setEdit(null))}>
        <div className="modal">
          <div className="modal-hdr">
            <span style={{ fontSize: 20 }}>✏️</span>
            <span className="modal-title">Modifica nome</span>
            <button className="modal-close" onClick={() => setEdit(null)}>✕</button>
          </div>
          <div className="form-group">
            <div className="form-lbl">nome completo</div>
            <input ref={editInp} className="form-inp" type="text" placeholder="Nome completo"
              value={edit ? edit.name : ''} onChange={e => setEdit({ ...edit, name: e.target.value })} />
          </div>
          <button className="confirm-btn blue" onClick={confirmEdit}>
            <i className="ti ti-check"></i> Salva
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      <div className={'overlay' + (del ? ' open' : '')} onClick={overlayClick(() => setDel(null))}>
        <div className="modal del-modal">
          <div className="del-icon"><i className="ti ti-trash"></i></div>
          <h2>Elimina giocatore</h2>
          <p>Vuoi eliminare <strong>{del?.name}</strong>?<br />Saldo e cronologia andranno persi.</p>
          <div className="del-btns">
            <button className="del-cancel" onClick={() => setDel(null)}>Annulla</button>
            <button className="del-confirm" onClick={confirmDelete}>Elimina</button>
          </div>
        </div>
      </div>

      {/* Reset Anno Modal */}
      <div className={'overlay' + (resetOpen ? ' open' : '')} onClick={overlayClick(() => setResetOpen(false))}>
        <div className="modal del-modal">
          <div className="del-icon"><i className="ti ti-refresh"></i></div>
          <h2>Reset anno</h2>
          <p>Azzera saldo e cronologia di <strong>tutti i giocatori</strong>.<br />I profili verranno mantenuti. Azione irreversibile.</p>
          <div className="del-btns">
            <button className="del-cancel" onClick={() => setResetOpen(false)}>Annulla</button>
            <button className="del-confirm" onClick={confirmReset}>Reset</button>
          </div>
        </div>
      </div>

      {toastEl}
    </>
  );
}
