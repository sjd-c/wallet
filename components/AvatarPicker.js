'use client';
import { useEffect, useState } from 'react';
import { avatarUrl, randomSeeds } from '@/lib/avatar';

// Gender toggle + 3 generated avatars + "Genera altri". Calls onChange({ seed, gender }) or onChange(null).
export default function AvatarPicker({ value, onChange }) {
  const [gender, setGender] = useState(value?.gender || '');
  const [seeds, setSeeds] = useState([]);

  useEffect(() => { setSeeds(randomSeeds()); }, []);

  function pickGender(g) {
    setGender(g);
    setSeeds(randomSeeds());
    onChange(null);
  }
  function regenerate() {
    setSeeds(randomSeeds());
    onChange(null);
  }

  return (
    <div className="av-picker">
      <div className="av-gender">
        <button type="button" className={gender === 'm' ? 'sel' : ''} onClick={() => pickGender('m')}>
          <i className="ti ti-gender-male"></i> Maschio
        </button>
        <button type="button" className={gender === 'f' ? 'sel' : ''} onClick={() => pickGender('f')}>
          <i className="ti ti-gender-female"></i> Femmina
        </button>
      </div>

      {gender && (
        <>
          <div className="av-options">
            {seeds.map(seed => (
              <button type="button" key={seed}
                className={'av-opt' + (value?.seed === seed ? ' sel' : '')}
                onClick={() => onChange({ seed, gender })}>
                <img src={avatarUrl({ seed, gender })} alt="Avatar" />
              </button>
            ))}
          </div>
          <button type="button" className="av-more" onClick={regenerate}>
            <i className="ti ti-refresh"></i> Genera altri
          </button>
        </>
      )}
    </div>
  );
}
