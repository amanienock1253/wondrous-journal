import { useMemo, useState } from 'react';
import { Settings, ChevronRight, Flame, Trophy, Zap, Sparkles } from 'lucide-react';
import { C } from '../constants/theme.js';
import { TypeCircle, TypeBadge } from '../components/TypeIcon.jsx';
import { StoriesRow } from '../components/StoriesRow.jsx';
import { StoryViewer } from '../components/StoryViewer.jsx';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

const QUOTES = [
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Innovation distinguishes a leader from a follower.", author: "Steve Jobs" },
  { text: "Make something people want.", author: "Paul Graham" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Every problem is a gift — without problems we would not grow.", author: "Tony Robbins" },
  { text: "Ideas are easy. Implementation is hard.", author: "Guy Kawasaki" },
  { text: "Don't find customers for your products; find products for your customers.", author: "Seth Godin" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Your most unhappy customers are your greatest source of learning.", author: "Bill Gates" },
  { text: "Move fast and build things that matter.", author: "Wondrous" },
  { text: "Observe more than you speak. Build more than you plan.", author: "Wondrous" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Burning midnight oil';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

function getDailyQuote() {
  const day = Math.floor(Date.now() / 86400000);
  return QUOTES[day % QUOTES.length];
}

function calcStreak(entries) {
  let streak = 0;
  const check = new Date();
  check.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const s = new Date(check); s.setHours(0, 0, 0, 0);
    const e = new Date(check); e.setHours(23, 59, 59, 999);
    if (!entries.some(en => { const d = new Date(en.created_at); return d >= s && d <= e; })) break;
    streak++;
    check.setDate(check.getDate() - 1);
  }
  return streak;
}

function calcScore(entries) {
  if (entries.length === 0) return 0;
  let s = Math.min(entries.length * 4, 30);
  s += new Set(entries.map(e => e.type)).size * 5;
  s += Math.min(entries.filter(e => (e.excited || 0) >= 3).length * 5, 20);
  s += Math.min(entries.filter(e => Date.now() - new Date(e.created_at) < 7 * 86400000).length * 3, 10);
  return Math.min(Math.round(s), 100);
}

function getAISuggestion(entries) {
  if (entries.length === 0) {
    return { text: "Start by documenting a problem you've noticed. The best products solve real pain.", cta: 'Discover now', type: 'start' };
  }
  const problems  = entries.filter(e => e.type === 'problem').length;
  const ideas     = entries.filter(e => e.type === 'idea').length;
  const recent3   = entries.filter(e => Date.now() - new Date(e.created_at) < 3 * 86400000).length;
  const types     = new Set(entries.map(e => e.type)).size;

  if (recent3 === 0) {
    return { text: "You haven’t captured anything in 3 days. What have you been observing out there?", cta: 'Capture now', type: 'nudge' };
  }
  if (ideas > 3 && problems === 0) {
    return { text: `You have ${ideas} ideas but no problems documented. Validate your ideas by finding the exact pain they solve.`, cta: 'Add a Problem', type: 'insight' };
  }
  if (problems > 2 && ideas === 0) {
    return { text: `You’ve spotted ${problems} problems. Time to brainstorm — what would you build to solve them?`, cta: 'Add an Idea', type: 'insight' };
  }
  if (types < 3 && entries.length >= 3) {
    return { text: 'Try capturing a different type of discovery today — Research, Observations, and Lessons create powerful connections.', cta: 'Explore types', type: 'tip' };
  }
  return { text: `You have ${entries.length} discoveries. Ask AI to find patterns and which idea has the biggest potential.`, cta: 'Ask AI', type: 'ai' };
}

function ScoreRing({ score }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={36} cy={36} r={r} fill="none" stroke={C.border} strokeWidth={5} />
      <circle
        cx={36} cy={36} r={r} fill="none"
        stroke={score >= 70 ? '#2E7D52' : score >= 40 ? C.accent : '#E85D3A'}
        strokeWidth={5}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.2s ease' }}
      />
    </svg>
  );
}

// Compact mode for wide desktop left panel
function CompactPanel({ entries, onOpen, onDiscover }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
      <div style={{ padding: '20px 16px 12px', flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
            {entries.length} {entries.length === 1 ? 'discovery' : 'discoveries'}
          </span>
          <button
            onClick={onDiscover}
            style={{
              background: C.accent, color: '#fff', border: 'none',
              borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <span>+</span> New
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }} className="hide-scroll">
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: C.muted, fontSize: 13 }}>
            No discoveries yet.<br />Start by clicking "New".
          </div>
        ) : (
          <div style={{ background: C.surface }}>
            {entries.map((e, i) => (
              <div key={e.id} style={{ borderTop: i === 0 ? 'none' : `1px solid ${C.border}` }}>
                <EntryCard entry={e} onOpen={onOpen} flat />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function HomeScreen({ entries, onDiscover, onOpen, onAI, onSettings, compact, showAISuggestion = true, userEmail }) {
  const { isDesktop } = useBreakpoint();

  const [storyIdx,  setStoryIdx]  = useState(null); // null = closed, number = open at index

  const greeting    = useMemo(() => getGreeting(), []);
  const quote       = useMemo(() => getDailyQuote(), []);
  const score       = useMemo(() => calcScore(entries), [entries]);
  const streak      = useMemo(() => calcStreak(entries), [entries]);
  const suggestion  = useMemo(() => getAISuggestion(entries), [entries]);
  const recent      = useMemo(() => entries.slice(0, 3), [entries]);
  const thisWeek    = useMemo(() => entries.filter(e => Date.now() - new Date(e.created_at) < 7 * 86400000).length, [entries]);

  const topEntry = useMemo(() =>
    [...entries]
      .filter(e => (e.excited || 0) > 0)
      .sort((a, b) => (b.excited || 0) - (a.excited || 0))[0]
  , [entries]);

  if (compact) return <CompactPanel entries={entries} onOpen={onOpen} onDiscover={onDiscover} />;

  const pad = isDesktop ? '40px 48px 48px' : '0 20px 120px';
  const headerPad = isDesktop ? '36px 48px 0' : '52px 20px 0';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
      <div className="hide-scroll" style={{ flex: 1, overflowY: 'auto' }}>

        {/* ── Header ── */}
        <div style={{ padding: headerPad }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 12, color: C.muted, fontWeight: 500, letterSpacing: '0.02em', marginBottom: 5 }}>
                {greeting} ✦
              </div>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: isDesktop ? 34 : 27,
                fontWeight: 700, color: C.text, lineHeight: 1.18,
              }}>
                Ready to innovate?
              </div>
              <div style={{ fontSize: 12.5, color: C.sub, marginTop: 5 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {!isDesktop && (
              <button
                onClick={onSettings}
                style={{
                  width: 38, height: 38, borderRadius: 12,
                  background: C.surface, border: `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: C.muted, flexShrink: 0,
                }}
              >
                <Settings size={16} strokeWidth={1.75} />
              </button>
            )}
          </div>
        </div>

        {/* ── Stories Row ── */}
        {!isDesktop && (
          <StoriesRow
            entries={entries}
            userEmail={userEmail}
            onAddNew={onDiscover}
            onViewStory={entry => setStoryIdx(entries.indexOf(entry))}
          />
        )}

        <div style={{ padding: pad }}>

          {/* ── Stats Row ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
            marginTop: 20,
            marginBottom: 24,
          }}>
            {/* Score */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: '14px 12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'relative' }}>
                <ScoreRing score={score} />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: C.text,
                }}>
                  {score}
                </div>
              </div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 500, textAlign: 'center', lineHeight: 1.3 }}>
                Innovation<br />Score
              </div>
            </div>

            {/* Total */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: '14px 12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              <div style={{ fontSize: 28, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: C.text, lineHeight: 1, animation: 'countUp 0.5s ease' }}>
                {entries.length}
              </div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 500, textAlign: 'center' }}>
                Discoveries
              </div>
            </div>

            {/* This Week */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: '14px 12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Zap size={14} color={C.accent} strokeWidth={2} />
                <div style={{ fontSize: 28, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: C.text, lineHeight: 1 }}>
                  {thisWeek}
                </div>
              </div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 500, textAlign: 'center' }}>
                This week
              </div>
            </div>

            {/* Streak */}
            <div style={{
              background: streak > 0
                ? 'linear-gradient(135deg, #1C1410 0%, #2C1E14 100%)'
                : C.surface,
              border: `1px solid ${streak > 0 ? '#3A2A1A' : C.border}`,
              borderRadius: 16, padding: '14px 12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Flame size={14} color={streak > 0 ? '#FF6B3A' : C.muted} strokeWidth={2} />
                <div style={{ fontSize: 28, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: streak > 0 ? C.accent : C.text, lineHeight: 1 }}>
                  {streak}
                </div>
              </div>
              <div style={{ fontSize: 10, color: streak > 0 ? 'rgba(212,197,169,0.6)' : C.muted, fontWeight: 500, textAlign: 'center' }}>
                Day streak
              </div>
            </div>
          </div>

          {/* ── Daily Inspiration ── */}
          <div style={{
            background: 'linear-gradient(135deg, #1C1410 0%, #2A1C14 60%, #1C2214 100%)',
            borderRadius: 20, padding: '24px 24px 22px', marginBottom: 16,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `${C.accent}10` }} />
            <div style={{ position: 'absolute', bottom: -30, left: 20, width: 80, height: 80, borderRadius: '50%', background: `${C.accent}08` }} />
            <div style={{ fontSize: 18, color: C.accent, marginBottom: 10, position: 'relative' }}>✦</div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isDesktop ? 17 : 16,
              color: 'rgba(247,243,238,0.92)',
              lineHeight: 1.65, fontStyle: 'italic',
              marginBottom: 14, position: 'relative',
            }}>
              &ldquo;{quote.text}&rdquo;
            </div>
            <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, position: 'relative' }}>
              — {quote.author}
            </div>
          </div>

          {/* ── AI Suggestion ── */}
          {showAISuggestion && <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 18, padding: '18px 20px', marginBottom: 24,
            cursor: 'pointer',
            transition: 'box-shadow 0.15s',
          }}
            onClick={() => suggestion.cta === 'Ask AI' ? onAI() : onDiscover()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: C.accentDim,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 14, color: C.accent }}>✦</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                AI Suggestion
              </span>
            </div>
            <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.65, marginBottom: 12 }}>
              {suggestion.text}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.accent, fontSize: 13, fontWeight: 600 }}>
              {suggestion.cta}
              <ChevronRight size={14} strokeWidth={2.5} />
            </div>
          </div>}

          {/* ── Recent Discoveries ── */}
          {entries.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Recent Discoveries</span>
                <button
                  onClick={onDiscover}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: C.accent, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}
                >
                  See all <ChevronRight size={13} strokeWidth={2.5} />
                </button>
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, overflow: 'hidden' }}>
                {recent.map((e, i) => {
                  const date = new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <button
                      key={e.id}
                      onClick={() => onOpen(e)}
                      style={{
                        width: '100%', background: 'none', border: 'none',
                        borderTop: i === 0 ? 'none' : `1px solid ${C.border}`,
                        padding: '12px 16px', cursor: 'pointer', textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: 12,
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e2 => e2.currentTarget.style.background = `${C.accent}05`}
                      onMouseLeave={e2 => e2.currentTarget.style.background = 'none'}
                    >
                      <TypeCircle type={e.type} size={38} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13.5, fontWeight: 600, color: C.text,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          marginBottom: 3,
                        }}>
                          {e.title || 'Untitled'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <TypeBadge type={e.type} />
                          <span style={{ fontSize: 11, color: C.muted }}>{date}</span>
                          {(e.excited || 0) > 0 && (
                            <div style={{ display: 'flex', gap: 2, marginLeft: 2 }}>
                              {[1,2,3,4,5].map(i => (
                                <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i <= e.excited ? C.accent : C.border }} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={14} color={C.border} strokeWidth={2} />
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Opportunity of the Week ── */}
          {topEntry && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                <Trophy size={15} color={C.accent} strokeWidth={2} />
                <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Top Discovery</span>
              </div>
              <button
                onClick={() => onOpen(topEntry)}
                style={{
                  width: '100%', background: C.surface,
                  border: `1.5px solid ${C.accent}30`,
                  borderRadius: 18, padding: '16px 18px', cursor: 'pointer', textAlign: 'left',
                  boxShadow: `0 4px 20px ${C.accent}14`,
                  display: 'flex', gap: 14, alignItems: 'center',
                }}
              >
                <TypeCircle type={topEntry.type} size={48} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10.5, color: C.accent, fontWeight: 700, marginBottom: 4, letterSpacing: '0.06em' }}>
                    HIGHEST RATED
                  </div>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 16, fontWeight: 700, color: C.text,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {topEntry.title || 'Untitled'}
                  </div>
                  <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i <= (topEntry.excited || 0) ? C.accent : C.border }} />
                    ))}
                  </div>
                </div>
                <ChevronRight size={16} color={C.muted} strokeWidth={1.75} />
              </button>
            </div>
          )}

          {/* ── Empty state ── */}
          {entries.length === 0 && (
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 22, padding: '44px 28px', textAlign: 'center',
              marginTop: 8,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 18,
                background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Sparkles size={24} color={C.accent} strokeWidth={1.75} />
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 10 }}>
                Your innovation journey starts here
              </div>
              <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.7, marginBottom: 24, maxWidth: 300, margin: '0 auto 24px' }}>
                Every great product began with a single observation. Start capturing what you notice, question, and imagine.
              </div>
              <button
                onClick={onDiscover}
                style={{
                  background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
                  color: C.accent, border: 'none', borderRadius: 16,
                  padding: '14px 32px', fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 6px 24px rgba(28,20,16,0.28)',
                }}
              >
                <Sparkles size={16} strokeWidth={2} /> Make your first discovery
              </button>
            </div>
          )}

          {/* Discover CTA if has entries */}
          {entries.length > 0 && (
            <button
              onClick={onDiscover}
              style={{
                width: '100%', marginTop: 20,
                background: 'linear-gradient(135deg, #1C1410 0%, #2A1C14 100%)',
                color: C.accent, border: 'none', borderRadius: 18,
                padding: '16px', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 6px 24px rgba(28,20,16,0.22)',
                transition: 'opacity 0.15s',
              }}
            >
              <span style={{ fontSize: 17 }}>✦</span>
              What did you discover today?
            </button>
          )}

        </div>
      </div>

      {/* ── Story Viewer overlay ── */}
      {storyIdx !== null && entries.length > 0 && (
        <StoryViewer
          stories={entries}
          initialIndex={Math.max(0, storyIdx)}
          onClose={() => setStoryIdx(null)}
          onOpen={onOpen}
        />
      )}
    </div>
  );
}
