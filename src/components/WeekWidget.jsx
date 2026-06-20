import { C } from '../constants/theme.js';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getMondayWeek() {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function hasEntryOn(entries, date) {
  const start = new Date(date); start.setHours(0, 0, 0, 0);
  const end   = new Date(date); end.setHours(23, 59, 59, 999);
  return entries.some(e => { const d = new Date(e.created_at); return d >= start && d <= end; });
}

function calcStreak(entries) {
  if (entries.length === 0) return 0;
  let streak = 0;
  const check = new Date(); check.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    if (!hasEntryOn(entries, check)) break;
    streak++;
    check.setDate(check.getDate() - 1);
  }
  return streak;
}

export function WeekWidget({ entries }) {
  const weekDates  = getMondayWeek();
  const streak     = calcStreak(entries);
  const todayStr   = new Date().toDateString();

  const thisWeekCount = weekDates.reduce(
    (n, d) => n + (hasEntryOn(entries, d) ? 1 : 0),
    0
  );

  return (
    <div style={{
      margin: '16px 20px 0',
      background: C.surface,
      borderRadius: 20,
      padding: '18px 20px',
      border: `1px solid ${C.border}`,
      boxShadow: '0 1px 8px rgba(28,25,23,0.04)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>This Week</span>
        {streak > 0 && (
          <span style={{
            fontSize: 11, fontWeight: 600, color: '#D4893A',
            background: '#FFF4E6', borderRadius: 20, padding: '3px 10px',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            🔥 {streak} day{streak !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {weekDates.map((date, i) => {
          const isToday  = date.toDateString() === todayStr;
          const isFuture = date > new Date();
          const filled   = !isFuture && hasEntryOn(entries, date);

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 10, fontWeight: 500, color: isToday ? C.accent : C.muted }}>
                {DAY_LABELS[i]}
              </span>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: filled ? C.accent : isToday ? `${C.accent}18` : 'transparent',
                border: `2px solid ${filled ? C.accent : isToday ? C.accent : C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: isFuture ? 0.35 : 1,
              }}>
                {filled && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: C.sub }}>
        {thisWeekCount === 0
          ? 'No entries this week yet — start capturing!'
          : `${thisWeekCount} entr${thisWeekCount === 1 ? 'y' : 'ies'} this week${streak > 1 ? ' · Keep it up!' : ''}`}
      </div>
    </div>
  );
}
