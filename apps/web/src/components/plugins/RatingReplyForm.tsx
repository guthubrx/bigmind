/**
 * Rating Reply Form
 * Allows replying to ratings
 */

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { submitRatingReply } from '../../services/supabaseClient';
import './RatingReplyForm.css';

export interface RatingReplyFormProps {
  ratingId: string;
  pluginId: string;
  onSuccess?: () => void;
}

export function RatingReplyForm({ ratingId, pluginId, onSuccess }: RatingReplyFormProps) {
  const [authorName, setAuthorName] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!authorName.trim() || !replyText.trim()) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check rate limit for replies
      const checkRateLimitResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-rate-limit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ pluginId, requestType: 'reply' }),
        }
      );

      if (!checkRateLimitResponse.ok) {
        const errorData = await checkRateLimitResponse.json();
        setMessage({
          type: 'error',
          text: errorData.message || 'Trop de réponses. Veuillez attendre avant de réessayer.',
        });
        setIsSubmitting(false);
        return;
      }

      const success = await submitRatingReply(ratingId, authorName, replyText);

      if (success) {
        setMessage({ type: 'success', text: 'Réponse envoyée !' });
        setAuthorName('');
        setReplyText('');
        setIsOpen(false);
        onSuccess?.();
      } else {
        setMessage({ type: 'error', text: "Erreur lors de l'envoi" });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[RatingReplyForm] Error:', error);
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button type="button" className="rating-reply-form__toggle" onClick={() => setIsOpen(true)}>
        Répondre
      </button>
    );
  }

  return (
    <form className="rating-reply-form" onSubmit={handleSubmit}>
      <div className="rating-reply-form__field">
        <label htmlFor={`reply-name-${ratingId}`} className="rating-reply-form__label">
          Votre nom
        </label>
        <input
          type="text"
          id={`reply-name-${ratingId}`}
          className="rating-reply-form__input"
          placeholder="Admin"
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="rating-reply-form__field">
        <label htmlFor={`reply-text-${ratingId}`} className="rating-reply-form__label">
          Votre réponse
        </label>
        <textarea
          id={`reply-text-${ratingId}`}
          className="rating-reply-form__textarea"
          placeholder="Répondez à cet avis..."
          rows={2}
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {message && (
        <div className={`rating-reply-form__message rating-reply-form__message--${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="rating-reply-form__actions">
        <button
          type="button"
          className="rating-reply-form__cancel"
          onClick={() => setIsOpen(false)}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="rating-reply-form__submit"
          disabled={isSubmitting || !authorName.trim() || !replyText.trim()}
        >
          <Send size={14} />
          Envoyer
        </button>
      </div>
    </form>
  );
}

export default RatingReplyForm;
