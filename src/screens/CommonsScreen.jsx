import { useState, useEffect, useRef } from 'react';
import { Globe, Plus, Heart, MessageCircle, Lock, Sparkles, ArrowLeft, Send, X, Users } from 'lucide-react';
import { C, typeMap, DISCOVERY_TYPES } from '../constants/theme.js';
import { useBreakpoint } from '../hooks/useBreakpoint.js';
import { useCommons } from '../hooks/useCommons.js';
import { askJournalAI } from '../lib/ai.js';

// ─── helpers ────────────────────────────────────────────────────────────────

function relTime(iso) {
  const d = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (d < 1)  return 'just now';
  if (d < 60) return `${d}m ago`;
  const h = Math.floor(d / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function nameFromEmail(email) {
  return (email || '').split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Innovator';
}

// ─── SQL setup instructions ──────────────────────────────────────────────────

const SETUP_SQL = `-- Run this in your Supabase SQL Editor

create table community_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  body text,
  type text not null default 'idea',
  is_public boolean not null default true,
  author_name text,
  location text,
  likes int not null default 0,
  reply_count int not null default 0,
  created_at timestamptz not null default now()
);

create table community_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references community_posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade,
  body text not null,
  author_name text,
  is_ai boolean not null default false,
  created_at timestamptz not null default now()
);

alter table community_posts enable row level security;
alter table community_comments enable row level security;

create policy "Public posts readable" on community_posts
  for select using (is_public = true or auth.uid() = user_id);
create policy "Insert own posts" on community_posts
  for insert with check (auth.uid() = user_id);
create policy "Update own posts" on community_posts
  for update using (auth.uid() = user_id);
create policy "Comments readable" on community_comments
  for select using (true);
create policy "Insert comments" on community_comments
  for insert with check (auth.uid() = user_id or is_ai = true);`;

// ─── PostCard ────────────────────────────────────────────────────────────────

function PostCard({ post, onOpen, onLike, liked, isOwn }) {
  const t    = typeMap[post.type] || typeMap.idea;
  const [hov, setHov] = useState(false);

  return (
    <div
      onClick={() => onOpen(post)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.surface,
        border: `1px solid ${hov ? C.accent + '40' : C.border}`,
        borderRadius: 18, padding: '18px 20px',
        cursor: 'pointer', marginBottom: 12,
        transition: 'border-color 0.15s, transform 0.12s, box-shadow 0.15s',
        transform: hov ? 'translateY(-1px)' : 'none',
        boxShadow: hov ? '0 6px 20px rgba(26,23,20,0.08)' : 'none',
        borderLeft: `3px solid ${t.color}`,
        animation: 'slideUp 0.2s ease both',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: t.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>
          {t.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>
              {post.author_name || 'Innovator'}
            </span>
            {post.location && (
              <span style={{ fontSize: 11, color: C.muted }}>· {post.location}</span>
            )}
            {isOwn && !post.is_public && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                background: C.border, borderRadius: 6, padding: '1px 7px',
                fontSize: 10, color: C.muted,
              }}>
                <Lock size={8} /> Private
              </span>
            )}
          </div>
          <span style={{ fontSize: 10.5, color: C.muted }}>{relTime(post.created_at)}</span>
        </div>
        <div style={{
          fontSize: 10.5, fontWeight: 600, color: t.color,
          background: `${t.color}12`, border: `1px solid ${t.color}25`,
          borderRadius: 6, padding: '3px 9px', flexShrink: 0,
        }}>
          {t.label}
        </div>
      </div>

      {/* Content */}
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6, lineHeight: 1.4,
      }}>
        {post.title}
      </div>
      {post.body && (
        <div style={{
          fontSize: 13, color: C.sub, lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: 12,
        }}>
          {post.body}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={e => { e.stopPropagation(); onLike(post.id); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: liked ? `${C.accent}18` : 'none',
            border: 'none', cursor: 'pointer', padding: '4px 8px',
            borderRadius: 8, color: liked ? C.accent : C.muted,
            fontSize: 12, fontWeight: liked ? 600 : 400,
            transition: 'all 0.15s',
          }}
        >
          <Heart size={13} fill={liked ? C.accent : 'none'} color={liked ? C.accent : C.muted} strokeWidth={2} />
          {post.likes || 0}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.muted, fontSize: 12 }}>
          <MessageCircle size={13} strokeWidth={1.75} />
          {post.reply_count || 0}
        </div>
      </div>
    </div>
  );
}

// ─── ThreadView ──────────────────────────────────────────────────────────────

