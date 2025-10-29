/**
 * Remote Plugin Marketplace Component
 * Displays plugins from remote registry (Cloudflare R2)
 * Uses @bigmind/plugin-marketplace package
 */

import React, { useState } from 'react';
import { PluginList } from '@bigmind/plugin-marketplace';
import { pluginSystem } from '../../utils/pluginManager';

const { registry } = pluginSystem;

export function RemotePluginMarketplace() {
  const [installing, setInstalling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInstall = async (pluginId: string) => {
    setInstalling(pluginId);
    setError(null);

    try {
      // Install from remote marketplace
      await registry.installFromMarketplace(pluginId);

      // Auto-activate after installation
      await registry.activate(pluginId);

      // eslint-disable-next-line no-console
      console.log(`✅ Successfully installed and activated ${pluginId}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Failed to install ${pluginId}:`, err);
      setError((err as Error).message);
      // TODO: Replace with proper toast/notification system
      // eslint-disable-next-line no-alert
      alert(`Installation failed: ${(err as Error).message}`);
    } finally {
      setInstalling(null);
    }
  };

  const handleUninstall = async (pluginId: string) => {
    try {
      // Deactivate first
      if (registry.isActive(pluginId)) {
        await registry.deactivate(pluginId);
      }

      // Unregister
      await registry.unregister(pluginId);

      // eslint-disable-next-line no-console
      console.log(`✅ Successfully uninstalled ${pluginId}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Failed to uninstall ${pluginId}:`, err);
      // TODO: Replace with proper toast/notification system
      // eslint-disable-next-line no-alert
      alert(`Uninstall failed: ${(err as Error).message}`);
    }
  };

  const handleViewDetails = (pluginId: string) => {
    // TODO: Open plugin detail modal
    // eslint-disable-next-line no-console
    console.log(`View details for ${pluginId}`);
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          🌐 Remote Marketplace
        </h2>
        <p style={{ color: '#6b7280' }}>
          Browse and install plugins from the BigMind plugin registry
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            marginBottom: '16px',
            color: '#991b1b'
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Installing Notice */}
      {installing && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            marginBottom: '16px',
            color: '#1e40af'
          }}
        >
          Installing <strong>{installing}</strong>... Please wait.
        </div>
      )}

      {/* Plugin List */}
      <PluginList
        registryUrl={import.meta.env.VITE_MARKETPLACE_URL || 'https://bigmind-registry.workers.dev'}
        onInstall={handleInstall}
        onUninstall={handleUninstall}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}
