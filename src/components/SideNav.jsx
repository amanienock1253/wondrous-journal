import { useState } from 'react';
import { Home, BookOpen, BarChart3, Settings, LogOut, Sparkles, Plus } from 'lucide-react';

const SB = {
  bg:     '#1A2B1A',
  hover:  'rgba(247,243,238,0.06)',
  active: 'rgba(201,168,76,0.14)',
  text:   '#D4C5A9',
  muted:  'rgba(212,197,169,0.45)',
  border: 'rgba(247,243,238,0.09)',
  accent: '#C9A84C',
};

export function SideNav({ screen, setScreen, onSignOut, entryCount, onCapture }) {
  const [hoveredKey, setHoveredKey] = useState(null);
  const [signOutH, setSignOutH]     = useState(false);

  const navItems = [
    { key: 'home',     Icon: Home,      label: 'Home'                         },
    { key: 'entries',  Icon: BookOpen,  label: 'Entries',  badge: entryCount  },
    { key: 'insights', Icon: BarChart3, label: 'Insights'                     },
    { key: 'settings', Icon: Settings,  label: 'Settings'                     },
  ];

  return (
    <div style={{ width: 220, flexShrink: 0, height: '100vh', background: SB.bg, display: 'flex', flexDirection: 'column' }}>

      {/* Logo */}
      <div style={{ padding: '26px 20px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 11,
          background: `linear-gradient(145deg, ${SB.accent}, #E8D08A)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Sparkles size={18} color={SB.bg} strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: SB.text, lineHeight: 1.2 }}>
            Wondrous
          </div>
          <div style={{ fontSize: 10, color: SB.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
            Journal
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: SB.border }} />

      {/* New Entry CTA */}
      <div style={{ padding: '14px 16px 10px' }}>
        <button
          onClick={onCapture}
          style={{
            width: '100%', background: SB.accent, border: 'none', borderRadius: 12,
            padding: '10px 14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            color: SB.bg, fontSize: 13, fontWeight: 700,
            boxShadow: `0 4px 14px ${SB.accent}40`,
            transition: 'opacity 0.15s',
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          New Entry
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 12px' }}>
        {navItems.map(({ key, Icon, label, badge }) => {
          const active  = screen === key;
          const hovered = hoveredKey === key && !active;
          return (
            <button
              key={key}
              onClick={() => setScreen(key)}
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 12px', marginBottom: 2,
                borderRadius: 10, border: 'none',
                background: active ? SB.active : hovered ? SB.hover : 'transparent',
                color: active ? SB.accent : SB.text,
                fontSize: 14, fontWeight: active ? 600 : 400,
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.13s',
              }}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 1.75} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge != null && (
                <span style={{ fontSize: 11, fontWeight: 600, color: SB.muted, background: 'rgba(247,243,238,0.08)', borderRadius: 20, padding: '1px 8px' }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sign out */}
      <div style={{ padding: '12px 16px 28px', borderTop: `1px solid ${SB.border}` }}>
        <button
          onClick={onSignOut}
          onMouseEnter={() => setSignOutH(true)}
          onMouseLeave={() => setSignOutH(false)}
          style={{
            width: '100%',
            background: signOutH ? 'rgba(247,243,238,0.06)' : 'transparent',
            border: `1px solid ${SB.border}`, borderRadius: 10, padding: '9px 14px',
            color: SB.muted, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 9, transition: 'all 0.13s',
          }}
        >
          <LogOut size={14} strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </div>
  );
}
