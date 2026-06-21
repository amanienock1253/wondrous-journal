import { useState, useMemo } from 'react';
import { Search, X, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import { C, DISCOVERY_TYPES, typeMap } from '../constants/theme.js';
import { EntryCard } from '../components/EntryCard.jsx';
import { useBreakpoint } from '../hooks/useBreakpoint.js';
import { formatEntryDate } from '../utils/time.js';

const ALL_FILTERS = [
  { key: 'all',   label: 'All' },
  ...DISCOVERY_TYPES.map(t => ({ key: t.key, label: t.label, color: t.color, icon: t.icon })),
];

function EmptyState({ filter, query, onDiscover }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 28px' }}>
      <div style={{ fontSize: 44, marginBottom: 14 }}>
        {query ? '🔍' : filter !== 'all' ? (typeMap[filter]?.icon || '📂') : '🗄️'}
      </div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.sub, marginBottom: 8 }}>
        {query
          ? 'No results found'
          : filter !== 'all'
          ? `No ${typeMap[filter]?.label || ''} discoveries yet`
          : 'Your Vault is empty'}
      </div>
      <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.65, marginBottom: 24 }}>
        {query
          ? 'Try different keywords or clear the search.'
          : filter !== 'all'
          ? `Start documenting ${typeMap[filter]?.label?.toLowerCase() || 'discoveries'} and they will appear here.`
          : 'Your discoveries will be organized here. Start by capturing your first observation.'}
      </div>
      {!query && filter === 'all' && (
        <button
          onClick={onDiscover}
          style={{
            background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
            color: C.accent, border: 'none', borderRadius: 16,
            padding: '13px 28px', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7,
          }}
        >
          <span>✦</span> Make a discovery
        </button>
      )}
    </div>
  );
}

export function VaultScreen({ entries, onOpen, onDiscover }) {
  const { isDesktop } = useBreakpoint();
  const [filter, setFilter]       = useState('all');
  const [query, setQuery]         = useState('');
  const [searchOpen, setSearch]   = useState(false);
  const [viewMode, setViewMode]   = useState('list'); // 'list' | 'grid'

  const filtered = useMemo(() => {
    let list = entries;
    if (filter !== 'all') list = list.filter(e => e.type === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(e =>
        (e.title || '').toLowerCase().includes(q) ||
        (e.body  || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [entries, filter, query]);

  // Group by date for timeline
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(e => {
      const d = new Date(e.created_at);
      const key = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return Object.entries(groups);
  }, [filtered]);

  const typeCounts = useMemo(() => {
    const c = { all: entries.length };
    DISCOVERY_TYPES.forEach(t => { c[t.key] = entries.filter(e => e.type === t.key).length; });
    return c;
  }, [entries]);

  const hPad = isDesktop ? '36px 48px 0' : '52px 20px 0';
  const px   = isDesktop ? '0 48px 48px' : '0 16px 120px';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>

      {/* ── Header ── */}
      <div style={{ padding: hPad, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isDesktop ? 32 : 26,
              fontWeight: 700, color: C.text,
            }}>
              Vault
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
              {entries.length} {entries.length === 1 ? 'discovery' : 'discoveries'} stored
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
              {searchOpen ? <X size={15} strokeWidth={2} /> : <Search size={15} strokeWidth={1.75} />}
            </button>
            <button
              onClick={() => setViewMode(v => v === 'list' ? 'grid' : 'list')}
              style={{
                width: 36, height: 36, borderRadius: 11,
                background: C.surface, border: `1px solid ${C.border}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: C.muted,
              }}
            >
              {viewMode === 'list' ? <LayoutGrid size={15} strokeWidth={1.75} /> : <List size={15} strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        {/* Search */}
        {searchOpen && (
          <div style={{ marginBottom: 12, animation: 'slideDown 0.15s ease' }}>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search your vault…"
              style={{
                width: '100%', background: C.surface,
                border: `1px solid ${C.border}`, borderRadius: 12,
                padding: '11px 16px', fontSize: 14, color: C.text,
                outline: 'none',
              }}
            />
          </div>
        )}

        {/* Filter chips */}
        <div className="hide-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 14 }}>
          {ALL_FILTERS.map(f => {
            const active = filter === f.key;
            const count  = typeCounts[f.key] || 0;
            if (count === 0 && f.key !== 'all') return null;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12.5, fontWeight: active ? 600 : 400,
                  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.13s',
                  background: active ? (f.color ? `${f.color}18` : C.text) : C.surface,
                  color: active ? (f.color || '#fff') : C.sub,
                  border: `1.5px solid ${active ? (f.color || C.text) : C.border}`,
                }}
              >
                {f.icon && <span style={{ marginRight: 4 }}>{f.icon}</span>}
                {f.label}
                {' '}
                <span style={{ opacity: 0.6 }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="hide-scroll" style={{ flex: 1, overflowY: 'auto', padding: px }}>
        {filtered.length === 0 ? (
          <EmptyState filter={filter} query={query} onDiscover={onDiscover} />
        ) : viewMode === 'list' ? (
          // Timeline grouped view
          grouped.map(([date, dayEntries]) => (
            <div key={date} style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 11.5, fontWeight: 700, color: C.muted,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                marginBottom: 10, paddingLeft: 2,
              }}>
                {date}
              </div>
              {dayEntries.map(e => <EntryCard key={e.id} entry={e} onOpen={onOpen} />)}
            </div>
          ))
        ) : (
          // Grid view
          <div style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
            gap: 10,
          }}>
            {filtered.map(e => {
              const t = typeMap[e.type] || typeMap.idea;
              return (
                <div
                  key={e.id}
                  onClick={() => onOpen(e)}
                  style={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 16, padding: '16px 14px',
                    cursor: 'pointer', animation: 'scaleIn 0.2s ease',
                    transition: 'transform 0.12s ease',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: t.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 10,
                  }}>
                    <span style={{ fontSize: 17 }}>{t.icon}</span>
                  </div>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 14, fontWeight: 700, color: C.text,
                    lineHeight: 1.3, marginBottom: 5,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {e.title || 'Untitled'}
                  </div>
                  <div style={{ fontSize: 10.5, color: C.muted }}>
                    {formatEntryDate(e.created_at)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
