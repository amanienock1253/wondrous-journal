import { useRef } from 'react';
import { Plus } from 'lucide-react';
import { C, typeMap } from '../constants/theme.js';
import { TypeIcon } from './TypeIcon.jsx';

function getViewed() {
  try { return new Set(JSON.parse(localStorage.getItem('wj_viewed') || '[]')); }
  catch { return new Set(); }
}

function StoryCircle({ entry, onClick }) {
  const t       = typeMap[entry.type] || typeMap.idea;
  const viewed  = getViewed().has(entry.id);
  const label   = (entry.title || 'Discovery').split(' ').slice(0, 2).join(' ');

  return (
    <button
      onClick={() => onClick(entry)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
               display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}
    >
      {/* Gradient ring */}
      <div style={{
        width: 68, height: 68, borderRadius: '50%', padding: 2.5,
        background: viewed
          ? C.border
          : `linear-gradient(135deg, ${t.color}, ${C.accent} 60%, ${t.color})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Inner circle */}
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          background: t.gradient,
          border: `2.5px solid ${C.bg}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TypeIcon type={entry.type} size={26} color="#fff" strokeWidth={1.75} />
        </div>
      </div>
      <span style={{
        fontSize: 10.5, color: C.sub, fontWeight: 500,
        maxWidth: 64, textAlign: 'center', lineHeight: 1.2,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
    </button>
  );
}

export function StoriesRow({ entries, userEmail, onAddNew, onViewStory }) {
  const ref      = useRef(null);
  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'WJ';
  const stories  = entries.slice(0, 8);

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        ref={ref}
        className="hide-scroll"
        style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '2px 20px 4px' }}
      >
        {/* Your Story */}
        <button
          onClick={onAddNew}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                   display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}
        >
          <div style={{ position: 'relative' }}>
            {/* Accent ring */}
            <div style={{
              width: 68, height: 68, borderRadius: '50%', padding: 2.5,
              background: `linear-gradient(135deg, ${C.accent}, #E8D08A)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
                border: `2.5px solid ${C.bg}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Playfair Display', serif",
                fontSize: 20, fontWeight: 700, color: C.accent,
              }}>
                {initials}
              </div>
            </div>
            {/* Plus badge */}
            <div style={{
              position: 'absolute', bottom: 1, right: 1,
              width: 20, height: 20, borderRadius: '50%',
              background: C.accent, border: `2px solid ${C.bg}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Plus size={11} color="#1C1410" strokeWidth={3} />
            </div>
          </div>
          <span style={{ fontSize: 10.5, color: C.sub, fontWeight: 600 }}>Your Story</span>
        </button>

        {/* Discovery stories */}
        {stories.map(e => (
          <StoryCircle key={e.id} entry={e} onClick={onViewStory} />
        ))}

        {/* Empty placeholders when no entries */}
        {stories.length === 0 && [1,2,3].map(i => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: C.surface, border: `1px dashed ${C.border}` }} />
            <span style={{ fontSize: 10.5, color: C.border }}>·  ·  ·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
