/**
 * OAuth Callback Handler
 * Gère le callback OAuth GitHub sur toutes les pages
 * Ce composant doit être monté dans App.tsx pour fonctionner globalement
 */

import { useEffect, useRef } from 'react';
import { gitHubAuthService } from '../../services/GitHubAuthService';

export function OAuthCallbackHandler() {
  // Prevent double execution in React Strict Mode
  const hasProcessedCallback = useRef(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const callback = gitHubAuthService.checkOAuthCallback();
      if (!callback) return; // Pas de callback OAuth dans l'URL

      // Prevent double execution in React Strict Mode (dev only)
      if (hasProcessedCallback.current) {
        // eslint-disable-next-line no-console
        console.log('[OAuthCallbackHandler] Already processed, skipping duplicate call');
        return;
      }
      hasProcessedCallback.current = true;

      // eslint-disable-next-line no-console
      console.log('[OAuthCallbackHandler] OAuth callback detected, processing...');
      console.log('[OAuthCallbackHandler] Code:', `${callback.code.substring(0, 10)}...`);
      console.log('[OAuthCallbackHandler] State:', callback.state);

      const result = await gitHubAuthService.handleOAuthCallback(callback.code, callback.state);

      if (result.success && result.user) {
        // eslint-disable-next-line no-console
        console.log('[OAuthCallbackHandler] OAuth successful, user:', result.user.login);

        // Nettoyer les paramètres OAuth de l'URL
        gitHubAuthService.cleanOAuthParams();

        // Small delay to ensure localStorage is flushed before redirect
        setTimeout(() => {
          // Get saved return URL or default to developer settings
          const returnUrl =
            localStorage.getItem('bigmind-oauth-return-url') || '/settings?section=developer';
          localStorage.removeItem('bigmind-oauth-return-url');

          // eslint-disable-next-line no-console
          console.log('[OAuthCallbackHandler] Redirecting to:', returnUrl);

          // Redirect back to where user came from
          window.location.replace(returnUrl);
        }, 100);
      } else {
        // eslint-disable-next-line no-console
        console.error('[OAuthCallbackHandler] OAuth failed:', result.error);

        // Redirect to developer settings with error
        const returnUrl = `/settings?section=developer&oauth_error=${encodeURIComponent(
          result.error || 'Unknown error'
        )}`;
        window.location.replace(returnUrl);
      }
    };

    handleOAuthCallback();
  }, []);

  // Ce composant ne rend rien, il gère juste le callback
  return null;
}
