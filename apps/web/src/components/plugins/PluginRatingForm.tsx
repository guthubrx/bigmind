/**
 * Plugin Rating Form Component
 * Allows users to submit ratings and comments
 */

import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { submitPluginRating } from '../../services/supabaseClient';
import './PluginRatingForm.css';

export interface PluginRatingFormProps {
  pluginId: string;
  onSuccess?: () => void;
}

export function PluginRatingForm({ pluginId, onSuccess }: PluginRatingFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (!rating || !userName.trim() || !comment.trim()) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check rate limit via Edge Function
      const checkRateLimitResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-rate-limit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ pluginId }),
        }
      );

      const rateLimitData = await checkRateLimitResponse.json();

      if (!rateLimitData.allowed) {
        setMessage({
          type: 'error',
          text: rateLimitData.message || 'Trop de tentatives. Veuillez réessayer plus tard.',
        });
        setIsSubmitting(false);
        return;
      }

      // Submit rating
      const success = await submitPluginRating(
        pluginId,
        userName.trim(),
        rating,
        comment.trim(),
        email.trim() || undefined
      );

      if (success) {
        setMessage({ type: 'success', text: 'Merci ! Votre avis a été enregistré.' });
        setRating(0);
        setUserName('');
        setEmail('');
        setComment('');
        onSuccess?.();
      } else {
        setMessage({ type: 'error', text: "Erreur lors de l'envoi. Veuillez réessayer." });
      }
    } catch (error) {
      console.error('[PluginRatingForm] Error:', error);
      setMessage({ type: 'error', text: 'Erreur de connexion. Veuillez réessayer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="plugin-rating-form" onSubmit={handleSubmit}>
      <h4 className="plugin-rating-form__title">Laissez votre avis</h4>

      {/* Star Rating */}
      <div className="plugin-rating-form__rating">
        <div className="plugin-rating-form__label" role="heading" aria-level={3}>Note</div>
        <div className="plugin-rating-form__stars">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              className={`plugin-rating-form__star ${
                (hoverRating || rating) >= star ? 'plugin-rating-form__star--filled' : ''
              }`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star size={28} />
            </button>
          ))}
        </div>
        {rating > 0 && <span className="plugin-rating-form__rating-text">{rating}/5</span>}
      </div>

      {/* User Name */}
      <div className="plugin-rating-form__field">
        <label htmlFor="userName" className="plugin-rating-form__label">
          Votre nom
        </label>
        <input
          type="text"
          id="userName"
          className="plugin-rating-form__input"
          placeholder="Alice"
          value={userName}
          onChange={e => setUserName(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {/* Email (optional) */}
      <div className="plugin-rating-form__field">
        <label htmlFor="email" className="plugin-rating-form__label">
          Email (optionnel)
        </label>
        <input
          type="email"
          id="email"
          className="plugin-rating-form__input"
          placeholder="alice@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {/* Comment */}
      <div className="plugin-rating-form__field">
        <label htmlFor="comment" className="plugin-rating-form__label">
          Votre avis
        </label>
        <textarea
          id="comment"
          className="plugin-rating-form__textarea"
          placeholder="Dites-nous ce que vous en pensez..."
          rows={4}
          value={comment}
          onChange={e => setComment(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {/* Message */}
      {message && (
        <div className={`plugin-rating-form__message plugin-rating-form__message--${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="plugin-rating-form__submit"
        disabled={isSubmitting || !rating}
      >
        {isSubmitting ? 'Envoi...' : 'Envoyer mon avis'}
        <Send size={16} />
      </button>
    </form>
  );
}

export default PluginRatingForm;
