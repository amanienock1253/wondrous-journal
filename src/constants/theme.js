export const C = {
  bg:         '#F7F3EE',   // warm cream parchment
  surface:    '#FFFFFF',   // white
  card:       '#FFFFFF',   // white card
  border:     '#EBE4DA',   // warm soft border
  muted:      '#BCA99A',   // muted brown
  text:       '#1C1917',   // near-black
  sub:        '#6B5E52',   // warm brown sub-text
  accent:     '#C9A84C',   // golden amber
  accentDim:  '#FBF3DF',   // light golden tint
  error:      '#C94A3A',   // terracotta red
};

export const TYPES = [
  { key: 'idea',    label: 'Idea',    icon: '💡', color: '#7C6AF7' },
  { key: 'problem', label: 'Problem', icon: '🔍', color: '#C94A3A' },
  { key: 'scout',   label: 'Scout',   icon: '📍', color: '#4A8C5C' },
  { key: 'project', label: 'Project', icon: '🚀', color: '#D4893A' },
];

export const typeMap = Object.fromEntries(TYPES.map((t) => [t.key, t]));
