/**
 * Star Rating Component
 * Displays rating as stars (0-5)
 */

import React from 'react';

interface StarRatingProps {
  rating: number; // 0-5
  reviewCount?: number;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
}

export function StarRating({
  rating,
  reviewCount = 0,
  size = 'small',
  showCount = true,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClass = {
    small: '12px',
    medium: '16px',
    large: '20px',
  }[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div
        style={{
          display: 'flex',
          gap: '2px',
          fontSize: sizeClass,
          color: '#f59e0b', // Orange/yellow for stars
        }}
      >
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={`full-${i}`}>★</span>
        ))}

        {/* Half star */}
        {hasHalfStar && <span>⯨</span>}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={`empty-${i}`} style={{ color: '#d1d5db' }}>
            ★
          </span>
        ))}
      </div>

      {showCount && reviewCount > 0 && (
        <span
          style={{
            fontSize: size === 'small' ? '11px' : '13px',
            color: '#6b7280',
          }}
        >
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
