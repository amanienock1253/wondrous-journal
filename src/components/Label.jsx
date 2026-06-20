// Simple label component for section headers and field tags.
import { C } from '../constants/theme.js';

export function Label({ children }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: C.muted,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
      }}
    >
      {children}
    </div>
  );
}
