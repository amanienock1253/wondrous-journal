import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

// Fetches one recent entry per user (excluding current user) for the stories row.
// Requires Supabase RLS policy: FOR SELECT USING (auth.uid() IS NOT NULL)
export function useCommunityStories(currentUserId) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUserId) return;
    setLoading(true);

    supabase
      .from('entries')
      .select('id, user_id, type, title, body, excited, created_at')
      .neq('user_id', currentUserId)
      .order('created_at', { ascending: false })
      .limit(80)
      .then(({ data, error }) => {
        if (error || !data) { setLoading(false); return; }

        // One story per user — their most recent entry
        const seen = new Set();
        const perUser = [];
        for (const entry of data) {
          if (!seen.has(entry.user_id)) {
            seen.add(entry.user_id);
            perUser.push(entry);
          }
          if (perUser.length >= 12) break;
        }

        setStories(perUser);
        setLoading(false);
      });
  }, [currentUserId]);

  return { stories, loading };
}

// Stable color from a user_id string (for avatar background)
export function userColor(userId) {
  const palette = [
    '#E85D3A', '#7C6AF7', '#2D9CDB', '#2E7D52',
    '#C9A84C', '#9B51E0', '#EB5757', '#F2994A',
  ];
  let hash = 0;
  for (let i = 0; i < (userId || '').length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

// Two-letter label from user_id (consistent per user)
export function userInitials(userId) {
  if (!userId) return 'WJ';
  const chars = userId.replace(/-/g, '');
  return (chars[0] + chars[1]).toUpperCase();
}
