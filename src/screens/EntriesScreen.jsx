import { useState } from 'react';
import { Search, AlignJustify, X } from 'lucide-react';
import { C } from '../constants/theme.js';
import { EntryCard } from '../components/EntryCard.jsx';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

const FILTERS = [
  { key: 'all',       label: 'All'       },
  { key: 'favorites', label: 'Favorites' },
  { key: 'journals',  label: 'Journals'  },
];

export function EntriesScreen({ entries, onOpen }) {
  const [filter, setFilter]     = useState('all');
  const [searchOpen, setSearch] = useState(false);
  const [query, setQuery]       = useState('');
  const { isDesktop }           = useBreakpoint();

  const filtered = entries
    .filter((e) => {
      if (filter === 'favorites') return (e.excited || 0) > 0;
      return true;
    })
    .filter((e) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (e.title || '').toLowerCase().includes(q) || (e.body || '').toLowerCase().includes(q);
    });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
      {/* ── Header ── */}
      <div style={{ padding: isDesktop ? '36px 48px 0' : '52px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: isDesktop ? 32 : 26, fontWeight: 700, color: C.text }}>
            Entries
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={() => { setSearch((v) => !v); if (searchOpen) setQuery(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: searchOpen ? C.accent : C.muted, display: 'flex' }}
            >
              {searchOpen ? <X size={22} strokeWidth={2} /> : <Search size={22} strokeWidth={1.75} />}
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex' }}>
              <AlignJustify size={22} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Search input (slide-in) */}
        {searchOpen && (
          <div style={{ marginBottom: 14, animation: 'slideUp 0.15s ease' }}>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entries…"
              style={{
                width: '100%', background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 14, padding: '11px 16px', fontSize: 14, color: C.text, outline: 'none',
              }}
            />
          </div>
        )}

        {/* Filter tabs (image-style: selected has border pill, others plain text) */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
          {FILTERS.map(({ key, label }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  padding: '7px 18px', borderRadius: 20, fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s',
                  border: `1.5px solid ${active ? C.text + 'AA' : 'transparent'}`,
                  background: active ? C.surface : 'transparent',
                  color: active ? C.text : C.muted,
                  boxShadow: active ? '0 1px 6px rgba(28,25,23,0.08)' : 'none',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Entry list ── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: isDesktop ? '0 48px 48px' : '0 16px 120px',
      }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: C.sub, marginBottom: 8 }}>
              {query
                ? 'No results found'
                : filter === 'favorites'
                ? 'No favourites yet'
                : 'No entries yet'}
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>
              {query
                ? 'Try a different search term.'
                : filter === 'favorites'
                ? 'Rate an entry 1+ stars to save it here.'
                : 'Use the + button to capture your first entry.'}
            </div>
          </div>
        ) : (
          /* Individual floating cards — no wrapping container */
          filtered.map((e) => <EntryCard key={e.id} entry={e} onOpen={onOpen} />)
        )}
      </div>
    </div>
  );
}
