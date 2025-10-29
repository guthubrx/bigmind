/**
 * Star Rating Input Component
 * Interactive component for users to rate plugins
 */

import React, { useState } from 'react';
import './StarRatingInput.css';

export interface StarRatingInputProps {
  rating: number;
  onRate: (rating: number) => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export function StarRatingInput({
  rating,
  onRate,
  size = 'medium',
  disabled = false,
}: StarRatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const currentRating = hoverRating || rating;

  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32,
  };

  const starSize = sizeMap[size];

  const handleClick = (starIndex: number) => {
    if (!disabled) {
      onRate(starIndex);
    }
  };

  const handleMouseEnter = (starIndex: number) => {
    if (!disabled) {
      setHoverRating(starIndex);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  return (
    <div
      className={`star-rating-input ${disabled ? 'star-rating-input--disabled' : ''}`}
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map(starIndex => {
        const isFilled = starIndex <= currentRating;

        return (
          <button
            key={starIndex}
            type="button"
            className={`star-rating-input__star ${
              isFilled ? 'star-rating-input__star--filled' : ''
            } ${hoverRating > 0 ? 'star-rating-input__star--hovering' : ''}`}
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            disabled={disabled}
            aria-label={`${starIndex} étoile${starIndex > 1 ? 's' : ''}`}
            style={{
              fontSize: `${starSize}px`,
            }}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export default StarRatingInput;
