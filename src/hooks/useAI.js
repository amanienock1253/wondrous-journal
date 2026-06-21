// React hook that manages AI conversation state.
// Keeps a message history so the AI remembers what was said this session.

import { useState, useCallback } from 'react';
import { askJournalAI } from '../lib/ai.js';

export function useAI(entries) {
  const [messages,   setMessages]   = useState([]);
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState(null);

  const sendMessage = useCallback(async (text, focusEntry = null) => {
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id:        Date.now(),
      role:      'user',
      content:   text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    // Pass full current history + this new message to the API
    const history = [...messages, userMsg];
    const reply   = await askJournalAI(history, entries, focusEntry);

    const aiMsg = {
      id:        Date.now() + 1,
      role:      'assistant',
      content:   reply,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);
  }, [messages, entries, isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearMessages };
}
