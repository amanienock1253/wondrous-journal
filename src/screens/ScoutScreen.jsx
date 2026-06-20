// Screen for capturing real-world observations and scout notes.
import { useState } from 'react';
import { ChevronLeft, MapPin } from 'lucide-react';
import { C } from '../constants/theme.js';
import { Label } from '../components/Label.jsx';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

export function ScoutScreen({ onSave, onBack }) {
  const [observation, setObservation] = useState('');
  const [why, setWhy]                 = useState('');
  const [solution, setSolution]       = useState('');
  const [location, setLocation]       = useState('');
  const [saving, setSaving]           = useState(false);
  const { isDesktop } = useBreakpoint();

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

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: isDesktop ? '24px 32px 20px' : '52px 20px 20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button
            onClick={onBack}
            style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: C.sub, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={18} color="#2BA84A" strokeWidth={2} />
              Scout Mode
            </div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>Observing the world</div>
          </div>
        </div>
        <div style={{ background: '#2BA84A18', border: '1px solid #2BA84A33', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#2BA84A', lineHeight: 1.5 }}>
          You're out in the world. Capture what you see — don't overthink it.
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: isDesktop ? '0 32px 32px' : '0 20px 20px' }}>
        <div style={{ marginBottom: 18 }}>
          <Label>What did you observe?</Label>
          <textarea
            autoFocus
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="e.g. Buses are always late because there's no real-time tracking…"
            rows={3}
            style={{ width: '100%', background: C.card, border: '1px solid #2BA84A33', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: C.text, marginTop: 8, resize: 'none', outline: 'none', lineHeight: 1.6 }}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <Label>Why is this a problem?</Label>
          <textarea
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="Who does it affect?"
            rows={2}
            style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, color: C.text, marginTop: 8, resize: 'none', outline: 'none', lineHeight: 1.6 }}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <Label>Any solution idea?</Label>
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Even a rough one is fine…"
            rows={2}
            style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', fontSize: 14, color: C.text, marginTop: 8, resize: 'none', outline: 'none', lineHeight: 1.6 }}
          />
        </div>

        <div style={{ marginBottom: 28 }}>
          <Label>Location (optional)</Label>
          <div style={{ position: 'relative', marginTop: 8 }}>
            <MapPin size={15} strokeWidth={1.75} color={C.muted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Dar es Salaam, Kariakoo market"
              style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px 12px 38px', fontSize: 14, color: C.text, outline: 'none' }}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !observation.trim()}
          style={{ width: '100%', background: '#2BA84A', color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: saving || !observation.trim() ? 0.5 : 1, transition: 'opacity 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <MapPin size={16} strokeWidth={2} />
          {saving ? 'Saving…' : 'Save observation'}
        </button>
      </div>
    </div>
  );
}
