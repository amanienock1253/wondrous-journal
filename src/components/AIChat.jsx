// Floating AI chat panel for Wondrous Journal.
// Shows as a bottom sheet when opened from the ✦ button or from DetailScreen.
// Always renders — floating button is visible when panel is closed.

import { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { C } from '../constants/theme.js';
import { useAI } from '../hooks/useAI.js';

const GLOBAL_PROMPTS = [
  "What's my most exciting idea?",
  "Find connections between my captures",
  "Which problem should I tackle first?",
  "What have I been observing lately?",
];

const FOCUS_PROMPTS = [
  "Help me expand this idea",
  "Give me honest feedback",
  "How can this become a real project?",
  "What are the biggest risks here?",
];

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '14px 16px 10px' }}>
      <div style={{ display: 'flex', gap: 5, background: C.card, borderRadius: '18px 18px 18px 4px', padding: '12px 16px' }}>
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
  const isUser = msg.role === 'user';
  const time   = new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  // Parse AI text into paragraphs for clean rendering
  const paragraphs = msg.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 14, padding: '0 16px',
    }}>
      <div style={{
        maxWidth: '82%',
        background:   isUser ? C.accent  : C.card,
        color:        isUser ? '#fff'    : C.text,
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '11px 15px',
        fontSize: 14, lineHeight: 1.65,
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

export function AIChat({ entries, open, onOpen, onClose, focusEntry }) {
  const { messages, isLoading, sendMessage, clearMessages } = useAI(entries);
  const [input,   setInput]   = useState('');
  const [kbHeight, setKbHeight] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const prompts        = focusEntry ? FOCUS_PROMPTS : GLOBAL_PROMPTS;

  // Clear chat every time the panel opens (fresh session)
  useEffect(() => {
    if (open) {
      clearMessages();
      setInput('');
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isLoading]);

  // Track keyboard height so input isn't hidden on mobile
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setKbHeight(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    vv.addEventListener('resize',  update);
    vv.addEventListener('scroll',  update);
    return () => { vv.removeEventListener('resize', update); vv.removeEventListener('scroll', update); };
  }, [open]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim(), focusEntry);
    setInput('');
  };

  const handlePrompt = (p) => {
    sendMessage(p, focusEntry);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      <style>{`
        @keyframes aiDot { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes aiSlideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        .ai-messages::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Panel */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500 }}>
          {/* Backdrop */}
          <div
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(28,25,23,0.45)' }}
          />

          {/* Sheet */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '88dvh',
            background: C.surface, borderRadius: '22px 22px 0 0',
            border: `1px solid ${C.border}`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            animation: 'aiSlideUp 0.28s cubic-bezier(0.32,0,0.67,0)',
            paddingBottom: kbHeight,
          }}>

            {/* Header */}
            <div style={{
              padding: '14px 18px 12px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`,
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 10, background: C.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 14, color: C.accent }}>✦</span>
                </div>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1 }}>Wondrous AI</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Your thinking partner</div>
                </div>
              </div>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sub }}>
                <X size={15} strokeWidth={2} />
              </button>
            </div>

            {/* Focus pill — shown when opened from an entry */}
            {focusEntry && (
              <div style={{ padding: '10px 18px 0', flexShrink: 0 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.accentDim, border: `1px solid ${C.accent}40`, borderRadius: 10, padding: '6px 12px' }}>
                  <span style={{ fontSize: 12 }}>📍</span>
                  <span style={{ fontSize: 12, color: C.accent, fontWeight: 600 }}>
                    Talking about: {focusEntry.title || 'Untitled'}
                  </span>
                </div>
              </div>
            )}

            {/* Messages area */}
            <div
              className="ai-messages"
              style={{ flex: 1, overflowY: 'auto', padding: '14px 0 8px' }}
            >
              {/* Suggested prompts — shown only when empty */}
              {messages.length === 0 && !isLoading && (
                <div style={{ padding: '8px 16px 16px' }}>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, textAlign: 'center' }}>
                    Tap a question to start, or type your own
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {prompts.map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePrompt(p)}
                        style={{
                          background: C.bg, border: `1px solid ${C.border}`,
                          borderRadius: 14, padding: '12px 16px', cursor: 'pointer',
                          textAlign: 'left', fontSize: 13, color: C.sub, fontWeight: 500,
                          transition: 'border-color 0.15s',
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
              {isLoading && <TypingDots />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input row */}
            <div style={{
              padding: '10px 14px 14px', borderTop: `1px solid ${C.border}`,
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
                  outline: 'none', resize: 'none', lineHeight: 1.5,
                  maxHeight: 96, overflowY: 'auto',
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
        </div>
      )}
    </>
  );
}
