import { C, TYPES } from '../constants/theme.js';
import { HeroCard } from '../components/HeroCard.jsx';
import { WeekWidget } from '../components/WeekWidget.jsx';
import { EntryCard } from '../components/EntryCard.jsx';
import { useBreakpoint } from '../hooks/useBreakpoint.js';
import { useState } from 'react';

// compact=true: used as the left list column in the wide (≥1200px) desktop split panel.
export function HomeScreen({ entries, greeting, onCapture, onOpen, compact }) {
  const [filter, setFilter] = useState('all');
  const { isDesktop } = useBreakpoint();

  // ── Compact mode: filter chips + full list for split-panel column ──────
  if (compact) {
    const filtered = filter === 'all' ? entries : entries.filter((e) => e.type === filter);
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
        <div style={{ padding: '14px 16px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.sub }}>
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12 }}>
            {[{ key: 'all', label: 'All' }, ...TYPES].map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                style={{
                  padding: '5px 13px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s',
                  border: `1px solid ${filter === t.key ? C.accent : C.border}`,
                  background: filter === t.key ? C.accentDim : 'transparent',
                  color: filter === t.key ? C.accent : C.sub,
                }}
              >
                {t.key !== 'all' ? `${t.icon} ` : ''}{t.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: C.sub, fontSize: 13 }}>
              No entries here yet.
            </div>
          ) : (
            filtered.map((e) => <EntryCard key={e.id} entry={e} onOpen={onOpen} flat />)
          )}
        </div>
      </div>
    );
  }

  // ── Desktop non-compact: full home dashboard ───────────────────────────
  if (isDesktop) {
    const recent = entries.slice(0, 6);
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '36px 48px 48px' }}>
          {/* Greeting */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, color: C.muted, fontWeight: 500, marginBottom: 8 }}>{greeting} ✦</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: C.text, lineHeight: 1.15 }}>
              What will you discover today?
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
            {/* Left: hero + recent */}
            <div>
              <div style={{ margin: '0 0 24px' }}>
                <HeroCard />
              </div>
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Recent Entries</span>
                <span style={{ fontSize: 12, color: C.muted }}>{entries.length} total</span>
              </div>
              {recent.length === 0 ? (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '40px 24px', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: C.sub, marginBottom: 8 }}>Your journal is empty</div>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Every great idea starts with a single captured thought.</div>
                  <button onClick={onCapture} style={{ background: C.accent, color: '#fff', border: 'none', borderRadius: 12, padding: '11px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Capture first idea
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {recent.map((e) => <EntryCard key={e.id} entry={e} onOpen={onOpen} />)}
                </div>
              )}
            </div>

            {/* Right: week widget */}
            <div>
              <WeekWidget entries={entries} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Mobile: greeting + hero + recent 4 + week widget ──────────────────
  const recent = entries.slice(0, 4);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 110 }}>
        {/* Header */}
        <div style={{ padding: '52px 20px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 500, marginBottom: 5 }}>{greeting}</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>
              What will you<br />discover today?
            </div>
          </div>
          {/* Entry count badge */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
            padding: '8px 14px', textAlign: 'center', flexShrink: 0,
          }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: C.accent, lineHeight: 1 }}>
              {entries.length}
            </div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2, letterSpacing: '0.04em' }}>entries</div>
          </div>
        </div>

        {/* Hero quote */}
        <HeroCard />

        {/* Week widget */}
        <WeekWidget entries={entries} />

        {/* Recent entries */}
        {entries.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 20px 10px' }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Recent</span>
              <span style={{ fontSize: 12, color: C.muted }}>{entries.length} total</span>
            </div>
            <div style={{ background: C.surface, borderRadius: 20, margin: '0 20px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
              {recent.map((e, i) => (
                <div key={e.id} style={{ borderTop: i === 0 ? 'none' : `1px solid ${C.border}` }}>
                  <EntryCard entry={e} onOpen={onOpen} flat />
                </div>
              ))}
            </div>
          </>
        )}

        {entries.length === 0 && (
          <div style={{ margin: '24px 20px 0', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '36px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: C.sub, marginBottom: 8 }}>Your journal awaits</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 24 }}>
              Capture an idea, problem, or observation to get started.
            </div>
            <button
              onClick={onCapture}
              style={{ background: C.accent, color: '#fff', border: 'none', borderRadius: 14, padding: '13px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Capture your first idea ✦
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
