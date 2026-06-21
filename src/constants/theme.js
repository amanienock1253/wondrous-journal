export const C = {
  bg:          '#F5F0E8',
  surface:     '#FFFFFF',
  surfaceAlt:  '#FDFBF7',
  card:        '#FFFFFF',
  border:      '#E8E0D0',
  borderLight: '#F2EDE4',
  muted:       '#9E8C7A',
  text:        '#1A1714',
  sub:         '#5C4E42',
  accent:      '#C9A84C',
  accentDim:   '#FBF3DF',
  accentDark:  '#A8882E',
  error:       '#C94A3A',
  success:     '#2E7D52',
  premium:     '#1C1410',
};

export const DISCOVERY_TYPES = [
  { key: 'problem',     label: 'Problem',     icon: '⚠️', color: '#E85D3A', gradient: 'linear-gradient(135deg, #E85D3A 0%, #F5A58C 100%)', desc: 'A pain point worth solving' },
  { key: 'idea',        label: 'Idea',        icon: '💡', color: '#7C6AF7', gradient: 'linear-gradient(135deg, #7C6AF7 0%, #B8B0FF 100%)', desc: 'A concept that could change things' },
  { key: 'observation', label: 'Observation', icon: '👁',  color: '#2D9CDB', gradient: 'linear-gradient(135deg, #2D9CDB 0%, #7DC8F0 100%)', desc: 'Something interesting you noticed' },
  { key: 'question',    label: 'Question',    icon: '❓', color: '#F2994A', gradient: 'linear-gradient(135deg, #F2994A 0%, #FFC87A 100%)', desc: 'A question worth exploring' },
  { key: 'lesson',      label: 'Lesson',      icon: '📚', color: '#2E7D52', gradient: 'linear-gradient(135deg, #2E7D52 0%, #5AB87A 100%)', desc: 'Something you learned' },
  { key: 'opportunity', label: 'Opportunity', icon: '🎯', color: '#C9A84C', gradient: 'linear-gradient(135deg, #C9A84C 0%, #E8D08A 100%)', desc: 'A gap or chance to pursue' },
  { key: 'research',    label: 'Research',    icon: '🔬', color: '#9B51E0', gradient: 'linear-gradient(135deg, #9B51E0 0%, #C89EF0 100%)', desc: 'Data, studies, or findings' },
  { key: 'inspiration', label: 'Inspiration', icon: '✨', color: '#EB5757', gradient: 'linear-gradient(135deg, #EB5757 0%, #F5A0A0 100%)', desc: 'A spark that ignites new thinking' },
];

const LEGACY_TYPES = [
  { key: 'scout',   label: 'Scout',   icon: '📍', color: '#4A8C5C', gradient: 'linear-gradient(135deg, #3A7A5A 0%, #7DC8A0 100%)', desc: 'Field observation' },
  { key: 'project', label: 'Project', icon: '🚀', color: '#D4893A', gradient: 'linear-gradient(135deg, #D4893A 0%, #F5C87A 100%)', desc: 'Active project' },
];

export const TYPES = DISCOVERY_TYPES;
export const typeMap = Object.fromEntries([...DISCOVERY_TYPES, ...LEGACY_TYPES].map(t => [t.key, t]));
