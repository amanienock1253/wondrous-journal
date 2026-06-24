import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { C, typeMap } from '../constants/theme.js';
import { TypeIcon, TypeBadge } from './TypeIcon.jsx';

function markViewed(id) {
  try {
    const v = new Set(JSON.parse(localStorage.getItem('wj_viewed') || '[]'));
    v.add(id);
    localStorage.setItem('wj_viewed', JSON.stringify([...v]));
  } catch {}
}

export function StoryViewer({ stories, initialIndex = 0, onClose, onOpen }) {
  const [idx,      setIdx]      = useState(initialIndex);
  const [leaving,  setLeaving]  = useState(null); // 'left' | 'right' | null
  const entry = stories[idx];

  useEffect(() => {
    if (entry) markViewed(entry.id);
  }, [entry?.id]);

  // Keyboard nav
  useEffect(() => {
    const handler = e => {
      if (e.key === 'ArrowRight' || e.key === ' ') go(1);
      if (e.key === 'ArrowLeft')                    go(-1);
      if (e.key === 'Escape')                        onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [idx]);

  const go = useCallback((dir) => {
    const next = idx + dir;
    if (next < 0)               { onClose(); return; }
    if (next >= stories.length) { onClose(); return; }
    setLeaving(dir > 0 ? 'left' : 'right');
    setTimeout(() => { setIdx(next); setLeaving(null); }, 120);
  }, [idx, stories.length, onClose]);

  const handleTap = (e) => {
    // Ignore taps on buttons/interactive elements
    if (e.target.closest('button') || e.target.closest('[data-action]')) return;
    const x = e.clientX;
    const w = window.innerWidth;
    go(x < w / 3 ? -1 : 1);
  };

  if (!entry) return null;

  const t    = typeMap[entry.type] || typeMap.idea;
  const date = new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const hasBody = entry.body && entry.body.trim().length > 0;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        display: 'flex', flexDirection: 'column',
        background: `linear-gradient(160deg, ${t.color}55 0%, #1A1714 45%, #0F0D0B 100%)`,
        transition: 'opacity 0.12s',
        opacity: leaving ? 0 : 1,
        userSelect: 'none',
      }}
      onClick={handleTap}
    >
      {/* Progress pills */}
      <div style={{ display: 'flex', gap: 4, padding: '52px 16px 10px', flexShrink: 0 }}>
        {stories.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i < idx
                ? 'rgba(255,255,255,0.85)'
                : i === idx
                ? 'rgba(255,255,255,0.85)'
                : 'rgba(255,255,255,0.25)',
              transition: 'background 0.15s',
            }}
          />
        ))}
      </div>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px 12px', flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: `${t.color}30`, border: `1px solid ${t.color}50`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginRight: 10,
        }}>
          <TypeIcon type={entry.type} size={18} color="#fff" strokeWidth={1.75} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1 }}>
            {entry.type ? entry.type.charAt(0).toUpperCase() + entry.type.slice(1) : 'Discovery'}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{date}</div>
        </div>
        <button
          data-action
          onClick={e => { e.stopPropagation(); onClose(); }}
          style={{
            background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} color="#fff" strokeWidth={2} />
        </button>
      </div>

      {/* Story content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>

        {/* Big type icon */}
        <div style={{
          width: 84, height: 84, borderRadius: 26, marginBottom: 24,
          background: `${t.color}25`,
          border: `1.5px solid ${t.color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 8px 32px ${t.color}30`,
        }}>
          <TypeIcon type={entry.type} size={40} color={t.color} strokeWidth={1.5} />
        </div>

        <TypeBadge
          type={entry.type}
          style={{
            marginBottom: 18,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
          }}
        />

        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 26, fontWeight: 700, color: '#fff',
          lineHeight: 1.3, marginBottom: hasBody ? 18 : 0,
          textShadow: '0 2px 12px rgba(0,0,0,0.4)',
        }}>
          {entry.title || 'Untitled'}
        </div>

        {hasBody && (
          <div style={{
            fontSize: 15, color: 'rgba(255,255,255,0.72)',
            lineHeight: 1.7, maxWidth: 340,
          }}>
            {entry.body.slice(0, 220)}{entry.body.length > 220 ? '…' : ''}
          </div>
        )}

        {/* Excitement */}
        {(entry.excited || 0) > 0 && (
          <div style={{ display: 'flex', gap: 7, marginTop: 22 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{
                width: 9, height: 9, borderRadius: '50%',
                background: i <= entry.excited ? C.accent : 'rgba(255,255,255,0.2)',
                boxShadow: i <= entry.excited ? `0 0 6px ${C.accent}` : 'none',
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div
        data-action
        style={{ padding: '12px 24px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => go(-1)}
          style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', opacity: idx > 0 ? 1 : 0.2,
          }}
        >
          <ChevronLeft size={20} color="#fff" strokeWidth={2} />
        </button>

        <button
          onClick={() => { onOpen(entry); onClose(); }}
          style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 16, padding: '10px 22px',
            fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer',
          }}
        >
          View full entry
        </button>

        <button
          onClick={() => go(1)}
          style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', opacity: idx < stories.length - 1 ? 1 : 0.2,
          }}
        >
          <ChevronRight size={20} color="#fff" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
