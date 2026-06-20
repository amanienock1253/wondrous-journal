import { Sparkles } from 'lucide-react';

const QUOTES = [
  "Every day holds a new beginning. Make it wondrous.",
  "The world is full of stories waiting to be told.",
  "Curiosity is the spark behind every great discovery.",
  "What you notice matters. Write it down.",
  "Great ideas begin with a single honest observation.",
  "To wonder is to begin. Keep going.",
  "The most ordinary moments hold the most extraordinary seeds.",
];

export function HeroCard() {
  const idx = new Date().getDate() % QUOTES.length;
  const quote = QUOTES[idx];

  return (
    <div style={{
      margin: '0 20px',
      borderRadius: 24,
      overflow: 'hidden',
      position: 'relative',
      background: 'linear-gradient(135deg, #1A2E1A 0%, #2D3B22 55%, #1C1917 100%)',
      padding: '28px 24px 24px',
      minHeight: 168,
      animation: 'fadeIn 0.4s ease',
    }}>
      {/* Decorative glow circles */}
      <div style={{ position: 'absolute', top: -40, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(201,168,76,0.10)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -30, left: -10, width: 100, height: 100, borderRadius: '50%', background: 'rgba(201,168,76,0.07)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
          <Sparkles size={13} color="#C9A84C" strokeWidth={2.5} />
          <span style={{ fontSize: 10, color: '#C9A84C', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Daily Inspiration
          </span>
        </div>

        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 20,
          fontWeight: 600,
          fontStyle: 'italic',
          color: '#F7F3EE',
          lineHeight: 1.55,
        }}>
          "{quote}"
        </div>

        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ height: 1, flex: 1, background: 'rgba(247,243,238,0.12)' }} />
          <span style={{ fontSize: 14, color: 'rgba(247,243,238,0.3)' }}>✦</span>
          <div style={{ height: 1, flex: 1, background: 'rgba(247,243,238,0.12)' }} />
        </div>
      </div>
    </div>
  );
}
