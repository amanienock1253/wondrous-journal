import { useState } from 'react';
import { Star } from 'lucide-react';
import { typeMap, C } from '../constants/theme.js';
import { formatEntryDate, timeOfDay } from '../utils/time.js';

const GRADIENTS = {
  idea:    'linear-gradient(135deg, #9B8BF7 0%, #C8C0FF 100%)',
  problem: 'linear-gradient(135deg, #C94A3A 0%, #F4A58C 100%)',
  scout:   'linear-gradient(135deg, #3A7A5A 0%, #7DC8A0 100%)',
  project: 'linear-gradient(135deg, #D4893A 0%, #F5C87A 100%)',
};

// flat=true: used inside a bordered container (HomeScreen recent list)
export function EntryCard({ entry, onOpen, flat }) {
  const [pressed, setPressed] = useState(false);
  const type     = typeMap[entry.type] || typeMap.idea;
  const gradient = GRADIENTS[entry.type] || GRADIENTS.idea;
  const isStarred = (entry.excited || 0) > 0;

  if (flat) {
    return (
      <div
        onClick={() => onOpen(entry)}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        onTouchStart={() => setPressed(true)}
        onTouchEnd={() => setPressed(false)}
        style={{
          background: C.surface, padding: '14px 16px', cursor: 'pointer',
          transform: pressed ? 'scale(0.985)' : 'scale(1)',
          transition: 'transform 0.1s ease',
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>
            {formatEntryDate(entry.created_at)} · {timeOfDay(entry.created_at)} · <span style={{ color: type.color, fontWeight: 600 }}>{type.label}</span>
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: C.text, lineHeight: 1.35, marginBottom: entry.body ? 4 : 0 }}>
            {entry.title || 'Untitled'}
          </div>
          {entry.body && (
            <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {entry.body}
            </div>
          )}
        </div>
        <div style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 18 }}>{type.icon}</span>
        </div>
      </div>
    );
  }

  // ── Premium floating card (for EntriesScreen) ──
  return (
    <div
      onClick={() => onOpen(entry)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        background: C.surface,
        borderRadius: 20,
        padding: '18px 16px',
        cursor: 'pointer',
        transform: pressed ? 'scale(0.975)' : 'scale(1)',
        transition: 'transform 0.12s ease, box-shadow 0.15s ease',
        boxShadow: pressed
          ? '0 2px 8px rgba(28,25,23,0.06)'
          : '0 2px 14px rgba(28,25,23,0.07), 0 1px 4px rgba(28,25,23,0.04)',
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
        animation: 'slideUp 0.2s ease both',
        marginBottom: 12,
      }}
    >
      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: '0.01em' }}>
          {formatEntryDate(entry.created_at)} · {timeOfDay(entry.created_at)}
        </div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 17, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: 6,
        }}>
          {entry.title || 'Untitled'}
        </div>
        {entry.body && (
          <div style={{
            fontSize: 13, color: C.sub, lineHeight: 1.6,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {entry.body}
          </div>
        )}
      </div>

      {/* Thumbnail */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 16,
          background: gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <span style={{ fontSize: 28 }}>{type.icon}</span>
        </div>

        {/* Bookmark star — top-right */}
        {isStarred && (
          <div style={{
            position: 'absolute', top: 6, right: 6,
            width: 22, height: 22, borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
          }}>
            <Star size={11} fill={C.accent} color={C.accent} strokeWidth={0} />
          </div>
        )}

        {/* Type badge — bottom-right */}
        <div style={{
          position: 'absolute', bottom: 6, right: 6,
          width: 22, height: 22, borderRadius: '50%',
          background: 'rgba(255,255,255,0.88)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11,
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}>
          {type.icon}
        </div>
      </div>
    </div>
  );
}
