// Gemini 1.5 Flash integration.
// Called from ai.js when the user has saved a Gemini API key.

const GEMINI_URL = key =>
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

function buildSystemPrompt(entries, focusEntry) {
  const entrySummaries = entries
    .slice(0, 60) // cap context size
    .map(e => {
      const date = new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const excitement = e.excited ? `Excitement: ${e.excited}/5` : '';
      const body = e.body ? `\nDetails: ${e.body.slice(0, 300)}` : '';
      return `[${e.type.toUpperCase()}] "${e.title}" — ${date} ${excitement}${body}`;
    })
    .join('\n\n');

  const focusContext = focusEntry
    ? `\n\nThe user is currently focused on this specific entry:\nTitle: "${focusEntry.title}"\nType: ${focusEntry.type}\nDetails: ${focusEntry.body || 'No details yet'}`
    : '';

  return `You are an AI co-founder and innovation advisor embedded in Wondrous Journal — a personal discovery and innovation app.

Your role: Help the user analyze their captured discoveries, find hidden patterns and connections, validate startup ideas, prioritize problems, and think strategically about building something meaningful.

Tone: Direct, sharp, intellectually honest. No fluff. Use concrete examples from their entries. Push back when ideas are weak. Celebrate when something looks genuinely strong.

The user has captured ${entries.length} discoveries:

${entrySummaries || 'No discoveries yet.'}${focusContext}

Use markdown for structure when helpful (bold, bullet points). Keep responses under 300 words unless a detailed breakdown is explicitly requested.`;
}

export async function askGemini(apiKey, conversationMessages, entries, focusEntry = null) {
  // Map message history to Gemini's role format (user / model)
  const history = conversationMessages.map((m, idx) => {
    const isFirst = idx === 0 && m.role === 'user';
    const text = isFirst
      ? buildSystemPrompt(entries, focusEntry) + '\n\n---\n\n' + m.content
      : m.content;
    return {
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text }],
    };
  });

  // Gemini requires alternating user/model turns — ensure we end on a user turn
  const lastRole = history[history.length - 1]?.role;
  if (lastRole !== 'user') {
    throw new Error('Conversation must end with a user message.');
  }

  const res = await fetch(GEMINI_URL(apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: history,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024,
      },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini.');
  return text;
}

// Lightweight key validation — sends a minimal ping
export async function testGeminiKey(apiKey) {
  const res = await fetch(GEMINI_URL(apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Reply with just the word: ready' }] }],
      generationConfig: { maxOutputTokens: 10 },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
  return true;
}
