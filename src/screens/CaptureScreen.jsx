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
  const { isDesktop }         = useBreakpoint();
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

  const inputStyle = {
    width: '100%', background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 14, padding: '12px 16px', fontSize: 15, color: C.text,
    outline: 'none', transition: 'border-color 0.15s',
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
      {/* Header */}
      <div style={{ padding: isDesktop ? '24px 32px 20px' : '52px 20px 20px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={onBack}
          style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, width: 38, height: 38, cursor: 'pointer', color: C.sub, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.text }}>New capture</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: isDesktop ? '0 32px 32px' : '0 20px 24px' }}>
        {/* Type selector */}
        <div style={{ marginBottom: 24 }}>
          <Label>What kind of capture?</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
            {TYPES.map((option) => {
              const active = type === option.key;
              return (
                <button
                  key={option.key}
                  onClick={() => setType(option.key)}
                  style={{
                    background: active ? `${option.color}12` : C.surface,
                    border: `1.5px solid ${active ? option.color : C.border}`,
                    borderRadius: 14, padding: '14px',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${option.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, fontSize: 18 }}>
                    {option.icon}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: active ? option.color : C.text }}>{option.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 18 }}>
          <Label>Title</Label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={placeholders[type]}
            style={{ ...inputStyle, marginTop: 8 }}
          />
        </div>

        {/* Details */}
        <div style={{ marginBottom: 18 }}>
          <Label>Details <span style={{ fontWeight: 400, color: C.muted }}>(optional)</span></Label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add more context…"
            rows={4}
            style={{ ...inputStyle, marginTop: 8, resize: 'none', lineHeight: 1.7 }}
          />
        </div>

        {/* Excitement */}
        {(type === 'idea' || type === 'project') && (
          <div style={{ marginBottom: 28 }}>
            <Label>How excited are you?</Label>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setExcited(n === excited ? 0 : n)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform 0.1s', transform: n === excited ? 'scale(1.25)' : 'scale(1)' }}
                >
                  <Star size={26} strokeWidth={1.5} color={C.accent}
                    fill={n <= excited ? C.accent : 'transparent'}
                    style={{ opacity: n <= excited ? 1 : 0.25, transition: 'opacity 0.15s, fill 0.15s' }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || (!title.trim() && !body.trim())}
          style={{
            width: '100%', background: t.color, color: '#fff', border: 'none',
            borderRadius: 16, padding: '15px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            opacity: saving || (!title.trim() && !body.trim()) ? 0.45 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {saving ? 'Saving…' : `Save ${t.icon}`}
        </button>
      </div>
    </div>
  );
}
