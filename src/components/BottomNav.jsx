// Mobile bottom navigation bar using Lucide icons.
import { useState } from 'react';
import { BookOpen, BarChart3 } from 'lucide-react';
import { C } from '../constants/theme.js';

export function BottomNav({ screen, setScreen }) {
  const [pressed, setPressed] = useState(null);

  const items = [
    { key: 'home',     Icon: BookOpen,  label: 'Journal'  },
    { key: 'insights', Icon: BarChart3, label: 'Insights' },
  ];

  return (
    <div style={{
      flexShrink: 0, height: 72,
      background: C.surface,
      borderTop: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      paddingBottom: 8,
    }}>
      {items.map(({ key, Icon, label }) => {
        const active = screen === key;
        return (
          <button
            key={key}
            onClick={() => setScreen(key)}
            onMouseDown={() => setPressed(key)}
            onMouseUp={() => setPressed(null)}
            onTouchStart={() => setPressed(key)}
            onTouchEnd={() => setPressed(null)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '8px 28px',
              color: active ? C.accent : C.muted,
              transform: pressed === key ? 'scale(0.92)' : 'scale(1)',
              transition: 'color 0.15s, transform 0.1s',
            }}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
            <span style={{ fontSize: 11, fontWeight: active ? 600 : 400 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
