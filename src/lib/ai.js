// Local AI engine for Wondrous Journal.
// No API key needed — all intelligence comes from analyzing the user's own entries.
// Detects what the user is asking, runs analysis on their journal, returns a natural response.

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const STOP = new Set([
  'the','a','an','is','it','in','on','at','to','for','of','and','or','but',
  'i','my','me','we','you','this','that','with','from','about','be','are',
  'was','were','have','has','had','do','did','not','can','will','would',
  'could','should','they','their','there','what','which','who','how','when',
  'where','why','its','if','just','also','very','some','any','all','more',
  'so','as','by','up','out','no','he','she','his','her','an','into','than',
  'then','now','here','only','even','been','being','does','each','both',
]);

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function daysAgo(iso) {
  return Math.floor((Date.now() - new Date(iso)) / 86_400_000);
}

function relDate(iso) {
  const d = daysAgo(iso);
  if (d === 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 7)  return `${d} days ago`;
  if (d < 30) return `${Math.floor(d / 7)} week${Math.floor(d / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(d / 30)} month${Math.floor(d / 30) > 1 ? 's' : ''} ago`;
}

function stars(n) { return n > 0 ? '⭐'.repeat(n) : 'unrated'; }

function keywords(text) {
  return (text || '').toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 3 && !STOP.has(w));
}

function entryKeywords(e) {
  return keywords(`${e.title} ${e.body || ''} ${e.location || ''}`);
}

function titleOf(e) { return e.title || 'Untitled'; }

// ─────────────────────────────────────────────
// ANALYSIS FUNCTIONS
// ─────────────────────────────────────────────

function analyzeAll(entries) {
  const byType = { idea: [], problem: [], scout: [], project: [] };
  entries.forEach(e => (byType[e.type] = byType[e.type] || []).push(e));

  // Top themes — most frequent keywords across all entries
  const freq = {};
  entries.forEach(e => {
    entryKeywords(e).forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  });
  const themes = Object.entries(freq)
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);

  // Top ideas by excitement then recency
  const topIdeas = [...(byType.idea || [])]
    .sort((a, b) => {
      const scoreA = (a.excited || 0) * 10 - daysAgo(a.created_at) * 0.1;
      const scoreB = (b.excited || 0) * 10 - daysAgo(b.created_at) * 0.1;
      return scoreB - scoreA;
    });

  // Connections — pairs of entries sharing 2+ keywords
  const withWords = entries.map(e => ({ e, words: new Set(entryKeywords(e)) }));
  const connections = [];
  for (let i = 0; i < withWords.length; i++) {
    for (let j = i + 1; j < withWords.length; j++) {
      const shared = [...withWords[i].words].filter(w => withWords[j].words.has(w));
      if (shared.length >= 2) {
        connections.push({ a: withWords[i].e, b: withWords[j].e, shared });
      }
    }
  }
  connections.sort((a, b) => b.shared.length - a.shared.length);

  // Recent entries (last 7 days)
  const recent = entries.filter(e => daysAgo(e.created_at) <= 7)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return { byType, themes, topIdeas, connections, recent };
}

// ─────────────────────────────────────────────
// INTENT DETECTION
// ─────────────────────────────────────────────

function detectIntent(q, hasFocus) {
  const t = q.toLowerCase();
  if (t.match(/most excit|best idea|top idea|highest rated|favourite/))       return 'top_ideas';
  if (t.match(/connect|similar|related|link|overlap|between/))                return 'connections';
  if (t.match(/problem|tackle|solve|priority|first|which one/))               return 'problems';
  if (t.match(/observ|scout|notice|seen|spot/))                               return 'scouts';
  if (t.match(/pattern|trend|often|repeat|common|theme/))                     return 'patterns';
  if (t.match(/expand|develop|deeper|more about|build on|elaborate/))         return hasFocus ? 'expand'     : 'general';
  if (t.match(/feedback|honest|critique|what do you think|assess|review/))    return hasFocus ? 'feedback'   : 'general';
  if (t.match(/project|become|turn into|next step|action|execute/))           return hasFocus ? 'to_project' : 'projects_overview';
  if (t.match(/risk|challenge|danger|obstacle|downside|worry/))               return hasFocus ? 'risks'      : 'general';
  if (t.match(/summar|overview|all|everything|total|what have/))              return 'summary';
  if (t.match(/recent|latest|new|last|today|this week/))                      return 'recent';
  if (t.match(/idea|ideas/))                                                  return 'top_ideas';
  if (t.match(/hello|hi|hey|who are you|what can you/))                       return 'greeting';
  return 'general';
}

