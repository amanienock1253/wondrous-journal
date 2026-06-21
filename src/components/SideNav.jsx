import { useState } from 'react';
import { Home, Compass, FolderKanban, TrendingUp, Sparkles, Settings, LogOut } from 'lucide-react';

const SB = {
  bg:     '#1A2B1A',
  hover:  'rgba(247,243,238,0.06)',
  active: 'rgba(201,168,76,0.14)',
  text:   '#D4C5A9',
  muted:  'rgba(212,197,169,0.42)',
  border: 'rgba(247,243,238,0.08)',
  accent: '#C9A84C',
};

const NAV_ITEMS = [
  { key: 'home',     Icon: Home,         label: 'Home'     },
  { key: 'discover', Icon: Compass,      label: 'Discover' },
  { key: 'projects', Icon: FolderKanban, label: 'Projects' },
  { key: 'insights', Icon: TrendingUp,   label: 'Insights' },
  { key: 'ai',       Icon: Sparkles,     label: 'AI'       },
];

export function SideNav({ screen, setScreen, onSignOut, entryCount }) {
  const [hovered, setHovered]   = useState(null);
  const [signOutH, setSignOutH] = useState(false);

  return (
    <div style={{
      width: 220, flexShrink: 0, height: '100vh',
      background: SB.bg, display: 'flex', flexDirection: 'column',
      userSelect: 'none',
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 20px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 11,
          background: `linear-gradient(145deg, ${SB.accent}, #E8D08A)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: `0 4px 12px ${SB.accent}35`,
        }}>
          <Sparkles size={17} color={SB.bg} strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15.5, fontWeight: 700, color: SB.text, lineHeight: 1.2 }}>
            Wondrous
          </div>
          <div style={{ fontSize: 9, color: SB.muted, letterSpacing: '0.13em', textTransform: 'uppercase', marginTop: 2 }}>
            Innovation Journal
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: SB.border, margin: '0 16px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px 0' }}>
        {NAV_ITEMS.map(({ key, Icon, label }) => {
          const active  = screen === key;
          const isHov   = hovered === key && !active;
          const isDiscover = key === 'discover';

          return (
            <button
              key={key}
              onClick={() => setScreen(key)}
              onMouseEnter={() => setHovered(key)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 12px', marginBottom: 2,
                borderRadius: 10, border: 'none',
                background: active
                  ? isDiscover ? 'rgba(201,168,76,0.18)' : SB.active
                  : isHov ? SB.hover : 'transparent',
                color: active ? SB.accent : SB.text,
                fontSize: 13.5, fontWeight: active ? 600 : 400,
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
              }}
            >
              <Icon size={15} strokeWidth={active ? 2.2 : 1.75} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {key === 'discover' && entryCount > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 600, color: SB.muted,
                  background: 'rgba(247,243,238,0.08)', borderRadius: 20, padding: '1px 8px',
                }}>
                  {entryCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ height: 1, background: SB.border, margin: '0 16px 8px' }} />

      {/* Settings */}
      <div style={{ padding: '0 10px 4px' }}>
        <button
          onClick={() => setScreen('settings')}
          onMouseEnter={() => setHovered('settings')}
          onMouseLeave={() => setHovered(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '9px 12px', marginBottom: 2,
            borderRadius: 10, border: 'none',
            background: screen === 'settings' ? SB.active : hovered === 'settings' ? SB.hover : 'transparent',
            color: screen === 'settings' ? SB.accent : SB.text,
            fontSize: 13.5, fontWeight: screen === 'settings' ? 600 : 400,
            cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
          }}
        >
          <Settings size={15} strokeWidth={1.75} />
          <span>Settings</span>
        </button>
      </div>

      {/* Sign out */}
      <div style={{ padding: '0 12px 28px' }}>
        <button
          onClick={onSignOut}
          onMouseEnter={() => setSignOutH(true)}
          onMouseLeave={() => setSignOutH(false)}
          style={{
            width: '100%', background: signOutH ? SB.hover : 'transparent',
            border: `1px solid ${SB.border}`, borderRadius: 10,
            padding: '9px 14px', color: SB.muted, fontSize: 13,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9,
            transition: 'all 0.12s',
          }}
        >
          <LogOut size={14} strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </div>
  );
}
