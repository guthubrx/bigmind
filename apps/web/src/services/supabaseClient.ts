/**
 * Supabase Client
 * For plugin ratings and public comments
 */

import { createClient } from '@supabase/supabase-js';

// Get from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Plugin Rating Interface
 */
export interface PluginRating {
  id?: string;
  pluginId: string;
  userName: string;
  email?: string;
  rating: number; // 1-5
  comment: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Rating Reply Interface
 */
export interface RatingReply {
  id?: string;
  rating_id: string;
  author_name: string;
  reply_text: string;
  created_at?: string;
}

/**
 * Aggregate ratings for a plugin
 */
export interface PluginRatingsAggregate {
  pluginId: string;
  averageRating: number;
  totalRatings: number;
  breakdown: {
    onestar: number;
    twostar: number;
    threestar: number;
    fourstar: number;
    fivestar: number;
  };
}

/**
 * Get all ratings for a plugin
 */
export async function getPluginRatings(pluginId: string): Promise<PluginRating[]> {
  const { data, error } = await supabase
    .from('plugin_ratings')
    .select('*')
    .eq('pluginId', pluginId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching ratings:', error);
    return [];
  }

  return data || [];
}

/**
 * Submit a new rating
 */
export async function submitPluginRating(
  pluginId: string,
  userName: string,
  rating: number,
  comment: string,
  email?: string
): Promise<boolean> {
  // Validation
  if (!pluginId || !userName || rating < 1 || rating > 5 || !comment.trim()) {
    console.error('[Supabase] Invalid rating data');
    return false;
  }

  const { error } = await supabase.from('plugin_ratings').insert([
    {
      pluginId,
      userName,
      email: email || null,
      rating,
      comment: comment.trim(),
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error('[Supabase] Error submitting rating:', error);
    return false;
  }

  return true;
}

/**
 * Calculate aggregate ratings
 */
export async function getPluginRatingsAggregate(
  pluginId: string
): Promise<PluginRatingsAggregate> {
  const ratings = await getPluginRatings(pluginId);

  if (ratings.length === 0) {
    return {
      pluginId,
      averageRating: 0,
      totalRatings: 0,
      breakdown: {
        onestar: 0,
        twostar: 0,
        threestar: 0,
        fourstar: 0,
        fivestar: 0,
      },
    };
  }

  const breakdown = {
    onestar: ratings.filter(r => r.rating === 1).length,
    twostar: ratings.filter(r => r.rating === 2).length,
    threestar: ratings.filter(r => r.rating === 3).length,
    fourstar: ratings.filter(r => r.rating === 4).length,
    fivestar: ratings.filter(r => r.rating === 5).length,
  };

  const totalScore = ratings.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalScore / ratings.length;

  return {
    pluginId,
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalRatings: ratings.length,
    breakdown,
  };
}

/**
 * Get top-rated plugins
 */
export interface TopRatedPlugin {
  pluginId: string;
  averageRating: number;
  totalRatings: number;
}

export async function getTopRatedPlugins(limit: number = 3): Promise<TopRatedPlugin[]> {
  const { data, error } = await supabase
    .from('plugin_ratings')
    .select('pluginId')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('[Supabase] Error fetching top plugins:', error);
    return [];
  }

  // Group by pluginId and calculate average
  const pluginMap = new Map<string, { sum: number; count: number }>();

  data.forEach((row: any) => {
    const existing = pluginMap.get(row.pluginId) || { sum: 0, count: 0 };
    existing.sum += row.rating || 0;
    existing.count += 1;
    pluginMap.set(row.pluginId, existing);
  });

  const topPlugins = Array.from(pluginMap.entries())
    .map(([pluginId, { sum, count }]) => ({
      pluginId,
      averageRating: Math.round((sum / count) * 10) / 10,
      totalRatings: count,
    }))
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, limit);

  return topPlugins;
}

/**
 * Export ratings to CSV
 */
export async function exportRatingsToCSV(pluginId: string): Promise<string> {
  const ratings = await getPluginRatings(pluginId);

  if (ratings.length === 0) {
    return 'Aucun avis';
  }

  const headers = ['Nom', 'Note', 'Date', 'Commentaire'];
  const rows = ratings.map(r => [
    r.userName,
    r.rating,
    new Date(r.created_at || '').toLocaleDateString('fr-FR'),
    `"${(r.comment || '').replace(/"/g, '""')}"`, // Escape quotes
  ]);

  const csv = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  return csv;
}

/**
 * Get replies for a rating
 */
export async function getRatingReplies(ratingId: string): Promise<RatingReply[]> {
  const { data, error } = await supabase
    .from('plugin_rating_replies')
    .select('*')
    .eq('rating_id', ratingId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[Supabase] Error fetching replies:', error);
    return [];
  }

  return data || [];
}

/**
 * Submit a reply to a rating
 */
export async function submitRatingReply(
  ratingId: string,
  authorName: string,
  replyText: string
): Promise<boolean> {
  if (!ratingId || !authorName.trim() || !replyText.trim()) {
    console.error('[Supabase] Invalid reply data');
    return false;
  }

  const { error } = await supabase.from('plugin_rating_replies').insert([
    {
      rating_id: ratingId,
      author_name: authorName.trim(),
      reply_text: replyText.trim(),
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error('[Supabase] Error submitting reply:', error);
    return false;
  }

  return true;
}

/**
 * Admin: Get unapproved ratings (in moderation queue)
 */
export async function getUnapprovedRatings(): Promise<PluginRating[]> {
  const { data, error } = await supabase
    .from('plugin_ratings')
    .select('*')
    .eq('is_approved', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching unapproved ratings:', error);
    return [];
  }

  return data || [];
}

/**
 * Admin: Approve a rating
 */
export async function approveRating(ratingId: string): Promise<boolean> {
  const { error } = await supabase
    .from('plugin_ratings')
    .update({ is_approved: true })
    .eq('id', ratingId);

  if (error) {
    console.error('[Supabase] Error approving rating:', error);
    return false;
  }

  return true;
}

/**
 * Admin: Reject (delete) a rating
 */
export async function rejectRating(ratingId: string): Promise<boolean> {
  const { error } = await supabase
    .from('plugin_ratings')
    .delete()
    .eq('id', ratingId);

  if (error) {
    console.error('[Supabase] Error rejecting rating:', error);
    return false;
  }

  return true;
}

/**
 * Check if current user is a moderator
 */
export async function isModerator(): Promise<boolean> {
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    return false;
  }

  const { data, error } = await supabase
    .from('moderators')
    .select('id')
    .eq('user_id', user.data.user.id)
    .single();

  return !error && !!data;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error('[Supabase] Error getting current user:', error);
    return null;
  }

  return data.user;
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<boolean> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('[Supabase] Error signing out:', error);
    return false;
  }

  return true;
}