// Find entries relevant to a free-text query
function findRelevant(q, entries) {
  const qWords = new Set(keywords(q));
  return entries
    .map(e => {
      const eWords = entryKeywords(e);
      const overlap = eWords.filter(w => qWords.has(w)).length;
      return { e, overlap };
    })
    .filter(x => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .map(x => x.e)
    .slice(0, 3);
}

// ─────────────────────────────────────────────
// RESPONSE GENERATORS
// ─────────────────────────────────────────────

function respondEmpty() {
  return pick([
    "Your journal is empty right now. Start by capturing your first idea — even a rough thought counts.",
    "No captures yet. Once you start journaling, I can help you think through your ideas and spot patterns.",
    "Nothing to analyse yet. Add a few captures and I'll start finding insights for you.",
  ]);
}

function respondGreeting(entries) {
  const n = entries.length;
  if (n === 0) return "Hey! I'm your thinking partner built into Wondrous Journal. Start capturing ideas and I'll help you make sense of them.";
  return pick([
    `Hey! I've been through all ${n} of your captures. Ask me anything — I'm here to help you think.`,
    `Hi! I know your journal well — ${n} captures, and I've spotted some interesting things. What do you want to explore?`,
    `Hello! With ${n} entries to work with, I can find patterns, connections, and help you develop ideas. Where should we start?`,
  ]);
}

function respondTopIdeas({ topIdeas }) {
  if (topIdeas.length === 0) return "You don't have any ideas captured yet. Tap the + button to capture your first one.";

  const top = topIdeas[0];
  const others = topIdeas.slice(1, 3);

  let r = `Your most exciting idea is **"${titleOf(top)}"** — captured ${relDate(top.created_at)}`;
  if (top.excited) r += ` and rated ${stars(top.excited)}`;
  r += '.';
  if (top.body) r += ` You wrote: "${top.body.slice(0, 100)}${top.body.length > 100 ? '…' : ''}"`;

  if (others.length > 0) {
    r += `\n\nClose behind: `;
    r += others.map(e => `**"${titleOf(e)}"**${e.excited ? ` (${stars(e.excited)})` : ''}`).join(' and ');
    r += '.';
  }

  return r;
}

function respondConnections({ connections, entries }) {
  if (connections.length === 0) {
    if (entries.length < 3) return "You need a few more captures before I can spot connections. Keep journaling!";
    return "Your captures are all quite distinct right now — no strong overlaps yet. That could be a good thing: you're exploring different territory.";
  }

  const top = connections.slice(0, 3);
  let r = pick([
    "Here are some connections I found across your captures:",
    "Interesting — I can see threads linking your entries:",
    "Your ideas aren't isolated — here's what connects them:",
  ]) + '\n\n';

  top.forEach(({ a, b, shared }) => {
    r += `**"${titleOf(a)}"** and **"${titleOf(b)}"** both touch on *${shared.slice(0, 3).join(', ')}*.\n\n`;
  });

  r += pick([
    "These links might be worth exploring — connecting your observations often leads to the strongest ideas.",
    "Recurring themes across entries usually point to something you genuinely care about.",
    "When your captures start echoing each other, that's usually a signal worth paying attention to.",
  ]);

  return r;
}

function respondProblems({ byType }) {
  const problems = byType.problem || [];
  if (problems.length === 0) return "You haven't captured any problems yet. Try the Problem type next time you notice something broken or frustrating.";

  const sorted = [...problems].sort((a, b) => {
    const scoreA = (a.excited || 0) * 10 + (daysAgo(a.created_at) < 7 ? 5 : 0);
    const scoreB = (b.excited || 0) * 10 + (daysAgo(b.created_at) < 7 ? 5 : 0);
    return scoreB - scoreA;
  });

  const top = sorted[0];
  let r = `You have ${problems.length} problem${problems.length > 1 ? 's' : ''} captured.`;
  r += ` The one I'd look at first is **"${titleOf(top)}"** — captured ${relDate(top.created_at)}`;
  if (top.excited) r += ` with ${stars(top.excited)}`;
  r += '.';

  if (top.body) r += `\n\nYour notes: "${top.body.slice(0, 120)}${top.body.length > 120 ? '…' : ''}"`;

  if (sorted.length > 1) {
    r += `\n\nOther problems on your radar: ${sorted.slice(1, 3).map(e => `**"${titleOf(e)}"**`).join(', ')}.`;
  }

  return r;
}

function respondScouts({ byType, recent }) {
  const scouts = byType.scout || [];
  if (scouts.length === 0) return "No Scout observations yet. Use the Scout type when you notice something interesting out in the world — a gap, a behaviour, an opportunity.";

  const recentScouts = scouts.filter(e => daysAgo(e.created_at) <= 14);
  const list = (recentScouts.length > 0 ? recentScouts : scouts).slice(0, 3);

  let r = `You have ${scouts.length} field observation${scouts.length > 1 ? 's' : ''}.`;
  if (recentScouts.length > 0) r += ` ${recentScouts.length} in the past two weeks.`;
  r += '\n\n';

  list.forEach(e => {
    r += `**"${titleOf(e)}"** — ${relDate(e.created_at)}`;
    if (e.location) r += ` (${e.location})`;
    if (e.body) r += `. "${e.body.slice(0, 80)}…"`;
    r += '\n\n';
  });

  return r.trim();
}

function respondPatterns({ themes, byType, entries }) {
  const total = entries.length;
  if (total === 0) return respondEmpty();

  const typeCounts = Object.entries(byType)
    .filter(([, arr]) => arr.length > 0)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([type, arr]) => `${arr.length} ${type}${arr.length > 1 ? 's' : ''}`);

  let r = `Across ${total} capture${total > 1 ? 's' : ''}, here's what I see:\n\n`;
  r += `**Breakdown:** ${typeCounts.join(', ')}.\n\n`;

  if (themes.length > 0) {
    r += `**Recurring themes:** ${themes.slice(0, 5).map(t => `*${t}*`).join(', ')}. These words keep showing up — they likely point to what you care about most.\n\n`;
  }

  const excited = entries.filter(e => (e.excited || 0) >= 4);
  if (excited.length > 0) {
    r += `**High energy:** ${excited.length} capture${excited.length > 1 ? 's' : ''} rated 4+ stars — these deserve your attention.`;
  }

  return r;
}