function ThreadView({ post, userId, userName, onBack, onLike, liked, fetchComments, addComment }) {
  const t = typeMap[post.type] || typeMap.idea;
  const [comments, setComments]   = useState([]);
  const [commentText, setText]    = useState('');
  const [submitting, setSubmit]   = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone]       = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchComments(post.id).then(setComments);
  }, [post.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSend = async () => {
    if (!commentText.trim() || submitting) return;
    setSubmit(true);
    const c = await addComment(post.id, commentText.trim(), userName);
    if (c) {
      setComments(prev => [...prev, c]);
      setText('');
    }
    setSubmit(false);
  };

  const handleAI = async () => {
    if (aiLoading || aiDone) return;
    setAiLoading(true);
    try {
      const prompt = `You are a community advisor in an innovation network. Someone posted this ${post.type}: "${post.title}". ${post.body ? `Details: "${post.body}"` : ''} Give 2-3 short, practical suggestions or questions to help them move forward. Be specific, encouraging, and concise.`;
      const reply = await askJournalAI([{ role: 'user', content: prompt }], [], null);
      const c = await addComment(post.id, reply, 'AI Assistant', true);
      if (c) setComments(prev => [...prev, c]);
      setAiDone(true);
    } catch {
      const c = await addComment(post.id, `For a **${post.type}** like this — focus on who specifically experiences this problem, what they currently do instead, and what the smallest testable version of your solution would look like.`, 'AI Assistant', true);
      if (c) setComments(prev => [...prev, c]);
      setAiDone(true);
    }
    setAiLoading(false);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, background: C.bg,
      display: 'flex', flexDirection: 'column', zIndex: 10,
      animation: 'slideUp 0.2s ease',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 20px', borderBottom: `1px solid ${C.border}`,
        flexShrink: 0, background: C.surface,
      }}>
        <button
          onClick={onBack}
          style={{
            width: 34, height: 34, borderRadius: 10,
            background: C.bg, border: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} color={C.text} strokeWidth={2} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 16, fontWeight: 700, color: C.text,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {post.title}
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>{post.author_name} · {relTime(post.created_at)}</div>
        </div>
        <button
          onClick={() => onLike(post.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: liked ? `${C.accent}18` : C.bg,
            border: `1px solid ${liked ? C.accent + '50' : C.border}`,
            borderRadius: 10, padding: '6px 12px',
            cursor: 'pointer', color: liked ? C.accent : C.muted,
            fontSize: 12, fontWeight: liked ? 600 : 400,
          }}
        >
          <Heart size={13} fill={liked ? C.accent : 'none'} color={liked ? C.accent : C.muted} strokeWidth={2} />
          {post.likes || 0}
        </button>
      </div>

      {/* Scrollable content */}
      <div className="hide-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>

        {/* Post body */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${t.color}`,
          borderRadius: 16, padding: '18px 20px', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: t.color }}>{t.label}</span>
            {post.location && <span style={{ fontSize: 11, color: C.muted }}>· {post.location}</span>}
          </div>
          {post.body && (
            <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.7 }}>{post.body}</div>
          )}
        </div>

        {/* AI block */}
        {!aiDone && (
          <button
            onClick={handleAI}
            disabled={aiLoading}
            style={{
              width: '100%', marginBottom: 16,
              background: `linear-gradient(135deg, ${C.accentDim}, #FFF8E8)`,
              border: `1px solid ${C.accent}35`,
              borderRadius: 14, padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: aiLoading ? 'default' : 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Sparkles size={15} color={C.accent} strokeWidth={2} style={aiLoading ? { animation: 'pulse 1s ease infinite' } : {}} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                {aiLoading ? 'AI is thinking…' : 'Ask AI for suggestions'}
              </div>
              <div style={{ fontSize: 11.5, color: C.sub }}>
                Get ideas, questions, and next steps for this {post.type}
              </div>
            </div>
          </button>
        )}

        {/* Comments */}
        {comments.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: C.muted, marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {comments.length} {comments.length === 1 ? 'reply' : 'replies'}
            </div>
            {comments.map(c => (
              <div key={c.id} style={{
                background: c.is_ai ? `linear-gradient(135deg, ${C.accentDim}, #FFF8E8)` : C.surface,
                border: `1px solid ${c.is_ai ? C.accent + '30' : C.border}`,
                borderRadius: 14, padding: '14px 16px', marginBottom: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                  {c.is_ai ? (
                    <div style={{
                      width: 22, height: 22, borderRadius: 7,
                      background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Sparkles size={11} color={C.accent} strokeWidth={2} />
                    </div>
                  ) : (
                    <div style={{
                      width: 22, height: 22, borderRadius: 7,
                      background: C.accentDim, border: `1px solid ${C.accent}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: C.accentDark,
                    }}>
                      {(c.author_name || 'A')[0].toUpperCase()}
                    </div>
                  )}
                  <span style={{ fontSize: 12, fontWeight: 600, color: c.is_ai ? C.accentDark : C.text }}>
                    {c.author_name || 'Innovator'}
                  </span>
                  <span style={{ fontSize: 10.5, color: C.muted }}>{relTime(c.created_at)}</span>
                </div>
                <div style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                  {c.body}
                </div>
              </div>
            ))}
          </div>
        )}

        {comments.length === 0 && aiDone && (
          <div style={{ textAlign: 'center', padding: '16px 0', color: C.muted, fontSize: 13 }}>
            Be the first to reply
          </div>
        )}

        <div ref={bottomRef} style={{ height: 20 }} />
      </div>

      {/* Comment input */}
      <div style={{
        padding: '12px 16px 20px',
        borderTop: `1px solid ${C.border}`,
        background: C.surface, flexShrink: 0,
        display: 'flex', gap: 10, alignItems: 'flex-end',
      }}>
        <textarea
          value={commentText}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Add your thoughts…"
          rows={1}
          style={{
            flex: 1, resize: 'none', border: `1px solid ${C.border}`,
            borderRadius: 12, padding: '10px 14px',
            fontSize: 14, fontFamily: 'inherit', color: C.text,
            background: C.bg, outline: 'none',
            lineHeight: 1.5, maxHeight: 100, overflowY: 'auto',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!commentText.trim() || submitting}
          style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: commentText.trim()
              ? 'linear-gradient(135deg, #1C1410, #2A1C14)'
              : C.border,
            border: 'none', cursor: commentText.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
        >
          <Send size={16} color={commentText.trim() ? C.accent : C.muted} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// ─── NewPostModal ─────────────────────────────────────────────────────────────

function NewPostModal({ onClose, onSubmit, userName }) {
  const [type, setType]       = useState('idea');
  const [title, setTitle]     = useState('');
  const [body, setBody]       = useState('');
  const [location, setLoc]    = useState('');
  const [isPublic, setPublic] = useState(true);
  const [saving, setSaving]   = useState(false);

  const canSubmit = title.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    await onSubmit({ type, title: title.trim(), body: body.trim(), location: location.trim(), is_public: isPublic, author_name: userName });
    setSaving(false);
    onClose();
  };

  const t = typeMap[type] || typeMap.idea;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400,
      background: 'rgba(26,23,20,0.45)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      animation: 'fadeIn 0.15s ease',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: C.surface, borderRadius: '24px 24px 0 0',
        width: '100%', maxWidth: 480,
        padding: '24px 20px 32px',
        animation: 'slideUp 0.22s ease',
        maxHeight: '90dvh', overflowY: 'auto',
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, background: C.border, borderRadius: 2, margin: '0 auto 20px' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.text }}>
            New Post
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color={C.muted} />
          </button>
        </div>

        {/* Type picker */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: C.muted, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Type</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {DISCOVERY_TYPES.map(dt => (
              <button
                key={dt.key}
                onClick={() => setType(dt.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: type === dt.key ? `${dt.color}18` : C.bg,
                  border: `1.5px solid ${type === dt.key ? dt.color + '60' : C.border}`,
                  borderRadius: 10, padding: '5px 11px',
                  cursor: 'pointer', fontSize: 12.5,
                  color: type === dt.key ? dt.color : C.sub,
                  fontWeight: type === dt.key ? 600 : 400,
                  transition: 'all 0.12s',
                }}
              >
                <span>{dt.icon}</span> {dt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: C.muted, marginBottom: 7, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Title</div>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={`What's your ${t.label.toLowerCase()}?`}
            style={{
              width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 12,
              padding: '11px 14px', fontSize: 15, fontFamily: 'inherit',
              color: C.text, background: C.bg, outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>

        {/* Details */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: C.muted, marginBottom: 7, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Details (optional)</div>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Share more context, background, or what you've tried…"
            rows={3}
            style={{
              width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 12,
              padding: '11px 14px', fontSize: 14, fontFamily: 'inherit',
              color: C.text, background: C.bg, outline: 'none',
              resize: 'none', lineHeight: 1.6,
              boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>

        {/* Location */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: C.muted, marginBottom: 7, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Location (optional)</div>
          <input
            value={location}
            onChange={e => setLoc(e.target.value)}
            placeholder="e.g. Dar es Salaam, Arusha…"
            style={{
              width: '100%', border: `1.5px solid ${C.border}`, borderRadius: 12,
              padding: '11px 14px', fontSize: 14, fontFamily: 'inherit',
              color: C.text, background: C.bg, outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>

        {/* Privacy toggle */}
        <button
          onClick={() => setPublic(v => !v)}
          style={{
            width: '100%', marginBottom: 16,
            background: isPublic ? C.accentDim : C.bg,
            border: `1.5px solid ${isPublic ? C.accent + '50' : C.border}`,
            borderRadius: 14, padding: '13px 18px',
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', textAlign: 'left',
            transition: 'all 0.15s',
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: isPublic ? 'linear-gradient(135deg, #1C1410, #2A1C14)' : C.border,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}>
            {isPublic
              ? <Globe size={17} color={C.accent} strokeWidth={2} />
              : <Lock size={17} color={C.muted} strokeWidth={2} />
            }
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
              {isPublic ? 'Post to Commons 🌐' : 'Save privately 🔒'}
            </div>
            <div style={{ fontSize: 12, color: C.sub }}>
              {isPublic
                ? 'Visible to everyone — AI can connect you with similar people'
                : 'Only you can see this'}
            </div>
          </div>
        </button>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || saving}
          style={{
            width: '100%',
            background: canSubmit
              ? 'linear-gradient(135deg, #1C1410, #2A1C14)'
              : C.border,
            color: canSubmit ? C.accent : C.muted,
            border: 'none', borderRadius: 16, padding: '14px',
            fontSize: 15, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'default',
            transition: 'all 0.15s',
          }}
        >
          {saving ? 'Posting…' : canSubmit ? (isPublic ? 'Post to Commons' : 'Save Post') : 'Add a title to continue'}
        </button>
      </div>
    </div>
  );
}

// ─── CommonsScreen ────────────────────────────────────────────────────────────

export function CommonsScreen({ userId, userEmail, entries = [] }) {
  const { isDesktop } = useBreakpoint();
  const { posts, myPosts, loading, error, tableReady, addPost, fetchComments, addComment, likePost } =
    useCommons(userId);

  const [tab, setTab]           = useState('all');   // 'all' | 'mine'
  const [activePost, setActive] = useState(null);
  const [showNew, setShowNew]   = useState(false);
  const [liked, setLiked]       = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('wj_liked_posts') || '[]')); }
    catch { return new Set(); }
  });

  const userName = nameFromEmail(userEmail);
  const hPad = isDesktop ? '36px 48px 0' : '52px 20px 0';
  const px   = isDesktop ? '20px 48px 48px' : '16px 20px 120px';

  const handleLike = async (postId) => {
    if (liked.has(postId)) return;
    await likePost(postId);
    setLiked(prev => {
      const next = new Set(prev);
      next.add(postId);
      localStorage.setItem('wj_liked_posts', JSON.stringify([...next]));
      return next;
    });
  };

  const handleAddPost = async (post) => {
    await addPost({ ...post, author_name: userName });
  };

  // AI connection banner: posts from other users whose type matches current user's entries
  const userTypes = new Set(entries.map(e => e.type));
  const similarPosts = posts.filter(p => p.user_id !== userId && userTypes.has(p.type));
  const uniqueAuthors = [...new Set(similarPosts.map(p => p.author_name || 'Someone'))].slice(0, 3);
  const showAIBanner = similarPosts.length > 0 && tab === 'all';

  const feed = tab === 'all' ? posts : myPosts;

  // Setup needed state
  if (!tableReady) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
        <div style={{ padding: hPad, flexShrink: 0 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: isDesktop ? 32 : 26, fontWeight: 700, color: C.text }}>
            Commons
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Community discussions</div>
        </div>
        <div className="hide-scroll" style={{ flex: 1, overflowY: 'auto', padding: px }}>
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 20, padding: '28px 24px',
          }}>
            <div style={{ fontSize: 22, marginBottom: 12 }}>🛠️</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>
              One-time setup needed
            </div>
            <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.7, marginBottom: 18 }}>
              Run this SQL in your Supabase project's SQL Editor to enable community discussions:
            </div>
            <div style={{
              background: C.bg, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: '14px 16px',
              fontFamily: 'monospace', fontSize: 11.5, color: C.sub,
              lineHeight: 1.7, overflowX: 'auto', whiteSpace: 'pre',
            }}>
              {SETUP_SQL}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg, position: 'relative' }}>

      {/* Thread overlay */}
      {activePost && (
        <ThreadView
          post={activePost}
          userId={userId}
          userName={userName}
          onBack={() => setActive(null)}
          onLike={handleLike}
          liked={liked.has(activePost.id)}
          fetchComments={fetchComments}
          addComment={addComment}
        />
      )}

      {/* Header */}
      <div style={{ padding: hPad, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: isDesktop ? 32 : 26, fontWeight: 700, color: C.text }}>
              Commons
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
              {posts.length > 0 ? `${posts.length} public discussion${posts.length !== 1 ? 's' : ''}` : 'Community discussions'}
            </div>
          </div>
          <button
            onClick={() => setShowNew(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
              color: C.accent, border: 'none', borderRadius: 14,
              padding: '10px 18px', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(28,20,16,0.25)',
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            Post
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginTop: 14, marginBottom: 0 }}>
          {[{ key: 'all', label: 'All Posts' }, { key: 'mine', label: 'My Posts' }].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: '7px 16px', borderRadius: 10, border: 'none',
                background: tab === key ? 'linear-gradient(135deg, #1C1410, #2A1C14)' : C.surface,
                color: tab === key ? C.accent : C.muted,
                fontSize: 13, fontWeight: tab === key ? 700 : 400,
                cursor: 'pointer', border: `1px solid ${tab === key ? 'transparent' : C.border}`,
                transition: 'all 0.15s',
              }}
            >
              {label}
              {key === 'mine' && myPosts.length > 0 && (
                <span style={{
                  marginLeft: 6, fontSize: 10.5, fontWeight: 600,
                  background: tab === key ? C.accent + '25' : C.bg,
                  borderRadius: 8, padding: '1px 6px',
                  color: tab === key ? C.accent : C.muted,
                }}>
                  {myPosts.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="hide-scroll" style={{ flex: 1, overflowY: 'auto', padding: px }}>

        {/* AI Connection Banner */}
        {showAIBanner && (
          <div style={{
            background: `linear-gradient(135deg, ${C.accentDim}, #FFF8E8)`,
            border: `1px solid ${C.accent}35`,
            borderRadius: 16, padding: '14px 18px', marginBottom: 18,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Users size={18} color={C.accent} strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 3 }}>
                {similarPosts.length} {similarPosts.length === 1 ? 'person is' : 'people are'} discussing what you care about
              </div>
              <div style={{ fontSize: 12, color: C.sub }}>
                {uniqueAuthors.length > 0
                  ? `${uniqueAuthors.slice(0, 2).join(', ')}${uniqueAuthors.length > 2 ? ' and others' : ''} — tap a post to connect`
                  : 'Tap a post to join the conversation'}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FCA5A5',
            borderRadius: 12, padding: '12px 16px', marginBottom: 16,
            fontSize: 13, color: C.error,
          }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: C.muted, fontSize: 13 }}>
            Loading…
          </div>
        )}

        {/* Empty states */}
        {!loading && feed.length === 0 && tab === 'all' && (
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 22, padding: '44px 28px', textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px',
            }}>
              <Globe size={28} color={C.accent} strokeWidth={1.75} />
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 10 }}>
              Be the first to post
            </div>
            <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.7, marginBottom: 24 }}>
              Share an idea, problem, or observation with the community. AI will connect you with people thinking about similar things.
            </div>
            <button
              onClick={() => setShowNew(true)}
              style={{
                background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
                color: C.accent, border: 'none', borderRadius: 16,
                padding: '13px 28px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              <Plus size={16} strokeWidth={2.5} /> Start a discussion
            </button>
          </div>
        )}

        {!loading && feed.length === 0 && tab === 'mine' && (
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 22, padding: '36px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✍️</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>
              No posts yet
            </div>
            <div style={{ fontSize: 13.5, color: C.sub, marginBottom: 20 }}>
              Your public and private posts will appear here.
            </div>
            <button
              onClick={() => setShowNew(true)}
              style={{
                background: 'linear-gradient(135deg, #1C1410, #2A1C14)',
                color: C.accent, border: 'none', borderRadius: 14,
                padding: '11px 22px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Write your first post
            </button>
          </div>
        )}

        {/* Feed */}
        {!loading && feed.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onOpen={setActive}
            onLike={handleLike}
            liked={liked.has(post.id)}
            isOwn={post.user_id === userId}
          />
        ))}

      </div>

      {/* New Post modal */}
      {showNew && (
        <NewPostModal
          onClose={() => setShowNew(false)}
          onSubmit={handleAddPost}
          userName={userName}
        />
      )}
    </div>
  );
}
