import {
  AlertTriangle, Lightbulb, Eye, HelpCircle, BookOpen,
  Target, Microscope, Zap, Compass, Rocket,
} from 'lucide-react';
import { typeMap } from '../constants/theme.js';

export const TYPE_ICON_MAP = {
  problem:     AlertTriangle,
  idea:        Lightbulb,
  observation: Eye,
  question:    HelpCircle,
  lesson:      BookOpen,
  opportunity: Target,
  research:    Microscope,
  inspiration: Zap,
  scout:       Compass,
  project:     Rocket,
};

export function TypeIcon({ type, size = 18, strokeWidth = 1.75, color }) {
  const t    = typeMap[type] || typeMap.idea;
  const Icon = TYPE_ICON_MAP[type] || Lightbulb;
  return <Icon size={size} color={color ?? t.color} strokeWidth={strokeWidth} />;
}

// Pill badge used in entry cards / detail headers
export function TypeBadge({ type, style }) {
  const t = typeMap[type] || typeMap.idea;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: `${t.color}12`, border: `1px solid ${t.color}28`,
      borderRadius: 8, padding: '3px 9px',
      ...style,
    }}>
      <TypeIcon type={type} size={11} strokeWidth={2} />
      <span style={{ fontSize: 11, fontWeight: 600, color: t.color, letterSpacing: '0.01em' }}>
        {t.label}
      </span>
    </div>
  );
}

// Circle icon used in cards / grids
export function TypeCircle({ type, size = 44 }) {
  const t = typeMap[type] || typeMap.idea;
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.3),
      background: t.gradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <TypeIcon type={type} size={Math.round(size * 0.42)} color="#fff" strokeWidth={2} />
    </div>
  );
}
