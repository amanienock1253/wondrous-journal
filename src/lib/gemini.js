// Gemini 1.5 Flash integration.
// Called from ai.js when the user has saved a Gemini API key.

// Try models in order — falls through to next if one isn't available on this key
const MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-pro',
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

async function callGemini(apiKey, model, body) {
  const res = await fetch(GEMINI_URL(apiKey, model), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
  return data;
}

// Try each model in order, return first that works
async function callWithFallback(apiKey, body) {
  let lastError;
  for (const model of MODELS) {
    try {
      const data = await callGemini(apiKey, model, body);
      return data;
    } catch (err) {
      // Only move to next model on "not found" errors
      if (err.message.toLowerCase().includes('not found') ||
          err.message.toLowerCase().includes('not supported') ||
          err.message.toLowerCase().includes('deprecated')) {
        lastError = err;
        continue;
      }
      // Auth errors, quota errors etc — throw immediately
      throw err;
    }
  }
  throw lastError || new Error('No supported Gemini model found for this API key.');
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
