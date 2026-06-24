import { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft, Sparkles, MoreHorizontal, Pencil, X, Check, Trash2,
  Image, Type, List,
  FileText, AlertTriangle, Lightbulb, Users, AlertCircle, HelpCircle,
  Zap, Clock, MapPin, TrendingUp, BookOpen, Star, Eye, Target,
} from 'lucide-react';
import { C, typeMap } from '../constants/theme.js';
import { formatEntryDate, timeOfDay } from '../utils/time.js';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

const FONT_SIZES = [14, 16, 19];

/* ── Body parser: splits "Label: content" pairs into sections ── */
const SECTION_ICONS = {
  description:      FileText,
  problem:          AlertTriangle,
  'project idea':   Lightbulb,
  idea:             Lightbulb,
  solution:         Zap,
  'who affected':   Users,
  "who's affected": Users,
  affected:         Users,
  severity:         AlertCircle,
  impact:           TrendingUp,
  when:             Clock,
  where:            MapPin,
  why:              HelpCircle,
  how:              Zap,
  lesson:           BookOpen,
  observation:      Eye,
  opportunity:      Target,
  inspiration:      Star,
  notes:            FileText,
  context:          FileText,
  background:       FileText,
};

function getSectionIcon(label) {
  const key = label.toLowerCase();
  for (const [k, Icon] of Object.entries(SECTION_ICONS)) {
    if (key.includes(k)) return Icon;
  }
  return FileText;
}

