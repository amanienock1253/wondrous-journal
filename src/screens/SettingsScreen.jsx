import { useState, useEffect } from 'react';
import {
  Sparkles, LogOut, Bell, Moon, Shield, Trash2,
  ChevronRight, Globe, Lock, Database, Palette, Zap,
  FileText, Star, Sun, CheckCircle2, ChevronLeft,
  Key, Eye, EyeOff, AlertCircle, Loader, User, Phone,
} from 'lucide-react';
import { testGeminiKey } from '../lib/gemini.js';
import { testGroqKey } from '../lib/groq.js';
import { saveGeminiKeyToSupabase, deleteGeminiKeyFromSupabase } from '../hooks/useAppConfig.js';
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
export function SettingsScreen({ onSignOut, userEmail, isAdmin, entries = [], onDeleteAll, aiSuggestions, onToggleAI, showToast, onBack, profile, onUpdateProfile }) {
  const { isDesktop } = useBreakpoint();

  // Persisted preferences
  const [darkMode,       setDarkMode]     = useState(() => getLS('wj_dark',         false));
  const [notifications,  setNotif]        = useState(() => getLS('wj_notif',        false));
  const [autoSave,       setAutoSave]     = useState(() => getLS('wj_autosave',     true));
  const [notifStatus,    setNotifStatus]  = useState('idle'); // idle | granted | denied | unsupported
  const [confirmDelete,  setConfirm]      = useState(false);
  const [deleting,       setDeleting]     = useState(false);
  const [exported,       setExported]     = useState(false);

  // Profile
  const [displayName,   setDisplayName]  = useState(profile?.display_name || '');
  const [waPhone,       setWaPhone]      = useState(profile?.whatsapp_phone || '');
  const [profileSaving, setProfileSave]  = useState(false);
  const [profileSaved,  setProfileSaved] = useState(false);

  // Groq API key (primary — free tier, recommended)
  const [groqKey,        setGroqKey]     = useState(() => localStorage.getItem('wj_groq_key') || '');
  const [groqInput,      setGroqInput]   = useState(() => localStorage.getItem('wj_groq_key') || '');
  const [showGroqKey,    setShowGroqKey] = useState(false);
  const [groqStatus,     setGroqStatus]  = useState(localStorage.getItem('wj_groq_key') ? 'saved' : 'idle');
  const [groqError,      setGroqError]   = useState('');

  // Gemini API key (secondary — quota issues in some regions)
  const [geminiKey,      setGeminiKey]   = useState(() => localStorage.getItem('wj_gemini_key') || '');
  const [geminiInput,    setGeminiInput] = useState(() => localStorage.getItem('wj_gemini_key') || '');
  const [showKey,        setShowKey]     = useState(false);
  const [keyStatus,      setKeyStatus]   = useState(localStorage.getItem('wj_gemini_key') ? 'saved' : 'idle');
  const [keyError,       setKeyError]    = useState('');

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

  const handleSaveProfile = async () => {
    if (!displayName.trim()) return;
    setProfileSave(true);
    const ok = await onUpdateProfile?.({ display_name: displayName.trim(), whatsapp_phone: waPhone.trim() });
    setProfileSave(false);
    if (ok !== false) { setProfileSaved(true); showToast?.('Profile updated'); setTimeout(() => setProfileSaved(false), 2500); }
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

  const handleSaveGroqKey = async () => {
    const key = groqInput.trim();
    if (!key) return;
    setGroqStatus('testing');
    setGroqError('');
    try {
      await testGroqKey(key);
      localStorage.setItem('wj_groq_key', key);
      setGroqKey(key);
      setGroqStatus('valid');
      showToast?.('Groq AI active');
    } catch (err) {
      setGroqStatus('error');
      setGroqError(err.message);
    }
  };

  const handleClearGroqKey = () => {
    localStorage.removeItem('wj_groq_key');
    setGroqKey('');
    setGroqInput('');
    setGroqStatus('idle');
    setGroqError('');
    showToast?.('Groq key removed');
  };

  const handleDeleteAll = async () => {
    setDeleting(true);
    await onDeleteAll?.();
    setDeleting(false);
    setConfirm(false);
  };

  const handleSaveKey = async () => {
    const key = geminiInput.trim();
    if (!key) return;
    setKeyStatus('testing');
    setKeyError('');
    try {
      await testGeminiKey(key);
      // Save locally for this device
      localStorage.setItem('wj_gemini_key', key);
      // Save to Supabase so all users benefit transparently
      await saveGeminiKeyToSupabase(key);
      setGeminiKey(key);
      setKeyStatus('valid');
      showToast?.('Gemini active — all users now use your key');
    } catch (err) {
      setKeyStatus('error');
      setKeyError(err.message);
    }
  };

  const handleClearKey = async () => {
    try {
      await deleteGeminiKeyFromSupabase();
    } catch {}
    localStorage.removeItem('wj_gemini_key');
    setGeminiKey('');
    setGeminiInput('');
    setKeyStatus('idle');
    setKeyError('');
    showToast?.('Gemini key removed — all users revert to local AI');
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

        {/* ── Profile ── */}
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: C.muted, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 8 }}>
            Profile
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '18px 18px 20px' }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                <User size={13} color={C.muted} strokeWidth={2} />
                <span style={{ fontSize: 12, fontWeight: 600, color: C.sub }}>Display Name</span>
              </div>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="How others see you in Commons"
                style={{
                  width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 12,
                  padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
                  color: C.text, background: C.bg, outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                <Phone size={13} color={C.muted} strokeWidth={2} />
                <span style={{ fontSize: 12, fontWeight: 600, color: C.sub }}>WhatsApp Number</span>
                <span style={{ fontSize: 11, color: C.muted }}>(optional)</span>
              </div>
              <input
                value={waPhone}
                onChange={e => setWaPhone(e.target.value)}
                placeholder="+ country code + number (e.g. +255 712 345 678)"
                type="tel"
                style={{
                  width: '100%', borderRadius: 12,
                  border: `1.5px solid ${waPhone && !waPhone.trim().startsWith('+') ? C.error : C.border}`,
                  padding: '10px 14px', fontSize: 14, fontFamily: 'inherit',
                  color: C.text, background: C.bg, outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = waPhone && !waPhone.trim().startsWith('+') ? C.error : C.accent}
                onBlur={e => e.target.style.borderColor = waPhone && !waPhone.trim().startsWith('+') ? C.error : C.border}
              />
              {waPhone && !waPhone.trim().startsWith('+') ? (
                <div style={{ fontSize: 11.5, color: C.error, marginTop: 5, fontWeight: 500 }}>
                  Must start with a country code — e.g. +255 (Tanzania), +254 (Kenya), +1 (USA)
                </div>
              ) : (
                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 5 }}>
                  Start with your country code — e.g. +255 712 345 678. Lets people connect from Commons.
                </div>
              )}
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={!displayName.trim() || profileSaving}
              style={{
                padding: '10px 20px', borderRadius: 12, border: 'none',
                background: profileSaved
                  ? '#2E7D52' : displayName.trim()
                  ? 'linear-gradient(135deg, #1C1410, #2A1C14)' : C.border,
                color: profileSaved ? '#fff' : displayName.trim() ? C.accent : C.muted,
                fontSize: 13.5, fontWeight: 700,
                cursor: displayName.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.15s',
              }}
            >
              {profileSaving ? <><Loader size={13} strokeWidth={2} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving…</>
               : profileSaved ? <><CheckCircle2 size={13} strokeWidth={2.5} /> Saved</>
               : 'Save Profile'}
            </button>
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

        {/* ── AI Integration — admin only ── */}
        {isAdmin && <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: C.muted, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 8 }}>
            AI Integration
          </div>

          {/* ── Groq (recommended) ── */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${C.border}` }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: '#2E7D5214', border: '1px solid #2E7D521A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={15} color="#2E7D52" strokeWidth={2} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Groq AI</div>
                  <div style={{
                    fontSize: 9.5, fontWeight: 800, color: '#2E7D52', letterSpacing: '0.07em',
                    background: '#2E7D5214', border: '1px solid #2E7D521A',
                    borderRadius: 4, padding: '1px 5px',
                  }}>RECOMMENDED</div>
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 1.5 }}>
                  {groqKey ? 'Llama 3 is active — fast and free' : 'Free tier, no billing needed — get key at console.groq.com'}
                </div>
              </div>
              {groqStatus === 'valid' || (groqStatus === 'saved' && groqKey) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#2E7D5212', border: '1px solid #2E7D5230', borderRadius: 7, padding: '3px 9px' }}>
                  <CheckCircle2 size={11} color="#2E7D52" strokeWidth={2.5} />
                  <span style={{ fontSize: 11, color: '#2E7D52', fontWeight: 700 }}>Active</span>
                </div>
              ) : groqStatus === 'error' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${C.error}12`, border: `1px solid ${C.error}30`, borderRadius: 7, padding: '3px 9px' }}>
                  <AlertCircle size={11} color={C.error} strokeWidth={2.5} />
                  <span style={{ fontSize: 11, color: C.error, fontWeight: 700 }}>Error</span>
                </div>
              ) : (
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 500, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: '3px 9px' }}>
                  Not set
                </div>
              )}
            </div>
            <div style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 8 }}>Groq API Key</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type={showGroqKey ? 'text' : 'password'}
                    value={groqInput}
                    onChange={e => { setGroqInput(e.target.value); setGroqStatus(groqKey ? 'saved' : 'idle'); setGroqError(''); }}
                    placeholder="gsk_…"
                    style={{
                      width: '100%', background: C.bg,
                      border: `1.5px solid ${groqStatus === 'error' ? C.error : groqStatus === 'valid' ? '#2E7D52' : C.border}`,
                      borderRadius: 12, padding: '10px 42px 10px 14px',
                      fontSize: 13.5, color: C.text, outline: 'none',
                    }}
                  />
                  <button onClick={() => setShowGroqKey(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 2 }}>
                    {showGroqKey ? <EyeOff size={15} strokeWidth={1.75} /> : <Eye size={15} strokeWidth={1.75} />}
                  </button>
                </div>
                <button
                  onClick={handleSaveGroqKey}
                  disabled={!groqInput.trim() || groqStatus === 'testing'}
                  style={{
                    padding: '10px 16px', borderRadius: 12, border: 'none',
                    background: groqInput.trim() && groqStatus !== 'testing' ? 'linear-gradient(135deg, #1C3A20, #2E7D52)' : C.border,
                    color: groqInput.trim() && groqStatus !== 'testing' ? '#fff' : C.muted,
                    fontSize: 13, fontWeight: 700, cursor: groqInput.trim() && groqStatus !== 'testing' ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  {groqStatus === 'testing'
                    ? <><Loader size={13} strokeWidth={2} style={{ animation: 'spin 0.8s linear infinite' }} /> Testing…</>
                    : groqStatus === 'valid' || (groqStatus === 'saved' && groqKey === groqInput.trim())
                    ? <><CheckCircle2 size={13} strokeWidth={2.5} /> Saved</>
                    : 'Save & Test'}
                </button>
              </div>
              {groqStatus === 'error' && groqError && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, background: `${C.error}0D`, border: `1px solid ${C.error}25`, borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
                  <AlertCircle size={14} color={C.error} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12.5, color: C.error, lineHeight: 1.5 }}>{groqError}</span>
                </div>
              )}
              {groqKey && (
                <button onClick={handleClearGroqKey} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 10, padding: '7px 14px', fontSize: 12.5, color: C.muted, cursor: 'pointer', marginBottom: 10 }}>
                  Remove Groq key
                </button>
              )}
              <div style={{ padding: '10px 14px', background: '#2E7D520A', border: '1px solid #2E7D5220', borderRadius: 10 }}>
                <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.65 }}>
                  Free key at{' '}<span style={{ color: '#2E7D52', fontWeight: 600 }}>console.groq.com</span>{' '}→ API Keys → Create key. Uses Llama 3.3 70B — smarter and faster than free Gemini.
                </div>
              </div>
            </div>
          </div>

          {/* ── Gemini (secondary) ── */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${C.border}` }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: `${C.accent}14`, border: `1px solid ${C.accent}1A`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Key size={15} color={C.accent} strokeWidth={2} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Google Gemini API</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 1.5 }}>
                  {geminiKey ? 'Gemini is configured (used if no Groq key)' : 'Alternative — may have quota issues in some regions'}
                </div>
              </div>
              {keyStatus === 'valid' || (keyStatus === 'saved' && geminiKey) ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#2E7D5212', border: '1px solid #2E7D5230', borderRadius: 7, padding: '3px 9px' }}>
                  <CheckCircle2 size={11} color="#2E7D52" strokeWidth={2.5} />
                  <span style={{ fontSize: 11, color: '#2E7D52', fontWeight: 700 }}>Saved</span>
                </div>
              ) : keyStatus === 'error' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${C.error}12`, border: `1px solid ${C.error}30`, borderRadius: 7, padding: '3px 9px' }}>
                  <AlertCircle size={11} color={C.error} strokeWidth={2.5} />
                  <span style={{ fontSize: 11, color: C.error, fontWeight: 700 }}>Error</span>
                </div>
              ) : (
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 500, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: '3px 9px' }}>
                  Not set
                </div>
              )}
            </div>
            <div style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 8 }}>Gemini API Key</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={geminiInput}
                    onChange={e => { setGeminiInput(e.target.value); setKeyStatus(geminiKey ? 'saved' : 'idle'); setKeyError(''); }}
                    placeholder="AQ… or AIza…"
                    style={{
                      width: '100%', background: C.bg,
                      border: `1.5px solid ${keyStatus === 'error' ? C.error : keyStatus === 'valid' ? '#2E7D52' : C.border}`,
                      borderRadius: 12, padding: '10px 42px 10px 14px',
                      fontSize: 13.5, color: C.text, outline: 'none',
                    }}
                  />
                  <button onClick={() => setShowKey(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 2 }}>
                    {showKey ? <EyeOff size={15} strokeWidth={1.75} /> : <Eye size={15} strokeWidth={1.75} />}
                  </button>
                </div>
                <button
                  onClick={handleSaveKey}
                  disabled={!geminiInput.trim() || keyStatus === 'testing'}
                  style={{
                    padding: '10px 16px', borderRadius: 12, border: 'none',
                    background: geminiInput.trim() && keyStatus !== 'testing' ? 'linear-gradient(135deg, #1C1410, #2A1C14)' : C.border,
                    color: geminiInput.trim() && keyStatus !== 'testing' ? C.accent : C.muted,
                    fontSize: 13, fontWeight: 700, cursor: geminiInput.trim() && keyStatus !== 'testing' ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  {keyStatus === 'testing'
                    ? <><Loader size={13} strokeWidth={2} style={{ animation: 'spin 0.8s linear infinite' }} /> Testing…</>
                    : keyStatus === 'valid' || (keyStatus === 'saved' && geminiKey === geminiInput.trim())
                    ? <><CheckCircle2 size={13} strokeWidth={2.5} /> Saved</>
                    : 'Save & Test'}
                </button>
              </div>
              {keyStatus === 'error' && keyError && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, background: `${C.error}0D`, border: `1px solid ${C.error}25`, borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
                  <AlertCircle size={14} color={C.error} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12.5, color: C.error, lineHeight: 1.5 }}>{keyError}</span>
                </div>
              )}
              {geminiKey && (
                <button onClick={handleClearKey} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 10, padding: '7px 14px', fontSize: 12.5, color: C.muted, cursor: 'pointer', marginBottom: 10 }}>
                  Remove Gemini key
                </button>
              )}
              <div style={{ padding: '10px 14px', background: C.accentDim, border: `1px solid ${C.accent}25`, borderRadius: 10 }}>
                <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.65 }}>
                  Get key at{' '}<span style={{ color: C.accent, fontWeight: 600 }}>aistudio.google.com</span>{' '}→ Create API Key. Both AQ. and AIza. prefixes are valid.
                </div>
              </div>
            </div>
          </div>
        </div>

        }

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
