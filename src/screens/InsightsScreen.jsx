// Insights screen — 4-column stat grid on desktop, 2-column on mobile, with Lucide icons.
import { Layers, Calendar, MapPin, Star } from 'lucide-react';
import { C, TYPES } from '../constants/theme.js';
import { SectionTitle } from '../components/SectionTitle.jsx';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

export function InsightsScreen({ entries }) {
  const { isDesktop } = useBreakpoint();

  const counts = TYPES.map((type) => ({
    ...type,
    count: entries.filter((e) => e.type === type.key).length,
  }));
  const total            = entries.length;
  const top              = [...counts].sort((a, b) => b.count - a.count)[0];
  const excitedEntries   = entries.filter((e) => e.excited > 0);
  const avgExcitement    = excitedEntries.length > 0
    ? (excitedEntries.reduce((s, e) => s + e.excited, 0) / excitedEntries.length).toFixed(1)
    : null;
  const recentDays = entries.filter(
    (e) => Date.now() - new Date(e.created_at).getTime() < 7 * 86400000
  ).length;

  const challenges = [];
  if (total === 0) {
    challenges.push("You haven't captured anything yet. Start today.");
  } else {
    if (entries.filter((e) => e.type === 'scout').length === 0)
      challenges.push("You haven't used Scout Mode yet. Next time you're outside, try it.");
    if (recentDays < 3)
      challenges.push("You've been quiet this week. What have you been observing?");
    if (top && top.count > 0)
      challenges.push(`${top.icon} ${top.label} is your most common capture type. Is this where your biggest opportunity is?`);
    if (avgExcitement)
      challenges.push(`Your average excitement score is ${avgExcitement}/5. Which idea excites you most — are you developing it?`);
  }

  const stats = [
    { label: 'Total captures', value: total,                                            Icon: Layers,   color: C.accent   },
    { label: 'This week',      value: recentDays,                                       Icon: Calendar, color: '#2BA84A'  },
    { label: 'Scout notes',    value: entries.filter((e) => e.type === 'scout').length, Icon: MapPin,   color: '#2BA84A'  },
    { label: 'Avg excitement', value: avgExcitement ? `${avgExcitement}★` : '—',        Icon: Star,     color: '#E09A2B'  },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: isDesktop ? '36px 48px 20px' : '52px 20px 20px', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: isDesktop ? 30 : 26, fontWeight: 700 }}>
          Insights
        </div>
        <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>Your capture patterns</div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: isDesktop ? '0 48px 48px' : '0 20px 100px' }}>
        <div style={{ maxWidth: isDesktop ? 900 : undefined }}>

          {/* Stat grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
            gap: isDesktop ? 14 : 10,
            marginBottom: 36,
          }}>
            {stats.map(({ label, value, Icon, color }, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: isDesktop ? '20px 16px' : '16px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={color} strokeWidth={2} />
                  </div>
                </div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: isDesktop ? 28 : 24, fontWeight: 700, color }}>
                  {value}
                </div>
                <div style={{ fontSize: 11, color: C.sub, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div style={{ marginBottom: 36 }}>
            <SectionTitle>Breakdown</SectionTitle>
            {counts.map((t) => (
              <div key={t.key} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: C.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{t.icon}</span> {t.label}
                  </span>
                  <span style={{ color: C.sub, fontWeight: 600 }}>{t.count}</span>
                </div>
                <div style={{ height: 5, background: C.card, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: total ? `${(t.count / total) * 100}%` : '0%', background: t.color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Challenges */}
          <div>
            <SectionTitle>Challenges for you</SectionTitle>
            <div style={{ display: isDesktop ? 'grid' : 'flex', gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : undefined, flexDirection: 'column', gap: 10 }}>
              {challenges.map((c, i) => (
                <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', fontSize: 14, color: C.sub, lineHeight: 1.6, borderLeft: `3px solid ${C.accent}` }}>
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
