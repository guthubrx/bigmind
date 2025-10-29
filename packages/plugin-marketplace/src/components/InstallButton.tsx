/**
 * InstallButton - Install/uninstall button with loading state
 */

import React, { useState } from 'react';

export interface InstallButtonProps {
  pluginId: string;
  installed: boolean;
  onInstall?: (pluginId: string) => void;
  onUninstall?: (pluginId: string) => void;
  disabled?: boolean;
}

export function InstallButton({
  pluginId,
  installed,
  onInstall,
  onUninstall,
  disabled = false
}: InstallButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || loading) return;

    setLoading(true);

    try {
      if (installed) {
        await onUninstall?.(pluginId);
      } else {
        await onInstall?.(pluginId);
      }
    } catch (error) {
      console.error('Installation error:', error);
      alert(`Failed to ${installed ? 'uninstall' : 'install'} plugin: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  if (installed) {
    return (
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className="px-4 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Uninstalling...' : 'Uninstall'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? 'Installing...' : 'Install'}
    </button>
  );
}
