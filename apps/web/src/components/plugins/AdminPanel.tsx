/**
 * Admin Panel Component
 * For moderating plugin ratings
 */

import React, { useState, useEffect } from 'react';
import { LogOut, CheckCircle, XCircle } from 'lucide-react';
import {
  supabase,
  getUnapprovedRatings,
  approveRating,
  rejectRating,
  getCurrentUser,
  signOut,
  type PluginRating,
} from '../../services/supabaseClient';
import './AdminPanel.css';

export function AdminPanel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [unapprovedRatings, setUnapprovedRatings] = useState<PluginRating[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (user) {
        setIsLoggedIn(true);
        setEmail(user.email || '');
      }
    };
    checkAuth();
  }, []);

  // Fetch unapproved ratings when logged in
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchRatings = async () => {
      const ratings = await getUnapprovedRatings();
      setUnapprovedRatings(ratings);
    };

    fetchRatings();
  }, [isLoggedIn, refreshTrigger]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ type: 'error', text: `Erreur: ${error.message}` });
        setIsLoading(false);
        return;
      }

      setIsLoggedIn(true);
      setPassword('');
      setMessage({ type: 'success', text: 'Connecté!' });
    } catch (err) {
      console.error('[AdminPanel] Login error:', err);
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setUnapprovedRatings([]);
  };

  const handleApprove = async (ratingId: string) => {
    const success = await approveRating(ratingId);
    if (success) {
      setMessage({ type: 'success', text: 'Avis approuvé!' });
      setRefreshTrigger(prev => prev + 1);
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de l\'approbation' });
    }
  };

  const handleReject = async (ratingId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir rejeter cet avis?')) {
      return;
    }

    const success = await rejectRating(ratingId);
    if (success) {
      setMessage({ type: 'success', text: 'Avis rejeté!' });
      setRefreshTrigger(prev => prev + 1);
    } else {
      setMessage({ type: 'error', text: 'Erreur lors du rejet' });
    }
  };

  // Not logged in - show login form
  if (!isLoggedIn) {
    return (
      <div className="admin-panel">
        <div className="admin-panel__login">
          <h2>Admin Panel</h2>
          <form onSubmit={handleLogin}>
            <div className="admin-panel__field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton-email@example.com"
                disabled={isLoading}
              />
            </div>

            <div className="admin-panel__field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            {message && (
              <div className={`admin-panel__message admin-panel__message--${message.type}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="admin-panel__button admin-panel__button--primary"
            >
              {isLoading ? 'Connexion...' : 'Se Connecter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Logged in - show moderation queue
  return (
    <div className="admin-panel">
      <div className="admin-panel__header">
        <h2>Admin Panel</h2>
        <div className="admin-panel__user">
          <span>{email}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="admin-panel__logout"
            title="Se déconnecter"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {message && (
        <div className={`admin-panel__message admin-panel__message--${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="admin-panel__queue">
        <h3>Avis en Attente d'Approbation ({unapprovedRatings.length})</h3>

        {unapprovedRatings.length === 0 ? (
          <div className="admin-panel__empty">
            <p>Aucun avis en attente ✅</p>
          </div>
        ) : (
          <div className="admin-panel__list">
            {unapprovedRatings.map((rating) => (
              <div key={rating.id} className="admin-panel__item">
                <div className="admin-panel__item-header">
                  <div>
                    <strong>{rating.userName}</strong>
                    <span className="admin-panel__plugin-id">{rating.pluginId}</span>
                  </div>
                  <div className="admin-panel__rating">
                    {'⭐'.repeat(rating.rating)}
                  </div>
                </div>

                <p className="admin-panel__comment">{rating.comment}</p>

                <div className="admin-panel__date">
                  {new Date(rating.created_at || '').toLocaleDateString('fr-FR')}{' '}
                  à{' '}
                  {new Date(rating.created_at || '').toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>

                <div className="admin-panel__actions">
                  <button
                    type="button"
                    onClick={() => handleApprove(rating.id || '')}
                    className="admin-panel__button admin-panel__button--approve"
                  >
                    <CheckCircle size={16} />
                    Approuver
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(rating.id || '')}
                    className="admin-panel__button admin-panel__button--reject"
                  >
                    <XCircle size={16} />
                    Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
