// Detail screen — view and edit a single entry with Lucide action icons.
import { useEffect, useState } from 'react';
import { ChevronLeft, Pencil, X, Trash2, MapPin, Star } from 'lucide-react';
import { C, typeMap } from '../constants/theme.js';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

export function DetailScreen({ entry, onBack, onDelete, onUpdate, showToast }) {
  const [editing, setEditing]   = useState(false);
  const [title, setTitle]       = useState(entry.title || '');
  const [body, setBody]         = useState(entry.body  || '');
  const [showDel, setShowDel]   = useState(false);
  const { isDesktop }           = useBreakpoint();
  const t = typeMap[entry.type] || typeMap.idea;

  useEffect(() => {
    setTitle(entry.title || '');
    setBody(entry.body   || '');
  }, [entry]);

  const handleSave = async () => {
    const updated = await onUpdate({ ...entry, title, body });
    if (updated) setEditing(false);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{ padding: isDesktop ? '24px 32px 16px' : '52px 20px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          {/* Back */}
          <button
            onClick={onBack}
            style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: C.sub, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setEditing(!editing)}
              style={{
                background: editing ? C.accent : C.card,
                border: `1px solid ${editing ? C.accent : C.border}`,
                borderRadius: 10, padding: '0 14px', height: 36, cursor: 'pointer',
                color: editing ? '#fff' : C.sub,
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500,
              }}
            >
              {editing ? <X size={14} strokeWidth={2} /> : <Pencil size={14} strokeWidth={1.75} />}
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <button
              onClick={() => setShowDel(true)}
              style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: C.sub, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Trash2 size={15} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Type badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${t.color}22`, border: `1px solid ${t.color}44`, borderRadius: 8, padding: '4px 10px', marginBottom: 10 }}>
          <span style={{ fontSize: 13 }}>{t.icon}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: t.color }}>{t.label}</span>
        </div>

        {/* Date + location */}
        <div style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span>{new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          {entry.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={11} strokeWidth={2} />
              {entry.location}
            </span>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: isDesktop ? '0 32px 32px' : '0 20px 20px' }}>
        {editing ? (
          <>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', background: C.card, border: `1px solid ${C.accent}`, borderRadius: 12, padding: '12px 14px', fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 14, outline: 'none', fontFamily: "'Sora',sans-serif" }}
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, color: C.text, resize: 'none', outline: 'none', lineHeight: 1.7, marginBottom: 20 }}
            />
            <button
              onClick={handleSave}
              style={{ width: '100%', background: t.color, color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
            >
              Save changes
            </button>
          </>
        ) : (
          <>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: 16 }}>
              {entry.title || 'Untitled'}
            </div>
            {entry.excited > 0 && (
              <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={15} strokeWidth={1.5} color="#E09A2B" fill={n <= entry.excited ? '#E09A2B' : 'transparent'} style={{ opacity: n <= entry.excited ? 1 : 0.2 }} />
                ))}
              </div>
            )}
            {entry.body
              ? <div style={{ fontSize: 15, color: C.sub, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{entry.body}</div>
              : <div style={{ fontSize: 14, color: C.muted, fontStyle: 'italic' }}>No notes. Tap Edit to add more.</div>
            }
          </>
        )}
      </div>

      {/* ── Delete confirmation sheet ── */}
      {showDel && (
        <div
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', zIndex: 10 }}
          onClick={() => setShowDel(false)}
        >
          <div
            style={{ background: C.surface, borderRadius: '20px 20px 0 0', padding: '28px 20px 40px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Trash2 size={18} color="#E8614A" strokeWidth={2} />
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700 }}>Delete this entry?</div>
            </div>
            <div style={{ fontSize: 14, color: C.sub, marginBottom: 24 }}>This can't be undone.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowDel(false)} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 500, color: C.text, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => onDelete(entry.id)} style={{ flex: 1, background: '#E8614A', border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
