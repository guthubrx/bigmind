/**
 * Publish Instructions Modal
 * Displays step-by-step instructions for publishing a plugin to the marketplace
 */

import React, { useState } from 'react';
import { X, Copy, Check, Upload, GitBranch, CheckCircle } from 'lucide-react';
import './PublishInstructionsModal.css';

export interface PublishInstructionsModalProps {
  pluginName: string;
  instructions: string[];
  onClose: () => void;
}

interface Step {
  title: string;
  description?: string;
  commands?: string[];
  links?: Array<{ label: string; url: string }>;
  items?: string[];
}

export function PublishInstructionsModal({
  pluginName,
  instructions,
  onClose,
}: PublishInstructionsModalProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(id);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Parse instructions array into structured steps
  const parseSteps = (): Step[] => {
    const steps: Step[] = [];
    let currentStep: Step | null = null;

    for (const line of instructions) {
      if (line.startsWith('===') || !line.trim()) continue;

      // New step
      if (/^\d+\./.test(line)) {
        if (currentStep) steps.push(currentStep);
        currentStep = {
          title: line.replace(/^\d+\.\s*/, ''),
          commands: [],
          items: [],
          links: [],
        };
      } else if (currentStep) {
        // Command line
        if (line.trim().startsWith('cd ') || line.trim().startsWith('npm ')) {
          currentStep.commands!.push(line.trim());
        }
        // Links
        else if (line.includes('Fork:') || line.includes('github.com')) {
          const match = line.match(/https?:\/\/[^\s]+/);
          if (match) {
            currentStep.links!.push({
              label: line.split(':')[0].trim().replace('-', ''),
              url: match[0],
            });
          }
        }
        // Regular items
        else if (line.trim().startsWith('-')) {
          currentStep.items!.push(line.trim().substring(1).trim());
        }
        // Description text
        else if (line.trim() && !line.startsWith('Note:')) {
          if (!currentStep.description) {
            currentStep.description = line.trim();
          }
        }
      }
    }

    if (currentStep) steps.push(currentStep);
    return steps;
  };

  const steps = parseSteps();

  return (
    <div className="publish-instructions-modal-overlay" onClick={onClose}>
      <div className="publish-instructions-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="publish-instructions-modal__header">
          <div className="publish-instructions-modal__header-icon">
            <Upload size={32} />
          </div>
          <div className="publish-instructions-modal__header-content">
            <h2 className="publish-instructions-modal__title">Publier {pluginName}</h2>
            <p className="publish-instructions-modal__subtitle">
              Suivez ces étapes pour publier votre plugin
            </p>
          </div>
          <button
            type="button"
            className="publish-instructions-modal__close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Steps */}
        <div className="publish-instructions-modal__steps">
          {steps.map((step, index) => (
            <div key={index} className="publish-instructions-modal__step">
              <div className="publish-instructions-modal__step-header">
                <div className="publish-instructions-modal__step-number">{index + 1}</div>
                <div className="publish-instructions-modal__step-title">{step.title}</div>
              </div>

              {step.description && (
                <p className="publish-instructions-modal__step-description">{step.description}</p>
              )}

              {step.commands && step.commands.length > 0 && (
                <div className="publish-instructions-modal__commands">
                  {step.commands.map((cmd, cmdIndex) => (
                    <div key={cmdIndex} className="publish-instructions-modal__command-wrapper">
                      <code className="publish-instructions-modal__command">{cmd}</code>
                      <button
                        type="button"
                        className={`publish-instructions-modal__copy-btn ${
                          copiedItem === `cmd-${index}-${cmdIndex}`
                            ? 'publish-instructions-modal__copy-btn--copied'
                            : ''
                        }`}
                        onClick={() => handleCopy(cmd, `cmd-${index}-${cmdIndex}`)}
                        title="Copier la commande"
                      >
                        {copiedItem === `cmd-${index}-${cmdIndex}` ? (
                          <Check size={14} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {step.links && step.links.length > 0 && (
                <div className="publish-instructions-modal__links">
                  {step.links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="publish-instructions-modal__link"
                    >
                      <GitBranch size={16} />
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              )}

              {step.items && step.items.length > 0 && (
                <ul className="publish-instructions-modal__items">
                  {step.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="publish-instructions-modal__footer">
          <div className="publish-instructions-modal__footer-icon">
            <CheckCircle size={20} />
          </div>
          <p className="publish-instructions-modal__footer-note">
            Une fois votre Pull Request mergée, votre plugin sera disponible dans le marketplace !
          </p>
          <button type="button" className="publish-instructions-modal__done-btn" onClick={onClose}>
            Compris
          </button>
        </div>
      </div>
    </div>
  );
}
