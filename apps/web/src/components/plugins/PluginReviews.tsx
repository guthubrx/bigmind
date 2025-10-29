/**
 * Plugin Reviews Component
 * Integrates Giscus for plugin comments/reviews via GitHub Discussions
 */

import React, { lazy, Suspense } from 'react';
import { MessageCircle } from 'lucide-react';
import './PluginReviews.css';

// Lazy load Giscus to reduce bundle size
const Giscus = lazy(() => import('@giscus/react'));

export interface PluginReviewsProps {
  pluginId: string;
  pluginName: string;
}

export function PluginReviews({ pluginId, pluginName }: PluginReviewsProps) {
  return (
    <div className="plugin-reviews">
      <div className="plugin-reviews__header">
        <MessageCircle size={20} />
        <h3 className="plugin-reviews__title">Avis et commentaires</h3>
      </div>

      <Suspense fallback={<div className="plugin-reviews__loading">Chargement des avis...</div>}>
        <Giscus
          id={`plugin-${pluginId}`}
          repo="guthubrx/bigmind-plugins"
          repoId="R_kgDON7lJBA" // You'll need to replace with actual repo ID
          category="Plugin Reviews"
          categoryId="DIC_kwDON7lJBM4Cy_gP" // You'll need to replace with actual category ID
          mapping="specific"
          term={`Plugin: ${pluginName} (${pluginId})`}
          reactionsEnabled="1"
          emitMetadata="1"
          inputPosition="top"
          theme="preferred_color_scheme"
          lang="fr"
          loading="lazy"
          onError={(e) => {
            console.error('Erreur lors du chargement des avis:', e);
          }}
        />
      </Suspense>
    </div>
  );
}

export default PluginReviews;
