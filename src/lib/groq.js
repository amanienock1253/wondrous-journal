// Groq AI integration — OpenAI-compatible, completely free tier
// Models: llama-3.3-70b, llama-3.1-8b (fast), mixtral-8x7b

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
];

function buildSystemPrompt(entries, focusEntry) {
  const entrySummaries = entries
    .slice(0, 60)
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
  if (m.includes('invalid api key') || m.includes('unauthorized') || m.includes('401'))
    return 'Invalid Groq API key — copy the full key from console.groq.com.';
  if (m.includes('rate limit') || m.includes('429'))
    return 'Rate limit hit — wait a moment and try again.';
  if (m.includes('model') && m.includes('not found'))
    return 'Model unavailable — trying next model.';
  return raw;
}

async function callGroq(apiKey, model, messages) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.8,
      max_tokens: 1024,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

async function callWithFallback(apiKey, messages) {
  let lastError;
  for (const model of MODELS) {
    try {
      return await callGroq(apiKey, model, messages);
    } catch (err) {
      const m = err.message.toLowerCase();
      // Only retry on model-not-found or rate limit, stop on auth errors
      if (m.includes('not found') || m.includes('rate limit') || m.includes('429')) {
        lastError = err;
        continue;
      }
      throw new Error(friendlyError(err.message));
    }
  }
  throw new Error(friendlyError(lastError?.message || 'All Groq models unavailable.'));
}

export async function askGroq(apiKey, conversationMessages, entries, focusEntry = null) {
  const system = buildSystemPrompt(entries, focusEntry);
  const messages = [
    { role: 'system', content: system },
    ...conversationMessages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
  ];

  const data = await callWithFallback(apiKey, messages);
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq.');
  return text;
}

export async function testGroqKey(apiKey) {
  await callWithFallback(apiKey, [
    { role: 'user', content: 'Reply with the single word: ready' },
  ]);
  return true;
}
