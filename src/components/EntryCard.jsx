import { useState } from 'react';
import { Star, ChevronRight } from 'lucide-react';
import { typeMap, C } from '../constants/theme.js';
import { TypeIcon, TypeCircle, TypeBadge } from './TypeIcon.jsx';
import { formatEntryDate, timeOfDay } from '../utils/time.js';

// flat=true: compact row (compact list panels)
export function EntryCard({ entry, onOpen, flat }) {
  const [pressed, setPressed] = useState(false);
  const t = typeMap[entry.type] || typeMap.idea;
  const isStarred = (entry.excited || 0) >= 3;

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
          background: C.surface,
          padding: '12px 16px',
          cursor: 'pointer',
          transform: pressed ? 'scale(0.985)' : 'scale(1)',
          transition: 'transform 0.1s ease',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: `${t.color}12`,
          border: `1px solid ${t.color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TypeIcon type={entry.type} size={15} strokeWidth={2} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {entry.title || 'Untitled'}
          </div>
          <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>
            <span style={{ color: t.color, fontWeight: 600 }}>{t.label}</span>
            {' · '}{formatEntryDate(entry.created_at)}
          </div>
        </div>

        {isStarred && <Star size={12} fill={C.accent} color={C.accent} strokeWidth={0} style={{ flexShrink: 0 }} />}
      </div>
    );
  }

  // Premium card
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
        borderRadius: 18,
        padding: '16px 18px',
        cursor: 'pointer',
        transform: pressed ? 'scale(0.974)' : 'scale(1)',
        transition: 'transform 0.12s ease, box-shadow 0.15s ease',
        boxShadow: pressed
          ? '0 1px 6px rgba(26,23,20,0.05)'
          : '0 2px 14px rgba(26,23,20,0.06), 0 1px 3px rgba(26,23,20,0.04)',
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
        animation: 'slideUp 0.2s ease both',
        marginBottom: 10,
        borderLeft: `3px solid ${t.color}`,
      }}
    >
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
          <TypeBadge type={entry.type} />
          <span style={{ fontSize: 10.5, color: C.muted }}>
            {formatEntryDate(entry.created_at)}
          </span>
          {isStarred && (
            <Star size={11} fill={C.accent} color={C.accent} strokeWidth={0} style={{ marginLeft: 'auto' }} />
          )}
        </div>

        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 16.5, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: entry.body ? 6 : 0,
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

        {(entry.excited || 0) > 0 && (
          <div style={{ display: 'flex', gap: 3, marginTop: 10 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: i <= (entry.excited || 0) ? C.accent : C.border,
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Icon thumbnail */}
      <TypeCircle type={entry.type} size={62} />
    </div>
  );
}
