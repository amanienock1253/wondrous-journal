// Section title component used in insights and overview sections.
import { C } from '../constants/theme.js';

export function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: C.muted,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}
