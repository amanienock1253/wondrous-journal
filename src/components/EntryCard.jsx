// Entry card with hover lift effect and Lucide star rating.
import { useState } from 'react';
import { Star, MapPin } from 'lucide-react';
import { typeMap, C } from '../constants/theme.js';
import { relTime } from '../utils/time.js';

export function EntryCard({ entry, onOpen }) {
  const [hovered, setHovered] = useState(false);
  const type = typeMap[entry.type] || typeMap.idea;

  return (
    <div
      onClick={() => onOpen(entry)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.card,
        border: `1px solid ${hovered ? type.color + '55' : C.border}`,
        borderRadius: 16,
        padding: '14px 16px',
        cursor: 'pointer',
        animation: 'slideUp 0.2s ease both',
        borderLeft: `3px solid ${type.color}`,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? `0 6px 24px rgba(0,0,0,0.3), 0 0 0 1px ${type.color}22` : 'none',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>{type.icon}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: type.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {type.label}
          </span>
        </div>
        <span style={{ fontSize: 11, color: C.muted }}>{relTime(entry.created_at)}</span>
      </div>

      <div style={{ fontSize: 15, fontWeight: 600, color: C.text, lineHeight: 1.4, marginBottom: entry.body ? 6 : 0 }}>
        {entry.title || 'Untitled'}
      </div>

      {entry.body && (
        <div style={{
          fontSize: 13, color: C.sub, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {entry.body}
        </div>
      )}

      {entry.location && (
        <div style={{ marginTop: 8, fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={11} strokeWidth={2} />
          {entry.location}
        </div>
      )}

      {entry.excited > 0 && (
        <div style={{ marginTop: 8, display: 'flex', gap: 2 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              size={11}
              strokeWidth={1.5}
              color="#E09A2B"
              fill={n <= entry.excited ? '#E09A2B' : 'transparent'}
              style={{ opacity: n <= entry.excited ? 1 : 0.25 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
