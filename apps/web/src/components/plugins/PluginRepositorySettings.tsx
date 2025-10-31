/**
 * Plugin Repository Settings Component
 * UI pour gérer les sources de plugins (GitHub repositories)
 */

import React, { useState, useEffect } from 'react';
import { pluginRepositoryManager, type PluginRepository } from '../../services/PluginRepositoryManager';
import { Plus, Trash2, Github, AlertCircle, CheckCircle, Power, Download } from 'lucide-react';
import { installPluginFromGitHub } from '../../services/PluginInstaller';
import { pluginSystem } from '../../utils/pluginManager';
import './PluginRepositorySettings.css';

const { registry } = pluginSystem;

export function PluginRepositorySettings() {
  const [repositories, setRepositories] = useState<PluginRepository[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDescription, setNewRepoDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Direct installation state
  const [showDirectInstall, setShowDirectInstall] = useState(false);
  const [directInstallUrl, setDirectInstallUrl] = useState('');
  const [directInstallBranch, setDirectInstallBranch] = useState('main');
  const [isInstalling, setIsInstalling] = useState(false);

  // Load repositories
  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = () => {
    setRepositories(pluginRepositoryManager.getAllRepositories());
  };

  const handleAddRepository = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      let urlToAdd = newRepoUrl.trim();

      // If it's a GitHub repo URL (not raw), convert it
      if (urlToAdd.includes('github.com') && !urlToAdd.includes('raw.githubusercontent.com')) {
        const parsedUrl = pluginRepositoryManager.parseGitHubUrl(urlToAdd);
        if (parsedUrl) {
          urlToAdd = parsedUrl;
          setMessage({
            type: 'success',
            text: `URL GitHub convertie en: ${parsedUrl}`,
          });
        }
      }

      await pluginRepositoryManager.addRepository(urlToAdd, newRepoName.trim(), newRepoDescription.trim() || undefined);

      setMessage({
        type: 'success',
        text: `Repository "${newRepoName}" ajouté avec succès !`,
      });

      // Reset form
      setNewRepoUrl('');
      setNewRepoName('');
      setNewRepoDescription('');
      setShowAddForm(false);
      loadRepositories();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur lors de l\'ajout du repository',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveRepository = (id: string, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le repository "${name}" ?`)) {
      return;
    }

    try {
      pluginRepositoryManager.removeRepository(id);
      setMessage({
        type: 'success',
        text: `Repository "${name}" supprimé`,
      });
      loadRepositories();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur lors de la suppression',
      });
    }
  };

  const handleToggleRepository = (id: string, enabled: boolean) => {
    pluginRepositoryManager.toggleRepository(id, enabled);
    loadRepositories();
    setMessage({
      type: 'success',
      text: enabled ? 'Repository activé' : 'Repository désactivé',
    });
  };

  const handleDirectInstall = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInstalling(true);
    setMessage(null);

    try {
      const plugin = await installPluginFromGitHub(directInstallUrl.trim(), directInstallBranch.trim() || 'main');

      // Register the plugin
      await registry.register(plugin, false);

      // Activate the plugin
      await registry.activate(plugin.manifest.id);

      setMessage({
        type: 'success',
        text: `Plugin "${plugin.manifest.name}" installé et activé avec succès !`,
      });

      // Reset form
      setDirectInstallUrl('');
      setDirectInstallBranch('main');
      setShowDirectInstall(false);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur lors de l\'installation du plugin',
      });
    } finally {
      setIsInstalling(false);
    }
  };

  // Extract GitHub username/org from repository URL
  const getGitHubAvatar = (repoUrl: string): string | null => {
    try {
      // Match raw.githubusercontent.com URLs
      const rawMatch = repoUrl.match(/raw\.githubusercontent\.com\/([^/]+)/);
      if (rawMatch && rawMatch[1]) {
        return `https://github.com/${rawMatch[1]}.png?size=40`;
      }

      // Match github.com URLs
      const githubMatch = repoUrl.match(/github\.com\/([^/]+)/);
      if (githubMatch && githubMatch[1]) {
        return `https://github.com/${githubMatch[1]}.png?size=40`;
      }

      return null;
    } catch {
      return null;
    }
  };

  return (
    <div className="plugin-repository-settings">
      <div className="plugin-repository-settings__header">
        <div>
          <h2 className="plugin-repository-settings__title">Sources de Plugins</h2>
          <p className="plugin-repository-settings__description">
            Gérez les repositories GitHub d'où proviennent vos plugins. Ajoutez le repository privé pour accéder au plugin Administration.
          </p>
        </div>
        {!showAddForm && (
          <button
            type="button"
            className="plugin-repository-settings__add-btn"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={16} />
            Ajouter un repository
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`plugin-repository-settings__message plugin-repository-settings__message--${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* Add Repository Form */}
      {showAddForm && (
        <form className="plugin-repository-settings__form" onSubmit={handleAddRepository}>
          <div className="plugin-repository-settings__form-header">
            <h3 className="plugin-repository-settings__form-title">
              <Github size={20} />
              Ajouter un repository
            </h3>
          </div>

          <div className="plugin-repository-settings__form-field">
            <label htmlFor="repo-name" className="plugin-repository-settings__label">
              Nom du repository *
            </label>
            <input
              type="text"
              id="repo-name"
              className="plugin-repository-settings__input"
              placeholder="Mon Repository Privé"
              value={newRepoName}
              onChange={e => setNewRepoName(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="plugin-repository-settings__form-field">
            <label htmlFor="repo-url" className="plugin-repository-settings__label">
              URL GitHub *
            </label>
            <input
              type="url"
              id="repo-url"
              className="plugin-repository-settings__input"
              placeholder="https://github.com/username/repo ou https://raw.githubusercontent.com/.../registry.json"
              value={newRepoUrl}
              onChange={e => setNewRepoUrl(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <p className="plugin-repository-settings__hint">
              Vous pouvez fournir l'URL GitHub standard ou l'URL raw vers registry.json
            </p>
          </div>

          <div className="plugin-repository-settings__form-field">
            <label htmlFor="repo-description" className="plugin-repository-settings__label">
              Description (optionnel)
            </label>
            <textarea
              id="repo-description"
              className="plugin-repository-settings__textarea"
              placeholder="Repository contenant mes plugins personnalisés"
              value={newRepoDescription}
              onChange={e => setNewRepoDescription(e.target.value)}
              disabled={isSubmitting}
              rows={2}
            />
          </div>

          <div className="plugin-repository-settings__form-actions">
            <button
              type="button"
              className="plugin-repository-settings__cancel-btn"
              onClick={() => {
                setShowAddForm(false);
                setNewRepoUrl('');
                setNewRepoName('');
                setNewRepoDescription('');
                setMessage(null);
              }}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="plugin-repository-settings__submit-btn"
              disabled={isSubmitting || !newRepoUrl.trim() || !newRepoName.trim()}
            >
              {isSubmitting ? 'Validation...' : 'Ajouter'}
            </button>
          </div>
        </form>
      )}

      {/* Repository List */}
      <div className="plugin-repository-settings__list">
        {repositories.map(repo => (
          <div
            key={repo.id}
            className={`plugin-repository-settings__item ${repo.enabled ? '' : 'plugin-repository-settings__item--disabled'}`}
          >
            <div className="plugin-repository-settings__item-header">
              <div className="plugin-repository-settings__item-info">
                <div className="plugin-repository-settings__item-title">
                  {getGitHubAvatar(repo.url) ? (
                    <img
                      src={getGitHubAvatar(repo.url)!}
                      alt={`${repo.name} avatar`}
                      className="plugin-repository-settings__avatar"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('plugin-repository-settings__avatar-fallback--hidden');
                      }}
                    />
                  ) : null}
                  <Github size={18} className={getGitHubAvatar(repo.url) ? 'plugin-repository-settings__avatar-fallback--hidden' : ''} />
                  {repo.name}
                  {repo.isDefault && (
                    <span className="plugin-repository-settings__badge">Par défaut</span>
                  )}
                </div>
                {repo.description && (
                  <p className="plugin-repository-settings__item-description">{repo.description}</p>
                )}
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="plugin-repository-settings__item-url"
                >
                  {repo.url}
                </a>
                <p className="plugin-repository-settings__item-date">
                  Ajouté le {new Date(repo.addedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="plugin-repository-settings__item-actions">
                <button
                  type="button"
                  className={`plugin-repository-settings__toggle-btn ${repo.enabled ? 'plugin-repository-settings__toggle-btn--enabled' : ''}`}
                  onClick={() => handleToggleRepository(repo.id, !repo.enabled)}
                  title={repo.enabled ? 'Désactiver' : 'Activer'}
                >
                  <Power size={16} />
                </button>

                {!repo.isDefault && (
                  <button
                    type="button"
                    className="plugin-repository-settings__remove-btn"
                    onClick={() => handleRemoveRepository(repo.id, repo.name)}
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {repositories.length === 0 && (
        <div className="plugin-repository-settings__empty">
          <Github size={48} />
          <p>Aucun repository configuré</p>
        </div>
      )}

      {/* Direct Installation Section */}
      <div className="plugin-repository-settings__divider">
        <span>Installation Directe</span>
      </div>

      <div className="plugin-repository-settings__direct-install">
        <div className="plugin-repository-settings__direct-install-header">
          <div>
            <h3 className="plugin-repository-settings__section-title">
              <Download size={20} />
              Installer un plugin depuis GitHub
            </h3>
            <p className="plugin-repository-settings__section-description">
              Installez un plugin directement depuis son repository GitHub sans l'ajouter aux sources
            </p>
          </div>
          {!showDirectInstall && (
            <button
              type="button"
              className="plugin-repository-settings__install-btn"
              onClick={() => setShowDirectInstall(true)}
            >
              <Download size={16} />
              Installer depuis URL
            </button>
          )}
        </div>

        {showDirectInstall && (
          <form className="plugin-repository-settings__form" onSubmit={handleDirectInstall}>
            <div className="plugin-repository-settings__form-field">
              <label htmlFor="direct-install-url" className="plugin-repository-settings__label">
                URL GitHub du plugin *
              </label>
              <input
                type="url"
                id="direct-install-url"
                className="plugin-repository-settings__input"
                placeholder="https://github.com/username/plugin-repo"
                value={directInstallUrl}
                onChange={e => setDirectInstallUrl(e.target.value)}
                disabled={isInstalling}
                required
              />
              <p className="plugin-repository-settings__hint">
                Le repository doit contenir manifest.json et plugin.js à la racine
              </p>
            </div>

            <div className="plugin-repository-settings__form-field">
              <label htmlFor="direct-install-branch" className="plugin-repository-settings__label">
                Branche (optionnel)
              </label>
              <input
                type="text"
                id="direct-install-branch"
                className="plugin-repository-settings__input"
                placeholder="main"
                value={directInstallBranch}
                onChange={e => setDirectInstallBranch(e.target.value)}
                disabled={isInstalling}
              />
            </div>

            <div className="plugin-repository-settings__form-actions">
              <button
                type="button"
                className="plugin-repository-settings__cancel-btn"
                onClick={() => {
                  setShowDirectInstall(false);
                  setDirectInstallUrl('');
                  setDirectInstallBranch('main');
                  setMessage(null);
                }}
                disabled={isInstalling}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="plugin-repository-settings__submit-btn"
                disabled={isInstalling || !directInstallUrl.trim()}
              >
                {isInstalling ? 'Installation...' : 'Installer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default PluginRepositorySettings;
