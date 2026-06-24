import { useState, useCallback } from 'react';
import { askJournalAI } from '../lib/ai.js';

export function useAI(entries) {
  const [messages,  setMessages]  = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);

  const sendMessage = useCallback(async (text, focusEntry = null) => {
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id:        Date.now(),
      role:      'user',
      content:   text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const history = [...messages, userMsg];
      const reply   = await askJournalAI(history, entries, focusEntry);

      setMessages(prev => [...prev, {
        id:        Date.now() + 1,
        role:      'assistant',
        content:   reply,
        timestamp: new Date().toISOString(),
      }]);
    } catch (err) {
      const errText = err?.message || 'Something went wrong. Please try again.';
      setError(errText);
      setMessages(prev => [...prev, {
        id:        Date.now() + 1,
        role:      'assistant',
        content:   `Sorry, I hit an error: ${errText}`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, entries, isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearMessages };
}
