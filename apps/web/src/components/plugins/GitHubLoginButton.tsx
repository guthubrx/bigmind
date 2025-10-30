/**
 * GitHub Login Button
 * Authentification GitHub via OAuth 2.0 ou Personal Access Token
 */

import React, { useState, useEffect } from 'react';
import { gitHubAuthService, type GitHubUser } from '../../services/GitHubAuthService';
import { LogIn, LogOut, User, Github } from 'lucide-react';
import { isGitHubOAuthConfigured } from '../../config/github';

export function GitHubLoginButton() {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [showPATInput, setShowPATInput] = useState(false);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const oauthConfigured = isGitHubOAuthConfigured();

  // Load user on mount
  useEffect(() => {
    const currentUser = gitHubAuthService.getUser();
    setUser(currentUser);
  }, []);

  // Check for OAuth callback on mount
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const callback = gitHubAuthService.checkOAuthCallback();
      if (callback) {
        setLoading(true);
        const result = await gitHubAuthService.handleOAuthCallback(callback.code, callback.state);

        if (result.success && result.user) {
          setUser(result.user);
          gitHubAuthService.cleanOAuthParams();
        } else {
          setError(result.error || 'Échec de la connexion OAuth');
        }
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, []);

  const handleOAuthLogin = () => {
    try {
      gitHubAuthService.startOAuthFlow();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion OAuth');
    }
  };

  const handlePATLogin = async () => {
    if (!token.trim()) {
      setError('Veuillez entrer un token GitHub');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loggedInUser = await gitHubAuthService.login(token);
      setUser(loggedInUser);
      setToken('');
      setShowPATInput(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    gitHubAuthService.logout();
    setUser(null);
    setShowPATInput(false);
    setToken('');
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePATLogin();
    }
  };

  if (user) {
    // User is logged in
    return (
      <div
        style={{
          padding: '12px 16px',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <User size={20} color="var(--accent-color)" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>@{user.login}</div>
            <div style={{ fontSize: '12px', color: 'var(--fg-secondary)' }}>Connecté à GitHub</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            padding: '6px 12px',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            backgroundColor: 'transparent',
            color: 'var(--fg-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
          }}
        >
          <LogOut size={14} />
          Déconnexion
        </button>
      </div>
    );
  }

  // User is not logged in
  return (
    <div
      style={{
        padding: '16px',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      {loading && (
        <div
          style={{
            padding: '12px',
            textAlign: 'center',
            color: 'var(--fg-secondary)',
            fontSize: '14px',
          }}
        >
          Connexion en cours...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '8px 12px',
            marginBottom: '12px',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '4px',
            color: '#DC2626',
            fontSize: '12px',
          }}
        >
          {error}
        </div>
      )}

      {(() => {
        if (loading) return null;

        if (!showPATInput) {
          return (
            <div>
              {oauthConfigured ? (
                <>
                  {/* OAuth Login Button */}
                  <button
                    type="button"
                    onClick={handleOAuthLogin}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      border: '2px solid #24292e',
                      borderRadius: '6px',
                      backgroundColor: '#24292e',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      marginBottom: '12px',
                    }}
                  >
                    <Github size={18} />
                    Se connecter avec GitHub
                  </button>

                  {/* Alternative: PAT Login */}
                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setShowPATInput(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-color)',
                        fontSize: '12px',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      Ou utiliser un Personal Access Token
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Fallback to PAT if OAuth not configured */}
                  <div
                    style={{
                      padding: '12px',
                      marginBottom: '12px',
                      backgroundColor: '#FEF3C7',
                      border: '1px solid #FCD34D',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#92400E',
                    }}
                  >
                    ⚠️ OAuth non configuré. Utilisez un Personal Access Token.
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPATInput(true)}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      border: '2px solid var(--accent-color)',
                      borderRadius: '6px',
                      backgroundColor: 'var(--accent-color)',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '14px',
                    }}
                  >
                    <LogIn size={16} />
                    Se connecter avec un PAT
                  </button>
                </>
              )}
            </div>
          );
        }

        return (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                GitHub Personal Access Token
              </div>
              <input
                id="github-token"
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={e => setToken(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                aria-label="Entrez votre GitHub Personal Access Token"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                }}
              />
              <div
                style={{
                  marginTop: '6px',
                  fontSize: '11px',
                  color: 'var(--fg-secondary)',
                }}
              >
                <a
                  href={
                    'https://github.com/settings/tokens/new?' +
                    'description=BigMind%20Plugin%20Dev&scopes=read:user'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--accent-color)',
                    textDecoration: 'underline',
                  }}
                >
                  Créer un token
                </a>
                {' avec le scope: read:user uniquement'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handlePATLogin}
                disabled={loading || !token.trim()}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  border: '2px solid var(--accent-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--accent-color)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: loading || !token.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !token.trim() ? 0.5 : 1,
                  fontSize: '13px',
                }}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPATInput(false);
                  setToken('');
                  setError(null);
                }}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  color: 'var(--fg-secondary)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
