/**
 * Plugins Page
 * Main page for plugin management with enhanced security
 */

/* eslint-disable no-alert */

import React, { useState, useEffect } from 'react';
import {
  PluginManager,
  PermissionDialog,
  AuditDashboard,
  PolicyEditor,
} from '../components/plugins';
import { pluginSystem } from '../utils/pluginManager';
import type {
  PluginInfo,
  Permission,
  AuditEvent,
  AuditQueryFilters,
  Policy,
} from '@bigmind/plugin-system';

const { registry, permissionManager, auditLogger, policyEngine } = pluginSystem;

type View = 'manager' | 'audit' | 'policy';

export function PluginsPage() {
  const [currentView, setCurrentView] = useState<View>('manager');
  const [plugins, setPlugins] = useState<Map<string, PluginInfo>>(new Map());
  const [permissionRequest, setPermissionRequest] = useState<{
    pluginId: string;
    pluginName: string;
    permissions: Permission[];
    resolve: (approved: boolean) => void;
  } | null>(null);
  const [policyEditing, setPolicyEditing] = useState<string | null>(null);

  // Load plugins
  useEffect(() => {
    const updatePlugins = () => {
      setPlugins(registry.getAllPlugins());
    };

    updatePlugins();

    // Listen to plugin events
    registry.on('plugin:registered', updatePlugins);
    registry.on('plugin:activated', updatePlugins);
    registry.on('plugin:deactivated', updatePlugins);
    registry.on('plugin:unregistered', updatePlugins);

    return () => {
      registry.off('plugin:registered', updatePlugins);
      registry.off('plugin:activated', updatePlugins);
      registry.off('plugin:deactivated', updatePlugins);
      registry.off('plugin:unregistered', updatePlugins);
    };
  }, []);

  // Override permission request to show dialog
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const requestPermissions = async (
    pluginId: string,
    pluginName: string,
    permissions: Permission[]
  ): Promise<boolean> =>
    new Promise(resolve => {
      setPermissionRequest({
        pluginId,
        pluginName,
        permissions,
        resolve,
      });
    });

  const handlePermissionApprove = () => {
    if (permissionRequest) {
      permissionRequest.resolve(true);
      setPermissionRequest(null);
    }
  };

  const handlePermissionDeny = () => {
    if (permissionRequest) {
      permissionRequest.resolve(false);
      setPermissionRequest(null);
    }
  };

  const handleActivate = async (pluginId: string) => {
    try {
      await registry.activate(pluginId);
      await auditLogger.logPluginActivated(pluginId);
    } catch (error) {
      console.error('Failed to activate plugin:', error);
      await auditLogger.logSecurityAlert(
        pluginId,
        `Failed to activate: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handleDeactivate = async (pluginId: string) => {
    await registry.deactivate(pluginId);
  };

  const handleUninstall = async (pluginId: string) => {
    await registry.unregister(pluginId);
  };

  const handleViewPermissions = (pluginId: string) => {
    const summary = permissionManager.getSecuritySummary(pluginId);
    alert(`Permissions pour ${pluginId}:\n\n${JSON.stringify(summary, null, 2)}`);
  };

  const handleQueryAudit = async (filters: AuditQueryFilters): Promise<AuditEvent[]> =>
    auditLogger.query(filters);

  const handleSavePolicy = async (pluginId: string, policy: Policy) => {
    policyEngine.registerPolicy(pluginId, policy);
    setPolicyEditing(null);
    alert('Politique sauvegardée avec succès!');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Navigation */}
      <div
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 24px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'manager' as View, label: 'Gestionnaire', icon: '🔌' },
            { id: 'audit' as View, label: 'Audit', icon: '📊' },
            { id: 'policy' as View, label: 'Politiques', icon: '🔐' },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setCurrentView(id)}
              style={{
                padding: '10px 20px',
                border: currentView === id ? '2px solid #3b82f6' : '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: currentView === id ? '#eff6ff' : 'white',
                color: currentView === id ? '#3b82f6' : '#374151',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: currentView === id ? '600' : '400',
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        {currentView === 'manager' && (
          <PluginManager
            plugins={plugins}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
            onUninstall={handleUninstall}
            onViewPermissions={handleViewPermissions}
          />
        )}

        {currentView === 'audit' && <AuditDashboard onQuery={handleQueryAudit} />}

        {currentView === 'policy' && (
          <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>
                Gestion des Politiques
              </h1>
              <p style={{ margin: 0, color: '#6b7280' }}>
                Définissez des politiques ABAC pour un contrôle d&apos;accès fin
              </p>
            </div>

            {policyEditing ? (
              <PolicyEditor
                pluginId={policyEditing}
                initialPolicy={policyEngine.getPolicy(policyEditing)}
                onSave={policy => handleSavePolicy(policyEditing, policy)}
                onCancel={() => setPolicyEditing(null)}
              />
            ) : (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const pluginId = prompt('ID du plugin:');
                      if (pluginId) setPolicyEditing(pluginId);
                    }}
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
                    + Nouvelle Politique
                  </button>
                </div>

                <div
                  style={{
                    padding: '40px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center',
                    color: '#6b7280',
                  }}
                >
                  Sélectionnez un plugin pour éditer sa politique
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Permission Dialog */}
      {permissionRequest && (
        <PermissionDialog
          pluginId={permissionRequest.pluginId}
          pluginName={permissionRequest.pluginName}
          permissions={permissionRequest.permissions}
          onApprove={handlePermissionApprove}
          onDeny={handlePermissionDeny}
        />
      )}
    </div>
  );
}