function respondSummary({ byType, themes, topIdeas, recent, entries }) {
  const total = entries.length;
  if (total === 0) return respondEmpty();

  let r = `Here's where your journal stands:\n\n`;

  const counts = Object.entries(byType).filter(([, a]) => a.length > 0);
  counts.forEach(([type, arr]) => {
    const typeLabel = { idea: '💡 Ideas', problem: '🔍 Problems', scout: '📍 Scouts', project: '🚀 Projects' }[type];
    r += `**${typeLabel}:** ${arr.length}\n`;
  });

  if (topIdeas.length > 0) {
    r += `\n**Most exciting:** "${titleOf(topIdeas[0])}"`;
    if (topIdeas[0].excited) r += ` ${stars(topIdeas[0].excited)}`;
    r += '\n';
  }

  if (themes.length > 0) {
    r += `\n**Core themes:** ${themes.slice(0, 4).join(', ')}\n`;
  }

  if (recent.length > 0) {
    r += `\n**This week:** ${recent.length} new capture${recent.length > 1 ? 's' : ''}, including "${titleOf(recent[0])}"`;
  }

  return r;
}

function respondRecent({ recent, entries }) {
  if (recent.length === 0) {
    const last = [...entries].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    if (!last) return "Nothing captured yet.";
    return `Your last capture was **"${titleOf(last)}"** — ${relDate(last.created_at)}. Nothing new this week yet.`;
  }

  let r = `Here's what you captured recently:\n\n`;
  recent.slice(0, 4).forEach(e => {
    const typeIcon = { idea: '💡', problem: '🔍', scout: '📍', project: '🚀' }[e.type] || '📝';
    r += `${typeIcon} **"${titleOf(e)}"** — ${relDate(e.created_at)}\n`;
    if (e.body) r += `   "${e.body.slice(0, 70)}${e.body.length > 70 ? '…' : ''}"\n`;
    r += '\n';
  });

  return r.trim();
}

