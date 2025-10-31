/**
 * Clone Instructions Modal
 * Displays manual cloning instructions when File System Access API is not available
 */

import React, { useState } from 'react';
import { X, Copy, Check, FolderDown } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useToast } from '../../hooks/useToast';
import './CloneInstructionsModal.css';

export interface CloneInstructionsModalProps {
  pluginName: string;
  files: Array<{
    name: string;
    content: string;
  }>;
  localPath: string;
  onClose: () => void;
}

export function CloneInstructionsModal({
  pluginName,
  files,
  localPath,
  onClose,
}: CloneInstructionsModalProps) {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState(false);
  const { info: showInfo } = useToast();

  const handleCopy = async (fileName: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFile(fileName);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText(localPath);
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 2000);
    } catch (error) {
      console.error('Failed to copy path:', error);
    }
  };

  const handleOpenFolder = async () => {
    try {
      // Utiliser File System Access API pour ouvrir le dossier parent
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
          startIn: 'documents',
        });
        showInfo(
          `Dossier sélectionné: ${dirHandle.name}. ` +
            `Créez maintenant le sous-dossier "${pluginName}"`,
          5000
        );
      }
    } catch (error) {
      // L'utilisateur a annulé ou le navigateur ne supporte pas
      // Silent fail is intentional
    }
  };

  const getLanguage = (fileName: string): string => {
    if (fileName.endsWith('.json')) return 'json';
    if (fileName.endsWith('.ts')) return 'typescript';
    if (fileName.endsWith('.tsx')) return 'tsx';
    if (fileName.endsWith('.js')) return 'javascript';
    if (fileName.endsWith('.jsx')) return 'jsx';
    return 'typescript';
  };

  return (
    <div
      className="clone-instructions-modal-overlay"
      onClick={onClose}
      onKeyDown={e => e.key === 'Escape' && onClose()}
      role="button"
      tabIndex={0}
      aria-label="Close modal"
    >
      <div className="clone-instructions-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="clone-instructions-modal__header">
          <div className="clone-instructions-modal__header-icon">
            <FolderDown size={32} />
          </div>
          <div className="clone-instructions-modal__header-content">
            <h2 className="clone-instructions-modal__title">Cloner {pluginName}</h2>
            <p className="clone-instructions-modal__subtitle">
              Créez manuellement les fichiers suivants
            </p>
          </div>
          <button
            type="button"
            className="clone-instructions-modal__close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Path instruction */}
        <div className="clone-instructions-modal__path">
          <div className="clone-instructions-modal__path-content">
            <button
              type="button"
              className="clone-instructions-modal__path-folder-btn"
              onClick={handleOpenFolder}
              title="Sélectionner le dossier parent"
            >
              <FolderDown size={20} />
            </button>
            <div className="clone-instructions-modal__path-text">
              <span className="clone-instructions-modal__path-label">Dossier:</span>
              <code className="clone-instructions-modal__path-value">{localPath}</code>
            </div>
          </div>
          <button
            type="button"
            className={`clone-instructions-modal__path-copy-btn ${
              copiedPath ? 'clone-instructions-modal__path-copy-btn--copied' : ''
            }`}
            onClick={handleCopyPath}
            title="Copier le chemin"
          >
            {copiedPath ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>

        {/* Files list */}
        <div className="clone-instructions-modal__files">
          {files.map(file => (
            <div key={file.name} className="clone-instructions-modal__file">
              <div className="clone-instructions-modal__file-header">
                <span className="clone-instructions-modal__file-name">📄 {file.name}</span>
              </div>
              <div className="clone-instructions-modal__file-content-wrapper">
                <button
                  type="button"
                  className={`clone-instructions-modal__copy-btn ${
                    copiedFile === file.name ? 'clone-instructions-modal__copy-btn--copied' : ''
                  }`}
                  onClick={() => handleCopy(file.name, file.content)}
                  title="Copier le contenu"
                >
                  {copiedFile === file.name ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <div className="clone-instructions-modal__file-content">
                  <SyntaxHighlighter
                    language={getLanguage(file.name)}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      borderRadius: 0,
                      fontSize: '12px',
                      maxHeight: '300px',
                    }}
                    showLineNumbers
                  >
                    {file.content}
                  </SyntaxHighlighter>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="clone-instructions-modal__footer">
          <p className="clone-instructions-modal__footer-note">
            💡 <strong>Astuce:</strong> Cliquez sur &ldquo;Copier&rdquo; pour chaque fichier, puis
            créez-les dans votre éditeur de code.
          </p>
          <button type="button" className="clone-instructions-modal__done-btn" onClick={onClose}>
            J&apos;ai compris
          </button>
        </div>
      </div>
    </div>
  );
}
