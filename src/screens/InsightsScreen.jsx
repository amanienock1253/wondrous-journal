import { useState, useMemo } from 'react';
import { Flame, Star, TrendingUp, Calendar, Layers, BarChart2, CheckCircle2, Circle, Award, Sparkles } from 'lucide-react';
import { C, DISCOVERY_TYPES } from '../constants/theme.js';
import { TypeIcon } from '../components/TypeIcon.jsx';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

function countOn(entries, date) {
  const s = new Date(date); s.setHours(0, 0, 0, 0);
  const e = new Date(date); e.setHours(23, 59, 59, 999);
  return entries.filter(en => { const d = new Date(en.created_at); return d >= s && d <= e; }).length;
}

function calcStreak(entries) {
  let streak = 0;
  const check = new Date(); check.setHours(0, 0, 0, 0);
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

function ScoreRing({ score, size = 130 }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 70 ? '#2E7D52' : score >= 40 ? C.accent : '#E85D3A';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={8} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.4s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
          {score}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3, fontWeight: 500 }}>/ 100</div>
      </div>
    </div>
  );
}

const TABS = [
  { key: 'overview',  label: 'Overview'  },
  { key: 'breakdown', label: 'Breakdown' },
  { key: 'growth',    label: 'Growth'    },
];

export function InsightsScreen({ entries }) {
  const { isDesktop } = useBreakpoint();
  const [tab, setTab] = useState('overview');

  const total      = entries.length;
  const streak     = useMemo(() => calcStreak(entries), [entries]);
  const score      = useMemo(() => calcScore(entries), [entries]);
  const weekDates  = useMemo(() => getMondayWeek(), []);
  const thisWeek   = entries.filter(e => Date.now() - new Date(e.created_at) < 7 * 86400000).length;
  const thisMonth  = entries.filter(e => Date.now() - new Date(e.created_at) < 30 * 86400000).length;
  const highRated  = entries.filter(e => (e.excited || 0) >= 4).length;
  const typesUsed  = new Set(entries.map(e => e.type)).size;
  const diversityPct = total > 0 ? Math.round((typesUsed / 8) * 100) : 0;

  const typeCounts = useMemo(() =>
    DISCOVERY_TYPES.map(t => ({
      ...t,
      count: entries.filter(e => e.type === t.key).length,
    })).sort((a, b) => b.count - a.count)
  , [entries]);

  const topType    = typeCounts[0];
  const scoreColor = score >= 70 ? '#2E7D52' : score >= 40 ? C.accent : '#E85D3A';
  const scoreLabel = score >= 70 ? 'Expert Innovator' : score >= 40 ? 'Active Discoverer' : 'Just Getting Started';

  const hPad = isDesktop ? '36px 48px 0' : '52px 20px 0';
  const px   = isDesktop ? '24px 48px 48px' : '20px 20px 120px';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>

      {/* Header */}
      <div style={{ padding: hPad, flexShrink: 0 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: isDesktop ? 32 : 26, fontWeight: 700, color: C.text }}>
            Insights
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
            Your intelligence center
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: C.surface, borderRadius: 14, padding: 4, border: `1px solid ${C.border}` }}>
          {TABS.map(({ key, label }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  flex: 1, padding: '7px 12px', borderRadius: 11, fontSize: 13,
                  fontWeight: active ? 700 : 400, cursor: 'pointer', transition: 'all 0.13s',
                  border: 'none',
                  background: active ? C.text : 'transparent',
                  color: active ? '#fff' : C.muted,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="hide-scroll" style={{ flex: 1, overflowY: 'auto', padding: px }}>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <>
            {/* Score hero */}
            <div style={{
              background: 'linear-gradient(135deg, #1C1410 0%, #2A1C14 60%, #1C2214 100%)',
              borderRadius: 22, padding: '28px 24px', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 24,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -24, right: -24, width: 120, height: 120, borderRadius: '50%', background: `${C.accent}08` }} />
              <ScoreRing score={score} />
              <div style={{ flex: 1, position: 'relative' }}>
                <div style={{ fontSize: 11, color: `${C.accent}99`, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>
                  Innovation Score
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 700, color: 'rgba(247,243,232,0.95)', lineHeight: 1.25, marginBottom: 10 }}>
                  {scoreLabel}
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: `${scoreColor}20`, border: `1px solid ${scoreColor}35`,
                  borderRadius: 8, padding: '4px 10px',
                }}>
                  <Award size={11} color={scoreColor} strokeWidth={2.5} />
                  <span style={{ fontSize: 11, color: scoreColor, fontWeight: 600 }}>
                    {score >= 70 ? 'Top 10% of innovators' : score >= 40 ? 'Building momentum' : 'Start capturing daily'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { Icon: BarChart2, iconColor: C.accent,    label: 'Discoveries', value: total,        sub: 'total captured'    },
                { Icon: Calendar,  iconColor: '#5B8DD9',   label: 'This Month',  value: thisMonth,    sub: 'in the last 30d'  },
                { Icon: Layers,    iconColor: '#2E7D52',   label: 'Diversity',   value: `${diversityPct}%`, sub: `${typesUsed}/8 types` },
                { Icon: Star,      iconColor: C.accent,    label: 'Top Rated',   value: highRated,    sub: 'rated 4+'         },
              ].map(({ Icon, iconColor, label, value, sub }) => (
                <div key={label} style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 16, padding: '18px 16px',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: `${iconColor}12`, border: `1px solid ${iconColor}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 10,
                  }}>
                    <Icon size={15} color={iconColor} strokeWidth={2} />
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: C.text, lineHeight: 1, marginBottom: 4 }}>
                    {value}
                  </div>
                  <div style={{ fontSize: 12, color: C.text, fontWeight: 600, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* This week */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '20px 20px 18px', marginBottom: 16 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 16 }}>This Week</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {weekDates.map((date, i) => {
                  const isFuture = date > new Date();
                  const has = !isFuture && hasEntryOn(entries, date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  const count = has ? countOn(entries, date) : 0;
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 11,
                        background: has
                          ? 'linear-gradient(145deg, #1C1410, #2A1C14)'
                          : isToday ? `${C.accent}10` : 'transparent',
                        border: `1.5px solid ${has ? C.accent : isToday ? `${C.accent}40` : C.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: isFuture ? 0.3 : 1,
                      }}>
                        {has
                          ? <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 700, color: C.accent }}>{count}</span>
                          : isToday
                          ? <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.accent }} />
                          : null
                        }
                      </div>
                      <span style={{ fontSize: 9.5, color: isToday ? C.accent : C.muted, fontWeight: isToday ? 700 : 400 }}>
                        {DAY_LABELS[i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top insight */}
            {topType && topType.count > 0 && (
              <div style={{
                background: `${topType.color}08`,
                border: `1px solid ${topType.color}25`,
                borderRadius: 18, padding: '18px 20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: topType.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <TypeIcon type={topType.key} size={18} color="#fff" strokeWidth={2} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: topType.color, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                      Most Captured
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginTop: 2 }}>
                      {topType.label}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.7 }}>
                  You've captured {topType.count} {topType.label.toLowerCase()}{topType.count !== 1 ? 's' : ''}.
                  {topType.key === 'problem'     && ' Problem-spotters make the best entrepreneurs.'}
                  {topType.key === 'idea'        && ' Ideas are your currency — validate the best ones.'}
                  {topType.key === 'observation' && ' Observers see what others miss. Keep looking.'}
                  {topType.key === 'opportunity' && ' You see gaps others don\'t. Start building.'}
                  {!['problem','idea','observation','opportunity'].includes(topType.key) && ' Expertise compounds. Keep exploring this domain.'}
                </div>
              </div>
            )}

            {/* Empty state */}
            {total === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 18, margin: '0 auto 16px',
                  background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <TrendingUp size={24} color={C.accent} strokeWidth={1.75} />
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>
                  No data yet
                </div>
                <div style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.7 }}>
                  Start capturing discoveries to see your insights here.
                </div>
              </div>
            )}
          </>
        )}

        {/* ── BREAKDOWN ── */}
        {tab === 'breakdown' && (
          <>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 22, padding: '22px 20px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: C.text }}>
                  Discovery Breakdown
                </span>
                <span style={{ fontSize: 12, color: C.muted }}>{total} total</span>
              </div>

              {typeCounts.map(t => (
                <div key={t.key} style={{ marginBottom: 17 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, fontWeight: 500, color: C.text }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: t.gradient,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <TypeIcon type={t.key} size={13} color="#fff" strokeWidth={2.5} />
                      </div>
                      {t.label}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: t.count > 0 ? t.color : C.border }}>{t.count}</span>
                  </div>
                  <div style={{ height: 6, background: `${t.color}12`, borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: total ? `${Math.max((t.count / total) * 100, t.count > 0 ? 4 : 0)}%` : '0%',
                      background: t.gradient, borderRadius: 6,
                      transition: 'width 0.9s ease',
                    }} />
                  </div>
                  {total > 0 && t.count > 0 && (
                    <div style={{ fontSize: 10.5, color: C.muted, marginTop: 3 }}>
                      {Math.round((t.count / total) * 100)}%
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Unexplored types */}
            {(() => {
              const missing = DISCOVERY_TYPES.filter(t => !entries.some(e => e.type === t.key));
              if (missing.length === 0) return (
                <div style={{
                  background: '#2E7D5210', border: '1px solid #2E7D5230',
                  borderRadius: 18, padding: '18px 20px',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <Sparkles size={18} color="#2E7D52" strokeWidth={2} />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 4 }}>Full diversity achieved</div>
                    <div style={{ fontSize: 13, color: C.sub }}>You've used all 8 discovery types.</div>
                  </div>
                </div>
              );
              return (
                <div style={{ background: C.accentDim, border: `1px solid ${C.accent}30`, borderRadius: 18, padding: '18px 20px' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                    Expand your perspective
                  </div>
                  <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.6, marginBottom: 12 }}>
                    You haven't tried these discovery types yet:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {missing.map(t => (
                      <div key={t.key} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: C.surface, border: `1px solid ${C.border}`,
                        borderRadius: 10, padding: '5px 11px',
                      }}>
                        <TypeIcon type={t.key} size={12} strokeWidth={2} color={t.color} />
                        <span style={{ fontSize: 12.5, color: C.sub }}>{t.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {/* ── GROWTH ── */}
        {tab === 'growth' && (
          <>
            {/* Streak hero */}
            <div style={{
              background: 'linear-gradient(135deg, #1C1410 0%, #2A1C14 100%)',
              borderRadius: 22, padding: '30px 24px', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 22,
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20, flexShrink: 0,
                background: streak > 0 ? '#FF6B3A18' : 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${streak > 0 ? '#FF6B3A35' : 'rgba(255,255,255,0.08)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Flame size={32} color={streak > 0 ? '#FF6B3A' : 'rgba(255,255,255,0.2)'} strokeWidth={1.75} />
              </div>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, color: streak > 0 ? C.accent : 'rgba(247,243,232,0.3)', lineHeight: 1 }}>
                  {streak}
                </div>
                <div style={{ fontSize: 14, color: 'rgba(247,243,232,0.7)', marginTop: 3 }}>
                  day{streak !== 1 ? 's' : ''} streak
                </div>
                <div style={{ fontSize: 12, color: 'rgba(247,243,232,0.35)', marginTop: 5, lineHeight: 1.5 }}>
                  {streak === 0
                    ? 'Capture something today to start your streak'
                    : streak >= 7
                    ? "You're on fire — keep the momentum going"
                    : "Building momentum — don't break the chain"}
                </div>
              </div>
            </div>

            {/* Personal stats */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '20px 22px', marginBottom: 16 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 16 }}>Personal Stats</div>
              {[
                { Icon: Flame,      iconColor: '#FF6B3A', label: 'Current streak',     value: `${streak}d`  },
                { Icon: BarChart2,  iconColor: C.accent,  label: 'Total discoveries',   value: total         },
                { Icon: Calendar,   iconColor: '#5B8DD9', label: 'This month',          value: thisMonth     },
                { Icon: Star,       iconColor: C.accent,  label: 'High-rated (4+)',      value: highRated     },
                { Icon: Layers,     iconColor: '#2E7D52', label: 'Types explored',       value: `${typesUsed}/8` },
              ].map(({ Icon, iconColor, label, value }, idx, arr) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  paddingBottom: idx < arr.length - 1 ? 14 : 0,
                  marginBottom: idx < arr.length - 1 ? 14 : 0,
                  borderBottom: idx < arr.length - 1 ? `1px solid ${C.border}` : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 9,
                      background: `${iconColor}12`,
                      border: `1px solid ${iconColor}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={14} color={iconColor} strokeWidth={2} />
                    </div>
                    <span style={{ fontSize: 13.5, color: C.sub }}>{label}</span>
                  </div>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: C.text }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Daily challenges */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '20px 22px' }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 14 }}>Daily Challenges</div>
              {total === 0 ? (
                <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.7 }}>
                  Start capturing discoveries to unlock challenges.
                </div>
              ) : (
                [
                  { done: streak > 0,    text: 'Capture something today'         },
                  { done: thisWeek >= 3, text: 'Capture 3 times this week'       },
                  { done: typesUsed >= 4,text: 'Use 4 different discovery types' },
                  { done: highRated >= 1, text: 'Rate an entry 4 or higher'       },
                ].map(({ done, text }, idx, arr) => (
                  <div key={text} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 0',
                    borderBottom: idx < arr.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}>
                    {done
                      ? <CheckCircle2 size={20} color="#2E7D52" strokeWidth={2} style={{ flexShrink: 0 }} />
                      : <Circle size={20} color={C.border} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                    }
                    <span style={{
                      fontSize: 13.5,
                      color: done ? C.muted : C.text,
                      textDecoration: done ? 'line-through' : 'none',
                    }}>
                      {text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
