import { useState } from 'react';
import { ChevronLeft, MapPin } from 'lucide-react';
import { C } from '../constants/theme.js';
import { Label } from '../components/Label.jsx';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

const SCOUT_GREEN = '#4A8C5C';

export function ScoutScreen({ onSave, onBack }) {
  const [observation, setObservation] = useState('');
  const [why, setWhy]                 = useState('');
  const [solution, setSolution]       = useState('');
  const [location, setLocation]       = useState('');
  const [saving, setSaving]           = useState(false);
  const { isDesktop }                 = useBreakpoint();

  const handleSave = async () => {
    if (!observation.trim()) return;
    setSaving(true);
    await onSave({
      type: 'scout',
      title: observation.trim(),
      body: [why && `Why it matters: ${why}`, solution && `Possible solution: ${solution}`].filter(Boolean).join('\n\n'),
      location,
      created_at: new Date().toISOString(),
    });
    setSaving(false);
  };

  const inputStyle = {
    width: '100%', background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 14, padding: '12px 16px', fontSize: 14, color: C.text,
    outline: 'none', lineHeight: 1.6, resize: 'none',
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
      {/* Header */}
      <div style={{ padding: isDesktop ? '24px 32px 20px' : '52px 20px 20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <button
            onClick={onBack}
            style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, width: 38, height: 38, cursor: 'pointer', color: C.sub, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={18} color={SCOUT_GREEN} strokeWidth={2} />
              Scout Mode
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Observing the world</div>
          </div>
        </div>
        <div style={{ background: `${SCOUT_GREEN}12`, border: `1px solid ${SCOUT_GREEN}33`, borderRadius: 14, padding: '11px 16px', fontSize: 13, color: SCOUT_GREEN, lineHeight: 1.5 }}>
          You're out in the world. Capture what you see — don't overthink it.
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: isDesktop ? '0 32px 32px' : '0 20px 24px' }}>
        <div style={{ marginBottom: 18 }}>
          <Label>What did you observe?</Label>
          <textarea
            autoFocus
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="e.g. Buses are always late because there's no real-time tracking…"
            rows={3}
            style={{ ...inputStyle, marginTop: 8, border: `1px solid ${observation ? SCOUT_GREEN + '55' : C.border}` }}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <Label>Why is this a problem?</Label>
          <textarea
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="Who does it affect?"
            rows={2}
            style={{ ...inputStyle, marginTop: 8 }}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <Label>Any solution idea?</Label>
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Even a rough one is fine…"
            rows={2}
            style={{ ...inputStyle, marginTop: 8 }}
          />
        </div>

        <div style={{ marginBottom: 28 }}>
          <Label>Location <span style={{ fontWeight: 400, color: C.muted }}>(optional)</span></Label>
          <div style={{ position: 'relative', marginTop: 8 }}>
            <MapPin size={15} strokeWidth={1.75} color={C.muted}
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Dar es Salaam, Kariakoo market"
              style={{ ...inputStyle, padding: '12px 16px 12px 40px', resize: undefined, lineHeight: undefined }}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !observation.trim()}
          style={{
            width: '100%', background: SCOUT_GREEN, color: '#fff', border: 'none',
            borderRadius: 16, padding: '15px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            opacity: saving || !observation.trim() ? 0.45 : 1, transition: 'opacity 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <MapPin size={16} strokeWidth={2} />
          {saving ? 'Saving…' : 'Save observation'}
        </button>
      </div>
    </div>
  );
}
