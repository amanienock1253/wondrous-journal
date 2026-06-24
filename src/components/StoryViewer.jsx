import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { C } from '../constants/theme.js';
import { STORY_BG } from '../hooks/useStories.js';
import { userColor, userInitials } from '../hooks/useCommunityStories.js';
import { markStoryViewed } from './StoriesRow.jsx';

function timeAgo(iso) {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export function StoryViewer({ stories, initialIndex = 0, onClose }) {
  const [idx,     setIdx]     = useState(initialIndex);
  const [fading,  setFading]  = useState(false);

  const story = stories[idx];

  useEffect(() => {
    if (story) markStoryViewed(story.id);
  }, [story?.id]);

  useEffect(() => {
    const h = e => {
      if (e.key === 'ArrowRight' || e.key === ' ') go(1);
      if (e.key === 'ArrowLeft')                    go(-1);
      if (e.key === 'Escape')                        onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [idx]);

  const go = useCallback((dir) => {
    const next = idx + dir;
    if (next < 0 || next >= stories.length) { onClose(); return; }
    setFading(true);
    setTimeout(() => { setIdx(next); setFading(false); }, 130);
  }, [idx, stories.length, onClose]);

  const handleTap = (e) => {
    if (e.target.closest('button') || e.target.closest('[data-stop]')) return;
    go(e.clientX < window.innerWidth / 3 ? -1 : 1);
  };

  if (!story) return null;

  const theme  = STORY_BG[story.bg] || STORY_BG.sunset;
  const color  = userColor(story.user_id);
  const label  = userInitials(story.user_id);
  const expiry = 24 - Math.floor((Date.now() - new Date(story.created_at)) / 3600000);

  return (
    <div
      onClick={handleTap}
      style={{
        position: 'fixed', inset: 0, zIndex: 1400,
        background: `linear-gradient(160deg, ${theme.from} 0%, ${theme.to} 100%)`,
        display: 'flex', flexDirection: 'column',
        opacity: fading ? 0 : 1, transition: 'opacity 0.13s',
        userSelect: 'none',
      }}
    >
      {/* Progress pills */}
      <div style={{ display: 'flex', gap: 4, padding: '52px 16px 10px', flexShrink: 0 }}>
        {stories.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= idx ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
          }} />
        ))}
      </div>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px 16px', flexShrink: 0 }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', marginRight: 10, flexShrink: 0,
          background: `linear-gradient(135deg, ${color}EE, ${color}88)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: '#fff' }}>
            {label}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1 }}>
            Community member
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
            {timeAgo(story.created_at)} · expires in {Math.max(1, expiry)}h
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onClose(); }}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <X size={18} color="#fff" strokeWidth={2} />
        </button>
      </div>

      {/* Story text */}
      <div
        data-stop
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}
      >
        <div style={{
          fontSize: story.text.length > 100 ? 20 : story.text.length > 60 ? 24 : 28,
          fontWeight: 700, color: '#fff', lineHeight: 1.55,
          textShadow: '0 2px 16px rgba(0,0,0,0.25)',
          fontFamily: "'Playfair Display', serif",
        }}>
          {story.text}
        </div>
      </div>

      {/* Nav buttons */}
      <div
        data-stop
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px 56px' }}
      >
        <button
          onClick={() => go(-1)}
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: idx > 0 ? 1 : 0.25 }}
        >
          <ChevronLeft size={22} color="#fff" strokeWidth={2} />
        </button>

        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
          {idx + 1} / {stories.length}
        </div>

        <button
          onClick={() => go(1)}
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: idx < stories.length - 1 ? 1 : 0.25 }}
        >
          <ChevronRight size={22} color="#fff" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
