import { useState } from 'react';
import { CalendarDays, TrendingUp, MapPin, Lightbulb } from 'lucide-react';
import { C, TYPES } from '../constants/theme.js';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

// ── Arch window illustration (CSS art) ────────────────────────────────────
function ArchIllustration() {
  return (
    <div style={{
      width: 130, height: 118,
      position: 'relative',
      borderRadius: 14,
      background: 'linear-gradient(145deg, #EDE5D0 0%, #E8DFC8 100%)',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Sky inside arch */}
      <div style={{
        position: 'absolute', bottom: 0,
        left: '50%', transform: 'translateX(-50%)',
        width: 80, height: 106,
        borderRadius: '40px 40px 0 0',
        background: 'linear-gradient(180deg, #B8D9E8 0%, #C8E8D0 50%, #8AB87A 82%, #6A9A58 100%)',
        overflow: 'hidden',
      }}>
        {/* Clouds */}
        <div style={{ position: 'absolute', top: 12, left: 8, width: 24, height: 10, borderRadius: 10, background: 'rgba(255,255,255,0.75)' }} />
        <div style={{ position: 'absolute', top: 8, left: 18, width: 18, height: 10, borderRadius: 10, background: 'rgba(255,255,255,0.6)' }} />
        {/* Path */}
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 16, height: 36, background: 'linear-gradient(180deg, #C8B878 0%, #D4C890 100%)', borderRadius: '8px 8px 0 0' }} />
        {/* Far trees */}
        <div style={{ position: 'absolute', bottom: 18, left: 10, width: 8, height: 22, background: '#5A8A4A', borderRadius: '4px 4px 0 0' }} />
        <div style={{ position: 'absolute', bottom: 18, right: 10, width: 8, height: 18, background: '#5A8A4A', borderRadius: '4px 4px 0 0' }} />
      </div>
      {/* Arch frame */}
      <div style={{
        position: 'absolute', bottom: 0,
        left: '50%', transform: 'translateX(-50%)',
        width: 80, height: 106,
        borderRadius: '40px 40px 0 0',
        border: '8px solid #C4A87A',
        borderBottom: 'none',
        pointerEvents: 'none',
      }} />
      {/* Vertical mullion */}
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 3, height: 80, background: '#C4A87A' }} />
      {/* Horizontal mullion */}
      <div style={{ position: 'absolute', bottom: 52, left: '50%', transform: 'translateX(-50%)', width: 64, height: 3, background: '#C4A87A' }} />
      {/* Ground plants */}
      <div style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 10, background: '#6A9A58', borderRadius: '0 0 14px 14px' }} />
      {/* Leaf left */}
      <div style={{ position: 'absolute', bottom: 0, left: 8, width: 18, height: 28, borderRadius: '50% 0 0 0', background: '#7AB868', transform: 'rotate(-20deg)', transformOrigin: 'bottom center' }} />
      {/* Leaf right */}
      <div style={{ position: 'absolute', bottom: 0, right: 6, width: 16, height: 24, borderRadius: '0 50% 0 0', background: '#7AB868', transform: 'rotate(20deg)', transformOrigin: 'bottom center' }} />
    </div>
  );
}

// ── Mood row helpers ───────────────────────────────────────────────────────
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MOODS = [
  { emoji: '😊', bg: '#FFF0B3', border: '#F5C842' },
  { emoji: '😌', bg: '#D6EED4', border: '#7AB868' },
  { emoji: '😄', bg: '#FFE4CC', border: '#F0904A' },
  { emoji: '🙂', bg: '#FFF4CC', border: '#E8C840' },
  { emoji: '😐', bg: '#EBE4F5', border: '#A888D8' },
  { emoji: '😔', bg: '#E0E8F5', border: '#7898D8' },
];

const EMPTY_MOOD = { emoji: '○', bg: 'transparent', border: C.border };

function getMondayWeek() {
  const today = new Date();
  const dow = today.getDay();
  const mon = new Date(today);
  mon.setDate(today.getDate() - ((dow + 6) % 7));
  mon.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

function hasEntryOn(entries, date) {
  const s = new Date(date); s.setHours(0, 0, 0, 0);
  const e = new Date(date); e.setHours(23, 59, 59, 999);
  return entries.some(en => { const d = new Date(en.created_at); return d >= s && d <= e; });
}

function calcStreak(entries) {
  let streak = 0;
  const check = new Date(); check.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    if (!hasEntryOn(entries, check)) break;
    streak++;
    check.setDate(check.getDate() - 1);
  }
  return streak;
}

