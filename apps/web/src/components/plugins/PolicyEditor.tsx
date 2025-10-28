/**
 * Policy Editor Component
 * Interface for creating and editing ABAC policies
 */

import React, { useState } from 'react';
import type { Policy, PolicyStatement } from '@bigmind/plugin-system';
import { PolicyEffect } from '@bigmind/plugin-system';

export interface PolicyEditorProps {
  pluginId: string;
  initialPolicy?: Policy;
  onSave: (policy: Policy) => Promise<void>;
  onCancel: () => void;
}

export function PolicyEditor({ pluginId, initialPolicy, onSave, onCancel }: PolicyEditorProps) {
  const [policy, setPolicy] = useState<Policy>(
    initialPolicy || {
      version: '1.0',
      statement: [],
    }
  );

  const [currentStatement, setCurrentStatement] = useState<Partial<PolicyStatement>>({
    effect: PolicyEffect.ALLOW,
    action: undefined,
  });

  const addStatement = () => {
    if (!currentStatement.action) return;

    const newStatement: PolicyStatement = {
      effect: currentStatement.effect || PolicyEffect.ALLOW,
      action: currentStatement.action,
      resource: currentStatement.resource,
      condition: currentStatement.condition,
    };

    setPolicy({
      ...policy,
      statement: [...policy.statement, newStatement],
    });

    setCurrentStatement({
      effect: PolicyEffect.ALLOW,
      action: undefined,
    });
  };

  const removeStatement = (index: number) => {
    setPolicy({
      ...policy,
      statement: policy.statement.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    await onSave(policy);
  };

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
      }}
    >
      <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600' }}>
        Éditeur de Politique - {pluginId}
      </h2>

      {/* Existing Statements */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '500' }}>
          Règles actuelles ({policy.statement.length})
        </h3>

        {policy.statement.length === 0 ? (
          <div
            style={{
              padding: '20px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              textAlign: 'center',
              color: '#6b7280',
            }}
          >
            Aucune règle définie
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* eslint-disable-next-line react/no-array-index-key */}
            {policy.statement.map((statement, index) => {
              const borderColor = statement.effect === PolicyEffect.ALLOW ? '#22c55e' : '#ef4444';
              const actionStr = Array.isArray(statement.action)
                ? statement.action.join('-')
                : statement.action;
              const uniqueKey = `${statement.effect}-${actionStr}-${index}`;
              return (
                <div
                  key={uniqueKey}
                  style={{
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                    border: `2px solid ${borderColor}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '8px' }}>
                        <span
                          style={{
                            fontSize: '12px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor:
                              statement.effect === PolicyEffect.ALLOW ? '#dcfce7' : '#fee2e2',
                            color: statement.effect === PolicyEffect.ALLOW ? '#16a34a' : '#dc2626',
                            fontWeight: '600',
                          }}
                        >
                          {statement.effect}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                        <strong>Action:</strong>{' '}
                        {Array.isArray(statement.action)
                          ? statement.action.join(', ')
                          : statement.action}
                      </div>
                      {statement.resource && (
                        <div style={{ fontSize: '14px', marginBottom: '4px', color: '#6b7280' }}>
                          <strong>Ressource:</strong>{' '}
                          {Array.isArray(statement.resource)
                            ? statement.resource.join(', ')
                            : statement.resource}
                        </div>
                      )}
                      {statement.condition && (
                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
                          <strong>Conditions:</strong>
                          <pre
                            style={{
                              marginTop: '4px',
                              padding: '8px',
                              backgroundColor: '#f3f4f6',
                              borderRadius: '4px',
                              fontSize: '12px',
                              overflow: 'auto',
                            }}
                          >
                            {JSON.stringify(statement.condition, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStatement(index)}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #fca5a5',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add New Statement */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          marginBottom: '24px',
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '500' }}>
          Ajouter une règle
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label
              htmlFor="policy-effect"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Effet
            </label>
            <select
              id="policy-effect"
              value={currentStatement.effect}
              onChange={e =>
                setCurrentStatement({ ...currentStatement, effect: e.target.value as PolicyEffect })
              }
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            >
              <option value={PolicyEffect.ALLOW}>Allow (Autoriser)</option>
              <option value={PolicyEffect.DENY}>Deny (Refuser)</option>
            </select>
          </div>

          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label
              htmlFor="policy-action"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Action *
            </label>
            <input
              id="policy-action"
              type="text"
              value={currentStatement.action || ''}
              onChange={e =>
                setCurrentStatement({
                  ...currentStatement,
                  action: (e.target.value || undefined) as any,
                })
              }
              placeholder="mindmap:read, mindmap:write, network, *, etc."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
            <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
              Utilisez &apos;*&apos; pour toutes les actions, ou séparez par des virgules
            </div>
          </div>

          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label
              htmlFor="policy-resource"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Ressource (optionnel)
            </label>
            <input
              id="policy-resource"
              type="text"
              value={
                Array.isArray(currentStatement.resource)
                  ? currentStatement.resource.join(', ')
                  : currentStatement.resource || ''
              }
              onChange={e => setCurrentStatement({ ...currentStatement, resource: e.target.value })}
              placeholder="mindmap:*, project-123, etc."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          </div>

          <button
            type="button"
            onClick={addStatement}
            disabled={!currentStatement.action}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: currentStatement.action ? '#3b82f6' : '#d1d5db',
              color: 'white',
              cursor: currentStatement.action ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Ajouter la règle
          </button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={policy.statement.length === 0}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: policy.statement.length > 0 ? '#22c55e' : '#d1d5db',
            color: 'white',
            cursor: policy.statement.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Sauvegarder la politique
        </button>
      </div>

      {/* Policy JSON Preview */}
      <details style={{ marginTop: '24px' }}>
        <summary
          style={{
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '12px',
          }}
        >
          Aperçu JSON
        </summary>
        <pre
          style={{
            padding: '16px',
            backgroundColor: '#1e293b',
            color: '#e2e8f0',
            borderRadius: '6px',
            fontSize: '13px',
            overflow: 'auto',
            fontFamily: 'monospace',
          }}
        >
          {JSON.stringify(policy, null, 2)}
        </pre>
      </details>
    </div>
  );
}
