import { useState, useEffect, useRef } from 'react';
import { X, Send, Trash2 } from 'lucide-react';
import { STORY_BG } from '../hooks/useStories.js';

const MAX = 300;

const BG_KEYS = Object.keys(STORY_BG);

export function AddStoryModal({ onPost, onClose, existing, onDelete }) {
  const [text,    setText]    = useState('');
  const [bgIdx,   setBgIdx]   = useState(0);
  const [posting, setPosting] = useState(false);
  const [kbH,     setKbH]     = useState(0);
  const textareaRef           = useRef(null);

  const bg    = BG_KEYS[bgIdx];
  const theme = STORY_BG[bg];
  const left  = MAX - text.length;

  // Track keyboard height via visualViewport
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      setKbH(Math.max(0, offset));
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => { vv.removeEventListener('resize', update); vv.removeEventListener('scroll', update); };
  }, []);

  // Auto-focus
  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  const handlePost = async () => {
    if (!text.trim() || posting) return;
    setPosting(true);
    const ok = await onPost(text.trim(), bg);
    if (!ok) setPosting(false);
    // onPost resolves then onClose is called from parent
  };

  const cycleColor = () => setBgIdx(i => (i + 1) % BG_KEYS.length);

  if (existing) {
    // Show existing story — view/delete mode
    const exTheme = STORY_BG[existing.bg] || STORY_BG.sunset;
    const expiry  = 24 - Math.floor((Date.now() - new Date(existing.created_at)) / 3600000);
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1300,
        background: `linear-gradient(160deg, ${exTheme.from} 0%, ${exTheme.to} 100%)`,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '56px 20px 16px' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Your Story</span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} color="#fff" strokeWidth={2} />
          </button>
        </div>

        {/* Story text */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
          <div style={{ fontSize: existing.text.length > 80 ? 22 : 28, fontWeight: 700, color: '#fff', lineHeight: 1.5, fontFamily: "'Playfair Display', serif" }}>
            {existing.text}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 24px 56px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            Expires in {Math.max(1, expiry)} hour{expiry !== 1 ? 's' : ''}
          </div>
          <button
            onClick={onDelete}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 16, padding: '12px 24px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            <Trash2 size={15} strokeWidth={2} /> Delete story
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1300,
      background: `linear-gradient(160deg, ${theme.from} 0%, ${theme.to} 100%)`,
      display: 'flex', flexDirection: 'column',
      transition: 'background 0.3s ease',
    }}>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '56px 20px 0', flexShrink: 0 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>New Story</span>
        <button
          onClick={onClose}
          style={{ background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <X size={18} color="#fff" strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Text area — centered in remaining space ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 28px' }}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value.slice(0, MAX))}
          placeholder="What's on your mind?"
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: text.length > 120 ? 18 : text.length > 60 ? 22 : 26,
            fontWeight: 700,
            fontFamily: "'Playfair Display', serif",
            color: '#fff',
            textAlign: 'center',
            lineHeight: 1.55,
            caretColor: 'rgba(255,255,255,0.9)',
            WebkitTextFillColor: '#fff',
            // Placeholder color via ::placeholder is in global.css
          }}
          rows={6}
          maxLength={MAX}
          className="story-input"
        />
      </div>

      {/* ── Bottom controls — floats above keyboard ── */}
      <div style={{
        flexShrink: 0,
        paddingBottom: kbH > 0 ? kbH + 12 : 48,
        padding: `12px 24px ${kbH > 0 ? kbH + 12 : 48}px`,
        background: 'rgba(0,0,0,0.18)',
        display: 'flex', alignItems: 'center', gap: 14,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'padding-bottom 0.15s',
      }}>

        {/* Color dots */}
        <div className="hide-scroll" style={{ display: 'flex', gap: 10, flex: 1, overflowX: 'auto' }}>
          {BG_KEYS.map((key, i) => {
            const t = STORY_BG[key];
            const active = i === bgIdx;
            return (
              <button
                key={key}
                onClick={() => setBgIdx(i)}
                style={{
                  width: active ? 36 : 30,
                  height: active ? 36 : 30,
                  borderRadius: '50%',
                  flexShrink: 0,
                  border: 'none',
                  cursor: 'pointer',
                  background: `linear-gradient(135deg, ${t.from}, ${t.to})`,
                  outline: active ? '2.5px solid #fff' : '2px solid transparent',
                  outlineOffset: 2,
                  transition: 'all 0.15s ease',
                  boxShadow: active ? '0 2px 10px rgba(0,0,0,0.3)' : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Counter + Send */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: left < 40 ? '#ffcccc' : 'rgba(255,255,255,0.55)', fontWeight: 600, minWidth: 28, textAlign: 'right' }}>
            {left}
          </span>
          <button
            onClick={handlePost}
            disabled={!text.trim() || posting}
            style={{
              width: 46, height: 46, borderRadius: '50%', border: 'none',
              background: text.trim() && !posting ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.25)',
              cursor: text.trim() && !posting ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
              boxShadow: text.trim() && !posting ? '0 4px 16px rgba(0,0,0,0.25)' : 'none',
            }}
          >
            <Send size={19} color={text.trim() && !posting ? '#1C1410' : 'rgba(255,255,255,0.4)'} strokeWidth={2.5} style={{ transform: 'translateX(1px)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
