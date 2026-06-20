// Toast message component used for brief success and status feedback.
import { C } from '../constants/theme.js';

export function Toast({ emoji, message }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 100,
        left: '50%',
        transform: 'translateX(-50%)',
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: '10px 20px',
        fontSize: 14,
        color: C.text,
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        animation: 'slideUp 0.2s ease',
        whiteSpace: 'nowrap',
        zIndex: 99,
      }}
    >
      <span>{emoji}</span> {message}
    </div>
  );
}
