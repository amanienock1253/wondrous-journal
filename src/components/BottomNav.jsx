import { useState } from 'react';
import { Home, Compass, Globe, TrendingUp, Sparkles } from 'lucide-react';
import { C } from '../constants/theme.js';

const ITEMS = [
  { key: 'home',     Icon: Home,        label: 'Home'     },
  { key: 'discover', Icon: Compass,     label: 'Discover' },
  { key: 'commons',  Icon: Globe,       label: 'Commons'  },
  { key: 'insights', Icon: TrendingUp,  label: 'Insights' },
  { key: 'ai',       Icon: Sparkles,    label: 'AI'       },
];

export function BottomNav({ screen, setScreen }) {
  const [pressed, setPressed] = useState(null);

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: 420,
      height: 64,
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRadius: 32,
      border: `1px solid ${C.border}`,
      boxShadow: '0 8px 40px rgba(26,23,20,0.11), 0 2px 8px rgba(26,23,20,0.05)',
      display: 'flex',
      alignItems: 'center',
      zIndex: 200,
      padding: '0 6px',
    }}>
      {ITEMS.map(({ key, Icon, label }) => {
        const active     = screen === key;
        const isDiscover = key === 'discover' || key === 'commons';

        return (
          <button
            key={key}
            onClick={() => setScreen(key)}
            onMouseDown={() => setPressed(key)}
            onMouseUp={() => setPressed(null)}
            onTouchStart={() => setPressed(key)}
            onTouchEnd={() => setPressed(null)}
            style={{
              flex: 1,
              height: 48,
              borderRadius: isDiscover ? 24 : 0,
              margin: isDiscover ? '0 2px' : 0,
              background: isDiscover
                ? active
                  ? 'linear-gradient(145deg, #1C1410, #2A1C14)'
                  : `${C.accent}12`
                : 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              position: 'relative',
              transform: pressed === key ? 'scale(0.86)' : 'scale(1)',
              transition: 'transform 0.1s ease, background 0.15s ease',
            }}
          >
            {active && !isDiscover && (
              <div style={{
                position: 'absolute',
                top: 4,
                width: 18,
                height: 2,
                background: C.accent,
                borderRadius: 2,
              }} />
            )}
            <Icon
              size={18}
              strokeWidth={active ? 2.2 : 1.6}
              color={
                isDiscover
                  ? active ? C.accent : C.accentDark
                  : active ? C.accent : C.muted
              }
              style={{ marginTop: active && !isDiscover ? 2 : 0 }}
            />
            <span style={{
              fontSize: 9,
              fontWeight: active ? 700 : 400,
              letterSpacing: '0.02em',
              color: isDiscover
                ? active ? C.accent : C.accentDark
                : active ? C.accent : C.muted,
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
