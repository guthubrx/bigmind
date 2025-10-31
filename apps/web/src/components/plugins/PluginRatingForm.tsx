/**
 * Plugin Rating Form Component
 * Allows users to submit ratings and comments
 */

import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { submitPluginRating, submitQuickRating } from '../../services/supabaseClient';
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
  const [emailTouched, setEmailTouched] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmittedQuickRating, setHasSubmittedQuickRating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // FR: Soumission rapide de la note au clic sur une étoile (avec demi-étoiles)
  // EN: Quick rating submission on star click (with half-stars)
  const handleQuickRating = async (newRating: number) => {
    setRating(newRating);
    setHasSubmittedQuickRating(false);
    setMessage(null);

    // Submit quick rating immediately
    try {
      const success = await submitQuickRating(
        pluginId,
        newRating,
        userName || undefined,
        email || undefined
      );

      if (success) {
        setHasSubmittedQuickRating(true);
        setMessage({
          type: 'success',
          text: `✓ Note de ${newRating}/5 enregistrée ! ${comment ? '' : 'Ajoutez un commentaire pour partager votre expérience.'}`,
        });
        onSuccess?.();
      } else {
        setMessage({ type: 'error', text: "Erreur lors de l'enregistrement de la note" });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[PluginRatingForm] Error submitting quick rating:', error);
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    }
  };

  // FR: Gestion du hover avec demi-étoiles
  // EN: Handle hover with half-stars
  const handleStarHover = (star: number, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const { width } = rect;
    const isLeftHalf = x < width / 2;

    setHoverRating(isLeftHalf ? star - 0.5 : star);
  };

  // FR: Gestion du clic avec demi-étoiles
  // EN: Handle click with half-stars
  const handleStarClick = (star: number, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const { width } = rect;
    const isLeftHalf = x < width / 2;

    const newRating = isLeftHalf ? star - 0.5 : star;
    handleQuickRating(newRating);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (!rating || !userName.trim()) {
      setMessage({ type: 'error', text: 'Veuillez donner une note et votre nom' });
      return;
    }

    if (!comment.trim()) {
      setMessage({
        type: 'error',
        text: 'Veuillez ajouter un commentaire pour soumettre un avis complet',
      });
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
        setMessage({
          type: 'success',
          text: 'Merci ! Votre avis a été envoyé pour approbation et apparaîtra une fois approuvé.',
        });
        setRating(0);
        setUserName('');
        setEmail('');
        setComment('');
        onSuccess?.();
      } else {
        setMessage({ type: 'error', text: "Erreur lors de l'envoi. Veuillez réessayer." });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[PluginRatingForm] Error:', error);
      setMessage({ type: 'error', text: 'Erreur de connexion. Veuillez réessayer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // FR: Validation email améliorée (RFC 5322 simplifié)
  // EN: Improved email validation (RFC 5322 simplified)
  const isValidEmail = (emailValue: string): boolean => {
    if (!emailValue) return true; // Empty is valid (optional field)

    // FR: Détection d'erreurs courantes
    // EN: Detect common errors
    if (emailValue.includes(' ')) return false;
    if (emailValue.includes('..')) return false;
    if (emailValue.startsWith('.') || emailValue.startsWith('@')) return false;
    if (emailValue.endsWith('.') || emailValue.endsWith('@')) return false;

    // FR: Regex stricte pour validation
    // EN: Strict regex for validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(emailValue);
  };

  // FR: Retourne un message d'aide contextuel
  // EN: Returns contextual help message
  const getEmailHelpMessage = (): string | null => {
    if (!emailTouched || !email) return null;

    if (email.includes(' ')) return "❌ Pas d'espaces";
    if (email.includes('..')) return '❌ Points consécutifs';
    if (!email.includes('@')) return '❌ Manque @';
    if (email.split('@').length > 2) return '❌ Un seul @';
    if (email.includes('@') && !email.split('@')[1].includes('.')) {
      return '❌ Domaine invalide';
    }
    if (isValidEmail(email)) return '✓ Valide';

    return '❌ Format invalide';
  };

  // FR: Classe CSS pour feedback visuel
  // EN: CSS class for visual feedback
  const getEmailInputClass = (): string => {
    let className = 'plugin-rating-form__input';

    if (emailTouched && email) {
      if (isValidEmail(email)) {
        className += ' plugin-rating-form__input--valid';
      } else {
        className += ' plugin-rating-form__input--invalid';
      }
    }

    return className;
  };

  return (
    <form className="plugin-rating-form" onSubmit={handleSubmit}>
      {/* Single Row: Note + Name + Email */}
      <div className="plugin-rating-form__single-row">
        {/* Note */}
        <div className="plugin-rating-form__field">
          <label className="plugin-rating-form__label">Note</label>
          <div className="plugin-rating-form__stars">
            {[1, 2, 3, 4, 5].map(star => {
              const currentRating = hoverRating || rating;
              const isFilled = star <= currentRating;
              const isHalfFilled = star - 0.5 <= currentRating && currentRating < star;

              return (
                <button
                  key={star}
                  type="button"
                  className={`plugin-rating-form__star ${
                    isFilled
                      ? 'plugin-rating-form__star--filled'
                      : isHalfFilled
                        ? 'plugin-rating-form__star--half'
                        : ''
                  }`}
                  onMouseMove={e => handleStarHover(star, e)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={e => handleStarClick(star, e)}
                  aria-label={`${star} étoiles`}
                >
                  {isHalfFilled ? (
                    <div className="star-half-container">
                      <Star size={20} fill="currentColor" className="star-half-filled" />
                      <Star size={20} fill="none" className="star-half-empty" />
                    </div>
                  ) : (
                    <Star size={20} fill={isFilled ? 'currentColor' : 'none'} />
                  )}
                </button>
              );
            })}
          </div>
          {rating > 0 && <span className="plugin-rating-form__rating-text-inline">{rating}/5</span>}
        </div>

        {/* Name */}
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

        {/* Email */}
        <div className="plugin-rating-form__field">
          <label htmlFor="email" className="plugin-rating-form__label">
            Email (optionnel)
          </label>
          <input
            type="email"
            id="email"
            className={getEmailInputClass()}
            placeholder="alice@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            onFocus={() => setEmailTouched(true)}
            disabled={isSubmitting}
            autoComplete="email"
            spellCheck="false"
          />
          {getEmailHelpMessage() && (
            <span
              className={`plugin-rating-form__hint ${
                isValidEmail(email)
                  ? 'plugin-rating-form__hint--success'
                  : 'plugin-rating-form__hint--error'
              }`}
            >
              {getEmailHelpMessage()}
            </span>
          )}
        </div>
      </div>

      {/* Optional Comment */}
      <div className="plugin-rating-form__field">
        <label htmlFor="comment" className="plugin-rating-form__label">
          Votre avis (optionnel)
        </label>
        <textarea
          id="comment"
          className="plugin-rating-form__textarea"
          placeholder="Dites-nous ce que vous en pensez..."
          rows={2}
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
