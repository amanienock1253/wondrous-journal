// Authentication screen for signing in and signing up with email and password.
import { useState } from 'react';
import { C } from '../constants/theme.js';
import { Toast } from '../components/Toast.jsx';

export function AuthScreen({ mode, onToggleMode, onSubmit, loading, error, toast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(email.trim(), password);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, padding: '20px', position: 'relative' }}>
      <div style={{ width: '100%', maxWidth: 420, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 24, padding: '34px 24px 30px', animation: 'fadeIn 0.3s ease' }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 32, fontWeight: 700, color: C.text, marginBottom: 10 }}>Wondrous Journal</div>
          <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.7 }}>
            Capture ideas, problems, and real-world observations in a mobile-first journal.
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: C.muted, marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 14px', color: C.text, outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: C.muted, marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              style={{ width: '100%', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 14px', color: C.text, outline: 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            style={{ width: '100%', background: C.accent, color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading || !email.trim() || !password ? 0.5 : 1 }}
          >
            {loading ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>

          {error && <div style={{ color: '#E8614A', fontSize: 13, lineHeight: 1.6 }}>{error}</div>}

          <div style={{ textAlign: 'center', color: C.sub, fontSize: 13 }}>
            {mode === 'signin' ? 'New here?' : 'Already have an account?'}{' '}
            <button type="button" onClick={onToggleMode} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontWeight: 600, padding: 0 }}>
              {mode === 'signin' ? 'Create account' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>

      {toast && <Toast emoji={toast.emoji} message={toast.message} />}
    </div>
  );
}
