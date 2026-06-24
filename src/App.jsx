import { useState } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { useAuth } from './hooks/useAuth.js';
import { useEntries } from './hooks/useEntries.js';
import { useBreakpoint } from './hooks/useBreakpoint.js';
import { AuthScreen } from './screens/AuthScreen.jsx';
import { HomeScreen } from './screens/HomeScreen.jsx';
import { DiscoverScreen } from './screens/DiscoverScreen.jsx';
import { CommonsScreen } from './screens/CommonsScreen.jsx';
import { DetailScreen } from './screens/DetailScreen.jsx';
import { InsightsScreen } from './screens/InsightsScreen.jsx';
import { SettingsScreen } from './screens/SettingsScreen.jsx';
import { AIScreen } from './screens/AIScreen.jsx';
import { BottomNav } from './components/BottomNav.jsx';
import { SideNav } from './components/SideNav.jsx';
import { Toast } from './components/Toast.jsx';
import { AIChat } from './components/AIChat.jsx';
import { C } from './constants/theme.js';
import { useAppConfig, ADMIN_EMAIL } from './hooks/useAppConfig.js';
import { useProfile } from './hooks/useProfile.js';

const NAV_SCREENS = new Set(['home', 'discover', 'commons', 'insights', 'ai', 'settings']);

