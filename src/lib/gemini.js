// Gemini 1.5 Flash integration.
// Called from ai.js when the user has saved a Gemini API key.

// Try models in order — falls through to next on quota OR not-found errors
const MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro',
  'gemini-1.5-pro-latest',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

const GEMINI_URL = (key, model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

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

function friendlyError(raw) {
  const m = (raw || '').toLowerCase();
  if (m.includes('api key not valid') || m.includes('invalid api key') || m.includes('api_key_invalid'))
    return 'Invalid API key — make sure you copied the full key from aistudio.google.com.';
  if (m.includes('permission') || m.includes('forbidden'))
    return 'Permission denied — enable the Gemini API for this key at aistudio.google.com.';
  if (m.includes('quota') || m.includes('resource_exhausted') || m.includes('limit: 0') ||
      m.includes('not found') || m.includes('not supported'))
    return 'Your Gemini key has no quota on any available model. Go to aistudio.google.com → your project → enable billing (free tier still works once billing is set up).';
  return raw;
}

function isRetryable(errMsg) {
  const m = errMsg.toLowerCase();
  return (
    m.includes('not found') ||
    m.includes('not supported') ||
    m.includes('deprecated') ||
    m.includes('resource_exhausted') ||
    m.includes('quota') ||
    m.includes('limit: 0') ||
    m.includes('429')
  );
}

async function callGemini(apiKey, model, body) {
  const res = await fetch(GEMINI_URL(apiKey, model), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// Try each model in order — skip on quota OR not-found, stop on auth errors
async function callWithFallback(apiKey, body) {
  let lastError;
  for (const model of MODELS) {
    try {
      return await callGemini(apiKey, model, body);
    } catch (err) {
      if (isRetryable(err.message)) {
        lastError = err;
        continue; // try next model
      }
      // Auth / permission error — no point trying other models
      throw new Error(friendlyError(err.message));
    }
  }
  // All models exhausted
  throw new Error(friendlyError(lastError?.message || 'All Gemini models unavailable for this key.'));
}

export async function askGemini(apiKey, conversationMessages, entries, focusEntry = null) {
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

  const data = await callWithFallback(apiKey, {
    contents: history,
    generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
  });

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini.');
  return text;
}

// Lightweight key validation — tries each model until one responds
export async function testGeminiKey(apiKey) {
  await callWithFallback(apiKey, {
    contents: [{ role: 'user', parts: [{ text: 'Reply with the single word: ready' }] }],
    generationConfig: { maxOutputTokens: 10 },
  });
  return true;
}