function respondExpand(entry) {
  const type = entry.type;
  const t = titleOf(entry);

  const q = pick({
    idea: [
      `What problem does **"${t}"** solve, exactly? Who feels that pain most?\n\nWhat's the simplest version of this you could test in a week?\n\nWho would pay for it — and what would make them say no?`,
      `Think about **"${t}"** from three angles:\n\n**User:** Who needs this and what do they do today instead?\n\n**Value:** What's the one thing that would make someone tell a friend about it?\n\n**Viability:** What's the hardest part to build?`,
    ],
    problem: [
      `For **"${t}"** — is this a problem people know they have, or one they haven't named yet?\n\nWho currently suffers from it most? What workarounds do they use?\n\nIf this were solved completely, what changes?`,
      `Good problem to track. A few questions that sharpen it:\n\nHow often does this happen? Daily, weekly, once-in-a-while?\n\nIs it getting worse or better over time?\n\nWho loses money or time because of it?`,
    ],
    scout: [
      `Your observation **"${t}"** is a seed. To develop it:\n\nWhat's behind this — what systemic reason causes it?\n\nHave you seen it elsewhere, or is it location-specific?\n\nWhat kind of solution would fit naturally into this environment?`,
      `Field observations like **"${t}"** are gold when you interrogate them.\n\nWho's affected? Who's responsible for fixing it?\n\nWhat would need to be true for this to become a real opportunity?`,
    ],
    project: [
      `For **"${t}"** to move forward, try answering:\n\n**What's done:** List what already exists or is decided.\n\n**What's next:** The single most important thing to do this week.\n\n**What's unclear:** The biggest open question you're avoiding.`,
      `**"${t}"** is in project territory. Let's make it concrete:\n\nWhat does "done" look like — what's the minimum version that matters?\n\nWho else needs to be involved?\n\nWhat's the first thing you'd regret not doing?`,
    ],
  }[type] || [`Tell me more about **"${t}"** — what made you capture it, and what would it mean if you actually did something with it?`]);

  return q;
}

function respondFeedback(entry) {
  const t = titleOf(entry);
  const hasBody  = (entry.body || '').length > 20;
  const hasTitle = (entry.title || '').length > 5;
  const excited  = entry.excited || 0;

  let r = `Honest thoughts on **"${t}"**:\n\n`;

  if (!hasBody) {
    r += `You haven't added much detail yet. The title alone isn't enough to know if this is strong — the idea is in your head, not on the page. Flesh it out first.\n\n`;
  } else {
    r += `You've written something here, which is already ahead of most people who just think and never capture.\n\n`;
  }

  if (excited >= 4) {
    r += `You rated this ${stars(excited)} — high excitement is good signal, but excitement fades. The question is: are you still thinking about this a week later?\n\n`;
  } else if (excited === 0) {
    r += `No excitement rating yet. That either means you're being conservative, or you haven't decided how you feel about it yet. Which is it?\n\n`;
  }

  r += pick([
    `The strength of an idea isn't how it sounds — it's how it survives questions. What's the weakest part of this?`,
    `What would have to be true for this to actually work? And how confident are you that it is true?`,
    `Most ideas die because nobody tests them. What's the smallest experiment that would tell you if this is worth pursuing?`,
  ]);

  return r;
}

function respondToProject(entry) {
  const t = titleOf(entry);
  const typeLabel = { idea: 'idea', problem: 'problem', scout: 'observation', project: 'project' }[entry.type] || 'capture';

  let r = `Turning **"${t}"** from a ${typeLabel} into a real project:\n\n`;

  r += `**Step 1 — Define the outcome.** What does success look like in 3 months? Be specific: not "build an app" but "10 people use it every day."\n\n`;
  r += `**Step 2 — Identify the first believer.** Who is the first person (not you) who would benefit? Talk to them before building anything.\n\n`;
  r += `**Step 3 — Shrink the scope.** What's the smallest version that still delivers value? Cut everything else.\n\n`;
  r += `**Step 4 — Block the time.** An idea without a calendar slot stays an idea. When are you working on this next?\n\n`;

  r += pick([
    `The difference between a capture and a project is a decision. Have you decided?`,
    `Most ideas don't fail — they just never get started. What's stopping you from treating this as a project today?`,
    `You've captured it. Now the move is commitment, not more thinking.`,
  ]);

  return r;
}

