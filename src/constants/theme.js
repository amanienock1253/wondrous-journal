// Shared theme tokens and journal entry types used across the app.
export const C = {
  bg: '#0E0F14',
  surface: '#16171E',
  card: '#1C1D27',
  border: '#2A2B38',
  muted: '#4A4B5C',
  text: '#E8E9F0',
  sub: '#8A8B9A',
  accent: '#7C6AF7',
  accentDim: '#2E2956',
};

export const TYPES = [
  { key: 'idea', label: 'Idea', icon: '💡', color: '#7C6AF7' },
  { key: 'problem', label: 'Problem', icon: '🔍', color: '#E8614A' },
  { key: 'scout', label: 'Scout', icon: '📍', color: '#2BA84A' },
  { key: 'project', label: 'Project', icon: '🚀', color: '#E09A2B' },
];

export const typeMap = Object.fromEntries(TYPES.map((t) => [t.key, t]));
