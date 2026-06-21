import { useMemo } from 'react';
import { FolderKanban, ChevronRight, Plus, Rocket, Target, CheckCircle2, Clock } from 'lucide-react';
import { C, typeMap } from '../constants/theme.js';
import { useBreakpoint } from '../hooks/useBreakpoint.js';
import { formatEntryDate } from '../utils/time.js';

function OpportunityScore({ score }) {
  const color = score >= 4 ? '#2E7D52' : score >= 3 ? C.accent : C.muted;
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: i <= score ? color : C.border,
        }} />
      ))}
    </div>
  );
}

function ProjectCard({ entry, onOpen }) {
  const t = typeMap[entry.type] || typeMap.idea;
  const excited = entry.excited || 0;
  const age = Math.floor((Date.now() - new Date(entry.created_at)) / 86400000);

  const statusColor = excited >= 4 ? '#2E7D52' : excited >= 2 ? C.accent : C.muted;
  const statusLabel = excited >= 4 ? 'High Potential' : excited >= 2 ? 'In Progress' : 'Exploring';
  const StatusIcon = excited >= 4 ? CheckCircle2 : excited >= 2 ? Rocket : Clock;

  return (
    <div
      onClick={() => onOpen(entry)}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 20, padding: '20px',
        cursor: 'pointer', marginBottom: 12,
        transition: 'transform 0.12s ease, box-shadow 0.15s ease',
        animation: 'slideUp 0.22s ease both',
        borderTop: `3px solid ${t.color}`,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,23,20,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 15, flexShrink: 0,
          background: t.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 24 }}>{t.icon}</span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Status pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: `${statusColor}15`, border: `1px solid ${statusColor}30`,
              borderRadius: 6, padding: '2px 8px',
            }}>
              <StatusIcon size={10} color={statusColor} strokeWidth={2} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: statusColor }}>{statusLabel}</span>
            </div>
            <span style={{ fontSize: 11, color: C.muted }}>{age}d ago</span>
          </div>

          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 17, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: 6,
          }}>
            {entry.title || 'Untitled'}
          </div>

          {entry.body && (
            <div style={{
              fontSize: 13, color: C.sub, lineHeight: 1.6, marginBottom: 12,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {entry.body}
            </div>
          )}

          {/* Score + type */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>Score</span>
              <OpportunityScore score={excited} />
            </div>
            <div style={{
              fontSize: 11.5, fontWeight: 600, color: t.color,
              background: `${t.color}12`, border: `1px solid ${t.color}25`,
              borderRadius: 6, padding: '2px 8px',
            }}>
              {t.label}
            </div>
          </div>
        </div>

        <ChevronRight size={16} color={C.muted} strokeWidth={1.75} style={{ flexShrink: 0, marginTop: 4 }} />
      </div>
    </div>
  );
}

export function ProjectsScreen({ entries, onOpen, onDiscover }) {
  const { isDesktop } = useBreakpoint();

  // Projects = high-excitement entries (3+) or type='project'/'idea'/'opportunity'
  const projects = useMemo(() => {
    return entries
      .filter(e =>
        (e.excited || 0) >= 2 ||
        e.type === 'project' ||
        e.type === 'opportunity'
      )
      .sort((a, b) => (b.excited || 0) - (a.excited || 0));
  }, [entries]);

  const activeProjects   = projects.filter(e => (e.excited || 0) >= 4);
  const exploringProjects = projects.filter(e => (e.excited || 0) >= 2 && (e.excited || 0) < 4);

  const hPad = isDesktop ? '36px 48px 0' : '52px 20px 0';
  const px   = isDesktop ? '24px 48px 48px' : '16px 20px 120px';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>

      {/* Header */}
      <div style={{ padding: hPad, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isDesktop ? 32 : 26,
              fontWeight: 700, color: C.text,
            }}>
              Projects
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
              {projects.length} idea{projects.length !== 1 ? 's' : ''} in motion
            </div>
          </div>

          <button
            onClick={onDiscover}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
              color: C.accent, border: 'none', borderRadius: 14,
              padding: '10px 18px', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(28,20,16,0.25)',
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            New Idea
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="hide-scroll" style={{ flex: 1, overflowY: 'auto', padding: px }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Total Ideas', value: projects.length, icon: '💡' },
            { label: 'High Potential', value: activeProjects.length, icon: '🚀' },
            { label: 'Exploring', value: exploringProjects.length, icon: '🔍' },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: '16px 12px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: C.text, lineHeight: 1 }}>
                {value}
              </div>
              <div style={{ fontSize: 10.5, color: C.muted, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {projects.length === 0 ? (
          // Empty state
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 22, padding: '48px 28px', textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px',
            }}>
              <FolderKanban size={28} color={C.accent} strokeWidth={1.75} />
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 10 }}>
              Ideas in motion start here
            </div>
            <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.7, marginBottom: 24 }}>
              When you rate an Idea or Opportunity with a high score in Discover, it automatically appears here as a project to track and develop.
            </div>
            <button
              onClick={onDiscover}
              style={{
                background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
                color: C.accent, border: 'none', borderRadius: 16,
                padding: '14px 28px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: '0 6px 20px rgba(28,20,16,0.28)',
              }}
            >
              <span>💡</span> Capture an Idea
            </button>
          </div>
        ) : (
          <>
            {/* High potential */}
            {activeProjects.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 7,
                    background: '#2E7D5215',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Rocket size={13} color="#2E7D52" strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>High Potential</span>
                  <span style={{ fontSize: 11.5, color: C.muted }}>({activeProjects.length})</span>
                </div>
                {activeProjects.map(e => <ProjectCard key={e.id} entry={e} onOpen={onOpen} />)}
              </div>
            )}

            {/* Exploring */}
            {exploringProjects.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 7,
                    background: `${C.accent}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Target size={13} color={C.accent} strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Exploring</span>
                  <span style={{ fontSize: 11.5, color: C.muted }}>({exploringProjects.length})</span>
                </div>
                {exploringProjects.map(e => <ProjectCard key={e.id} entry={e} onOpen={onOpen} />)}
              </div>
            )}

            {/* CTA: score your ideas */}
            <div style={{
              background: C.accentDim,
              border: `1px solid ${C.accent}30`,
              borderRadius: 18, padding: '18px 20px', marginTop: 16,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <span style={{ fontSize: 28 }}>💡</span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 3 }}>
                  Rate your discoveries
                </div>
                <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.5 }}>
                  Open any Vault entry and rate its potential to see it appear here.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