function parseBody(text) {
  if (!text || !text.trim()) return null;
  const lines = text.split('\n');
  const labelRe = /^([A-Za-z][A-Za-z\s'&/-]{0,34}):\s*(.*)$/;
  let hasLabels = false;
  const sections = [];
  let current = null;
  for (const raw of lines) {
    const m = raw.match(labelRe);
    if (m) {
      hasLabels = true;
      if (current) sections.push(current);
      current = { label: m[1].trim(), content: m[2].trim() };
    } else if (current) {
      current.content += (current.content ? '\n' : '') + raw;
    } else {
      const last = sections[sections.length - 1];
      if (last && last.label === null) last.content += '\n' + raw;
      else sections.push({ label: null, content: raw });
    }
  }
  if (current) sections.push(current);
  return hasLabels ? sections.filter(s => s.content.trim() || s.label) : null;
}

async function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const maxPx = 900;
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ── Structured body section card ── */
function SectionCard({ label, content, typeColor }) {
  const Icon = getSectionIcon(label);
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: '14px 16px',
      marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: content ? 8 : 0 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 8, flexShrink: 0,
          background: `${typeColor}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={13} color={typeColor} strokeWidth={2} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: typeColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
      </div>
      {content ? (
        <div style={{ fontSize: 15, color: C.text, lineHeight: 1.7, whiteSpace: 'pre-wrap', paddingLeft: 2 }}>
          {content.trim()}
        </div>
      ) : null}
    </div>
  );
}

/* ── Excitement dots ── */
function ExcitedDots({ level }) {
  if (!level) return null;
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: i <= level ? C.accent : C.border,
        }} />
      ))}
    </div>
  );
}

/* ── Combined view-mode body (mobile + desktop) ── */
function ViewBody({ entry, photo, fontSize, onRemovePhoto, onAskAI, t, desktop }) {
  const sections = parseBody(entry.body);
  const titleSize = desktop ? 28 : 26;

  return (
    <>
      {/* Date */}
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, letterSpacing: '0.01em' }}>
        {formatEntryDate(entry.created_at)} · {timeOfDay(entry.created_at)}
      </div>

      {/* Type chip + excited dots row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: `${t.color}12`, border: `1px solid ${t.color}30`,
          borderRadius: 8, padding: '5px 11px',
        }}>
          <span style={{ fontSize: 13 }}>{t.icon}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: t.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.label}</span>
        </div>
        <ExcitedDots level={entry.excited} />
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: titleSize, fontWeight: 700, color: C.text,
        lineHeight: 1.25, marginBottom: 20,
      }}>
        {entry.title || 'Untitled'}
      </h1>

      {/* Photo */}
      {photo && (
        <div style={{ position: 'relative', marginBottom: 18 }}>
          <img
            src={photo} alt=""
            style={{ width: '100%', maxHeight: desktop ? 360 : 220, borderRadius: 16, display: 'block', objectFit: 'cover' }}
          />
          <button
            onClick={onRemovePhoto}
            style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(28,25,23,0.65)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Body */}
      {sections ? (
        <div style={{ marginBottom: 8 }}>
          {sections.map((s, i) =>
            s.label
              ? <SectionCard key={i} label={s.label} content={s.content} typeColor={t.color} />
              : s.content.trim()
                ? <div key={i} style={{ fontSize: 15, color: C.text, lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: 10 }}>{s.content.trim()}</div>
                : null
          )}
        </div>
      ) : entry.body ? (
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: '16px 18px', marginBottom: 8,
        }}>
          <div style={{ fontSize, color: C.text, lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{entry.body}</div>
        </div>
      ) : (
        <div style={{
          background: C.surface, border: `1px dashed ${C.border}`,
          borderRadius: 16, padding: '20px 18px', textAlign: 'center', marginBottom: 8,
        }}>
          <div style={{ fontSize: 14, color: C.muted, fontStyle: 'italic' }}>
            No notes yet. Tap the pencil to add details.
          </div>
        </div>
      )}

      {/* Ask AI */}
      {onAskAI && (
        <button
          onClick={() => onAskAI(entry)}
          style={{
            width: desktop ? 'auto' : '100%',
            marginTop: 20,
            background: C.accentDim, border: `1px solid ${C.accent}60`,
            borderRadius: 14, padding: '13px 20px', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center',
            justifyContent: desktop ? 'flex-start' : 'center',
            gap: 8, color: C.accent, fontSize: 14, fontWeight: 600,
          }}
        >
          <Sparkles size={15} strokeWidth={2} />
          Ask AI about this
        </button>
      )}
    </>
  );
}

function DeleteSheet({ onClose, onConfirm }) {
  return (
    <div
      style={{ position: 'absolute', inset: 0, background: 'rgba(28,25,23,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 30 }}
      onClick={onClose}
    >
      <div
        style={{ background: C.surface, borderRadius: '24px 24px 0 0', padding: '28px 20px 48px', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Trash2 size={18} color={C.error} strokeWidth={2} />
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.text }}>
            Delete this entry?
          </div>
        </div>
        <div style={{ fontSize: 14, color: C.sub, marginBottom: 24 }}>This action cannot be undone.</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: '13px', fontSize: 15, fontWeight: 500, color: C.text, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ flex: 1, background: C.error, border: 'none', borderRadius: 14, padding: '13px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function DetailScreen({ entry, onBack, onDelete, onUpdate, onAskAI }) {
  const [editing, setEditing]   = useState(false);
  const [title, setTitle]       = useState(entry.title || '');
  const [body, setBody]         = useState(entry.body   || '');
  const [photo, setPhoto]       = useState(entry.photo  || null);
  const [showDel, setShowDel]   = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [fontIdx, setFontIdx]   = useState(1);       // 0=small 1=normal 2=large
  const [photoLoading, setPhotoLoading] = useState(false);
  const bodyRef   = useRef(null);
  const fileRef   = useRef(null);
  const { isDesktop } = useBreakpoint();
  const t = typeMap[entry.type] || typeMap.idea;
  const fontSize  = FONT_SIZES[fontIdx];

  useEffect(() => {
    setTitle(entry.title || '');
    setBody(entry.body   || '');
    setPhoto(entry.photo || null);
    setEditing(false);
  }, [entry.id]);

  const handleSave = async () => {
    const updated = await onUpdate({ ...entry, title, body, photo });
    if (updated) setEditing(false);
  };

  const handleCancel = () => {
    setTitle(entry.title || '');
    setBody(entry.body   || '');
    setPhoto(entry.photo || null);
    setEditing(false);
  };

  const handleAa = () => setFontIdx((i) => (i + 1) % FONT_SIZES.length);

  const handleBullet = () => {
    if (!editing) {
      setEditing(true);
      // Insert bullet at start on next tick when textarea mounts
      setTimeout(() => {
        const el = bodyRef.current;
        if (!el) return;
        el.focus();
        const pos = el.selectionStart || body.length;
        const before = body.substring(0, pos);
        const after  = body.substring(pos);
        const insertion = (before.length > 0 && !before.endsWith('\n')) ? '\n• ' : '• ';
        const next = before + insertion + after;
        setBody(next);
        const cur = before.length + insertion.length;
        setTimeout(() => el.setSelectionRange(cur, cur), 0);
      }, 60);
      return;
    }
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const before = body.substring(0, start);
    const after  = body.substring(el.selectionEnd);
    const insertion = (before.length > 0 && !before.endsWith('\n')) ? '\n• ' : '• ';
    const next = before + insertion + after;
    setBody(next);
    const cur = before.length + insertion.length;
    setTimeout(() => { el.focus(); el.setSelectionRange(cur, cur); }, 0);
  };

  const handlePhotoClick = () => fileRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
      if (!editing) {
        // Auto-save photo immediately in view mode
        await onUpdate({ ...entry, title, body, photo: compressed });
      }
    } finally {
      setPhotoLoading(false);
    }
    e.target.value = '';
  };

  const handleRemovePhoto = async () => {
    setPhoto(null);
    await onUpdate({ ...entry, title, body, photo: null });
  };

  // ── Shared toolbar buttons (first 3 are always present) ─────────────
  const ToolbarLeft = () => (
    <>
      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* Photo */}
      <button
        onClick={handlePhotoClick}
        disabled={photoLoading}
        style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: photo ? C.accent : C.muted, opacity: photoLoading ? 0.5 : 1 }}
      >
        <Image size={18} strokeWidth={1.75} />
        <span style={{ fontSize: 9, fontWeight: photo ? 600 : 400, color: photo ? C.accent : C.muted }}>{photoLoading ? '…' : 'Photo'}</span>
      </button>

      <div style={{ width: 1, height: 24, background: C.border }} />

      {/* Aa */}
      <button
        onClick={handleAa}
        style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: fontIdx !== 1 ? C.accent : C.muted }}
      >
        <Type size={18} strokeWidth={1.75} />
        <span style={{ fontSize: 9, fontWeight: fontIdx !== 1 ? 600 : 400, color: fontIdx !== 1 ? C.accent : C.muted }}>{['Sm', 'Aa', 'Lg'][fontIdx]}</span>
      </button>

      <div style={{ width: 1, height: 24, background: C.border }} />

      {/* List */}
      <button
        onClick={handleBullet}
        style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: C.muted }}
      >
        <List size={18} strokeWidth={1.75} />
        <span style={{ fontSize: 9 }}>List</span>
      </button>

      <div style={{ width: 1, height: 24, background: C.border }} />
    </>
  );

  // ── Desktop layout ────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg, position: 'relative' }}>
        {/* Desktop header */}
        <div style={{ padding: '24px 40px 16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}` }}>
          {onBack && (
            <button onClick={onBack} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, width: 38, height: 38, cursor: 'pointer', color: C.sub, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={18} strokeWidth={2} />
            </button>
          )}
          <div style={{ fontSize: 12, color: C.muted, flex: 1, textAlign: 'center' }}>
            {formatEntryDate(entry.created_at)} · {timeOfDay(entry.created_at)}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {/* Aa */}
            <button onClick={handleAa} style={{ background: C.surface, border: `1px solid ${fontIdx !== 1 ? C.accent : C.border}`, borderRadius: 12, width: 38, height: 38, cursor: 'pointer', color: fontIdx !== 1 ? C.accent : C.sub, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>
              Aa
            </button>
            {/* Photo */}
            <button onClick={handlePhotoClick} style={{ background: C.surface, border: `1px solid ${photo ? C.accent : C.border}`, borderRadius: 12, width: 38, height: 38, cursor: 'pointer', color: photo ? C.accent : C.sub, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image size={15} strokeWidth={1.75} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            {editing ? (
              <>
                <button onClick={handleBullet} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, width: 38, height: 38, cursor: 'pointer', color: C.sub, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <List size={15} strokeWidth={1.75} />
                </button>
                <button onClick={handleCancel} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '0 14px', height: 38, cursor: 'pointer', color: C.sub, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <X size={14} strokeWidth={2} /> Cancel
                </button>
                <button onClick={handleSave} style={{ background: C.accent, border: 'none', borderRadius: 12, padding: '0 16px', height: 38, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                  <Check size={14} strokeWidth={2.5} /> Save
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '0 14px', height: 38, cursor: 'pointer', color: C.sub, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500 }}>
                  <Pencil size={14} strokeWidth={1.75} /> Edit
                </button>
                <button onClick={() => setShowDel(true)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, width: 38, height: 38, cursor: 'pointer', color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={15} strokeWidth={1.75} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Desktop content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px 48px' }}>
          {editing ? (
            <>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: C.text, border: 'none', background: 'transparent', outline: 'none', marginBottom: 20, padding: 0 }}
              />
              {photo && (
                <div style={{ position: 'relative', marginBottom: 20, display: 'inline-block' }}>
                  <img src={photo} alt="" style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 14, display: 'block', objectFit: 'cover' }} />
                  <button onClick={handleRemovePhoto} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(28,25,23,0.65)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </div>
              )}
              <textarea ref={bodyRef} value={body} onChange={(e) => setBody(e.target.value)} rows={16}
                style={{ width: '100%', fontSize, color: C.text, lineHeight: 1.85, border: `1px solid ${C.border}`, background: C.surface, borderRadius: 14, padding: '16px', resize: 'none', outline: 'none' }}
              />
            </>
          ) : (
            <ViewBody
              entry={entry}
              photo={photo}
              fontSize={fontSize}
              onRemovePhoto={handleRemovePhoto}
              onAskAI={onAskAI}
              t={t}
              desktop
            />
          )}
        </div>

        {showDel && <DeleteSheet onClose={() => setShowDel(false)} onConfirm={() => onDelete(entry.id)} />}
      </div>
    );
  }

  // ── Mobile layout ────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg, position: 'relative' }}>

      {/* Mobile header */}
      <div style={{ padding: '52px 20px 10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={onBack}
          style={{ width: 36, height: 36, borderRadius: 12, background: C.surface, border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sub }}
        >
          <ChevronLeft size={17} strokeWidth={2} />
        </button>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Sparkles size={17} color={C.muted} strokeWidth={1.75} />
          <button
            onClick={() => setShowMore(!showMore)}
            style={{ width: 36, height: 36, borderRadius: 12, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}
          >
            <MoreHorizontal size={20} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 24px 140px' }}>
        {editing ? (
          <>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title…"
              style={{
                width: '100%', fontFamily: "'Playfair Display', serif",
                fontSize: 26, fontWeight: 700, color: C.text,
                border: 'none', background: 'transparent', outline: 'none',
                marginBottom: 20, padding: 0, lineHeight: 1.25,
              }}
            />
            {photo && (
              <div style={{ position: 'relative', marginBottom: 18 }}>
                <img src={photo} alt="" style={{ width: '100%', maxHeight: 220, borderRadius: 14, display: 'block', objectFit: 'cover' }} />
                <button
                  onClick={handleRemovePhoto}
                  style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(28,25,23,0.65)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>
            )}
            <textarea
              ref={bodyRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={16}
              placeholder="Write your thoughts…"
              style={{
                width: '100%', fontSize, color: C.text, lineHeight: 1.9,
                border: 'none', background: 'transparent', resize: 'none',
                outline: 'none', padding: 0,
              }}
            />
          </>
        ) : (
          <ViewBody
            entry={entry}
            photo={photo}
            fontSize={fontSize}
            onRemovePhoto={handleRemovePhoto}
            onAskAI={onAskAI}
            t={t}
          />
        )}
      </div>

      {/* More menu dropdown */}
      {showMore && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20 }} onClick={() => setShowMore(false)}>
          <div
            style={{ position: 'absolute', top: 88, right: 20, background: C.surface, borderRadius: 16, padding: '6px', boxShadow: '0 8px 32px rgba(28,25,23,0.15)', border: `1px solid ${C.border}`, minWidth: 160 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setShowMore(false); setShowDel(true); }}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, color: C.error, fontSize: 14 }}
            >
              <Trash2 size={16} strokeWidth={1.75} /> Delete entry
            </button>
          </div>
        </div>
      )}

      {/* Floating bottom toolbar */}
      <div style={{
        position: 'fixed', bottom: 18, left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 60px)', maxWidth: 320,
        background: C.surface, borderRadius: 32, height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        boxShadow: '0 8px 32px rgba(28,25,23,0.13), 0 2px 10px rgba(28,25,23,0.07)',
        border: `1px solid ${C.border}`, zIndex: 10, padding: '0 8px',
      }}>
        <ToolbarLeft />

        {editing ? (
          <>
            <button onClick={handleCancel} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: C.muted }}>
              <X size={18} strokeWidth={1.75} />
              <span style={{ fontSize: 9 }}>Cancel</span>
            </button>
            <div style={{ width: 1, height: 24, background: C.border }} />
            <button onClick={handleSave} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Check size={18} strokeWidth={2.5} color={C.accent} />
              <span style={{ fontSize: 9, fontWeight: 600, color: C.accent }}>Save</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: C.accent }}
          >
            <Pencil size={18} strokeWidth={1.75} />
            <span style={{ fontSize: 9, fontWeight: 600 }}>Edit</span>
          </button>
        )}
      </div>

      {showDel && <DeleteSheet onClose={() => setShowDel(false)} onConfirm={() => onDelete(entry.id)} />}
    </div>
  );
}
