import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { C } from '../constants/theme.js';
import { STORY_BG } from '../hooks/useStories.js';

const MAX = 300;

export function AddStoryModal({ onPost, onClose, existing, onDelete }) {
  const [text,    setText]    = useState('');
  const [bg,      setBg]      = useState('sunset');
  const [posting, setPosting] = useState(false);

  const theme   = STORY_BG[bg] || STORY_BG.sunset;
  const left    = MAX - text.length;
  const canPost = text.trim().length > 0 && left >= 0;

  const handlePost = async () => {
    if (!canPost || posting) return;
    setPosting(true);
    const ok = await onPost(text, bg);
    if (ok) onClose();
    else setPosting(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1300,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
    }}>
      {/* Story preview card */}
      <div style={{
        width: '100%', maxWidth: 430,
        background: `linear-gradient(160deg, ${theme.from}, ${theme.to})`,
        borderRadius: '28px 28px 0 0',
        padding: '24px 24px 0',
        minHeight: '62vh',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
            {existing ? 'Your active story' : 'Add to story'}
          </span>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={16} color="#fff" strokeWidth={2} />
          </button>
        </div>

        {existing ? (
          /* Show existing story */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#fff', lineHeight: 1.5, marginBottom: 24 }}>
              {existing.text}
            </div>
            <button
              onClick={onDelete}
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 14, padding: '10px 24px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Delete story
            </button>
          </div>
        ) : (
          /* Create new story */
          <>
            <textarea
              autoFocus
              value={text}
              onChange={e => setText(e.target.value.slice(0, MAX))}
              placeholder="What's on your mind?"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none',
                fontSize: 22, fontWeight: 600, color: '#fff', lineHeight: 1.55,
                placeholder: 'rgba(255,255,255,0.5)',
                minHeight: 140,
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0 4px' }}>
              <span style={{ fontSize: 12, color: left < 30 ? '#ff6b6b' : 'rgba(255,255,255,0.5)' }}>
                {left} left
              </span>
            </div>
          </>
        )}

        {/* Background color picker + post button */}
        {!existing && (
          <div style={{
            background: 'rgba(0,0,0,0.25)', borderRadius: '20px 20px 0 0',
            padding: '16px 16px 40px',
            display: 'flex', alignItems: 'center', gap: 10,
            marginLeft: -24, marginRight: -24,
          }}>
            <div style={{ display: 'flex', gap: 10, flex: 1, overflowX: 'auto' }} className="hide-scroll">
              {Object.entries(STORY_BG).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setBg(key)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0, border: 'none', cursor: 'pointer',
                    background: `linear-gradient(135deg, ${val.from}, ${val.to})`,
                    outline: bg === key ? '2.5px solid #fff' : '2.5px solid transparent',
                    outlineOffset: 2,
                    transition: 'transform 0.1s',
                    transform: bg === key ? 'scale(1.18)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
            <button
              onClick={handlePost}
              disabled={!canPost || posting}
              style={{
                width: 48, height: 48, borderRadius: '50%', border: 'none', flexShrink: 0,
                background: canPost && !posting ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                cursor: canPost && !posting ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              <Send size={20} color={canPost && !posting ? '#1C1410' : 'rgba(255,255,255,0.5)'} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