function respondRisks(entry) {
  const t = titleOf(entry);
  const type = entry.type;

  const risks = {
    idea: [
      `The risks I'd think through for **"${t}"**:\n\n**Market risk** — Do people actually want this, or do you just want to build it?\n\n**Timing risk** — Has someone already tried this? Why didn't it work?\n\n**Complexity risk** — How many things have to go right for this to succeed?\n\n**Motivation risk** — Will you still care about this in 6 months?`,
    ],
    problem: [
      `For the problem **"${t}"**:\n\n**Is it real?** You've observed it, but how widespread is it really?\n\n**Is it urgent?** People tolerate problems they've learned to live with.\n\n**Is it yours to solve?** Someone else may be better positioned.`,
    ],
    scout: [
      `For your observation **"${t}"**:\n\n**Context risk** — Is this specific to one place, or a broader pattern?\n\n**Interpretation risk** — You saw it, but did you understand it correctly?\n\n**Action risk** — Observations are only useful if they lead somewhere.`,
    ],
    project: [
      `Key risks for **"${t}"**:\n\n**Scope creep** — Projects expand. What will you say no to?\n\n**Dependency risk** — What external things could block you?\n\n**Abandonment risk** — What usually makes you drop projects like this?`,
    ],
  };

  return pick(risks[type] || risks.idea);
}

function respondProjectsOverview({ byType }) {
  const projects = byType.project || [];
  const ideas    = byType.idea    || [];

  if (projects.length === 0 && ideas.length === 0) return "No projects or ideas yet. Start capturing and we can talk about what to turn into a project.";

  let r = '';

  if (projects.length > 0) {
    r += `You have ${projects.length} active project${projects.length > 1 ? 's' : ''}: `;
    r += projects.map(e => `**"${titleOf(e)}"**`).join(', ');
    r += '.\n\n';
  }

  if (ideas.length > 0) {
    const topIdea = [...ideas].sort((a, b) => (b.excited || 0) - (a.excited || 0))[0];
    r += `Of your ${ideas.length} idea${ideas.length > 1 ? 's' : ''}, **"${titleOf(topIdea)}"** looks most ready to become a project`;
    if (topIdea.excited) r += ` (${stars(topIdea.excited)})`;
    r += '.';
  }

  return r;
}

function respondGeneral(q, entries) {
  const relevant = findRelevant(q, entries);
  if (relevant.length > 0) {
    let r = `Your most relevant captures for that:\n\n`;
    relevant.forEach(e => {
      r += `**"${titleOf(e)}"** (${e.type}, ${relDate(e.created_at)})`;
      if (e.body) r += ` — "${e.body.slice(0, 90)}${e.body.length > 90 ? '…' : ''}"`;
      r += '\n\n';
    });
    return r.trim();
  }

  return pick([
    "I didn't find anything directly matching that in your journal. Try capturing more context around this topic.",
    "Nothing specific in your captures about that. Either capture it now, or rephrase your question.",
    "Your journal doesn't have much on that yet. Ask me something about what you've already captured and I can dig in.",
  ]);
}

// ─────────────────────────────────────────────
// MAIN ENTRY POINT
// ─────────────────────────────────────────────

export async function askJournalAI(conversationMessages, entries, focusEntry = null) {
  // Get the latest user message
  const lastUser = [...conversationMessages].reverse().find(m => m.role === 'user');
  if (!lastUser) return "Ask me anything about your journal.";

  const q = lastUser.content;

  if (entries.length === 0) return respondEmpty();

  const analysis = analyzeAll(entries);
  const intent   = detectIntent(q, !!focusEntry);

  // Focus entry overrides — operations on a specific entry
  if (focusEntry) {
    if (intent === 'expand')     return respondExpand(focusEntry);
    if (intent === 'feedback')   return respondFeedback(focusEntry);
    if (intent === 'to_project') return respondToProject(focusEntry);
    if (intent === 'risks')      return respondRisks(focusEntry);
  }

  switch (intent) {
    case 'greeting':         return respondGreeting(entries);
    case 'top_ideas':        return respondTopIdeas(analysis);
    case 'connections':      return respondConnections({ ...analysis, entries });
    case 'problems':         return respondProblems(analysis);
    case 'scouts':           return respondScouts(analysis);
    case 'patterns':         return respondPatterns({ ...analysis, entries });
    case 'summary':          return respondSummary({ ...analysis, entries });
    case 'recent':           return respondRecent({ ...analysis, entries });
    case 'projects_overview':return respondProjectsOverview(analysis);
    case 'expand':           return focusEntry ? respondExpand(focusEntry)   : respondGeneral(q, entries);
    case 'feedback':         return focusEntry ? respondFeedback(focusEntry) : respondGeneral(q, entries);
    case 'to_project':       return focusEntry ? respondToProject(focusEntry): respondProjectsOverview(analysis);
    case 'risks':            return focusEntry ? respondRisks(focusEntry)    : respondGeneral(q, entries);
    default:                 return respondGeneral(q, entries);
  }
}
