import { avatarUrl } from '@/lib/avatar';
import { palette, initials } from '@/lib/utils';

// Shows the player's DiceBear avatar, or coloured initials for players created before avatars existed.
export default function Avatar({ id, name, avatar, size = 34, className }) {
  const url = avatarUrl(avatar);
  const style = { width: size, height: size, borderRadius: '50%', flexShrink: 0 };
  if (url) return <img className={className} src={url} alt="" style={style} />;
  const [bg, col] = palette(id || name || '');
  return (
    <div className={className} style={{ ...style, background: bg, color: col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(size * 0.35), fontWeight: 900 }}>
      {initials(name || '?')}
    </div>
  );
}
