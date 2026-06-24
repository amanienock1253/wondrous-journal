import { useEffect, useRef, useState } from 'react';
import { Send, ChevronRight } from 'lucide-react';
import { C } from '../constants/theme.js';
import { useAI } from '../hooks/useAI.js';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

const MODES = [
  { icon: '🎯', title: 'Validate an Idea',     color: '#E85D3A', prompt: 'Looking at all my captures, which idea has the strongest potential? What would it take to validate it?' },
  { icon: '🔥', title: 'Rank Problems',         color: '#F2994A', prompt: "Analyze the problems I've captured. Rank them by urgency and my ability to solve them." },
  { icon: '🧠', title: 'Find Connections',      color: '#7C6AF7', prompt: 'Look across all my entries and find the hidden connections. What patterns do you see?' },
  { icon: '🚀', title: 'Build an MVP',          color: '#2D9CDB', prompt: 'Based on my highest-rated idea, what would a minimal viable product look like?' },
  { icon: '💰', title: 'Revenue Models',        color: '#2E7D52', prompt: 'For my top ideas, suggest realistic revenue models. Which monetization strategy fits best?' },
  { icon: '⚡', title: 'Predict Challenges',    color: '#C9A84C', prompt: 'What are the biggest risks I should expect if I pursue my top idea? How should I prepare?' },
  { icon: '🗺️', title: 'Create a Roadmap',     color: '#9B51E0', prompt: 'Help me create a 90-day roadmap to start building my best idea. Break it into milestones.' },
  { icon: '🌍', title: 'Market Analysis',       color: '#EB5757', prompt: 'Based on my observations and problems, what markets should I focus on? Who are the key players?' },
];

function TypingDots() {
  return (
    <div style={{ padding: '0 18px 14px', display: 'flex' }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '18px 18px 18px 4px', padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: C.muted, animation: 'aiDot 1.2s ease-in-out infinite', animationDelay: `${i * 0.18}s` }} />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  const time   = new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const paras  = msg.content.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', padding: '0 18px', marginBottom: 16 }}>
      {!isUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
          <div style={{ width: 24, height: 24, borderRadius: 8, background: C.accentDim, border: `1px solid ${C.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, color: C.accent }}>✦</span>
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: C.sub }}>Wondrous AI</span>
        </div>
      )}
      <div style={{
        maxWidth: '84%', background: isUser ? C.accent : C.surface, color: isUser ? '#fff' : C.text,
        border: isUser ? 'none' : `1px solid ${C.border}`,
        borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
        padding: '12px 16px', fontSize: 14, lineHeight: 1.68,
        boxShadow: isUser ? `0 4px 14px ${C.accent}40` : '0 2px 8px rgba(26,23,20,0.06)',
      }}>
        {isUser ? <span>{msg.content}</span> : paras.map((para, i) => (
          <p key={i} style={{ margin: i === 0 ? 0 : '10px 0 0' }}>
            {para.split('\n').map((line, j, arr) => <span key={j}>{line}{j < arr.length - 1 ? <br /> : null}</span>)}
          </p>
        ))}
      </div>
      <span style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{time}</span>
    </div>
  );
}

export function AIScreen({ entries }) {
  const { messages, isLoading, sendMessage } = useAI(entries);
  const [input,     setInput]     = useState('');
  const [kbH,       setKbH]       = useState(0);
  const [showModes, setShowModes] = useState(true);
  const msgsEndRef  = useRef(null);
  const inputRef    = useRef(null);
  const { isDesktop } = useBreakpoint();

  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShowModes(false);
    }
  }, [messages.length, isLoading]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const upd = () => setKbH(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    vv.addEventListener('resize', upd);
    vv.addEventListener('scroll', upd);
    return () => { vv.removeEventListener('resize', upd); vv.removeEventListener('scroll', upd); };
  }, []);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleMode = prompt => { sendMessage(prompt); setShowModes(false); };

  return (
    <>
      <style>{`
        @keyframes aiDot { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1.1)} }
        .ai-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg, paddingBottom: kbH }}>

        {/* ── Header ── */}
        <div style={{ padding: isDesktop ? '28px 40px 16px' : '52px 20px 14px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            {/* App icon */}
            <div style={{ width: 46, height: 46, borderRadius: 14, background: '#1C1410', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(28,20,16,0.28)', flexShrink: 0 }}>
              <span style={{ fontSize: 20, color: C.accent }}>✦</span>
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.text, lineHeight: 1.15 }}>
                Wondrous AI
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2E7D52' }} />
                <span style={{ fontSize: 11.5, color: C.muted }}>Local AI</span>
              </div>
            </div>
          </div>

          {/* Context banner */}
          <div style={{ background: C.accentDim, border: `1px solid ${C.accent}35`, borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 15, color: C.accent, flexShrink: 0, marginTop: 1 }}>✦</span>
            <span style={{ fontSize: 13, color: C.sub, lineHeight: 1.55 }}>
              {entries.length === 0
                ? 'No captures yet — add discoveries so I can advise you better.'
                : `I have full context on your ${entries.length} ${entries.length === 1 ? 'discovery' : 'discoveries'} and I'm ready to think with you.`}
            </span>
          </div>
        </div>

        {/* ── Scrollable area ── */}
        <div className="ai-scroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 0 8px' }}>

          {/* Mode cards grid */}
          {showModes && messages.length === 0 && !isLoading && (
            <div style={{ padding: isDesktop ? '4px 40px 24px' : '4px 18px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {MODES.map(({ icon, title, color, prompt }) => (
                  <button
                    key={title}
                    onClick={() => handleMode(prompt)}
                    style={{
                      background: C.surface, border: `1px solid ${C.border}`,
                      borderRadius: 18, padding: '18px 16px 14px',
                      cursor: 'pointer', textAlign: 'left',
                      boxShadow: '0 2px 10px rgba(28,25,23,0.06)',
                      transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                    }}
                    onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(28,25,23,0.04)'; }}
                    onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(28,25,23,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(28,25,23,0.06)'; }}
                    onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                    onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <div style={{ fontSize: 36, lineHeight: 1, marginBottom: 10 }}>{icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8, lineHeight: 1.3 }}>{title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, color, fontSize: 12, fontWeight: 600 }}>
                      Ask <ChevronRight size={12} strokeWidth={2.5} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation */}
          <div style={{ padding: isDesktop ? '0 40px' : 0 }}>
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            {isLoading && <TypingDots />}
            <div ref={msgsEndRef} />
          </div>

          {/* Return to modes */}
          {messages.length > 0 && !showModes && (
            <div style={{ textAlign: 'center', padding: '4px 0 20px' }}>
              <button onClick={() => setShowModes(true)} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 20, padding: '7px 18px', fontSize: 12, color: C.muted, cursor: 'pointer' }}>
                ✦ Choose a mode
              </button>
            </div>
          )}
        </div>

        {/* ── Input bar ── */}
        <div style={{ padding: isDesktop ? '10px 40px 24px' : '10px 14px 88px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0, background: C.surface }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything…"
            rows={1}
            style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: '11px 14px', fontSize: 14, color: C.text, outline: 'none', resize: 'none', lineHeight: 1.5, maxHeight: 100, overflowY: 'auto' }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'; }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{ width: 44, height: 44, borderRadius: 14, border: 'none', background: input.trim() && !isLoading ? C.accent : C.border, cursor: input.trim() && !isLoading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}
          >
            <Send size={17} color={input.trim() && !isLoading ? '#fff' : C.muted} strokeWidth={2} />
          </button>
        </div>

      </div>
    </>
  );
}
