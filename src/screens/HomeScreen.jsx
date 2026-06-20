// Home screen — responsive: grid on desktop, list on mobile, compact sidebar list on wide split view.
import { useState } from 'react';
import { Lightbulb, MapPin, Compass } from 'lucide-react';
import { C, TYPES } from '../constants/theme.js';
import { QuickBtn } from '../components/QuickBtn.jsx';
import { EntryCard } from '../components/EntryCard.jsx';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

// compact=true: used as the left list column on wide (≥1200px) desktop — smaller header, no grid.
export function HomeScreen({ entries, greeting, onCapture, onScout, onOpen, onSignOut, compact }) {
  const [filter, setFilter] = useState('all');
  const { isDesktop } = useBreakpoint();

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.type === filter);
  // 2-column grid only on desktop in non-compact mode (full content area).
  const useGrid = isDesktop && !compact;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Full header (mobile + regular desktop) ── */}
      {!compact && (
        <div style={{ padding: isDesktop ? '36px 40px 24px' : '48px 20px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>
                {greeting}
              </div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: isDesktop ? 32 : 28, fontWeight: 700, color: C.text, lineHeight: 1.1 }}>
                Wondrous <span style={{ color: C.accent }}>✦</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '5px 12px', color: C.sub, fontSize: 11, cursor: 'pointer' }}
                >
                  Sign out
                </button>
              )}
              {/* Captures count chip */}
              <div style={{ background: `${C.accent}18`, border: `1px solid ${C.accent}33`, borderRadius: 10, padding: '5px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.accent, fontFamily: "'Sora',sans-serif", lineHeight: 1 }}>{entries.length}</div>
                <div style={{ fontSize: 10, color: C.sub, marginTop: 2, letterSpacing: '0.04em' }}>captures</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: isDesktop ? 560 : undefined }}>
            <QuickBtn LucideIcon={Lightbulb} label="Capture" sub="idea, problem…" onClick={onCapture} />
            <QuickBtn LucideIcon={Compass} label="Scout Mode" sub="observe the world" onClick={onScout} accent="#2BA84A" />
          </div>
        </div>
      )}

      {/* ── Compact header (left list panel on wide desktop) ── */}
      {compact && (
        <div style={{ padding: '18px 16px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={onCapture}
                title="Capture idea"
                style={{ background: C.accentDim, border: `1px solid ${C.accent}44`, borderRadius: 8, padding: '6px 10px', color: C.accent, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Lightbulb size={14} strokeWidth={2} />
              </button>
              <button
                onClick={onScout}
                title="Scout mode"
                style={{ background: '#2BA84A18', border: '1px solid #2BA84A44', borderRadius: 8, padding: '6px 10px', color: '#2BA84A', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <MapPin size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Filter chips ── */}
      <div style={{
        display: 'flex', gap: 6, flexShrink: 0, overflowX: 'auto',
        padding: compact ? '0 16px 10px' : isDesktop ? '0 40px 16px' : '0 20px 12px',
      }}>
        {[{ key: 'all', label: 'All' }, ...TYPES].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s',
              border: `1px solid ${filter === t.key ? C.accent : C.border}`,
              background: filter === t.key ? C.accentDim : 'transparent',
              color: filter === t.key ? C.accent : C.sub,
            }}
          >
            {t.icon ? `${t.icon} ` : ''}{t.label}
          </button>
        ))}
      </div>

      {/* ── Entry list / grid ── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: compact ? '0 16px 16px' : isDesktop ? '0 40px 40px' : '0 20px 20px',
      }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: compact ? '40px 12px' : '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: compact ? 15 : 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>
              Your journal is empty
            </div>
            <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.6, marginBottom: compact ? 0 : 28 }}>
              Every great product starts with a single captured thought.
            </div>
            {!compact && (
              <button
                onClick={onCapture}
                style={{ background: C.accent, color: '#fff', border: 'none', borderRadius: 14, padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Capture your first idea
              </button>
            )}
          </div>
        ) : (
          <div style={
            useGrid
              ? { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }
              : { display: 'flex', flexDirection: 'column', gap: 10 }
          }>
            {filtered.map((entry) => (
              <EntryCard key={entry.id} entry={entry} onOpen={onOpen} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
