/**
 * Rating Filter Component
 * Filter plugins by minimum rating
 */

import React from 'react';
import { Star } from 'lucide-react';
import './RatingFilter.css';

export interface RatingFilterProps {
  selectedRating: number | null; // null = no filter, 0 = all, 1-5 = minimum rating
  onRatingChange: (rating: number | null) => void;
}

export function RatingFilter({ selectedRating, onRatingChange }: RatingFilterProps) {
  return (
    <div className="rating-filter">
      <label className="rating-filter__label">
        <Star size={14} />
        Filtrer par note
      </label>
      <select
        value={selectedRating ?? ''}
        onChange={(e) => onRatingChange(e.target.value === '' ? null : Number(e.target.value))}
        className="rating-filter__select"
      >
        <option value="">Toutes les notes</option>
        <option value="5">5 étoiles</option>
        <option value="4">4 étoiles et plus</option>
        <option value="3">3 étoiles et plus</option>
        <option value="2">2 étoiles et plus</option>
        <option value="1">1 étoile et plus</option>
      </select>
    </div>
  );
}

export default RatingFilter;
