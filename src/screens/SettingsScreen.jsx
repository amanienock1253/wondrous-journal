import { LogOut, Info, Sparkles } from 'lucide-react';
import { C } from '../constants/theme.js';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

export function SettingsScreen({ onSignOut, userEmail }) {
  const { isDesktop } = useBreakpoint();
  const px = isDesktop ? '36px 48px' : '52px 20px';

  const Row = ({ Icon, label, sub, onClick, danger }) => (
    <button
      onClick={onClick}
      style={{
        width: '100%', background: 'none', border: 'none', cursor: onClick ? 'pointer' : 'default',
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 20px', textAlign: 'left',
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
        background: danger ? '#FBE9E7' : C.accentDim,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} color={danger ? C.error : C.accent} strokeWidth={2} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: danger ? C.error : C.text }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{sub}</div>}
      </div>
    </button>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: px, paddingBottom: isDesktop ? undefined : 110 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: isDesktop ? 32 : 26, fontWeight: 700, color: C.text, marginBottom: 28 }}>
          Settings
        </div>

        {/* Account section */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Account
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: C.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} color={C.accent} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>Signed in</div>
                <div style={{ fontSize: 12, color: C.muted }}>{userEmail || 'Your account'}</div>
              </div>
            </div>
            <Row Icon={LogOut} label="Sign out" sub="Sign out of your account" onClick={onSignOut} danger />
          </div>
        </div>

        {/* App info */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            About
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, overflow: 'hidden' }}>
            <Row Icon={Info} label="Wondrous Journal" sub="Project 001 · Built with curiosity ✦" />
          </div>
        </div>
      </div>
    </div>
  );
}
