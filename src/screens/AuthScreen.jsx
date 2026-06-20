import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { C } from '../constants/theme.js';
import { Toast } from '../components/Toast.jsx';

export function AuthScreen({ mode, onToggleMode, onSubmit, loading, error, toast }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email.trim(), password);
  };

  const inputStyle = {
    width: '100%', background: C.bg, border: `1px solid ${C.border}`,
    borderRadius: 14, padding: '13px 16px', color: C.text, outline: 'none',
    fontSize: 15, transition: 'border-color 0.15s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, padding: '20px', position: 'relative' }}>
      <div style={{ width: '100%', maxWidth: 420, animation: 'fadeIn 0.4s ease' }}>
        {/* Brand mark */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 20, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #1A2B1A 0%, #2D3B22 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(26,43,26,0.25)',
          }}>
            <Sparkles size={26} color={C.accent} strokeWidth={2} />
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 6 }}>
            Wondrous Journal
          </div>
          <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.6 }}>
            {mode === 'signin'
              ? 'Welcome back. Your ideas are waiting.'
              : 'Start capturing what the world shows you.'}
          </div>
        </div>

        {/* Card */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 24, padding: '28px 24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 7, letterSpacing: '0.04em' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 7, letterSpacing: '0.04em' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{ color: C.error, fontSize: 13, lineHeight: 1.6, background: '#FBE9E7', borderRadius: 10, padding: '10px 14px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              style={{
                width: '100%', background: '#1A2B1A', color: C.accent, border: 'none',
                borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                opacity: loading || !email.trim() || !password ? 0.5 : 1,
                transition: 'opacity 0.15s',
                fontFamily: "'Playfair Display', serif",
              }}
            >
              {loading ? 'Working…' : mode === 'signin' ? 'Sign in ✦' : 'Create account ✦'}
            </button>

            <div style={{ textAlign: 'center', color: C.muted, fontSize: 13 }}>
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={onToggleMode}
                style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontWeight: 600, padding: 0 }}
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {toast && <Toast emoji={toast.emoji} message={toast.message} />}
    </div>
  );
}
