// Full-screen dedicated AI chat experience.
// Accessible from the bottom nav ✦ tab.
// Keeps its own conversation history for the session.

import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { C } from '../constants/theme.js';
import { useAI } from '../hooks/useAI.js';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

const PROMPTS = [
  "What's my most exciting idea?",
  "Find connections between my captures",
  "Which problem should I tackle first?",
  "What have I been observing lately?",
  "What patterns do you see in my thinking?",
  "Which idea has the most potential?",
];

function TypingDots() {
  return (
    <div style={{ padding: '0 18px 14px', display: 'flex' }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '18px 18px 18px 4px', padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
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
  const isUser    = msg.role === 'user';
  const time      = new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const paragraphs = msg.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      padding: '0 18px', marginBottom: 14,
    }}>
      <div style={{
        maxWidth: '82%',
        background:   isUser ? C.accent : C.card,
        color:        isUser ? '#fff'   : C.text,
        border:       isUser ? 'none'   : `1px solid ${C.border}`,
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '11px 15px', fontSize: 14, lineHeight: 1.65,
      }}>
        {isUser ? (
          <span>{msg.content}</span>
        ) : (
          paragraphs.map((para, i) => (
            <p key={i} style={{ margin: i === 0 ? 0 : '9px 0 0' }}>
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
  const [input,    setInput]    = useState('');
  const [kbHeight, setKbHeight] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const { isDesktop }  = useBreakpoint();

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isLoading]);

  // Keyboard height tracking for mobile
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setKbHeight(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => { vv.removeEventListener('resize', update); vv.removeEventListener('scroll', update); };
  }, []);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handlePrompt = (p) => sendMessage(p);

  return (
    <>
      <style>{`
        @keyframes aiDot { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1.1)} }
        .ai-screen-msgs::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: C.bg, paddingBottom: kbHeight,
      }}>

        {/* Header */}
        <div style={{ padding: isDesktop ? '28px 40px 20px' : '52px 20px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: C.accentDim, border: `1px solid ${C.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 17, color: C.accent }}>✦</span>
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.1 }}>
                Wondrous AI
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>Your personal thinking partner</div>
            </div>
          </div>

          {/* Stats banner */}
          <div style={{
            marginTop: 14, background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Sparkles size={15} color={C.accent} strokeWidth={1.75} />
            <span style={{ fontSize: 13, color: C.sub }}>
              {entries.length === 0
                ? 'No captures yet — start journaling so I can help you think.'
                : `I know all ${entries.length} of your captures and I'm ready to help.`}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div
          className="ai-screen-msgs"
          style={{ flex: 1, overflowY: 'auto', padding: '4px 0 8px' }}
        >
          {/* Suggested prompts — when chat is empty */}
          {messages.length === 0 && !isLoading && (
            <div style={{ padding: isDesktop ? '8px 40px 20px' : '8px 18px 20px' }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, textAlign: 'center' }}>
                Start with a question, or tap one below
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 8 }}>
                {PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePrompt(p)}
                    style={{
                      background: C.surface, border: `1px solid ${C.border}`,
                      borderRadius: 14, padding: '13px 16px', cursor: 'pointer',
                      textAlign: 'left', fontSize: 13, color: C.sub, fontWeight: 500,
                      transition: 'border-color 0.15s, color 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.text; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.sub; }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: isDesktop ? '0 40px' : 0 }}>
            {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
            {isLoading && <TypingDots />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div style={{
          padding: isDesktop ? '10px 40px 24px' : '10px 14px 90px',
          borderTop: `1px solid ${C.border}`,
          display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0,
          background: C.surface,
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about your journal…"
            rows={1}
            style={{
              flex: 1, background: C.bg, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: '11px 14px', fontSize: 14, color: C.text,
              outline: 'none', resize: 'none', lineHeight: 1.5, maxHeight: 96, overflowY: 'auto',
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{
              width: 42, height: 42, borderRadius: 14, border: 'none',
              background: C.accent, cursor: input.trim() && !isLoading ? 'pointer' : 'default',
              opacity: input.trim() && !isLoading ? 1 : 0.4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'opacity 0.15s',
            }}
          >
            <Send size={17} color="#fff" strokeWidth={2} />
          </button>
        </div>

      </div>
    </>
  );
}
