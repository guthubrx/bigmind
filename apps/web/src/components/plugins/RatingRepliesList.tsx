/**
 * Rating Replies List
 * Display all replies to a rating
 */

import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { getRatingReplies, supabase, type RatingReply } from '../../services/supabaseClient';
import './RatingRepliesList.css';

export interface RatingRepliesListProps {
  ratingId: string;
  refreshTrigger?: number;
}

export function RatingRepliesList({ ratingId, refreshTrigger }: RatingRepliesListProps) {
  const [replies, setReplies] = useState<RatingReply[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReplies = async () => {
      setIsLoading(true);
      try {
        const data = await getRatingReplies(ratingId);
        setReplies(data);
      } catch (error) {
        console.error('[RatingRepliesList] Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReplies();
  }, [ratingId, refreshTrigger]);

  // Subscribe to realtime reply updates
  useEffect(() => {
    if (!ratingId) return;

    const subscription = supabase
      .channel(`replies:${ratingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'plugin_rating_replies',
          filter: `rating_id=eq.${ratingId}`,
        },
        payload => {
          const newReply = payload.new as RatingReply;
          // Add new reply to the end of the list
          setReplies(prev => [...prev, newReply]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [ratingId]);

  if (isLoading) {
    return null;
  }

  if (replies.length === 0) {
    return null;
  }

  return (
    <div className="rating-replies-list">
      <div className="rating-replies-list__header">
        <MessageCircle size={14} />
        <span>
          {replies.length} réponse{replies.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="rating-replies-list__items">
        {replies.map(reply => (
          <div key={reply.id} className="rating-replies-list__item">
            <div className="rating-replies-list__author">{reply.author_name}</div>
            <div className="rating-replies-list__date">
              {new Date(reply.created_at || '').toLocaleDateString('fr-FR')}
            </div>
            <div className="rating-replies-list__text">{reply.reply_text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RatingRepliesList;
