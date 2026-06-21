import { useEffect, useRef, useState } from 'react';
import { Send, ChevronRight, Sparkles } from 'lucide-react';
import { C } from '../constants/theme.js';
import { useAI } from '../hooks/useAI.js';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

// Startup advisor quick-action modes
const ADVISOR_MODES = [
  {
    icon: '🎯',
    title: 'Validate an Idea',
    prompt: 'Looking at all my captures, which idea has the strongest market potential and why? What would it take to validate it?',
    color: '#C9A84C',
  },
  {
    icon: '🔥',
    title: 'Rank Problems',
    prompt: 'Analyze the problems I\'ve captured. Rank them by severity, market size, and my ability to solve them. Which should I focus on?',
    color: '#E85D3A',
  },
  {
    icon: '🧠',
    title: 'Find Connections',
    prompt: 'Look across all my discoveries and find the hidden connections. What patterns do you see? What synthesis is possible?',
    color: '#7C6AF7',
  },
  {
    icon: '🚀',
    title: 'Build an MVP',
    prompt: 'Based on my highest-rated idea, what would a minimal viable product look like? Give me a concrete plan.',
    color: '#2D9CDB',
  },
  {
    icon: '💰',
    title: 'Revenue Models',
    prompt: 'For my top ideas, suggest 3 different revenue models for each. Which monetization strategy is most realistic?',
    color: '#2E7D52',
  },
  {
    icon: '⚠️',
    title: 'Predict Challenges',
    prompt: 'What are the biggest risks and challenges I should expect if I pursue my top idea? How should I prepare?',
    color: '#F2994A',
  },
  {
    icon: '📋',
    title: 'Create a Roadmap',
    prompt: 'Help me create a 90-day roadmap to start building my best idea. Break it into weekly milestones.',
    color: '#9B51E0',
  },
  {
    icon: '🌍',
    title: 'Market Analysis',
    prompt: 'Based on my observations and problems, what industries or markets should I focus on? Who are the key players?',
    color: '#EB5757',
  },
];

function TypingDots() {
  return (
    <div style={{ padding: '0 18px 14px', display: 'flex' }}>
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: '18px 18px 18px 4px', padding: '12px 16px',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%', background: C.muted,
            animation: 'aiDot 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.18}s`,
          }} />
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
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      padding: '0 18px', marginBottom: 16,
    }}>
      {/* Avatar for AI */}
      {!isUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 8,
            background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 12, color: C.accent }}>✦</span>
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: C.sub }}>AI Co-Founder</span>
        </div>
      )}

      <div style={{
        maxWidth: '84%',
        background: isUser
          ? 'linear-gradient(135deg, #1C1410, #2A1C14)'
          : C.surface,
        color:   isUser ? C.accent  : C.text,
        border:  isUser ? 'none'    : `1px solid ${C.border}`,
        borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
        padding: '12px 16px', fontSize: 14, lineHeight: 1.68,
        boxShadow: isUser ? '0 4px 14px rgba(28,20,16,0.3)' : '0 2px 8px rgba(26,23,20,0.06)',
      }}>
        {isUser ? (
          <span>{msg.content}</span>
        ) : (
          paras.map((para, i) => (
            <p key={i} style={{ margin: i === 0 ? 0 : '10px 0 0' }}>
              {para.split('\n').map((line, j, arr) => (
                <span key={j}>{line}{j < arr.length - 1 ? <br /> : null}</span>
              ))}
            </p>
          ))
        )}
      </div>
      <span style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{time}</span>
    </div>
  );
}

export function AIScreen({ entries }) {
  const { messages, isLoading, sendMessage } = useAI(entries);
  const [input, setInput]     = useState('');
  const [kbH, setKbH]         = useState(0);
  const [showModes, setShowModes] = useState(true);
  const msgsEndRef             = useRef(null);
  const inputRef               = useRef(null);
  const { isDesktop }          = useBreakpoint();

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

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleMode = (prompt) => {
    sendMessage(prompt);
    setShowModes(false);
  };

  return (
    <>
      <style>{`@keyframes aiDot { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1.1)} }`}</style>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: C.bg, paddingBottom: kbH,
      }}>

        {/* Header */}
        <div style={{ padding: isDesktop ? '28px 40px 20px' : '52px 20px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(28,20,16,0.3)',
            }}>
              <Sparkles size={20} color={C.accent} strokeWidth={1.75} />
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.1 }}>
                AI Co-Founder
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>Your startup advisor powered by AI</div>
            </div>
          </div>

          {/* Context pill */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 14, color: C.accent }}>✦</span>
            <span style={{ fontSize: 13, color: C.sub }}>
              {entries.length === 0
                ? 'No captures yet — add discoveries so I can advise you better.'
                : `I have full context on your ${entries.length} ${entries.length === 1 ? 'discovery' : 'discoveries'} and I\'m ready to think with you.`}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="hide-scroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 0 8px' }}>

          {/* Advisor mode cards */}
          {showModes && messages.length === 0 && !isLoading && (
            <div style={{ padding: isDesktop ? '8px 40px 20px' : '4px 18px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                Ask your Co-Founder
              </div>
              <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 16 }}>
                Choose a mode or type your own question below.
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
                gap: 8,
              }}>
                {ADVISOR_MODES.map(({ icon, title, prompt, color }) => (
                  <button
                    key={title}
                    onClick={() => handleMode(prompt)}
                    style={{
                      background: C.surface, border: `1px solid ${C.border}`,
                      borderRadius: 14, padding: '14px 12px', cursor: 'pointer',
                      textAlign: 'left', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = color;
                      e.currentTarget.style.background = `${color}08`;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 6px 20px ${color}20`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.background = C.surface;
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                      {title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, color, fontSize: 11.5, fontWeight: 600 }}>
                      Ask <ChevronRight size={11} strokeWidth={2.5} />
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

          {/* Show modes again link */}
          {messages.length > 0 && !showModes && (
            <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
              <button
                onClick={() => setShowModes(true)}
                style={{
                  background: 'none', border: `1px solid ${C.border}`,
                  borderRadius: 20, padding: '7px 18px', fontSize: 12.5,
                  color: C.muted, cursor: 'pointer',
                }}
              >
                ✦ Choose advisor mode
              </button>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div style={{
          padding: isDesktop ? '10px 40px 24px' : '10px 14px 88px',
          borderTop: `1px solid ${C.border}`,
          display: 'flex', gap: 10, alignItems: 'flex-end',
          flexShrink: 0, background: C.surface,
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything…"
            rows={1}
            style={{
              flex: 1, background: C.bg, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: '11px 14px', fontSize: 14, color: C.text,
              outline: 'none', resize: 'none', lineHeight: 1.5, maxHeight: 100, overflowY: 'auto',
            }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{
              width: 44, height: 44, borderRadius: 14, border: 'none',
              background: input.trim() && !isLoading
                ? 'linear-gradient(135deg, #1C1410, #2A1C14)'
                : C.border,
              cursor: input.trim() && !isLoading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.15s',
              boxShadow: input.trim() && !isLoading ? '0 4px 12px rgba(28,20,16,0.28)' : 'none',
            }}
          >
            <Send size={17} color={input.trim() && !isLoading ? C.accent : C.muted} strokeWidth={2} />
          </button>
        </div>
      </div>
    </>
  );
}
