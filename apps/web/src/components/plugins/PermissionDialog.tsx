/**
 * Permission Dialog Component
 * Shows when a plugin requests permissions
 */

import React, { useState } from 'react';
import type { Permission } from '@bigmind/plugin-system';
import { PermissionMetadataMap } from '@bigmind/plugin-system';

export interface PermissionDialogProps {
  pluginId: string;
  pluginName: string;
  permissions: Permission[];
  onApprove: () => void;
  onDeny: () => void;
}

const getRiskColor = (risk: string): string => {
  switch (risk) {
    case 'low':
      return '#22c55e';
    case 'medium':
      return '#f59e0b';
    case 'high':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

const getRiskLabel = (risk: string): string => {
  switch (risk) {
    case 'low':
      return 'Risque faible';
    case 'medium':
      return 'Risque moyen';
    case 'high':
      return 'Risque élevé';
    default:
      return 'Risque inconnu';
  }
};

export function PermissionDialog({
  pluginId,
  pluginName,
  permissions,
  onApprove,
  onDeny,
}: PermissionDialogProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>
            Demande de permissions
          </h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            Le plugin <strong>{pluginName}</strong> demande les permissions suivantes :
          </p>
        </div>

        {/* Permissions List */}
        <div style={{ marginBottom: '20px' }}>
          {permissions.map(permission => {
            const metadata = PermissionMetadataMap[permission];
            if (!metadata) return null;

            return (
              <div
                key={permission}
                style={{
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  borderLeft: `3px solid ${getRiskColor(metadata.risk)}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>{metadata.label}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{metadata.description}</div>
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: getRiskColor(metadata.risk),
                      color: 'white',
                      fontWeight: '500',
                    }}
                  >
                    {getRiskLabel(metadata.risk)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Details Toggle */}
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: 'none',
            border: 'none',
            color: '#3b82f6',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '16px',
            padding: 0,
          }}
        >
          {showDetails ? '▼' : '▶'} {showDetails ? 'Masquer' : 'Voir'} les détails
        </button>

        {/* Details Section */}
        {showDetails && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '13px',
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <strong>ID du plugin:</strong> {pluginId}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Permissions demandées:</strong> {permissions.length}
            </div>
            <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '12px' }}>
              ⚠️ Accordez uniquement les permissions aux plugins de confiance. Ces permissions
              donnent au plugin un accès à vos données et fonctionnalités.
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onDeny}
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
            Refuser
          </button>
          <button
            type="button"
            onClick={onApprove}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#3b82f6',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Autoriser
          </button>
        </div>
      </div>
    </div>
  );
}
