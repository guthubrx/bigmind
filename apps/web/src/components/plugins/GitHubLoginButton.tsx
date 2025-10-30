/**
 * GitHub Login Button
 * Permet de se connecter avec un GitHub Personal Access Token
 */

import React, { useState, useEffect } from 'react';
import { gitHubAuthService, type GitHubUser } from '../../services/GitHubAuthService';
import { LogIn, LogOut, User } from 'lucide-react';

export function GitHubLoginButton() {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user on mount
  useEffect(() => {
    const currentUser = gitHubAuthService.getUser();
    setUser(currentUser);
  }, []);

  const handleLogin = async () => {
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
      setShowTokenInput(false);
      // eslint-disable-next-line no-alert
      alert(`Connecté en tant que @${loggedInUser.login}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    gitHubAuthService.logout();
    setUser(null);
    setShowTokenInput(false);
    setToken('');
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
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
      {!showTokenInput ? (
        <button
          type="button"
          onClick={() => setShowTokenInput(true)}
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
          Se connecter avec GitHub
        </button>
      ) : (
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
                  'description=BigMind%20Plugin%20Dev&scopes=repo,read:user'
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
              {' avec les scopes: repo, read:user'}
            </div>
          </div>

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

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleLogin}
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
                setShowTokenInput(false);
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
      )}
    </div>
  );
}
