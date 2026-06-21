import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from './hooks/useAuth.js';
import { useEntries } from './hooks/useEntries.js';
import { useBreakpoint } from './hooks/useBreakpoint.js';
import { AuthScreen } from './screens/AuthScreen.jsx';
import { HomeScreen } from './screens/HomeScreen.jsx';
import { EntriesScreen } from './screens/EntriesScreen.jsx';
import { CaptureScreen } from './screens/CaptureScreen.jsx';
import { ScoutScreen } from './screens/ScoutScreen.jsx';
import { DetailScreen } from './screens/DetailScreen.jsx';
import { InsightsScreen } from './screens/InsightsScreen.jsx';
import { SettingsScreen } from './screens/SettingsScreen.jsx';
import { AIScreen } from './screens/AIScreen.jsx';
import { BottomNav } from './components/BottomNav.jsx';
import { SideNav } from './components/SideNav.jsx';
import { Toast } from './components/Toast.jsx';
import { AIChat } from './components/AIChat.jsx';
import { C } from './constants/theme.js';

// Screens that show BottomNav on mobile.
const NAV_SCREENS = new Set(['home', 'entries', 'insights', 'ai', 'settings']);

export default function App() {
  const { session, initializing, authLoading, authError, signIn, signUp, signOut } = useAuth();
  const { isMobile, isDesktop, isWide } = useBreakpoint();

  const [screen, setScreen]               = useState('home');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [rightPanel, setRightPanel]       = useState(null);
  const [toast, setToast]                 = useState(null);
  const [authMode, setAuthMode]           = useState('signin');

  // AI chat state
  const [aiOpen, setAiOpen]         = useState(false);
  const [aiFocusEntry, setAiFocus]  = useState(null);

  const userId    = session?.user?.id;
  const userEmail = session?.user?.email;
  const { entries, error: entriesError, addEntry, updateEntry, deleteEntry } = useEntries(userId);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const showToast = (message, emoji = '✓') => {
    setToast({ message, emoji });
    window.setTimeout(() => setToast(null), 2500);
  };

  // Open AI chat — optionally focused on a specific entry
  const handleOpenAI = (focusEntry = null) => {
    setAiFocus(focusEntry);
    setAiOpen(true);
  };

  // ── Auth ──────────────────────────────────────────────────────────────────
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

  // ── Navigation helpers ────────────────────────────────────────────────────
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
    if (isWide) setRightPanel(null);
    else setScreen('detail');
  };
  const handleNavChange = (newScreen) => {
    setScreen(newScreen);
    if (!isWide) setSelectedEntry(null);
    setRightPanel(null);
  };

  // ── Entry CRUD ────────────────────────────────────────────────────────────
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

  // ── Derived ───────────────────────────────────────────────────────────────
  const currentEntry = selectedEntry
    ? entries.find((e) => e.id === selectedEntry.id) || selectedEntry
    : null;

  const mainScreen = NAV_SCREENS.has(screen) ? screen : 'home';

  // ── Loading ───────────────────────────────────────────────────────────────
  if (initializing) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.bg, gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #1A2B1A, #2D3B22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={24} color={C.accent} strokeWidth={2} style={{ animation: 'pulse 1.5s ease infinite' }} />
        </div>
        <div style={{ color: C.muted, fontSize: 13, animation: 'pulse 1.5s ease infinite' }}>Loading…</div>
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
    <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 18px', color: C.error, fontSize: 13, zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      {entriesError}
    </div>
  );

  // ── DESKTOP LAYOUT (≥768px) ───────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: C.bg, overflow: 'hidden' }}>
        <SideNav
          screen={mainScreen}
          setScreen={handleNavChange}
          onSignOut={signOut}
          entryCount={entries.length}
          onCapture={handleCaptureClick}
        />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {isWide && (screen === 'home' || screen === 'entries') ? (
            <>
              <div style={{ width: 360, flexShrink: 0, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <HomeScreen entries={entries} greeting={greeting} compact onCapture={handleCaptureClick} onOpen={handleOpenEntry} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                {currentEntry && !rightPanel && (
                  <DetailScreen entry={currentEntry} onBack={() => setSelectedEntry(null)} onDelete={handleDeleteEntry} onUpdate={handleUpdateEntry} showToast={showToast} onAskAI={handleOpenAI} />
                )}
                {rightPanel === 'capture' && <CaptureScreen onSave={handleAddEntry} onBack={() => setRightPanel(null)} />}
                {rightPanel === 'scout'   && <ScoutScreen   onSave={handleAddEntry} onBack={() => setRightPanel(null)} />}
                {!currentEntry && !rightPanel && (
                  <HomeScreen entries={entries} greeting={greeting} onCapture={handleCaptureClick} onOpen={handleOpenEntry} />
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
              {mainScreen === 'home'     && screen !== 'capture' && screen !== 'scout' && !currentEntry && (
                <HomeScreen entries={entries} greeting={greeting} onCapture={handleCaptureClick} onOpen={handleOpenEntry} />
              )}
              {mainScreen === 'entries' && screen !== 'capture' && screen !== 'scout' && !currentEntry && (
                <EntriesScreen entries={entries} onOpen={handleOpenEntry} />
              )}
              {screen === 'capture'  && <CaptureScreen onSave={handleAddEntry} onBack={() => handleNavChange(mainScreen)} />}
              {screen === 'scout'    && <ScoutScreen   onSave={handleAddEntry} onBack={() => handleNavChange(mainScreen)} />}
              {currentEntry          && <DetailScreen  entry={currentEntry} onBack={() => setSelectedEntry(null)} onDelete={handleDeleteEntry} onUpdate={handleUpdateEntry} showToast={showToast} onAskAI={handleOpenAI} />}
              {screen === 'insights' && <InsightsScreen entries={entries} />}
              {screen === 'ai'       && <AIScreen entries={entries} />}
              {screen === 'settings' && <SettingsScreen onSignOut={signOut} userEmail={userEmail} />}
            </div>
          )}
        </div>

        <AIChat
          entries={entries}
          open={aiOpen}
          onOpen={() => handleOpenAI(null)}
          onClose={() => setAiOpen(false)}
          focusEntry={aiFocusEntry}
        />

        {toast && <Toast emoji={toast.emoji} message={toast.message} />}
        {errorBanner}
      </div>
    );
  }

  // ── MOBILE LAYOUT (<768px) ────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 430, margin: '0 auto', height: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', background: C.bg }}>
      {screen === 'home'     && <HomeScreen entries={entries} greeting={greeting} onCapture={handleCaptureClick} onOpen={handleOpenEntry} />}
      {screen === 'entries'  && <EntriesScreen entries={entries} onOpen={handleOpenEntry} />}
      {screen === 'capture'  && <CaptureScreen onSave={handleAddEntry} onBack={() => setScreen(mainScreen)} />}
      {screen === 'scout'    && <ScoutScreen   onSave={handleAddEntry} onBack={() => setScreen(mainScreen)} />}
      {screen === 'detail'   && currentEntry && <DetailScreen entry={currentEntry} onBack={() => setScreen(mainScreen === 'entries' ? 'entries' : 'home')} onDelete={handleDeleteEntry} onUpdate={handleUpdateEntry} showToast={showToast} onAskAI={handleOpenAI} />}
      {screen === 'insights' && <InsightsScreen entries={entries} />}
      {screen === 'ai'       && <AIScreen entries={entries} />}
      {screen === 'settings' && <SettingsScreen onSignOut={signOut} userEmail={userEmail} />}

      <AIChat
        entries={entries}
        open={aiOpen}
        onOpen={() => handleOpenAI(null)}
        onClose={() => setAiOpen(false)}
        focusEntry={aiFocusEntry}
      />

      {toast && <Toast emoji={toast.emoji} message={toast.message} />}
      {NAV_SCREENS.has(screen) && (
        <BottomNav screen={screen} setScreen={handleNavChange} onCapture={handleCaptureClick} />
      )}
      {errorBanner}
    </div>
  );
}
