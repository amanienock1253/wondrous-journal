// Groq AI — Llama 3.3 70B via Groq's free API
// Docs: https://console.groq.com/docs/openai

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
];

// Build a concise index of entries — not verbose, just enough for the AI to reason about
function buildEntryIndex(entries) {
  if (!entries || entries.length === 0) return 'No discoveries captured yet.';
  return entries
    .slice(0, 80)
    .map((e, i) => {
      const date = new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const ex   = e.excited ? ` [★${e.excited}]` : '';
      const body = e.body ? ` — ${e.body.slice(0, 120).replace(/\n/g, ' ')}` : '';
      return `${i + 1}. [${(e.type || 'idea').toUpperCase()}] "${e.title}"${ex} (${date})${body}`;
    })
    .join('\n');
}

function buildSystemPrompt(entries, focusEntry) {
  const index = buildEntryIndex(entries);
  const focusSection = focusEntry
    ? `\n\nACTIVE ENTRY (user is focused on this one):\nTitle: "${focusEntry.title}"\nType: ${focusEntry.type}\n${focusEntry.body ? `Notes: ${focusEntry.body}` : ''}`
    : '';

  return `You are Wondrous AI — a sharp, honest innovation advisor inside a personal journal app called Wondrous Journal.

PERSONALITY: Direct, insightful, intellectually honest. No filler phrases. No "Great question!" or "Certainly!". Get to the point. Push back when an idea is weak. Get excited when something is genuinely strong.

RESPONSE RULES — follow these strictly:
1. For greetings (hello, hi, how are you): respond in 1 short sentence. Do NOT list or mention any discoveries.
2. For vague questions: ask one clarifying question instead of guessing.
3. For analysis, patterns, ideas, problems: reference the user's ACTUAL entries by name. Be specific.
4. NEVER dump a raw list of all discoveries. Only reference the ones directly relevant to the question.
5. Keep responses under 250 words unless the user asks for a detailed breakdown.
6. Use **bold** for emphasis and bullet points when listing things. Keep it readable.
7. Remember the conversation history — don't repeat yourself.

USER'S DISCOVERY JOURNAL (${entries.length} total — use as context, never recite verbatim):
${index}${focusSection}

When the user asks about their work, reference specific entries by their title. When they ask a general question, answer it directly without referencing their journal unless it's relevant.`;
}

function friendlyError(raw) {
  const m = (raw || '').toLowerCase();
  if (m.includes('invalid api key') || m.includes('unauthorized') || m.includes('401'))
    return 'Invalid Groq API key. Go to Settings → AI Integration and save a fresh key from console.groq.com.';
  if (m.includes('rate_limit') || m.includes('rate limit') || m.includes('429'))
    return 'Rate limit hit. Wait a few seconds and try again.';
  if (m.includes('model_not_found') || m.includes('model not found'))
    return 'Model unavailable, trying next model.';
  if (m.includes('context_length') || m.includes('context length'))
    return 'Message too long. Try asking something more specific.';
  return raw || 'Unknown error from Groq.';
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
      temperature: 0.7,
      max_tokens: 800,
      stream: false,
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
      const data = await callGroq(apiKey, model, messages);
      const text = data?.choices?.[0]?.message?.content;
      if (!text) throw new Error('Empty response from model.');
      return text;
    } catch (err) {
      const m = err.message.toLowerCase();
      // Retry on model issues; stop on auth errors
      if (m.includes('invalid api key') || m.includes('unauthorized') || m.includes('401')) {
        throw new Error(friendlyError(err.message));
      }
      lastError = err;
    }
  }
  throw new Error(friendlyError(lastError?.message || 'All Groq models failed.'));
}

export async function askGroq(apiKey, conversationMessages, entries, focusEntry = null) {
  const systemPrompt = buildSystemPrompt(entries, focusEntry);

  // Build messages array: system + conversation history
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationMessages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
  ];

  return await callWithFallback(apiKey, messages);
}

export async function testGroqKey(apiKey) {
  const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Reply with just the word: ready' },
  ];
  await callWithFallback(apiKey, messages);
  return true;
}
