import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

export function useCommons(userId) {
  const [posts, setPosts]         = useState([]);
  const [myPosts, setMyPosts]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [tableReady, setTableReady] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    const [pubRes, myRes] = await Promise.all([
      supabase
        .from('community_posts')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(60),
      supabase
        .from('community_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ]);

    if (pubRes.error) {
      if (pubRes.error.code === '42P01') {
        setTableReady(false);
      } else {
        setError(pubRes.error.message);
      }
      setLoading(false);
      return;
    }

    setTableReady(true);
    setPosts(pubRes.data || []);
    setMyPosts(myRes.data || []);
    setLoading(false);
  }, [userId]);

  const addPost = async (post) => {
    const payload = {
      ...post,
      user_id: userId,
      likes: 0,
      reply_count: 0,
      created_at: new Date().toISOString(),
    };
    const { data, error: err } = await supabase
      .from('community_posts')
      .insert(payload)
      .select();
    if (err) { setError(err.message); return null; }
    const created = data?.[0];
    if (created) {
      if (created.is_public) setPosts(prev => [created, ...prev]);
      setMyPosts(prev => [created, ...prev]);
    }
    return created;
  };

  const fetchComments = async (postId) => {
    const { data, error: err } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (err) return [];
    return data || [];
  };

  const addComment = async (postId, body, authorName, isAI = false) => {
    const payload = {
      post_id: postId,
      user_id: isAI ? null : userId,
      body,
      author_name: authorName,
      is_ai: isAI,
      created_at: new Date().toISOString(),
    };
    const { data, error: err } = await supabase
      .from('community_comments')
      .insert(payload)
      .select();
    if (err) { setError(err.message); return null; }

    // Increment reply_count
    await supabase
      .from('community_posts')
      .update({ reply_count: (posts.find(p => p.id === postId)?.reply_count || 0) + 1 })
      .eq('id', postId);

    return data?.[0];
  };

  const likePost = async (postId) => {
    const post = [...posts, ...myPosts].find(p => p.id === postId);
    if (!post) return;
    const newLikes = (post.likes || 0) + 1;
    const { data } = await supabase
      .from('community_posts')
      .update({ likes: newLikes })
      .eq('id', postId)
      .select();
    if (data?.[0]) {
      setPosts(prev => prev.map(p => p.id === postId ? data[0] : p));
      setMyPosts(prev => prev.map(p => p.id === postId ? data[0] : p));
    }
  };

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    fetchPosts();
  }, [userId, fetchPosts]);

  return { posts, myPosts, loading, error, tableReady, fetchPosts, addPost, fetchComments, addComment, likePost };
}
