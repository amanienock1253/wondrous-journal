import { useState, useEffect } from 'react';
import {
  Sparkles, LogOut, Bell, Moon, Shield, Trash2,
  ChevronRight, Globe, Lock, Database, Palette, Zap,
  FileText, Star, Sun, CheckCircle2, ChevronLeft,
} from 'lucide-react';
import { C } from '../constants/theme.js';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

// ── Helpers ──────────────────────────────────────────────────────────────────
function getLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
  catch { return fallback; }
}
function setLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{
        fontSize: 10.5, fontWeight: 800, color: C.muted,
        letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 8,
      }}>
        {title}
      </div>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function Row({ Icon, iconBg, iconColor, label, sub, onClick, danger, right, first }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '13px 18px',
        borderTop: first ? 'none' : `1px solid ${C.border}`,
        cursor: onClick ? 'pointer' : 'default',
        background: hov && onClick ? `${C.accent}05` : 'transparent',
        transition: 'background 0.12s',
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: danger ? '#FBE9E7' : (iconBg || `${iconColor || C.accent}14`),
        border: `1px solid ${danger ? '#C94A3A18' : `${iconColor || C.accent}1A`}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={15} color={danger ? C.error : (iconColor || C.accent)} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: danger ? C.error : C.text }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 1.5, lineHeight: 1.4 }}>{sub}</div>}
      </div>
      {right}
      {onClick && !right && <ChevronRight size={14} color={C.border} strokeWidth={2} />}
    </div>
  );
}

function Toggle({ on, onToggle, disabled }) {
  return (
    <div
      onClick={disabled ? undefined : onToggle}
      style={{
        width: 42, height: 24, borderRadius: 12, flexShrink: 0,
        background: on ? C.accent : C.border,
        position: 'relative', cursor: disabled ? 'default' : 'pointer',
        transition: 'background 0.2s', opacity: disabled ? 0.4 : 1,
      }}
    >
      <div style={{
        position: 'absolute', top: 3,
        left: on ? 21 : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        transition: 'left 0.18s',
      }} />
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export function SettingsScreen({ onSignOut, userEmail, entries = [], onDeleteAll, aiSuggestions, onToggleAI, showToast, onBack }) {
  const { isDesktop } = useBreakpoint();

  // Persisted preferences
  const [darkMode,       setDarkMode]     = useState(() => getLS('wj_dark',         false));
  const [notifications,  setNotif]        = useState(() => getLS('wj_notif',        false));
  const [autoSave,       setAutoSave]     = useState(() => getLS('wj_autosave',     true));
  const [notifStatus,    setNotifStatus]  = useState('idle'); // idle | granted | denied | unsupported
  const [confirmDelete,  setConfirm]      = useState(false);
  const [deleting,       setDeleting]     = useState(false);
  const [exported,       setExported]     = useState(false);

  // Check notification permission on mount
  useEffect(() => {
    if (!('Notification' in window)) { setNotifStatus('unsupported'); return; }
    if (Notification.permission === 'granted') { setNotifStatus('granted'); setNotif(true); }
    else if (Notification.permission === 'denied') { setNotifStatus('denied'); }
  }, []);

  // Apply dark mode class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    setLS('wj_dark', next);
    showToast?.(next ? 'Dark mode on' : 'Dark mode off');
  };

  const toggleNotif = async () => {
    if (notifStatus === 'unsupported') {
      showToast?.('Notifications not supported in this browser');
      return;
    }
    if (notifStatus === 'denied') {
      showToast?.('Notifications blocked — enable in browser settings');
      return;
    }
    if (!notifications) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotif(true); setNotifStatus('granted');
        setLS('wj_notif', true);
        // Schedule a daily reminder using the visible notification
        new Notification('Wondrous Journal', {
          body: "What did you discover today? Don't forget to capture it.",
          icon: '/icon-192.png',
        });
        showToast?.('Daily reminders enabled');
      } else {
        setNotifStatus('denied');
        showToast?.('Permission denied — check browser settings');
      }
    } else {
      setNotif(false);
      setLS('wj_notif', false);
      showToast?.('Reminders turned off');
    }
  };

  const toggleAutoSave = () => {
    const next = !autoSave;
    setAutoSave(next);
    setLS('wj_autosave', next);
    showToast?.(next ? 'Auto-save enabled' : 'Auto-save disabled');
  };

  const handleExport = () => {
    if (entries.length === 0) { showToast?.('No discoveries to export'); return; }
    const payload = {
      exported_at: new Date().toISOString(),
      total: entries.length,
      discoveries: entries,
    };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wondrous-discoveries-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2500);
    showToast?.(`${entries.length} discoveries exported`);
  };

  const handleDeleteAll = async () => {
    setDeleting(true);
    await onDeleteAll?.();
    setDeleting(false);
    setConfirm(false);
  };

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'WJ';
  const px = isDesktop ? '36px 48px 48px' : '52px 20px 120px';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
      <div className="hide-scroll" style={{ flex: 1, overflowY: 'auto', padding: px }}>

        {/* Title */}
        <div style={{ marginBottom: 26, display: 'flex', alignItems: 'center', gap: 14 }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                background: C.surface, border: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: C.sub,
                boxShadow: '0 1px 4px rgba(26,23,20,0.06)',
              }}
            >
              <ChevronLeft size={18} strokeWidth={2} />
            </button>
          )}
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: isDesktop ? 32 : 26, fontWeight: 700, color: C.text }}>
              Settings
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Customize your experience</div>
          </div>
        </div>

        {/* Profile hero */}
        <div style={{
          background: 'linear-gradient(135deg, #1C1410 0%, #2A1C14 60%, #1C2214 100%)',
          borderRadius: 20, padding: '22px', marginBottom: 26,
          display: 'flex', alignItems: 'center', gap: 16,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `${C.accent}08` }} />
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: `linear-gradient(135deg, ${C.accent}, #E8D08A)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1C1410',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: 'rgba(247,243,232,0.95)', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userEmail || 'Your account'}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: `${C.accent}20`, border: `1px solid ${C.accent}30`,
              borderRadius: 6, padding: '2px 8px',
            }}>
              <Star size={10} color={C.accent} strokeWidth={0} fill={C.accent} />
              <span style={{ fontSize: 10.5, color: C.accent, fontWeight: 700, letterSpacing: '0.05em' }}>WONDROUS PRO</span>
            </div>
          </div>
        </div>

        {/* ── Preferences ── */}
        <Section title="Preferences">
          <Row
            first Icon={darkMode ? Sun : Moon} iconColor="#5B8DD9"
            label="Dark Mode"
            sub={darkMode ? 'Dark theme active' : 'Switch to dark interface'}
            onClick={toggleDark}
            right={<Toggle on={darkMode} onToggle={toggleDark} />}
          />
          <Row
            Icon={Bell} iconColor="#FF6B3A"
            label="Daily Reminders"
            sub={
              notifStatus === 'denied' ? 'Blocked — enable in browser settings'
              : notifStatus === 'granted' && notifications ? 'You\'ll be nudged to capture daily'
              : 'Get nudged to capture daily'
            }
            onClick={toggleNotif}
            right={<Toggle on={notifications} onToggle={toggleNotif} disabled={notifStatus === 'denied' || notifStatus === 'unsupported'} />}
          />
          <Row
            Icon={Zap} iconColor={C.accent}
            label="AI Suggestions"
            sub={aiSuggestions ? 'Shown on Home screen' : 'Hidden from Home screen'}
            onClick={() => onToggleAI?.(!aiSuggestions)}
            right={<Toggle on={!!aiSuggestions} onToggle={() => onToggleAI?.(!aiSuggestions)} />}
          />
          <Row
            Icon={Database} iconColor="#2E7D52"
            label="Auto-save Drafts"
            sub={autoSave ? 'In-progress entries save locally' : 'Drafts will not be saved'}
            onClick={toggleAutoSave}
            right={<Toggle on={autoSave} onToggle={toggleAutoSave} />}
          />
        </Section>

        {/* ── Discovery ── */}
        <Section title="Discovery">
          <Row
            first Icon={Globe} iconColor="#5B8DD9"
            label="Default View"
            sub="Timeline grouped by date"
            right={<span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>Timeline</span>}
          />
          <Row
            Icon={exported ? CheckCircle2 : FileText}
            iconColor={exported ? '#2E7D52' : C.accent}
            label="Export Discoveries"
            sub={entries.length > 0
              ? `Download all ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} as JSON`
              : 'No discoveries to export yet'}
            onClick={handleExport}
            right={exported
              ? <span style={{ fontSize: 12, color: '#2E7D52', fontWeight: 600 }}>Done</span>
              : <ChevronRight size={14} color={C.border} strokeWidth={2} />
            }
          />
          <Row
            Icon={Lock} iconColor="#8B6FBF"
            label="Private Entries"
            sub="Biometric lock for sensitive notes"
            right={<span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>Coming soon</span>}
          />
        </Section>

        {/* ── Account ── */}
        <Section title="Account">
          <Row
            first Icon={Sparkles} iconColor={C.accent}
            label="Signed in"
            sub={userEmail || 'Your account'}
          />
          <Row
            Icon={Shield} iconColor="#2E7D52"
            label="Privacy & Security"
            sub="Your data stays private and secure"
            right={<span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>Supabase RLS</span>}
          />
          <Row
            Icon={Palette} iconColor="#8B6FBF"
            label="Sync & Backup"
            sub="Real-time sync across all devices"
            right={<span style={{ fontSize: 12, color: '#2E7D52', fontWeight: 600 }}>Active</span>}
          />
          <Row
            Icon={LogOut} iconColor={C.error}
            label="Sign out"
            sub="Sign out of your account"
            onClick={onSignOut}
            danger
          />
        </Section>

        {/* ── Danger zone ── */}
        <Section title="Danger Zone">
          {!confirmDelete ? (
            <Row
              first Icon={Trash2} iconColor={C.error}
              label="Delete all discoveries"
              sub={entries.length > 0
                ? `Permanently delete all ${entries.length} discoveries`
                : 'No discoveries to delete'}
              onClick={entries.length > 0 ? () => setConfirm(true) : undefined}
              danger
            />
          ) : (
            <div style={{ padding: '18px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.error, marginBottom: 5 }}>Are you sure?</div>
              <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.65, marginBottom: 14 }}>
                This will permanently delete all {entries.length} discoveries. This cannot be undone.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setConfirm(false)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 12,
                    background: C.bg, border: `1.5px solid ${C.border}`,
                    color: C.sub, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={deleting}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 12,
                    background: deleting ? C.border : '#FBE9E7',
                    border: `1.5px solid ${C.error}30`,
                    color: deleting ? C.muted : C.error,
                    fontSize: 13.5, fontWeight: 700,
                    cursor: deleting ? 'default' : 'pointer',
                  }}
                >
                  {deleting ? 'Deleting…' : 'Delete all'}
                </button>
              </div>
            </div>
          )}
        </Section>

        {/* App footer */}
        <div style={{ textAlign: 'center', paddingBottom: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, margin: '0 auto 10px',
            background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={15} color={C.accent} strokeWidth={2} />
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 3 }}>
            Wondrous Journal
          </div>
          <div style={{ fontSize: 11.5, color: C.muted }}>Version 1.0.0 · Built with curiosity</div>
        </div>

      </div>
    </div>
  );
}
