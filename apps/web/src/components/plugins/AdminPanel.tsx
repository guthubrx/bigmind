/**
 * Admin Panel Component
 * For moderating plugin ratings and managing plugin reports
 */

import React, { useState, useEffect } from 'react';
import { LogOut, CheckCircle, XCircle, AlertTriangle, Clock, Flag, Shield, Star, MessageSquare } from 'lucide-react';
import {
  supabase,
  getUnapprovedRatings,
  approveRating,
  rejectRating,
  getCurrentUser,
  signOut,
  type PluginRating,
} from '../../services/supabaseClient';
import {
  getAllReports,
  updateReportStatus,
  deleteReport,
  type PluginReport,
  type ReportStatus,
} from '../../services/PluginReportService';
import './AdminPanel.css';

type TabType = 'approvals' | 'reports';

export function AdminPanel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [unapprovedRatings, setUnapprovedRatings] = useState<PluginRating[]>([]);
  const [reports, setReports] = useState<PluginReport[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('approvals');
  const [reportStatusFilter, setReportStatusFilter] = useState<ReportStatus | 'all'>('pending');
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

  // Fetch data when logged in or when tab/filter changes
  useEffect(() => {
    if (!isLoggedIn) {
      console.log('[AdminPanel] Not logged in, skipping fetch');
      return;
    }

    const fetchData = async () => {
      console.log('[AdminPanel] Fetching data (tab:', activeTab, 'trigger:', refreshTrigger, ')');

      if (activeTab === 'approvals') {
        const ratings = await getUnapprovedRatings();
        console.log('[AdminPanel] Fetched ratings:', ratings.length);
        setUnapprovedRatings(ratings);
      } else {
        const allReports =
          reportStatusFilter === 'all'
            ? await getAllReports()
            : await getAllReports(reportStatusFilter as ReportStatus);
        console.log('[AdminPanel] Fetched reports:', allReports.length);
        setReports(allReports);
      }
    };

    fetchData();
  }, [isLoggedIn, activeTab, reportStatusFilter, refreshTrigger]);

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
    console.log('[AdminPanel] Approving rating:', ratingId);
    const success = await approveRating(ratingId);
    console.log('[AdminPanel] Approve result:', success);
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

    console.log('[AdminPanel] Rejecting rating:', ratingId);
    const success = await rejectRating(ratingId);
    console.log('[AdminPanel] Reject result:', success);
    if (success) {
      setMessage({ type: 'success', text: 'Avis rejeté!' });
      setRefreshTrigger(prev => prev + 1);
    } else {
      setMessage({ type: 'error', text: 'Erreur lors du rejet' });
    }
  };

  // Report management
  const handleUpdateReportStatus = async (reportId: string, status: ReportStatus) => {
    console.log('[AdminPanel] Updating report status:', reportId, status);
    const success = await updateReportStatus(reportId, status);
    if (success) {
      setMessage({ type: 'success', text: `Signalement marqué comme ${status}` });
      setRefreshTrigger(prev => prev + 1);
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce signalement ?')) {
      return;
    }

    console.log('[AdminPanel] Deleting report:', reportId);
    const success = await deleteReport(reportId);
    if (success) {
      setMessage({ type: 'success', text: 'Signalement supprimé' });
      setRefreshTrigger(prev => prev + 1);
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      malware: 'Malware',
      spam: 'Spam',
      inappropriate: 'Contenu inapproprié',
      broken: 'Ne fonctionne pas',
      copyright: 'Violation de copyright',
      other: 'Autre',
    };
    return labels[category] || category;
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

  // Logged in - show moderation panel with tabs
  return (
    <div className="admin-panel">
      <div className="admin-panel__header">
        <div className="admin-panel__header-content">
          <Shield size={24} />
          <div>
            <h2>Panneau d'Administration</h2>
            <p className="admin-panel__subtitle">Modération des avis et gestion des signalements</p>
          </div>
        </div>
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

      {/* Tabs */}
      <div className="admin-panel__tabs">
        <button
          type="button"
          className={`admin-panel__tab ${activeTab === 'approvals' ? 'admin-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          <CheckCircle size={18} />
          <span>Approbations</span>
          {unapprovedRatings.length > 0 && (
            <span className="admin-panel__badge">{unapprovedRatings.length}</span>
          )}
        </button>
        <button
          type="button"
          className={`admin-panel__tab ${activeTab === 'reports' ? 'admin-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <Flag size={18} />
          <span>Signalements</span>
          {reports.filter(r => r.status === 'pending').length > 0 && (
            <span className="admin-panel__badge">
              {reports.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {message && (
        <div className={`admin-panel__message admin-panel__message--${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="admin-panel__content">
          <div className="admin-panel__section-header">
            <h3>Avis en attente d'approbation</h3>
            <span className="admin-panel__count">{unapprovedRatings.length} avis</span>
          </div>

          {unapprovedRatings.length === 0 ? (
            <div className="admin-panel__empty">
              <CheckCircle size={48} />
              <p>Aucun avis en attente d'approbation</p>
            </div>
          ) : (
            <div className="admin-panel__list">
              {unapprovedRatings.map((rating) => (
                <div key={rating.id} className="admin-panel__item">
                  <div className="admin-panel__item-header">
                    <div className="admin-panel__item-info">
                      <strong>{rating.pluginId}</strong>
                      <div className="admin-panel__rating">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < rating.rating ? '#fbbf24' : 'none'}
                            stroke={i < rating.rating ? '#fbbf24' : '#d1d5db'}
                          />
                        ))}
                        <span>{rating.rating}/5</span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-panel__meta">
                    <MessageSquare size={12} />
                    <span>Par <strong>{rating.userName}</strong></span>
                    {rating.email && <span className="admin-panel__email">({rating.email})</span>}
                    <span className="admin-panel__date">
                      <Clock size={12} />
                      {new Date(rating.created_at || '').toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="admin-panel__comment">{rating.comment}</p>

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
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="admin-panel__content">
          <div className="admin-panel__section-header">
            <h3>Signalements de plugins</h3>
            <div className="admin-panel__filters">
              <label htmlFor="status-filter">Statut :</label>
              <select
                id="status-filter"
                value={reportStatusFilter}
                onChange={e => setReportStatusFilter(e.target.value as ReportStatus | 'all')}
                className="admin-panel__filter-select"
              >
                <option value="all">Tous</option>
                <option value="pending">En attente</option>
                <option value="reviewing">En cours</option>
                <option value="resolved">Résolus</option>
                <option value="rejected">Rejetés</option>
              </select>
              <span className="admin-panel__count">{reports.length} signalements</span>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="admin-panel__empty">
              <Flag size={48} />
              <p>Aucun signalement trouvé</p>
            </div>
          ) : (
            <div className="admin-panel__list">
              {reports.map(report => (
                <div key={report.id} className="admin-panel__item admin-panel__item--report">
                  <div className="admin-panel__item-header">
                    <div className="admin-panel__item-info">
                      <AlertTriangle size={16} />
                      <strong>{report.pluginId}</strong>
                    </div>
                    <span className={`admin-panel__status admin-panel__status--${report.status}`}>
                      {report.status}
                    </span>
                  </div>

                  <div className="admin-panel__category">
                    <strong>{getCategoryLabel(report.category)}</strong>
                  </div>

                  <p className="admin-panel__comment">{report.description}</p>

                  <div className="admin-panel__meta">
                    {report.reporter_email && (
                      <span className="admin-panel__email">Contact: {report.reporter_email}</span>
                    )}
                    <span className="admin-panel__date">
                      <Clock size={12} />
                      {new Date(report.created_at || '').toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="admin-panel__actions">
                    {report.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          className="admin-panel__button admin-panel__button--secondary"
                          onClick={() => handleUpdateReportStatus(report.id!, 'reviewing')}
                        >
                          En cours
                        </button>
                        <button
                          type="button"
                          className="admin-panel__button admin-panel__button--approve"
                          onClick={() => handleUpdateReportStatus(report.id!, 'resolved')}
                        >
                          <CheckCircle size={16} />
                          Résoudre
                        </button>
                        <button
                          type="button"
                          className="admin-panel__button admin-panel__button--reject"
                          onClick={() => handleUpdateReportStatus(report.id!, 'rejected')}
                        >
                          <XCircle size={16} />
                          Rejeter
                        </button>
                      </>
                    )}
                    {report.status === 'reviewing' && (
                      <>
                        <button
                          type="button"
                          className="admin-panel__button admin-panel__button--approve"
                          onClick={() => handleUpdateReportStatus(report.id!, 'resolved')}
                        >
                          <CheckCircle size={16} />
                          Résoudre
                        </button>
                        <button
                          type="button"
                          className="admin-panel__button admin-panel__button--reject"
                          onClick={() => handleUpdateReportStatus(report.id!, 'rejected')}
                        >
                          <XCircle size={16} />
                          Rejeter
                        </button>
                      </>
                    )}
                    {(report.status === 'resolved' || report.status === 'rejected') && (
                      <button
                        type="button"
                        className="admin-panel__button admin-panel__button--danger"
                        onClick={() => handleDeleteReport(report.id!)}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