// ── Main component ─────────────────────────────────────────────────────────
const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'mood',     label: 'Mood'     },
  { key: 'themes',   label: 'Themes'   },
  { key: 'streaks',  label: 'Streaks'  },
];

export function InsightsScreen({ entries }) {
  const [tab, setTab] = useState('overview');
  const { isDesktop } = useBreakpoint();

  const total      = entries.length;
  const counts     = TYPES.map((t) => ({ ...t, count: entries.filter((e) => e.type === t.key).length }));
  const topCounts  = [...counts].sort((a, b) => b.count - a.count);
  const weekDates  = getMondayWeek();
  const streak     = calcStreak(entries);
  const recentDays = entries.filter((e) => Date.now() - new Date(e.created_at).getTime() < 7 * 86400000).length;

  const excitedEntries = entries.filter((e) => e.excited > 0);
  const avgExcitement  = excitedEntries.length
    ? (excitedEntries.reduce((s, e) => s + e.excited, 0) / excitedEntries.length).toFixed(1)
    : null;

  const challenges = [];
  if (total === 0) {
    challenges.push({ text: "You haven't captured anything yet. Start today.", Icon: Lightbulb });
  } else {
    if (entries.filter((e) => e.type === 'scout').length === 0)
      challenges.push({ text: "You haven't used Scout Mode yet. Next time you're outside, try it.", Icon: MapPin });
    if (recentDays < 3)
      challenges.push({ text: "You've been quiet this week. What have you been observing?", Icon: CalendarDays });
    if (topCounts[0]?.count > 0)
      challenges.push({ text: `${topCounts[0].icon} ${topCounts[0].label} is your most captured type. Is that where your biggest opportunity is?`, Icon: TrendingUp });
    if (avgExcitement)
      challenges.push({ text: `Your average excitement is ${avgExcitement}/5. Which idea excites you most?`, Icon: TrendingUp });
  }

  const px   = isDesktop ? '20px 48px 48px' : '20px 20px 120px';
  const hPad = isDesktop ? '36px 48px 0' : '52px 20px 0';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
      {/* ── Header ── */}
      <div style={{ padding: hPad, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: isDesktop ? 32 : 26, fontWeight: 700, color: C.text }}>
            Insights
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex', alignItems: 'center' }}>
            <CalendarDays size={22} strokeWidth={1.75} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          {TABS.map(({ key, label }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  padding: '7px 15px', borderRadius: 20, fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s',
                  border: `1.5px solid ${active ? C.text : 'transparent'}`,
                  background: active ? C.surface : 'transparent',
                  color: active ? C.text : C.muted,
                  boxShadow: active ? '0 1px 6px rgba(28,25,23,0.08)' : 'none',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: px }}>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <>
            {/* Hero stat card */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 22,
              padding: '24px 20px 24px 24px', marginBottom: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              overflow: 'hidden',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: C.sub, marginBottom: 6 }}>You've written</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 60, fontWeight: 700, color: C.text, lineHeight: 1 }}>
                  {total}
                </div>
                <div style={{ fontSize: 16, color: C.sub, marginTop: 4, marginBottom: 14 }}>
                  {total === 1 ? 'entry' : 'entries'}
                </div>
                <div style={{ fontSize: 13, color: C.accent, fontWeight: 500 }}>
                  Keep shining ✦
                </div>
              </div>
              <ArchIllustration />
            </div>

            {/* Mood This Week */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Mood This Week</span>
                <span style={{ fontSize: 13, color: C.muted }}>View all</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {weekDates.map((date, i) => {
                  const isFuture = date > new Date();
                  const has      = !isFuture && hasEntryOn(entries, date);
                  const mood     = has ? MOODS[i % MOODS.length] : EMPTY_MOOD;
                  const isToday  = date.toDateString() === new Date().toDateString();
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: mood.bg,
                        border: `2px solid ${has ? mood.border : C.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: has ? 20 : 14,
                        color: has ? undefined : C.border,
                        opacity: isFuture ? 0.35 : 1,
                        transition: 'all 0.2s',
                      }}>
                        {mood.emoji}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: isToday ? 700 : 400, color: isToday ? C.accent : C.muted }}>
                        {DAY_LABELS[i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Themes */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Top Themes</span>
                <span style={{ fontSize: 13, color: C.muted }}>This Month</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {topCounts.map((t) => (
                  <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, color: C.sub, width: 64, flexShrink: 0 }}>{t.label}</span>
                    <div style={{ flex: 1, height: 8, background: C.border, borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: total ? `${Math.max((t.count / total) * 100, t.count > 0 ? 6 : 0)}%` : '0%',
                        background: `linear-gradient(90deg, #4A8C5C 0%, #6AB87A 100%)`,
                        borderRadius: 8,
                        transition: 'width 0.7s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.sub, width: 16, textAlign: 'right', flexShrink: 0 }}>{t.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── MOOD TAB ── */}
        {tab === 'mood' && (
          <div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '28px 24px', textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>😊</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 8 }}>Mood Tracking</div>
              <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.65 }}>
                Mood tracking will let you log how you're feeling each day and see patterns over time.
              </div>
              <div style={{ marginTop: 16, display: 'inline-block', background: C.accentDim, border: `1px solid ${C.accent}44`, borderRadius: 20, padding: '5px 16px', fontSize: 12, color: C.accent, fontWeight: 600 }}>
                Coming soon ✦
              </div>
            </div>

            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>Activity This Week</div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '20px', display: 'flex', justifyContent: 'space-between' }}>
              {weekDates.map((date, i) => {
                const isFuture = date > new Date();
                const has      = !isFuture && hasEntryOn(entries, date);
                const isToday  = date.toDateString() === new Date().toDateString();
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: has ? C.accent : isToday ? `${C.accent}18` : 'transparent',
                      border: `2px solid ${has ? C.accent : isToday ? C.accent : C.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: isFuture ? 0.3 : 1,
                    }}>
                      {has && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    <span style={{ fontSize: 10, color: isToday ? C.accent : C.muted, fontWeight: isToday ? 700 : 400 }}>
                      {DAY_LABELS[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── THEMES TAB ── */}
        {tab === 'themes' && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 22, padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: C.text }}>Capture Breakdown</span>
              <span style={{ fontSize: 12, color: C.muted }}>{total} total</span>
            </div>
            {topCounts.map((t) => (
              <div key={t.key} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, color: C.text }}>
                    <span style={{ width: 28, height: 28, borderRadius: 9, background: `${t.color}18`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
                      {t.icon}
                    </span>
                    {t.label}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.color }}>{t.count}</span>
                </div>
                <div style={{ height: 8, background: `${t.color}18`, borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: total ? `${Math.max((t.count / total) * 100, t.count > 0 ? 5 : 0)}%` : '0%',
                    background: t.color, borderRadius: 8,
                    transition: 'width 0.7s ease',
                  }} />
                </div>
                {total > 0 && (
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{Math.round((t.count / total) * 100)}%</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── STREAKS TAB ── */}
        {tab === 'streaks' && (
          <div>
            {/* Streak hero */}
            <div style={{ background: 'linear-gradient(135deg, #1A2B1A 0%, #2D3B22 100%)', borderRadius: 22, padding: '28px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ fontSize: 52 }}>🔥</div>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 700, color: C.accent, lineHeight: 1 }}>
                  {streak}
                </div>
                <div style={{ fontSize: 16, color: 'rgba(247,243,238,0.8)', marginTop: 4 }}>
                  day{streak !== 1 ? 's' : ''} streak
                </div>
                <div style={{ fontSize: 13, color: 'rgba(247,243,238,0.45)', marginTop: 4 }}>
                  {streak === 0 ? 'Write today to start your streak!' : 'Keep the momentum going ✦'}
                </div>
              </div>
            </div>

            {/* Challenges */}
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 14 }}>Challenges</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {challenges.map(({ text, Icon }, i) => (
                <div key={i} style={{
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
                  padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start',
                  borderLeft: `3px solid ${C.accent}`,
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: C.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={C.accent} strokeWidth={2} />
                  </div>
                  <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.65, paddingTop: 6 }}>{text}</div>
                </div>
              ))}
              {challenges.length === 0 && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px 20px', textAlign: 'center', color: C.muted }}>
                  No challenges yet — keep capturing! ✦
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
