import { useState, useRef } from 'react';
import { ChevronLeft, Sparkles, Pencil, AlignLeft, Mic, MicOff, BookmarkPlus } from 'lucide-react';
import { C, TYPES } from '../constants/theme.js';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;

const TITLE_MAX   = 80;
const DETAILS_MAX = 500;
const SAVE_GREEN  = '#1B2E22';

export function CaptureScreen({ onSave, onBack }) {
  const [type, setType]       = useState('idea');
  const [title, setTitle]     = useState('');
  const [body, setBody]       = useState('');
  const [excited, setExcited] = useState(0);
  const [saving, setSaving]     = useState(false);
  const [recording, setRec]     = useState(false);
  const [interim, setInterim]   = useState('');
  const recognitionRef          = useRef(null);
  const { isDesktop }           = useBreakpoint();

  const canSave = title.trim().length > 0 || body.trim().length > 0;

  const doSave = async (andAnother = false) => {
    if (!canSave) return;
    setSaving(true);
    await onSave({ type, title: title.trim(), body: body.trim(), excited, created_at: new Date().toISOString() });
    setSaving(false);
    if (andAnother) { setTitle(''); setBody(''); setExcited(0); setType('idea'); }
  };

  const toggleRecord = () => {
    if (recording) {
      recognitionRef.current?.stop();
      setRec(false);
      setInterim('');
      return;
    }
    if (!SR) { alert('Speech recognition is not supported in this browser. Try Chrome or Safari.'); return; }
    const rec = new SR();
    rec.continuous      = true;
    rec.interimResults  = true;
    rec.lang            = 'en-US';
    rec.onresult = (e) => {
      let fin = '', tmp = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) fin += e.results[i][0].transcript;
        else tmp += e.results[i][0].transcript;
      }
      if (fin) {
        setBody((prev) => {
          const sep = prev.trim() ? ' ' : '';
          return prev + sep + fin.trim();
        });
      }
      setInterim(tmp);
    };
    rec.onerror = () => { setRec(false); setInterim(''); };
    rec.onend   = () => { setRec(false); setInterim(''); };
    rec.start();
    recognitionRef.current = rec;
    setRec(true);
  };

  return (
    <>
      <style>{`
        @keyframes wv0 { 0%,100%{height:4px} 50%{height:18px} }
        @keyframes wv1 { 0%,100%{height:6px} 50%{height:24px} }
        @keyframes wv2 { 0%,100%{height:3px} 50%{height:14px} }
        .capture-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        overflow: 'hidden', background: C.bg,
        padding: isDesktop ? '24px' : '0',
      }}>

        {/* ── Top row ── */}
        <div style={{ padding: isDesktop ? '0 0 14px' : '48px 18px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: '50%', background: C.surface, border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sub }}>
            <ChevronLeft size={17} strokeWidth={2} />
          </button>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={15} color={C.accent} strokeWidth={1.75} />
          </div>
        </div>

        {/* ── Title block ── */}
        <div style={{ padding: '0 18px 14px', flexShrink: 0 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: C.text, lineHeight: 1.2, marginBottom: 4 }}>
            New capture
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>
            Capture your idea, thought, or anything on your mind.
          </div>
        </div>

        {/* ── Scrollable form ── */}
        <div className="capture-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Type selector — horizontal pills, text only */}
          <div style={{ display: 'flex', gap: 6, background: `${C.border}55`, borderRadius: 14, padding: 4 }}>
            {TYPES.map(({ key, label, color }) => {
              const active = type === key;
              return (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  style={{
                    flex: 1, padding: '9px 4px', borderRadius: 10, border: 'none',
                    background: active ? C.surface : 'transparent',
                    color: active ? C.text : C.muted,
                    fontSize: 12, fontWeight: active ? 700 : 500,
                    cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: active ? '0 1px 6px rgba(28,25,23,0.1)' : 'none',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Title */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 7 }}>Title</div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Pencil size={13} color={C.muted} strokeWidth={1.75} style={{ position: 'absolute', left: 13, pointerEvents: 'none' }} />
              <input
                autoFocus
                value={title}
                maxLength={TITLE_MAX}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give it a short title..."
                style={{
                  width: '100%', background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '12px 48px 12px 34px', fontSize: 14,
                  color: C.text, outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', right: 12, fontSize: 11, color: C.muted, pointerEvents: 'none' }}>
                {title.length}/{TITLE_MAX}
              </span>
            </div>
          </div>

          {/* Details */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 7 }}>
              Details <span style={{ fontWeight: 400, color: C.muted }}>(optional)</span>
            </div>
            <div style={{ position: 'relative' }}>
              <AlignLeft size={13} color={C.muted} strokeWidth={1.75} style={{ position: 'absolute', top: 13, left: 13, pointerEvents: 'none' }} />
              <textarea
                value={body}
                maxLength={DETAILS_MAX}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Add more context..."
                rows={4}
                style={{
                  width: '100%', background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '12px 14px 28px 34px',
                  fontSize: 14, color: C.text, outline: 'none', resize: 'none', lineHeight: 1.6,
                }}
              />
              <span style={{ position: 'absolute', bottom: 9, right: 12, fontSize: 11, color: C.muted, pointerEvents: 'none' }}>
                {body.length}/{DETAILS_MAX}
              </span>
            </div>
          </div>

          {/* Voice note */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 7 }}>Or speak it out</div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', justifyContent: 'center' }}>
                {/* Waveform left */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  {[5,9,12,7,10,6,11].map((h, i) => (
                    <div key={i} style={{ width: 3, borderRadius: 2, height: recording ? h : 3, background: recording ? '#9A9A9A' : '#DEDAD4', transition: 'height 0.2s', animation: recording ? `wv${i%3} 0.75s ease-in-out ${i*0.07}s infinite` : 'none' }} />
                  ))}
                </div>

                <button
                  onClick={toggleRecord}
                  style={{
                    width: 52, height: 52, borderRadius: '50%', border: 'none',
                    background: recording ? '#C94A3A' : SAVE_GREEN,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    boxShadow: recording ? '0 0 0 7px rgba(201,74,58,0.13)' : '0 4px 14px rgba(27,46,34,0.28)',
                    transition: 'all 0.2s',
                  }}
                >
                  {recording ? <MicOff size={20} color="#fff" strokeWidth={1.75} /> : <Mic size={20} color="#fff" strokeWidth={1.75} />}
                </button>

                {/* Waveform right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  {[10,6,13,5,11,8,4].map((h, i) => (
                    <div key={i} style={{ width: 3, borderRadius: 2, height: recording ? h : 3, background: recording ? '#9A9A9A' : '#DEDAD4', transition: 'height 0.2s', animation: recording ? `wv${i%3} 0.75s ease-in-out ${i*0.06}s infinite` : 'none' }} />
                  ))}
                </div>
              </div>
              {interim
                ? <span style={{ fontSize: 12, color: C.sub, fontStyle: 'italic', textAlign: 'center', maxWidth: '100%', padding: '0 4px' }}>{interim}</span>
                : <span style={{ fontSize: 12, color: C.muted }}>{recording ? 'Tap to stop' : 'Tap to record'}</span>
              }
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={() => doSave(false)}
            disabled={saving || !canSave}
            style={{
              width: '100%', background: SAVE_GREEN, color: '#fff', border: 'none',
              borderRadius: 16, padding: '16px', fontSize: 15, fontWeight: 600,
              cursor: canSave ? 'pointer' : 'default',
              opacity: saving || !canSave ? 0.45 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              transition: 'opacity 0.15s',
              flexShrink: 0,
            }}
          >
            {saving ? 'Saving…' : <>Save capture <span>✦</span></>}
          </button>

          {/* Save & add another */}
          <button
            onClick={() => doSave(true)}
            disabled={saving || !canSave}
            style={{
              width: '100%', background: 'none', border: 'none',
              cursor: canSave ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              color: canSave ? C.sub : C.muted, fontSize: 13, fontWeight: 500,
              opacity: saving || !canSave ? 0.45 : 1, padding: '4px',
              marginTop: -6,
            }}
          >
            <BookmarkPlus size={14} strokeWidth={1.75} />
            Save &amp; add another
          </button>

        </div>
      </div>
    </>
  );
}
