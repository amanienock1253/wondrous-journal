// Main app shell — handles auth, routing, and responsive layout (mobile / desktop / wide).
import { useMemo, useState } from 'react';
import { Lightbulb, MapPin } from 'lucide-react';
import { useAuth } from './hooks/useAuth.js';
import { useEntries } from './hooks/useEntries.js';
import { useBreakpoint } from './hooks/useBreakpoint.js';
import { AuthScreen } from './screens/AuthScreen.jsx';
import { HomeScreen } from './screens/HomeScreen.jsx';
import { CaptureScreen } from './screens/CaptureScreen.jsx';
import { ScoutScreen } from './screens/ScoutScreen.jsx';
import { DetailScreen } from './screens/DetailScreen.jsx';
import { InsightsScreen } from './screens/InsightsScreen.jsx';
import { BottomNav } from './components/BottomNav.jsx';
import { SideNav } from './components/SideNav.jsx';
import { Toast } from './components/Toast.jsx';
import { C } from './constants/theme.js';

export default function App() {
  const { session, initializing, authLoading, authError, signIn, signUp, signOut } = useAuth();
  const { isMobile, isDesktop, isWide } = useBreakpoint();

  // screen drives mobile routing; on desktop 'home'/'insights' also set the main area.
  const [screen, setScreen] = useState('home');
  const [selectedEntry, setSelectedEntry] = useState(null);
  // rightPanel: what's open in the right panel on wide desktop ('capture' | 'scout' | null)
  const [rightPanel, setRightPanel] = useState(null);
  const [toast, setToast] = useState(null);
  const [authMode, setAuthMode] = useState('signin');

  const userId = session?.user?.id;
  const { entries, error: entriesError, addEntry, updateEntry, deleteEntry } = useEntries(userId);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const showToast = (message, emoji = '✓') => {
    setToast({ message, emoji });
    window.setTimeout(() => setToast(null), 2500);
  };

  // ── Auth ────────────────────────────────────────────────────────────────
  const handleAuthSubmit = async (email, password) => {
    if (authMode === 'signin') {
      const result = await signIn(email, password);
      if (result) showToast('Welcome back!', '👋');
    } else {
      const result = await signUp(email, password);
      if (result) {
        if (result.needsConfirmation) showToast('Check your email to confirm your account', '📧');
        else showToast('Account created!', '✨');
      }
    }
  };

  // ── Navigation helpers ──────────────────────────────────────────────────
  // On wide desktop, Capture/Scout open in the right panel instead of navigating.
  const handleCaptureClick = () => {
    if (isWide) { setRightPanel('capture'); setSelectedEntry(null); }
    else setScreen('capture');
  };
  const handleScoutClick = () => {
    if (isWide) { setRightPanel('scout'); setSelectedEntry(null); }
    else setScreen('scout');
  };
  const handleOpenEntry = (entry) => {
    setSelectedEntry(entry);
    if (isWide) setRightPanel(null); // clear form panel, show detail panel
    else setScreen('detail');
  };
  // Used by SideNav — resets sub-state when switching top-level sections.
  const handleNavChange = (newScreen) => {
    setScreen(newScreen);
    setSelectedEntry(null);
    setRightPanel(null);
  };

  // ── Entry CRUD ──────────────────────────────────────────────────────────
  const handleAddEntry = async (entry) => {
    const created = await addEntry(entry);
    if (created) {
      showToast('Captured!', '💡');
      if (isWide) { setRightPanel(null); setSelectedEntry(created); }
      else setScreen('home');
    }
  };
  const handleUpdateEntry = async (entry) => {
    const updated = await updateEntry(entry);
    if (updated) showToast('Updated', '✓');
    return updated;
  };
  const handleDeleteEntry = async (id) => {
    const success = await deleteEntry(id);
    if (success) {
      setSelectedEntry(null);
      if (!isWide) setScreen('home');
      showToast('Deleted', '🗑');
    }
  };

  // ── Derived state ───────────────────────────────────────────────────────
  const currentEntry = selectedEntry
    ? entries.find((e) => e.id === selectedEntry.id) || selectedEntry
    : null;
  // The "main" section for sidebar highlighting (home or insights).
  const mainScreen = screen === 'insights' ? 'insights' : 'home';

  // ── Loading / Auth gates ────────────────────────────────────────────────
  if (initializing) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
        <div style={{ fontSize: 40 }}>✦</div>
        <div style={{ color: C.sub, fontSize: 13, animation: 'pulse 1.5s ease infinite', marginLeft: 12 }}>Loading…</div>
      </div>
    );
  }

  if (!session) {
    return (
      <AuthScreen
        mode={authMode}
        onToggleMode={() => setAuthMode((m) => (m === 'signin' ? 'signup' : 'signin'))}
        onSubmit={handleAuthSubmit}
        loading={authLoading}
        error={authError}
        toast={toast}
      />
    );
  }

  const errorBanner = entriesError && (
    <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 18px', color: '#E8614A', fontSize: 13, zIndex: 100 }}>
      {entriesError}
    </div>
  );

  // ── DESKTOP LAYOUT (≥ 768px) ───────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: C.bg, overflow: 'hidden' }}>
        <SideNav
          screen={mainScreen}
          setScreen={handleNavChange}
          onSignOut={signOut}
          entryCount={entries.length}
        />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Wide (≥1200px) + home view: 3-column split panel */}
          {isWide && screen !== 'insights' ? (
            <>
              {/* Column 2 — entry list */}
              <div style={{
                width: 360,
                flexShrink: 0,
                borderRight: `1px solid ${C.border}`,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}>
                <HomeScreen
                  entries={entries}
                  greeting={greeting}
                  compact
                  onCapture={handleCaptureClick}
                  onScout={handleScoutClick}
                  onOpen={handleOpenEntry}
                />
              </div>

              {/* Column 3 — detail / form / empty state */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                {currentEntry && !rightPanel && (
                  <DetailScreen
                    entry={currentEntry}
                    onBack={() => setSelectedEntry(null)}
                    onDelete={handleDeleteEntry}
                    onUpdate={handleUpdateEntry}
                    showToast={showToast}
                  />
                )}
                {rightPanel === 'capture' && (
                  <CaptureScreen onSave={handleAddEntry} onBack={() => setRightPanel(null)} />
                )}
                {rightPanel === 'scout' && (
                  <ScoutScreen onSave={handleAddEntry} onBack={() => setRightPanel(null)} />
                )}
                {!currentEntry && !rightPanel && <PanelEmptyState onCapture={handleCaptureClick} onScout={handleScoutClick} />}
              </div>
            </>
          ) : (
            /* Regular desktop (768–1199px) or Insights: single content column */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {mainScreen === 'home' && screen === 'home' && (
                <HomeScreen entries={entries} greeting={greeting} onCapture={handleCaptureClick} onScout={handleScoutClick} onOpen={handleOpenEntry} />
              )}
              {screen === 'capture' && <CaptureScreen onSave={handleAddEntry} onBack={() => setScreen('home')} />}
              {screen === 'scout'   && <ScoutScreen   onSave={handleAddEntry} onBack={() => setScreen('home')} />}
              {screen === 'detail'  && currentEntry && (
                <DetailScreen entry={currentEntry} onBack={() => setScreen('home')} onDelete={handleDeleteEntry} onUpdate={handleUpdateEntry} showToast={showToast} />
              )}
              {screen === 'insights' && <InsightsScreen entries={entries} />}
            </div>
          )}
        </div>

        {toast && <Toast emoji={toast.emoji} message={toast.message} />}
        {errorBanner}
      </div>
    );
  }

  // ── MOBILE LAYOUT (< 768px) ────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {screen === 'home'     && <HomeScreen entries={entries} greeting={greeting} onCapture={handleCaptureClick} onScout={handleScoutClick} onOpen={handleOpenEntry} onSignOut={signOut} />}
      {screen === 'capture'  && <CaptureScreen onSave={handleAddEntry} onBack={() => setScreen('home')} />}
      {screen === 'scout'    && <ScoutScreen   onSave={handleAddEntry} onBack={() => setScreen('home')} />}
      {screen === 'detail'   && currentEntry && <DetailScreen entry={currentEntry} onBack={() => setScreen('home')} onDelete={handleDeleteEntry} onUpdate={handleUpdateEntry} showToast={showToast} />}
      {screen === 'insights' && <InsightsScreen entries={entries} />}

      {toast && <Toast emoji={toast.emoji} message={toast.message} />}
      {['home', 'insights'].includes(screen) && <BottomNav screen={screen} setScreen={handleNavChange} />}
      {errorBanner}
    </div>
  );
}

// Empty state shown in the right panel when nothing is selected on wide desktop.
function PanelEmptyState({ onCapture, onScout }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 40 }}>
      <div style={{ fontSize: 64, opacity: 0.12 }}>✦</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>
          Nothing selected
        </div>
        <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.7 }}>
          Pick an entry from the list, or start a new capture.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
        <button
          onClick={onCapture}
          style={{ background: C.accent, color: '#fff', border: 'none', borderRadius: 12, padding: '11px 22px', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}
        >
          <Lightbulb size={15} strokeWidth={2} /> Capture idea
        </button>
        <button
          onClick={onScout}
          style={{ background: '#2BA84A18', color: '#2BA84A', border: '1px solid #2BA84A44', borderRadius: 12, padding: '11px 22px', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}
        >
          <MapPin size={15} strokeWidth={2} /> Scout mode
        </button>
      </div>
    </div>
  );
}
