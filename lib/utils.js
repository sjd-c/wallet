// Must match basePath in next.config.mjs
export const BASE = '/wallet';

export function palette(id) {
  const p = [
    ['#d0f2e7','#0F6E56'],['#FDF3DC','#9a6200'],['#ddeeff','#1a5cbf'],
    ['#ede8fb','#5b28b8'],['#ffe8e8','#b81a1a'],['#ffe0f5','#b0186e']
  ];
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % p.length;
  return p[h];
}

export function slugify(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function fmtDate(ts) {
  if (!ts) return '';
  const d = new Date(ts), now = new Date(), diff = now - d;
  const time = d.toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'});
  if (diff < 86400000) return 'oggi, ' + time;
  if (diff < 172800000) return 'ieri, ' + time;
  return d.toLocaleDateString('it-IT', {day:'2-digit', month:'2-digit'}) + ', ' + time;
}

export function doConfetti() {
  const cols = ['#1D9E75','#EF9F27','#4a90e2','#e05555','#9b6de8','#f5d87a','#ff9f43'];
  for (let i = 0; i < 60; i++) {
    const d = document.createElement('div');
    const sz = 6 + Math.random() * 9;
    const dur = 1.5 + Math.random() * 2;
    d.style.cssText = 'position:fixed;width:' + sz + 'px;height:' + sz + 'px;'
      + 'background:' + cols[Math.floor(Math.random() * cols.length)] + ';'
      + 'top:-10px;left:' + (Math.random() * 100) + 'vw;'
      + 'border-radius:' + (Math.random() > .5 ? '50%' : '3px') + ';'
      + 'animation:confettiFall ' + dur + 's ease-out forwards;'
      + 'animation-delay:' + (Math.random() * .7) + 's;'
      + 'z-index:9999;pointer-events:none';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), (dur + 1) * 1000);
  }
}
