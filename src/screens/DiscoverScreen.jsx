import { useState, useRef } from 'react';
import { ChevronLeft, Plus, Mic, MicOff, Search, X, Wand2, ChevronRight } from 'lucide-react';
import { C, DISCOVERY_TYPES, typeMap } from '../constants/theme.js';
import { TypeIcon, TypeBadge, TypeCircle } from '../components/TypeIcon.jsx';
import { EntryCard } from '../components/EntryCard.jsx';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;

// ── Auto-detect type from text ───────────────────────────────────────────────
const TYPE_KEYWORDS = {
  problem:     ['problem', 'issue', 'pain', 'frustrat', 'broken', 'fail', 'struggle', 'difficult', 'annoy', 'bug', 'wrong', 'bad', 'hurt', 'challenge', 'complain'],
  idea:        ['idea', 'what if', 'should we', 'build a', 'create a', 'imagine', 'concept', 'app that', 'platform', 'product', 'feature', 'solution', 'startup'],
  observation: ['noticed', 'observed', 'saw', 'interesting', 'weird', 'curious', 'funny how', 'people are', 'everyone', 'most people', 'watching'],
  question:    ['why', 'how does', 'what is', 'wondering', 'question', 'curious about', 'don\'t understand', '?'],
  lesson:      ['learned', 'lesson', 'realized', 'understood', 'taught me', 'now i know', 'key insight', 'tip'],
  opportunity: ['market', 'business', 'opportunity', 'revenue', 'niche', 'gap in', 'nobody', 'no one is', 'monetize', 'billion'],
  research:    ['research', 'study', 'data', 'statistics', 'according to', 'found that', 'survey', 'report', 'article', 'paper'],
  inspiration: ['inspired', 'love how', 'amazing', 'beautiful', 'brilliant', 'genius', 'incredible', 'wow', 'blown away'],
};

function autoDetectType(text) {
  const t = text.toLowerCase();
  let best = { type: 'observation', score: 0 };
  for (const [type, kws] of Object.entries(TYPE_KEYWORDS)) {
    const score = kws.filter(w => t.includes(w)).length;
    if (score > best.score) best = { type, score };
  }
  return best.type;
}

