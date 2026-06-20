import { useState } from 'react';
import { Home, BookOpen, Plus, BarChart3, Settings } from 'lucide-react';
import { C } from '../constants/theme.js';

export function BottomNav({ screen, setScreen, onCapture }) {
  const [pressed, setPressed] = useState(null);

  const items = [
    { key: 'home',     Icon: Home,      label: 'Home'     },
    { key: 'entries',  Icon: BookOpen,  label: 'Entries'  },
    { key: 'fab',      fab: true                          },
    { key: 'insights', Icon: BarChart3, label: 'Insights' },
    { key: 'settings', Icon: Settings,  label: 'Settings' },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 18,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 40px)',
      maxWidth: 390,
      height: 66,
      background: C.surface,
      borderRadius: 32,
      border: `1px solid ${C.border}`,
      boxShadow: '0 8px 32px rgba(28,25,23,0.13), 0 2px 10px rgba(28,25,23,0.07)',
      display: 'flex',
      alignItems: 'center',
      zIndex: 200,
    }}>
      {items.map((item) => {
        if (item.fab) {
          return (
            <div key="fab" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <button
                onClick={onCapture}
                onMouseDown={() => setPressed('fab')}
                onMouseUp={() => setPressed(null)}
                onTouchStart={() => setPressed('fab')}
                onTouchEnd={() => setPressed(null)}
                style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: `linear-gradient(145deg, ${C.accent} 0%, #D4BC6A 100%)`,
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 6px 20px ${C.accent}65`,
                  transform: pressed === 'fab' ? 'scale(0.88)' : 'scale(1)',
                  transition: 'transform 0.12s ease',
                  marginTop: -20,
                }}
              >
                <Plus size={26} color="#fff" strokeWidth={2.5} />
              </button>
            </div>
          );
        }

        const active = screen === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setScreen(item.key)}
            onMouseDown={() => setPressed(item.key)}
            onMouseUp={() => setPressed(null)}
            onTouchStart={() => setPressed(item.key)}
            onTouchEnd={() => setPressed(null)}
            style={{
              flex: 1, background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '10px 0 6px',
              position: 'relative',
              color: active ? C.accent : C.muted,
              transform: pressed === item.key ? 'scale(0.85)' : 'scale(1)',
              transition: 'color 0.15s, transform 0.1s',
            }}
          >
            {active && (
              <div style={{
                position: 'absolute', top: 6, width: 20, height: 3,
                background: C.accent, borderRadius: 2,
              }} />
            )}
            <item.Icon size={21} strokeWidth={active ? 2.5 : 1.75} />
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
