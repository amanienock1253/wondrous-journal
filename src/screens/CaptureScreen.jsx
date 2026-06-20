// Screen for creating a new idea, problem, or project capture.
import { useState } from 'react';
import { ChevronLeft, Star } from 'lucide-react';
import { C, TYPES, typeMap } from '../constants/theme.js';
import { Label } from '../components/Label.jsx';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

export function CaptureScreen({ onSave, onBack }) {
  const [type, setType]       = useState('idea');
  const [title, setTitle]     = useState('');
  const [body, setBody]       = useState('');
  const [excited, setExcited] = useState(0);
  const [saving, setSaving]   = useState(false);
  const { isDesktop } = useBreakpoint();
  const t = typeMap[type];

  const handleSave = async () => {
    if (!title.trim() && !body.trim()) return;
    setSaving(true);
    await onSave({ type, title: title.trim(), body: body.trim(), excited, created_at: new Date().toISOString() });
    setSaving(false);
  };

  const placeholders = {
    idea:    'e.g. Solar charging for street vendors',
    problem: 'e.g. Schools still use paper attendance',
    scout:   'e.g. Bus stop with no shelter',
    project: 'e.g. Wondrous Home Assistant',
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: isDesktop ? '24px 32px 20px' : '52px 20px 20px', gap: 12, flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: C.sub, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>
        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700 }}>New capture</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: isDesktop ? '0 32px 32px' : '0 20px 20px' }}>
        {/* Type selector */}
        <div style={{ marginBottom: 24 }}>
          <Label>What kind of capture is this?</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
            {TYPES.map((option) => (
              <button
                key={option.key}
                onClick={() => setType(option.key)}
                style={{
                  background: type === option.key ? `${option.color}18` : C.card,
                  border: `1.5px solid ${type === option.key ? option.color : C.border}`,
                  borderRadius: 12, padding: '12px 14px',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>{option.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: type === option.key ? option.color : C.text }}>
                  {option.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <Label>Title</Label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={placeholders[type]}
            style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 15, color: C.text, marginTop: 8, outline: 'none' }}
          />
        </div>

        {/* Details */}
        <div style={{ marginBottom: 20 }}>
          <Label>Details (optional)</Label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add more context…"
            rows={4}
            style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, color: C.text, marginTop: 8, resize: 'none', outline: 'none', lineHeight: 1.6 }}
          />
        </div>

        {/* Excitement (idea + project only) */}
        {(type === 'idea' || type === 'project') && (
          <div style={{ marginBottom: 28 }}>
            <Label>How excited are you?</Label>
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setExcited(n === excited ? 0 : n)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform 0.1s', transform: n === excited ? 'scale(1.2)' : 'scale(1)' }}
                >
                  <Star size={22} strokeWidth={1.5} color="#E09A2B" fill={n <= excited ? '#E09A2B' : 'transparent'} style={{ opacity: n <= excited ? 1 : 0.3, transition: 'opacity 0.15s, fill 0.15s' }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || (!title.trim() && !body.trim())}
          style={{
            width: '100%', background: t.color, color: '#fff', border: 'none',
            borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            opacity: saving || (!title.trim() && !body.trim()) ? 0.5 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {saving ? 'Saving…' : `Save ${t.icon}`}
        </button>
      </div>
    </div>
  );
}