// ── Form schemas per type ────────────────────────────────────────────────────
const TYPE_SCHEMAS = {
  problem: {
    subtitle: 'Document a pain point worth solving',
    fields: [
      { key: 'title',       label: 'Problem Name',         type: 'text',     placeholder: 'Name the problem clearly', required: true },
      { key: 'description', label: 'Describe the Problem', type: 'textarea', placeholder: 'What is happening? Who faces this?', rows: 3 },
      { key: 'who',         label: "Who's Affected",       type: 'text',     placeholder: 'e.g. Small business owners, students…' },
      { key: 'severity',    label: 'Severity',             type: 'scale',    options: ['Mild', 'Minor', 'Moderate', 'Serious', 'Critical'] },
      { key: 'frequency',   label: 'How Often?',           type: 'radio',    options: ['Rarely', 'Sometimes', 'Often', 'Daily'] },
      { key: 'solution',    label: 'Initial Solution Idea', type: 'textarea', placeholder: 'Any first thoughts on solving this?', rows: 2, optional: true },
    ],
    getExcited: f => parseInt(f.severity || 0),
    buildBody:  f => [
      f.description && `Description:\n${f.description}`,
      f.who         && `Who's affected: ${f.who}`,
      f.severity    && `Severity: ${f.severity}/5`,
      f.frequency   && `Frequency: ${f.frequency}`,
      f.solution    && `Possible solution:\n${f.solution}`,
    ].filter(Boolean).join('\n\n'),
  },

  idea: {
    subtitle: 'Capture a concept that could change things',
    fields: [
      { key: 'title',     label: 'Idea Name',          type: 'text',     placeholder: 'Give your idea a name', required: true },
      { key: 'vision',    label: 'The Vision',         type: 'textarea', placeholder: 'What does this create, enable, or transform?', rows: 3 },
      { key: 'target',    label: 'Target Users',       type: 'text',     placeholder: 'Who benefits most from this?' },
      { key: 'potential', label: 'Business Potential', type: 'radio',    options: ['Side project', 'Small business', 'Startup', 'Unicorn'] },
      { key: 'difficulty',label: 'Build Difficulty',   type: 'radio',    options: ['Easy', 'Medium', 'Hard', 'Very Hard'] },
    ],
    getExcited: f => ({ 'Side project': 1, 'Small business': 2, 'Startup': 3, 'Unicorn': 5 }[f.potential] || 2),
    buildBody:  f => [
      f.vision     && `Vision:\n${f.vision}`,
      f.target     && `Target users: ${f.target}`,
      f.potential  && `Potential: ${f.potential}`,
      f.difficulty && `Difficulty: ${f.difficulty}`,
    ].filter(Boolean).join('\n\n'),
  },

  observation: {
    subtitle: 'Record something interesting you noticed',
    fields: [
      { key: 'title', label: 'What did you observe?',  type: 'text',     placeholder: 'Summarize it briefly', required: true },
      { key: 'what',  label: 'Describe it',            type: 'textarea', placeholder: 'Paint the full picture — when, where, what…', rows: 3 },
      { key: 'why',   label: 'Why is it interesting?', type: 'textarea', placeholder: 'What stands out to you?', rows: 2 },
      { key: 'opp',   label: 'Opportunity Potential',  type: 'radio',    options: ['None', 'Maybe', 'Definitely'] },
    ],
    getExcited: f => ({ 'None': 0, 'Maybe': 2, 'Definitely': 4 }[f.opp] || 0),
    buildBody:  f => [
      f.what && `What happened:\n${f.what}`,
      f.why  && `Why interesting:\n${f.why}`,
      f.opp  && `Opportunity: ${f.opp}`,
    ].filter(Boolean).join('\n\n'),
  },

  question: {
    subtitle: 'Every breakthrough begins with a great question',
    fields: [
      { key: 'title',   label: 'The Question',        type: 'text',     placeholder: 'Ask it clearly and precisely', required: true },
      { key: 'context', label: 'Why Does It Matter?', type: 'textarea', placeholder: 'What would change if we answered this?', rows: 3 },
      { key: 'who',     label: 'Who Might Know?',     type: 'text',     placeholder: 'Experts, books, communities…' },
    ],
    getExcited: () => 0,
    buildBody:  f => [
      f.context && `Context:\n${f.context}`,
      f.who     && `Who might know: ${f.who}`,
    ].filter(Boolean).join('\n\n'),
  },

  lesson: {
    subtitle: 'Turn what you learned into permanent wisdom',
    fields: [
      { key: 'title',  label: 'What Did You Learn?',    type: 'text',     placeholder: 'The core lesson in one sentence', required: true },
      { key: 'source', label: 'Source / Context',       type: 'text',     placeholder: 'Book, conversation, failure, experience…' },
      { key: 'detail', label: 'Expand on It',           type: 'textarea', placeholder: 'The full story or reasoning…', rows: 3 },
      { key: 'apply',  label: 'How Will You Apply It?', type: 'textarea', placeholder: 'Concrete next steps…', rows: 2 },
    ],
    getExcited: () => 0,
    buildBody:  f => [
      f.source && `Source: ${f.source}`,
      f.detail && `Detail:\n${f.detail}`,
      f.apply  && `Application:\n${f.apply}`,
    ].filter(Boolean).join('\n\n'),
  },

  opportunity: {
    subtitle: 'Market gaps and untapped potential',
    fields: [
      { key: 'title',   label: 'Opportunity Name',       type: 'text',     placeholder: 'Name the gap or opportunity', required: true },
      { key: 'gap',     label: 'What Gap Does It Fill?', type: 'textarea', placeholder: "What's missing in the market?", rows: 3 },
      { key: 'market',  label: 'Target Market',          type: 'text',     placeholder: 'Who are the potential customers?' },
      { key: 'urgency', label: 'Urgency',                type: 'scale',    options: ['Very Low', 'Low', 'Medium', 'High', 'Critical'] },
      { key: 'size',    label: 'Market Size',            type: 'radio',    options: ['Niche', 'Small', 'Medium', 'Large', 'Massive'] },
    ],
    getExcited: f => parseInt(f.urgency || 0),
    buildBody:  f => [
      f.gap    && `Market gap:\n${f.gap}`,
      f.market && `Target market: ${f.market}`,
      f.urgency && `Urgency: ${f.urgency}/5`,
      f.size   && `Market size: ${f.size}`,
    ].filter(Boolean).join('\n\n'),
  },

  research: {
    subtitle: 'Data, studies, and findings that matter',
    fields: [
      { key: 'title',    label: 'Research Topic',       type: 'text',     placeholder: 'What did you research?', required: true },
      { key: 'source',   label: 'Source',               type: 'text',     placeholder: 'Article, book, paper, person…' },
      { key: 'findings', label: 'Key Findings',         type: 'textarea', placeholder: 'What did you discover?', rows: 3 },
      { key: 'impact',   label: 'Implications for You', type: 'textarea', placeholder: 'How does this change your thinking?', rows: 2 },
    ],
    getExcited: () => 0,
    buildBody:  f => [
      f.source   && `Source: ${f.source}`,
      f.findings && `Key findings:\n${f.findings}`,
      f.impact   && `Implications:\n${f.impact}`,
    ].filter(Boolean).join('\n\n'),
  },

  inspiration: {
    subtitle: 'Sparks that ignite new thinking',
    fields: [
      { key: 'title',    label: 'What Inspired You?',       type: 'text',     placeholder: 'Name the inspiration', required: true },
      { key: 'source',   label: 'Source',                   type: 'text',     placeholder: 'Person, place, art, nature, product…' },
      { key: 'details',  label: 'Describe It',              type: 'textarea', placeholder: 'What exactly happened?', rows: 3 },
      { key: 'connects', label: 'Connection to Your Work',  type: 'textarea', placeholder: 'How might this spark something new?', rows: 2 },
    ],
    getExcited: () => 2,
    buildBody:  f => [
      f.source   && `Source: ${f.source}`,
      f.details  && `Details:\n${f.details}`,
      f.connects && `Connection:\n${f.connects}`,
    ].filter(Boolean).join('\n\n'),
  },

  // Auto-detect form — minimal
  auto: {
    subtitle: 'Describe it — AI will categorize it for you',
    fields: [
      { key: 'title',       label: 'What did you find?',    type: 'text',     placeholder: 'Give it a short title', required: true },
      { key: 'description', label: 'Tell me more',          type: 'textarea', placeholder: 'Describe it in your own words…', rows: 4 },
    ],
    getExcited: () => 0,
    buildBody:  f => f.description ? `Description:\n${f.description}` : '',
  },
};

