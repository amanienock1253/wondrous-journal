import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

// Background themes for stories
export const STORY_BG = {
  sunset:   { from: '#E85D3A', to: '#C9A84C',  label: 'Sunset'  },
  ocean:    { from: '#2D9CDB', to: '#7C6AF7',  label: 'Ocean'   },
  forest:   { from: '#2E7D52', to: '#2D9CDB',  label: 'Forest'  },
  night:    { from: '#1C1410', to: '#2A1C14',  label: 'Night'   },
  rose:     { from: '#EB5757', to: '#9B51E0',  label: 'Rose'    },
  gold:     { from: '#C9A84C', to: '#F2994A',  label: 'Gold'    },
};

export function useStories(userId) {
  const [myStory,    setMyStory]    = useState(null);
  const [community,  setCommunity]  = useState([]);
  const [loading,    setLoading]    = useState(false);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setMyStory(data.find(s => s.user_id === userId) || null);

      // One story per other user (most recent)
      const seen = new Set([userId]);
      const others = [];
      for (const s of data) {
        if (!seen.has(s.user_id)) {
          seen.add(s.user_id);
          others.push(s);
        }
      }
      setCommunity(others);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const postStory = useCallback(async (text, bg) => {
    if (!userId || !text.trim()) return false;
    const { error } = await supabase
      .from('stories')
      .insert({ user_id: userId, text: text.trim(), bg });
    if (!error) { await fetch(); return true; }
    return false;
  }, [userId, fetch]);

  const deleteMyStory = useCallback(async () => {
    if (!myStory) return;
    await supabase.from('stories').delete().eq('id', myStory.id);
    setMyStory(null);
  }, [myStory]);

  return { myStory, community, loading, postStory, deleteMyStory, refresh: fetch };
}
