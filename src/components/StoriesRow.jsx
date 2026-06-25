import { useRef } from 'react';
import { Plus, Check } from 'lucide-react';
import { C } from '../constants/theme.js';
import { STORY_BG } from '../hooks/useStories.js';
import { userColor, userInitials } from '../hooks/useCommunityStories.js';

function getViewed() {
  try { return new Set(JSON.parse(localStorage.getItem('wj_viewed_stories') || '[]')); }
  catch { return new Set(); }
}
export function markStoryViewed(id) {
  try {
    const v = new Set(JSON.parse(localStorage.getItem('wj_viewed_stories') || '[]'));
    v.add(id); localStorage.setItem('wj_viewed_stories', JSON.stringify([...v]));
  } catch {}
}

function GhostCircle() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
      <div style={{ width: 68, height: 68, borderRadius: '50%', background: C.surface, border: `1px solid ${C.border}`, animation: 'pulse 1.5s ease infinite' }} />
      <div style={{ width: 38, height: 8, borderRadius: 4, background: C.border, animation: 'pulse 1.5s ease infinite' }} />
    </div>
  );
}

function CommunityCircle({ story, onClick }) {
  const viewed = getViewed().has(story.id);
  const color  = userColor(story.user_id);
  const label  = story.author_name
    ? story.author_name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : userInitials(story.user_id);
  const theme  = STORY_BG[story.bg] || STORY_BG.sunset;
  const age    = Math.floor((Date.now() - new Date(story.created_at)) / 3600000);

  return (
    <button
      onClick={() => onClick(story)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}
    >
      <div style={{
        width: 68, height: 68, borderRadius: '50%', padding: 2.5,
        background: viewed
          ? C.border
          : `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}EE, ${color}99)`,
          border: `2.5px solid ${C.bg}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#fff' }}>
            {label}
          </span>
        </div>
      </div>
      <span style={{ fontSize: 10.5, color: C.sub, fontWeight: 600, maxWidth: 68, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {story.author_name || (age < 1 ? 'now' : `${age}h`)}
      </span>
      {story.author_name && (
        <span style={{ fontSize: 9.5, color: C.muted, marginTop: -3 }}>
          {age < 1 ? 'now' : `${age}h`}
        </span>
      )}
    </button>
  );
}

export function StoriesRow({ myStory, community, loading, userEmail, userId, onMyStoryPress, onViewStory }) {
  const ref      = useRef(null);
  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'WJ';
  const hasMyStory = !!myStory;
  const myTheme  = myStory ? (STORY_BG[myStory.bg] || STORY_BG.sunset) : null;

  return (
    <div style={{ marginBottom: 16 }}>
      <div ref={ref} className="hide-scroll" style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '2px 20px 4px' }}>

        {/* ── Your Story ── */}
        <button
          onClick={onMyStoryPress}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}
        >
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 68, height: 68, borderRadius: '50%', padding: 2.5,
              background: hasMyStory
                ? `linear-gradient(135deg, ${myTheme.from}, ${myTheme.to})`
                : `linear-gradient(135deg, ${C.accent}, #E8D08A)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
                border: `2.5px solid ${C.bg}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.accent,
              }}>
                {initials}
              </div>
            </div>
            {/* Badge: + if no story, check if has story */}
            <div style={{
              position: 'absolute', bottom: 1, right: 1,
              width: 20, height: 20, borderRadius: '50%',
              background: hasMyStory ? '#2E7D52' : C.accent,
              border: `2px solid ${C.bg}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {hasMyStory
                ? <Check size={11} color="#fff" strokeWidth={3} />
                : <Plus size={11} color="#1C1410" strokeWidth={3} />
              }
            </div>
          </div>
          <span style={{ fontSize: 10.5, color: C.sub, fontWeight: 600 }}>
            {hasMyStory ? 'My Story' : 'Add Story'}
          </span>
        </button>

        {/* ── Community stories ── */}
        {loading && [1,2,3].map(i => <GhostCircle key={i} />)}

        {!loading && community.map(story => (
          <CommunityCircle key={story.id} story={story} onClick={onViewStory} />
        ))}

        {!loading && community.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 4, fontSize: 12, color: C.muted, fontStyle: 'italic', alignSelf: 'center' }}>
            Be the first to post
          </div>
        )}
      </div>
    </div>
  );
}
