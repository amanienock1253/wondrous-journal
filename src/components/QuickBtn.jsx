// Premium quick-action card with a Lucide icon mark, press feedback, and subtle glow on hover.
import { useState } from 'react';
import { C } from '../constants/theme.js';

export function QuickBtn({ LucideIcon, label, sub, onClick, accent = C.accent }) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => { setPressed(false); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        background: C.card,
        border: `1px solid ${hovered ? accent + '55' : C.border}`,
        borderRadius: 16,
        padding: '16px',
        textAlign: 'left',
        cursor: 'pointer',
        transform: pressed ? 'scale(0.96)' : 'scale(1)',
        boxShadow: hovered ? `0 4px 20px ${accent}22` : 'none',
        transition: 'transform 0.1s, border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {/* Icon mark */}
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `${accent}18`,
        border: `1px solid ${accent}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 12,
      }}>
        <LucideIcon size={20} color={accent} strokeWidth={2} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{label}</div>
      <div style={{ fontSize: 11, color: C.sub, marginTop: 3 }}>{sub}</div>
    </button>
  );
}
