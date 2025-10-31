/**
 * Report Plugin Modal Component
 * Allows users to report problematic plugins
 */

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import {
  submitPluginReport,
  type ReportCategory,
  type ReportSubmission,
} from '../../services/PluginReportService';
import './ReportPluginModal.css';

export interface ReportPluginModalProps {
  pluginId: string;
  pluginName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES: { value: ReportCategory; label: string; description: string }[] = [
  {
    value: 'malware',
    label: 'Malware / Code malveillant',
    description: 'Le plugin contient du code malveillant ou dangereux',
  },
  {
    value: 'spam',
    label: 'Spam / Publicité',
    description: 'Le plugin fait de la publicité non sollicitée',
  },
  {
    value: 'inappropriate',
    label: 'Contenu inapproprié',
    description: 'Contenu offensant, illégal ou inapproprié',
  },
  {
    value: 'broken',
    label: 'Ne fonctionne pas',
    description: 'Le plugin est cassé ou ne fonctionne pas correctement',
  },
  {
    value: 'copyright',
    label: 'Violation de copyright',
    description: "Le plugin viole des droits d'auteur",
  },
  {
    value: 'other',
    label: 'Autre',
    description: 'Autre problème non listé ci-dessus',
  },
];

export function ReportPluginModal({
  pluginId,
  pluginName,
  onClose,
  onSuccess,
}: ReportPluginModalProps) {
  const [category, setCategory] = useState<ReportCategory>('other');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false); // FR: Suivi si l'utilisateur a interagi avec le champ
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // FR: Validation email améliorée (RFC 5322 simplifié)
  // EN: Improved email validation (RFC 5322 simplified)
  const isValidEmail = (emailValue: string): boolean => {
    if (!emailValue) return true; // Empty is valid (optional field)

    // FR: Détection d'erreurs courantes
    // EN: Detect common errors
    if (emailValue.includes(' ')) return false; // No spaces
    if (emailValue.includes('..')) return false; // No consecutive dots
    if (emailValue.startsWith('.') || emailValue.startsWith('@')) return false;
    if (emailValue.endsWith('.') || emailValue.endsWith('@')) return false;

    // FR: Regex stricte pour validation
    // EN: Strict regex for validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(emailValue);
  };

  // FR: Retourne un message d'aide contextuel
  // EN: Returns contextual help message
  const getEmailHelpMessage = (): string | null => {
    if (!emailTouched || !email) return null;

    if (email.includes(' ')) return '❌ L\'email ne doit pas contenir d\'espaces';
    if (email.includes('..')) return '❌ Points consécutifs non autorisés';
    if (!email.includes('@')) return '❌ L\'email doit contenir un @';
    if (email.split('@').length > 2) return '❌ Un seul @ autorisé';
    if (email.includes('@') && !email.split('@')[1].includes('.')) {
      return '❌ Domaine invalide (exemple: @gmail.com)';
    }
    if (isValidEmail(email)) return '✓ Email valide';

    return '❌ Format email invalide';
  };

  // FR: Classe CSS pour feedback visuel
  // EN: CSS class for visual feedback
  const getEmailInputClass = (): string => {
    let className = 'form-input';

    if (emailTouched && email) {
      if (isValidEmail(email)) {
        className += ' form-input--valid';
      } else {
        className += ' form-input--invalid';
      }
    }

    return className;
  };

  // FR: Vérifie si le bouton doit être désactivé
  // EN: Check if submit button should be disabled
  const isSubmitDisabled = (): boolean => {
    // Désactivé si en cours de soumission
    if (isSubmitting) return true;

    // Désactivé si description trop courte
    if (description.trim().length < 10) return true;

    // Désactivé si email rempli mais invalide
    if (email && !isValidEmail(email)) return true;

    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!description.trim()) {
      setError('Veuillez décrire le problème');
      return;
    }

    if (description.trim().length < 10) {
      setError('Description trop courte (minimum 10 caractères)');
      return;
    }

    if (email && !isValidEmail(email)) {
      setError('Email invalide');
      return;
    }

    setIsSubmitting(true);

    const submission: ReportSubmission = {
      pluginId,
      category,
      description: description.trim(),
      reporter_email: email.trim() || undefined,
    };

    try {
      const result = await submitPluginReport(submission);

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      } else {
        setError(result.error || "Erreur lors de l'envoi du signalement");
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="report-modal" onClick={e => e.stopPropagation()}>
          <div className="report-modal-success">
            <div className="success-icon">✓</div>
            <h3>Signalement envoyé !</h3>
            <p>Merci de nous aider à maintenir la qualité des plugins.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="report-modal" onClick={e => e.stopPropagation()}>
        <div className="report-modal-header">
          <AlertTriangle className="report-icon" size={24} />
          <h2>Signaler un plugin</h2>
          <button
            type="button"
            className="report-modal-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="report-modal-plugin">
          <strong>{pluginName}</strong>
          <span className="plugin-id">{pluginId}</span>
        </div>

        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-section">
            <label className="form-label">
              Catégorie du problème <span className="required">*</span>
            </label>
            <div className="category-options">
              {CATEGORIES.map(cat => (
                <label key={cat.value} className="category-option">
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    checked={category === cat.value}
                    onChange={e => setCategory(e.target.value as ReportCategory)}
                  />
                  <div className="category-content">
                    <div className="category-label">{cat.label}</div>
                    <div className="category-description">{cat.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label" htmlFor="description">
              Description détaillée <span className="required">*</span>
            </label>
            <textarea
              id="description"
              className="form-textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Décrivez le problème rencontré avec ce plugin..."
              rows={5}
              maxLength={1000}
              required
            />
            <div className="char-count">
              {description.length} / 1000 caractères
              {description.length < 10 && description.length > 0 && (
                <span className="char-warning"> (minimum 10)</span>
              )}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label" htmlFor="email">
              Email (optionnel)
            </label>
            <input
              type="email"
              id="email"
              className={getEmailInputClass()}
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              onFocus={() => setEmailTouched(true)}
              placeholder="votre.email@exemple.com"
              autoComplete="email"
              spellCheck="false"
            />
            {getEmailHelpMessage() && (
              <div
                className={`form-hint ${
                  isValidEmail(email) ? 'form-hint--success' : 'form-hint--error'
                }`}
              >
                {getEmailHelpMessage()}
              </div>
            )}
            {!getEmailHelpMessage() && (
              <div className="form-hint">
                Votre email ne sera utilisé que pour vous informer du traitement de ce signalement.
              </div>
            )}
          </div>

          {error && (
            <div className="form-error">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={isSubmitDisabled()}
              title={
                email && !isValidEmail(email)
                  ? 'Email invalide - corrigez le format'
                  : description.trim().length < 10
                    ? 'Description trop courte (minimum 10 caractères)'
                    : ''
              }
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer le signalement'}
            </button>
          </div>
        </form>

        <div className="report-modal-footer">
          <small>
            Les signalements abusifs peuvent entraîner des restrictions. Merci de signaler
            uniquement les problèmes réels.
          </small>
        </div>
      </div>
    </div>
  );
}
