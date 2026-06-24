import { useRef } from 'react';
import { Plus } from 'lucide-react';
import { C, typeMap } from '../constants/theme.js';
import { TypeIcon } from './TypeIcon.jsx';
import { userColor, userInitials } from '../hooks/useCommunityStories.js';

function getViewed() {
  try { return new Set(JSON.parse(localStorage.getItem('wj_viewed') || '[]')); }
  catch { return new Set(); }
}

// Circle for another user's story
function CommunityCircle({ entry, onClick }) {
  const t      = typeMap[entry.type] || typeMap.idea;
  const viewed = getViewed().has(entry.id);
  const color  = userColor(entry.user_id);
  const label  = userInitials(entry.user_id);

  return (
    <button
      onClick={() => onClick(entry)}
      style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0,
      }}
    >
      {/* Ring */}
      <div style={{
        width: 68, height: 68, borderRadius: '50%', padding: 2.5,
        background: viewed
          ? C.border
          : `linear-gradient(135deg, ${color}, ${t.color})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Avatar */}
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}DD, ${color}88)`,
          border: `2.5px solid ${C.bg}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 18, fontWeight: 700, color: '#fff',
          }}>
            {label}
          </span>
          {/* Type badge dot */}
          <div style={{
            position: 'absolute', bottom: 1, right: 1,
            width: 20, height: 20, borderRadius: '50%',
            background: t.gradient,
            border: `2px solid ${C.bg}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TypeIcon type={entry.type} size={10} color="#fff" strokeWidth={2.5} />
          </div>
        </div>
      </div>
      <span style={{
        fontSize: 10.5, color: C.sub, fontWeight: 500,
        maxWidth: 64, textAlign: 'center', lineHeight: 1.2,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {(entry.title || 'Discovery').split(' ')[0]}
      </span>
    </button>
  );
}

// Placeholder loading circle
function GhostCircle() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
      <div style={{
        width: 68, height: 68, borderRadius: '50%',
        background: C.surface, border: `1px solid ${C.border}`,
        animation: 'pulse 1.5s ease infinite',
      }} />
      <div style={{ width: 40, height: 9, borderRadius: 4, background: C.border, animation: 'pulse 1.5s ease infinite' }} />
    </div>
  );
}

export function StoriesRow({ communityStories, loading, userEmail, userId, onAddNew, onViewStory }) {
  const ref      = useRef(null);
  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'WJ';
  const myColor  = userColor(userId);

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        ref={ref}
        className="hide-scroll"
        style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '2px 20px 4px' }}
      >
        {/* ── Your Story (always first) ── */}
        <button
          onClick={onAddNew}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0,
          }}
        >
          <div style={{ position: 'relative' }}>
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

        {/* ── Community stories ── */}
        {loading && [1, 2, 3, 4].map(i => <GhostCircle key={i} />)}

        {!loading && communityStories.map(entry => (
          <CommunityCircle
            key={entry.id}
            entry={entry}
            onClick={onViewStory}
          />
        ))}

        {/* Empty state when no community yet */}
        {!loading && communityStories.length === 0 && (
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: '0 8px',
            fontSize: 12, color: C.muted, fontStyle: 'italic',
            alignSelf: 'center',
          }}>
            No community stories yet
          </div>
        )}
      </div>
    </div>
  );
}
