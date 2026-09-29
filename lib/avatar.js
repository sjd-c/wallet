// DiceBear "adventurer" avatars. We store only { seed, gender } and rebuild the URL.
const range = (prefix, n) => Array.from({ length: n }, (_, i) => prefix + String(i + 1).padStart(2, '0'));

const HAIR = {
  m: range('short', 19),
  f: range('long', 26),
};

const BG = 'd0f2e7,fdf3dc,ddeeff,ede8fb,ffe8e8,ffe0f5';

export function avatarUrl(av) {
  if (!av || !av.seed) return null;
  const hair = HAIR[av.gender] || [...HAIR.m, ...HAIR.f];
  return 'https://api.dicebear.com/9.x/adventurer/svg?seed=' + encodeURIComponent(av.seed)
    + '&hair=' + hair.join(',') + '&backgroundColor=' + BG + '&radius=50';
}

export function randomSeeds(n = 3) {
  return Array.from({ length: n }, () => Math.random().toString(36).slice(2, 10));
}