export default function App() {
  const { session, initializing, authLoading, authError, signIn, signUp, signOut } = useAuth();
  const { isMobile, isDesktop, isWide } = useBreakpoint();

  const [screen, setScreen]               = useState('home');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [rightPanel, setRightPanel]       = useState(null); // 'discover' | null
  const [toast, setToast]                 = useState(null);
  const [authMode, setAuthMode]           = useState('signin');

  const [aiOpen, setAiOpen]       = useState(false);
  const [aiFocusEntry, setAiFocus] = useState(null);

  const userId    = session?.user?.id;
  const userEmail = session?.user?.email;
  const isAdmin   = userEmail === ADMIN_EMAIL;
  const { entries, error: entriesError, addEntry, updateEntry, deleteEntry, deleteAllEntries } = useEntries(userId);
  const { profile, updateProfile } = useProfile(userId);

  // Silently sync admin's Gemini key from Supabase to localStorage for all users
  useAppConfig(userId);

  const [aiSuggestions, setAiSuggestions] = useState(() => localStorage.getItem('wj_ai_suggestions') !== 'false');

  const showToast = (message, emoji = '✓') => {
    setToast({ message, emoji });
    window.setTimeout(() => setToast(null), 2500);
  };

  const handleOpenAI = (focusEntry = null) => {
    setAiFocus(focusEntry);
    setAiOpen(true);
  };

  // ── Auth ───────────────────────────────────────────────────────────────────
  const handleAuthSubmit = async (email, password) => {
    if (authMode === 'signin') {
      const result = await signIn(email, password);
      if (result) showToast('Welcome back!', '👋');
    } else {
      const result = await signUp(email, password);
      if (result) {
        if (result.needsConfirmation) showToast('Check your email to confirm', '📧');
        else showToast('Account created!', '✨');
      }
    }
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleNavChange = (newScreen) => {
    setScreen(newScreen);
    if (!isWide) setSelectedEntry(null);
    setRightPanel(null);
  };

  const handleDiscoverClick = () => {
    if (isWide) { setRightPanel('discover'); setSelectedEntry(null); }
    else setScreen('discover');
  };

  const handleOpenEntry = (entry) => {
    setSelectedEntry(entry);
    if (isWide) setRightPanel(null);
    else setScreen('detail');
  };

  // ── Entry CRUD ─────────────────────────────────────────────────────────────
  const handleAddEntry = async (entry) => {
    const created = await addEntry(entry);
    if (created) {
      showToast('Discovery saved!', '✦');
      if (isWide) { setRightPanel(null); setSelectedEntry(created); }
      else setScreen('discover');
    }
  };

  const handleUpdateEntry = async (entry) => {
    const updated = await updateEntry(entry);
    if (updated) showToast('Updated', '✓');
    return updated;
  };

  const handleDeleteAll = async () => {
    const success = await deleteAllEntries();
    if (success) {
      setSelectedEntry(null);
      showToast('All discoveries deleted');
    }
  };

  const handleToggleAI = (v) => {
    setAiSuggestions(v);
    localStorage.setItem('wj_ai_suggestions', String(v));
  };

  const handleDeleteEntry = async (id) => {
    const success = await deleteEntry(id);
    if (success) {
      setSelectedEntry(null);
      if (!isWide) setScreen('discover');
      showToast('Deleted', '✦');
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const currentEntry = selectedEntry
    ? entries.find(e => e.id === selectedEntry.id) || selectedEntry
    : null;

  const mainScreen = NAV_SCREENS.has(screen) ? screen : 'home';

  // ── Loading ────────────────────────────────────────────────────────────────
  if (initializing) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: C.bg, gap: 16,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 18,
          background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 8px 24px rgba(28,20,16,0.28)`,
        }}>
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
        onToggleMode={() => setAuthMode(m => m === 'signin' ? 'signup' : 'signin')}
        onSubmit={handleAuthSubmit}
        loading={authLoading}
        error={authError}
        toast={toast}
      />
    );
  }

  const errorBanner = entriesError && (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: '12px 18px', color: C.error, fontSize: 13,
      zIndex: 300, boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    }}>
      {entriesError}
    </div>
  );

  // ── DESKTOP LAYOUT (≥768px) ────────────────────────────────────────────────
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
          {/* Wide split-panel: compact list on left, content on right */}
          {isWide && mainScreen === 'home' ? (
            <>
              <div style={{ width: 360, flexShrink: 0, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <HomeScreen
                  entries={entries}
                  compact
                  onDiscover={handleDiscoverClick}
                  onOpen={handleOpenEntry}
                />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                {rightPanel === 'discover' && (
                  <DiscoverScreen
                    entries={entries}
                    onSave={handleAddEntry}
                    onOpen={handleOpenEntry}
                    onBack={() => setRightPanel(null)}
                    createMode
                  />
                )}
                {currentEntry && !rightPanel && (
                  <DetailScreen
                    entry={currentEntry}
                    onBack={() => setSelectedEntry(null)}
                    onDelete={handleDeleteEntry}
                    onUpdate={handleUpdateEntry}
                    showToast={showToast}
                    onAskAI={handleOpenAI}
                  />
                )}
                {!currentEntry && !rightPanel && (
                  <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 16,
                    color: C.muted,
                  }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 18,
                      background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Plus size={22} color={C.accent} strokeWidth={2.5} />
                    </div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: C.sub, textAlign: 'center' }}>
                      Select a discovery to view it,<br />or start a new one.
                    </div>
                    <button
                      onClick={handleDiscoverClick}
                      style={{
                        background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
                        color: C.accent, border: 'none', borderRadius: 14,
                        padding: '12px 24px', fontSize: 14, fontWeight: 700,
                        cursor: 'pointer', marginTop: 4,
                      }}
                    >
                      New Discovery
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
              {mainScreen === 'home' && !currentEntry && (
                <HomeScreen
                  entries={entries}
                  onDiscover={handleDiscoverClick}
                  onOpen={handleOpenEntry}
                  onAI={() => setScreen('ai')}
                  onSettings={() => setScreen('settings')}
                  showAISuggestion={aiSuggestions}
                  userEmail={userEmail}
                  userId={userId}
                />
              )}
              {mainScreen === 'commons' && (
                <CommonsScreen userId={userId} userEmail={userEmail} entries={entries} profile={profile} onUpdateProfile={updateProfile} />
              )}
              {mainScreen === 'discover' && (
                <DiscoverScreen
                  entries={entries}
                  onSave={handleAddEntry}
                  onOpen={handleOpenEntry}
                  onBack={() => handleNavChange('home')}
                />
              )}
              {currentEntry && mainScreen !== 'discover' && (
                <DetailScreen
                  entry={currentEntry}
                  onBack={() => setSelectedEntry(null)}
                  onDelete={handleDeleteEntry}
                  onUpdate={handleUpdateEntry}
                  showToast={showToast}
                  onAskAI={handleOpenAI}
                />
              )}
              {mainScreen === 'insights' && <InsightsScreen entries={entries} />}
              {mainScreen === 'ai'       && <AIScreen entries={entries} />}
              {mainScreen === 'settings' && (
                <SettingsScreen
                  onSignOut={signOut}
                  userEmail={userEmail}
                  isAdmin={isAdmin}
                  entries={entries}
                  onDeleteAll={handleDeleteAll}
                  aiSuggestions={aiSuggestions}
                  onToggleAI={handleToggleAI}
                  showToast={showToast}
                  onBack={() => handleNavChange('home')}
                  profile={profile}
                  onUpdateProfile={updateProfile}
                />
              )}
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

  // ── MOBILE LAYOUT (<768px) ─────────────────────────────────────────────────
  return (
    <div style={{
      maxWidth: 430, margin: '0 auto',
      height: '100dvh', display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden', background: C.bg,
    }}>
      {screen === 'home' && (
        <HomeScreen
          entries={entries}
          onDiscover={handleDiscoverClick}
          onOpen={handleOpenEntry}
          onAI={() => handleNavChange('ai')}
          onSettings={() => setScreen('settings')}
          showAISuggestion={aiSuggestions}
          userEmail={userEmail}
          userId={userId}
        />
      )}
      {screen === 'discover' && (
        <DiscoverScreen
          entries={entries}
          onSave={handleAddEntry}
          onOpen={handleOpenEntry}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'commons' && (
        <CommonsScreen userId={userId} userEmail={userEmail} entries={entries} profile={profile} onUpdateProfile={updateProfile} />
      )}
      {screen === 'detail' && currentEntry && (
        <DetailScreen
          entry={currentEntry}
          onBack={() => {
            setSelectedEntry(null);
            setScreen(['home','discover'].includes(mainScreen) ? mainScreen : 'discover');
          }}
          onDelete={handleDeleteEntry}
          onUpdate={handleUpdateEntry}
          showToast={showToast}
          onAskAI={handleOpenAI}
        />
      )}
      {screen === 'insights' && <InsightsScreen entries={entries} />}
      {screen === 'ai'       && <AIScreen entries={entries} />}
      {screen === 'settings' && (
        <SettingsScreen
          onSignOut={signOut}
          userEmail={userEmail}
          isAdmin={isAdmin}
          entries={entries}
          onDeleteAll={handleDeleteAll}
          aiSuggestions={aiSuggestions}
          onToggleAI={handleToggleAI}
          showToast={showToast}
          onBack={() => setScreen('home')}
          profile={profile}
          onUpdateProfile={updateProfile}
        />
      )}

      <AIChat
        entries={entries}
        open={aiOpen}
        onOpen={() => handleOpenAI(null)}
        onClose={() => setAiOpen(false)}
        focusEntry={aiFocusEntry}
      />

      {toast && <Toast emoji={toast.emoji} message={toast.message} />}

      {NAV_SCREENS.has(screen) && (
        <BottomNav screen={screen} setScreen={handleNavChange} />
      )}
      {errorBanner}
    </div>
  );
}
