// Desktop sidebar navigation with a premium icon-driven design.
import { useState } from 'react';
import { BookOpen, BarChart3, LogOut, Sparkles } from 'lucide-react';
import { C } from '../constants/theme.js';

export function SideNav({ screen, setScreen, onSignOut, entryCount }) {
  const [hoveredKey, setHoveredKey] = useState(null);
  const [signOutHovered, setSignOutHovered] = useState(false);

  const navItems = [
    { key: 'home',     Icon: BookOpen,  label: 'Journal',  badge: entryCount },
    { key: 'insights', Icon: BarChart3, label: 'Insights' },
  ];

  return (
    <div style={{
      width: 224,
      flexShrink: 0,
      height: '100vh',
      background: C.surface,
      borderRight: `1px solid ${C.border}`,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* ── Logo mark + branding ── */}
      <div style={{ padding: '24px 20px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: `linear-gradient(135deg, ${C.accent}, #9B8AF8)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: `0 4px 12px ${C.accent}44`,
        }}>
          <Sparkles size={17} color="#fff" strokeWidth={2} />
        </div>
        <div>
          <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>
            Wondrous
          </div>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 1 }}>
            Project 001
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: C.border, margin: '0 0 10px' }} />

      {/* ── Nav items ── */}
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
                width: '100%', padding: '9px 12px', marginBottom: 3,
                borderRadius: 10, border: 'none',
                background: active ? C.accentDim : hovered ? `${C.muted}18` : 'transparent',
                color: active ? C.accent : hovered ? C.text : C.sub,
                fontSize: 14, fontWeight: active ? 600 : 400,
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.13s',
              }}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 1.75} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge != null && (
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: active ? C.accent : C.muted,
                  background: active ? `${C.accent}22` : C.card,
                  borderRadius: 20, padding: '1px 8px', minWidth: 22, textAlign: 'center',
                }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Sign out ── */}
      <div style={{ padding: '12px 16px 24px', borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={onSignOut}
          onMouseEnter={() => setSignOutHovered(true)}
          onMouseLeave={() => setSignOutHovered(false)}
          style={{
            width: '100%',
            background: signOutHovered ? `${C.muted}18` : 'transparent',
            border: `1px solid ${signOutHovered ? C.muted : C.border}`,
            borderRadius: 10, padding: '9px 14px',
            color: signOutHovered ? C.text : C.sub,
            fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 9,
            transition: 'all 0.13s',
          }}
        >
          <LogOut size={14} strokeWidth={1.75} />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}