// ── Field renderer ────────────────────────────────────────────────────────────
function FieldInput({ field, value, onChange, accentColor }) {
  const base = {
    width: '100%', background: C.surface, border: `1.5px solid ${C.border}`,
    borderRadius: 12, padding: '12px 14px', fontSize: 14, color: C.text,
    outline: 'none', transition: 'border-color 0.15s',
  };

  if (field.type === 'text') {
    return (
      <input
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder}
        autoFocus={field.required}
        style={base}
        onFocus={e => { e.target.style.borderColor = accentColor || C.accent; }}
        onBlur={e => { e.target.style.borderColor = C.border; }}
      />
    );
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={field.rows || 3}
        style={{ ...base, resize: 'none', lineHeight: 1.65 }}
        onFocus={e => { e.target.style.borderColor = accentColor || C.accent; }}
        onBlur={e => { e.target.style.borderColor = C.border; }}
      />
    );
  }

  if (field.type === 'scale') {
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        {field.options.map((opt, i) => {
          const val = i + 1;
          const active = value === val;
          return (
            <button key={val} onClick={() => onChange(val)} type="button" style={{
              flex: 1, padding: '10px 4px', borderRadius: 10,
              border: `1.5px solid ${active ? (accentColor || C.text) : C.border}`,
              background: active ? (accentColor || C.text) : C.surface,
              cursor: 'pointer', transition: 'all 0.12s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: active ? '#fff' : C.text }}>
                {val}
              </span>
              <span style={{ fontSize: 9, lineHeight: 1.2, textAlign: 'center', color: active ? 'rgba(255,255,255,0.7)' : C.muted }}>
                {opt}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  if (field.type === 'radio') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {field.options.map(opt => {
          const active = value === opt;
          return (
            <button key={opt} onClick={() => onChange(opt)} type="button" style={{
              padding: '8px 14px', borderRadius: 20,
              border: `1.5px solid ${active ? (accentColor || C.text) : C.border}`,
              background: active ? (accentColor || C.text) : C.surface,
              color: active ? '#fff' : C.sub,
              fontSize: 13, fontWeight: active ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.12s',
            }}>
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  return null;
}

// ── Discoveries list view ────────────────────────────────────────────────────
function DiscoveriesList({ entries, onOpen, onNew, onBack }) {
  const { isDesktop } = useBreakpoint();
  const [query, setQuery]     = useState('');
  const [filter, setFilter]   = useState('all');
  const [searchOpen, setSearch] = useState(false);

  const filtered = entries
    .filter(e => filter === 'all' || e.type === filter)
    .filter(e => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (e.title || '').toLowerCase().includes(q) || (e.body || '').toLowerCase().includes(q);
    });

  // Group by date
  const groups = {};
  filtered.forEach(e => {
    const key = new Date(e.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });

  const usedTypes = [...new Set(entries.map(e => e.type))];

  const hPad = isDesktop ? '36px 0 0' : '52px 20px 0';
  const px   = isDesktop ? '0 0 48px' : '0 20px 120px';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
      {/* Header */}
      <div style={{ padding: hPad, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: isDesktop ? 32 : 26, fontWeight: 700, color: C.text }}>
              Discover
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
              {entries.length} {entries.length === 1 ? 'discovery' : 'discoveries'}
              {entries.length > 0 && ` · ${entries.filter(e => Date.now() - new Date(e.created_at) < 7 * 86400000).length} this week`}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { setSearch(v => !v); if (searchOpen) setQuery(''); }}
              style={{
                width: 36, height: 36, borderRadius: 11,
                background: searchOpen ? C.accent : C.surface,
                border: `1px solid ${searchOpen ? C.accent : C.border}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: searchOpen ? '#fff' : C.muted,
              }}
            >
              {searchOpen ? <X size={14} strokeWidth={2} /> : <Search size={14} strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        {/* Search */}
        {searchOpen && (
          <div style={{ marginBottom: 10, animation: 'slideDown 0.15s ease' }}>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search your discoveries…"
              style={{
                width: '100%', background: C.surface,
                border: `1.5px solid ${C.border}`, borderRadius: 12,
                padding: '10px 14px', fontSize: 14, color: C.text, outline: 'none',
              }}
            />
          </div>
        )}

        {/* Type filters */}
        {usedTypes.length > 1 && (
          <div className="hide-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: filter === 'all' ? 600 : 400,
                border: `1.5px solid ${filter === 'all' ? C.text : C.border}`,
                background: filter === 'all' ? C.text : C.surface,
                color: filter === 'all' ? '#fff' : C.sub,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.12s',
              }}
            >
              All
            </button>
            {usedTypes.map(typeKey => {
              const t = typeMap[typeKey];
              if (!t) return null;
              const active = filter === typeKey;
              return (
                <button
                  key={typeKey}
                  onClick={() => setFilter(active ? 'all' : typeKey)}
                  style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: active ? 600 : 400,
                    border: `1.5px solid ${active ? t.color : C.border}`,
                    background: active ? `${t.color}15` : C.surface,
                    color: active ? t.color : C.sub,
                    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.12s',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  <TypeIcon type={typeKey} size={11} strokeWidth={2} color={active ? t.color : C.muted} />
                  {t.label}
                </button>
              );
            })}
          </div>
        )}

        {/* New Discovery button */}
        <button
          onClick={onNew}
          style={{
            width: '100%', marginTop: 12,
            background: 'linear-gradient(135deg, #1C1410 0%, #2A1C14 100%)',
            color: C.accent, border: 'none', borderRadius: 14,
            padding: '13px 20px', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 6px 20px rgba(28,20,16,0.22)',
            transition: 'opacity 0.15s',
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          New Discovery
        </button>
      </div>

      {/* List */}
      <div className="hide-scroll" style={{ flex: 1, overflowY: 'auto', padding: px }}>
        {filtered.length === 0 && entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 28px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, margin: '0 auto 18px',
              background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Search size={28} color={C.accent} strokeWidth={1.5} />
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 21, fontWeight: 700, color: C.text, marginBottom: 10 }}>
              No discoveries yet
            </div>
            <div style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.7, marginBottom: 24, maxWidth: 300, margin: '0 auto 24px' }}>
              Start capturing what you observe, question, and imagine. Every great idea starts here.
            </div>
            <button
              onClick={onNew}
              style={{
                background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
                color: C.accent, border: 'none', borderRadius: 14,
                padding: '13px 28px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Make your first discovery
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: C.muted, fontSize: 13.5 }}>
            No results for "{query || typeMap[filter]?.label}"
          </div>
        ) : (
          Object.entries(groups).map(([date, dayEntries]) => (
            <div key={date} style={{ marginBottom: 22 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: C.muted,
                letterSpacing: '0.07em', textTransform: 'uppercase',
                marginBottom: 10, paddingTop: 8,
              }}>
                {date}
              </div>
              {dayEntries.map(e => <EntryCard key={e.id} entry={e} onOpen={onOpen} />)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Type selection grid ───────────────────────────────────────────────────────
function TypeSelectView({ onSelect, onBack }) {
  const { isDesktop } = useBreakpoint();
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
      {/* Header */}
      <div style={{ padding: isDesktop ? '28px 0 0' : '52px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button
            onClick={onBack}
            style={{
              width: 36, height: 36, borderRadius: 11,
              background: C.surface, border: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: C.sub, flexShrink: 0,
            }}
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.15 }}>
              What did you discover?
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
              Choose a category — or let AI decide
            </div>
          </div>
        </div>
      </div>

      <div className="hide-scroll" style={{ flex: 1, overflowY: 'auto', padding: isDesktop ? '0 0 32px' : '0 20px 100px' }}>
        {/* Auto-detect card */}
        <button
          onClick={() => onSelect('auto')}
          onMouseEnter={() => setHovered('auto')}
          onMouseLeave={() => setHovered(null)}
          style={{
            width: '100%', marginBottom: 14,
            background: hovered === 'auto'
              ? 'linear-gradient(135deg, #1C1410 0%, #2A1C14 100%)'
              : C.surface,
            border: `1.5px solid ${hovered === 'auto' ? 'transparent' : C.border}`,
            borderRadius: 16, padding: '16px 18px',
            cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 14,
            transition: 'all 0.15s ease',
            boxShadow: hovered === 'auto' ? '0 8px 24px rgba(28,20,16,0.28)' : '0 1px 4px rgba(26,23,20,0.05)',
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 13, flexShrink: 0,
            background: hovered === 'auto' ? `${C.accent}22` : C.accentDim,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Wand2 size={20} color={C.accent} strokeWidth={1.75} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: hovered === 'auto' ? C.accent : C.text, marginBottom: 3 }}>
              Auto-detect Category
            </div>
            <div style={{ fontSize: 12.5, color: hovered === 'auto' ? 'rgba(212,197,169,0.7)' : C.muted }}>
              Just describe what you found — AI picks the right type
            </div>
          </div>
          <ChevronRight size={16} color={hovered === 'auto' ? C.accent : C.muted} strokeWidth={1.75} />
        </button>

        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
          Or choose manually
        </div>

        {/* 8-type grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
          gap: 8,
        }}>
          {DISCOVERY_TYPES.map(type => {
            const isHov = hovered === type.key;
            return (
              <button
                key={type.key}
                onClick={() => onSelect(type.key)}
                onMouseEnter={() => setHovered(type.key)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: C.surface,
                  border: `1.5px solid ${isHov ? type.color : C.border}`,
                  borderRadius: 14, padding: '14px 12px',
                  cursor: 'pointer', textAlign: 'left',
                  transform: isHov ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'all 0.14s ease',
                  boxShadow: isHov
                    ? `0 8px 20px ${type.color}20, 0 2px 6px rgba(26,23,20,0.08)`
                    : '0 1px 3px rgba(26,23,20,0.05)',
                  animation: 'slideUp 0.18s ease both',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: type.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 10,
                }}>
                  <TypeIcon type={type.key} size={18} color="#fff" strokeWidth={2} />
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 3 }}>
                  {type.label}
                </div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>
                  {type.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Discovery form view ───────────────────────────────────────────────────────
function DiscoveryForm({ typeKey, onSave, onBack }) {
  const { isDesktop } = useBreakpoint();
  const isAuto   = typeKey === 'auto';
  const schema   = TYPE_SCHEMAS[typeKey] || TYPE_SCHEMAS.observation;
  const typeInfo = isAuto ? null : DISCOVERY_TYPES.find(t => t.key === typeKey);

  const [fields,  setFields]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const [recording, setRec]   = useState(false);
  const [interim, setInterim] = useState('');
  const recRef = useRef(null);

  const hasTitle = fields.title?.trim().length > 0;

  const handleField = (key, val) => setFields(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!hasTitle || saving) return;
    setSaving(true);
    const resolvedType = isAuto
      ? autoDetectType((fields.title || '') + ' ' + (fields.description || ''))
      : typeKey;
    const resolvedSchema = TYPE_SCHEMAS[resolvedType] || schema;
    const body    = resolvedSchema.buildBody(fields);
    const excited = resolvedSchema.getExcited(fields);
    await onSave({
      type: resolvedType,
      title: fields.title.trim(),
      body:  body || '',
      excited,
      created_at: new Date().toISOString(),
    });
    setSaving(false);
  };

  const toggleRecord = () => {
    if (recording) { recRef.current?.stop(); setRec(false); setInterim(''); return; }
    if (!SR) { alert('Speech not supported — try Chrome or Safari.'); return; }
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = 'en-US';
    r.onresult = e => {
      let fin = '', tmp = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) fin += e.results[i][0].transcript;
        else tmp += e.results[i][0].transcript;
      }
      if (fin) {
        const ta = schema.fields.find(f => f.type === 'textarea');
        if (ta) handleField(ta.key, (fields[ta.key] || '') + (fields[ta.key] ? ' ' : '') + fin.trim());
      }
      setInterim(tmp);
    };
    r.onerror = () => { setRec(false); setInterim(''); };
    r.onend   = () => { setRec(false); setInterim(''); };
    r.start(); recRef.current = r; setRec(true);
  };

  const accentColor = isAuto ? C.accent : typeInfo?.color;

  return (
    <>
      <style>{`@keyframes wv0{0%,100%{height:4px}50%{height:18px}} @keyframes wv1{0%,100%{height:6px}50%{height:24px}} @keyframes wv2{0%,100%{height:3px}50%{height:14px}}`}</style>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
        {/* Header */}
        <div style={{
          padding: isDesktop ? '28px 0 20px' : '52px 20px 16px',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <button
            onClick={onBack}
            style={{
              width: 36, height: 36, borderRadius: 11,
              background: C.surface, border: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: C.sub, flexShrink: 0,
            }}
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>

          {isAuto ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: C.accentDim, border: `1px solid ${C.accent}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Wand2 size={16} color={C.accent} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Auto-detect</div>
                <div style={{ fontSize: 11, color: C.muted }}>AI will identify the category</div>
              </div>
            </div>
          ) : typeInfo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: typeInfo.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TypeIcon type={typeKey} size={17} color="#fff" strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{typeInfo.label}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{schema.subtitle}</div>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="hide-scroll" style={{ flex: 1, overflowY: 'auto', padding: isDesktop ? '0 0 32px' : '0 20px 100px', animation: 'slideLeft 0.2s ease' }}>

          {/* Auto-detect hint */}
          {isAuto && (
            <div style={{
              background: C.accentDim, border: `1px solid ${C.accent}30`,
              borderRadius: 12, padding: '12px 16px', marginBottom: 18,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Wand2 size={14} color={C.accent} strokeWidth={2} />
              <span style={{ fontSize: 13, color: C.sub, lineHeight: 1.5 }}>
                Describe what you found — AI will pick the best category when you save.
              </span>
            </div>
          )}

          {schema.fields.map(field => (
            <div key={field.key} style={{ marginBottom: 18 }}>
              <div style={{
                fontSize: 12.5, fontWeight: 700, color: C.text, marginBottom: 7,
                display: 'flex', alignItems: 'center', gap: 5,
                letterSpacing: '0.01em',
              }}>
                {field.label}
                {field.optional && <span style={{ fontSize: 11, fontWeight: 400, color: C.muted }}>(optional)</span>}
              </div>
              <FieldInput
                field={field}
                value={fields[field.key]}
                onChange={v => handleField(field.key, v)}
                accentColor={accentColor}
              />
            </div>
          ))}

          {/* Voice note */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text, marginBottom: 8, letterSpacing: '0.01em' }}>
              Voice Note
            </div>
            <div style={{
              background: C.surface, border: `1.5px solid ${C.border}`,
              borderRadius: 14, padding: '16px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  {[5,9,12,7,10,6,11].map((h, i) => (
                    <div key={i} style={{
                      width: 3, borderRadius: 2, height: recording ? h : 2,
                      background: recording ? (accentColor || C.accent) : C.border,
                      transition: 'height 0.2s',
                      animation: recording ? `wv${i % 3} 0.75s ease-in-out ${i * 0.07}s infinite` : 'none',
                    }} />
                  ))}
                </div>
                <button
                  onClick={toggleRecord}
                  style={{
                    width: 48, height: 48, borderRadius: '50%', border: 'none',
                    background: recording ? C.error : 'linear-gradient(135deg, #1C1410, #2A1C14)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: recording ? `0 0 0 7px ${C.error}18` : '0 4px 12px rgba(28,20,16,0.28)',
                    transition: 'all 0.2s',
                  }}
                >
                  {recording
                    ? <MicOff size={18} color="#fff" strokeWidth={1.75} />
                    : <Mic size={18} color={C.accent} strokeWidth={1.75} />
                  }
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  {[10,6,13,5,11,8,4].map((h, i) => (
                    <div key={i} style={{
                      width: 3, borderRadius: 2, height: recording ? h : 2,
                      background: recording ? (accentColor || C.accent) : C.border,
                      transition: 'height 0.2s',
                      animation: recording ? `wv${i % 3} 0.75s ease-in-out ${i * 0.06}s infinite` : 'none',
                    }} />
                  ))}
                </div>
              </div>
              <span style={{ fontSize: 12, color: C.muted }}>
                {interim || (recording ? 'Tap to stop' : 'Tap to speak your discovery')}
              </span>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!hasTitle || saving}
            style={{
              width: '100%',
              background: hasTitle && !saving
                ? 'linear-gradient(135deg, #1C1410, #2A1C14)'
                : C.border,
              color: hasTitle && !saving ? C.accent : C.muted,
              border: 'none', borderRadius: 14,
              padding: '15px', fontSize: 14.5, fontWeight: 700,
              cursor: hasTitle && !saving ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.15s',
              boxShadow: hasTitle && !saving ? '0 6px 20px rgba(28,20,16,0.28)' : 'none',
            }}
          >
            {saving
              ? 'Saving…'
              : isAuto
              ? <><Wand2 size={16} strokeWidth={2} /> Save &amp; Auto-Categorize</>
              : <>Save {typeInfo?.label || 'Discovery'}</>
            }
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main DiscoverScreen ───────────────────────────────────────────────────────
export function DiscoverScreen({ entries = [], onSave, onOpen, onBack, createMode = false }) {
  const [view, setView]           = useState(createMode ? 'select' : 'list');
  const [selectedType, setType]   = useState(null);

  const handleSelectType = (typeKey) => {
    setType(typeKey);
    setView('form');
  };

  const handleSave = async (data) => {
    await onSave(data);
    setView('list');
    setType(null);
  };

  if (view === 'list') {
    return (
      <DiscoveriesList
        entries={entries}
        onOpen={onOpen}
        onNew={() => setView('select')}
        onBack={onBack}
      />
    );
  }

  if (view === 'select') {
    return (
      <TypeSelectView
        onSelect={handleSelectType}
        onBack={() => createMode ? (onBack?.()) : setView('list')}
      />
    );
  }

  if (view === 'form') {
    return (
      <DiscoveryForm
        typeKey={selectedType}
        onSave={handleSave}
        onBack={() => setView('select')}
      />
    );
  }

  return null;
}
