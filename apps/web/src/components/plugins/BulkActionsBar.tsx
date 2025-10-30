/**
 * Bulk Actions Bar Component
 * Displays action buttons for selected plugins
 */

import React from 'react';
import { Download, Power, PowerOff, Trash2, X } from 'lucide-react';
import './BulkActionsBar.css';

export interface BulkActionsBarProps {
  selectedCount: number;
  canInstall: boolean;
  canActivate: boolean;
  canDeactivate: boolean;
  canUninstall: boolean;
  onInstall: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onUninstall: () => void;
  onCancel: () => void;
}

export function BulkActionsBar({
  selectedCount,
  canInstall,
  canActivate,
  canDeactivate,
  canUninstall,
  onInstall,
  onActivate,
  onDeactivate,
  onUninstall,
  onCancel,
}: BulkActionsBarProps) {
  return (
    <div className="bulk-actions-bar">
      <div className="bulk-actions-bar__content">
        <div className="bulk-actions-bar__info">
          <span className="bulk-actions-bar__count">{selectedCount}</span>
          <span className="bulk-actions-bar__label">
            plugin{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
          </span>
        </div>

        <div className="bulk-actions-bar__actions">
          {canInstall && (
            <button
              type="button"
              className="bulk-actions-bar__action bulk-actions-bar__action--install"
              onClick={onInstall}
              title="Installer les plugins sélectionnés"
            >
              <Download size={16} />
              <span>Installer</span>
            </button>
          )}

          {canActivate && (
            <button
              type="button"
              className="bulk-actions-bar__action bulk-actions-bar__action--activate"
              onClick={onActivate}
              title="Activer les plugins sélectionnés"
            >
              <Power size={16} />
              <span>Activer</span>
            </button>
          )}

          {canDeactivate && (
            <button
              type="button"
              className="bulk-actions-bar__action bulk-actions-bar__action--deactivate"
              onClick={onDeactivate}
              title="Désactiver les plugins sélectionnés"
            >
              <PowerOff size={16} />
              <span>Désactiver</span>
            </button>
          )}

          {canUninstall && (
            <button
              type="button"
              className="bulk-actions-bar__action bulk-actions-bar__action--uninstall"
              onClick={onUninstall}
              title="Supprimer les plugins sélectionnés"
            >
              <Trash2 size={16} />
              <span>Supprimer</span>
            </button>
          )}

          <button
            type="button"
            className="bulk-actions-bar__action bulk-actions-bar__action--cancel"
            onClick={onCancel}
            title="Annuler la sélection (ESC)"
          >
            <X size={16} />
            <span>Annuler</span>
          </button>
        </div>
      </div>
    </div>
  );
}
