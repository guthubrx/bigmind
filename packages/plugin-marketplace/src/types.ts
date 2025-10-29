/**
 * Plugin marketplace types
 */

export interface PluginListing {
  id: string;
  name: string;
  version: string;
  description: string;
  longDescription?: string;
  author: string | { name: string; email?: string; url?: string };
  pricing: 'free' | 'paid' | 'freemium';
  category?: 'productivity' | 'integration' | 'theme' | 'developer' | 'export' | 'template';
  tags?: string[];
  icon?: string;
  banner?: string;
  screenshots?: string[];
  downloads?: number;
  rating?: number;
  verified?: boolean;
  homepage?: string;
  repository?: string;
  license?: string;
  updatedAt: string;
  downloadUrl: string;
  size: number;
}

export interface PluginSearchFilters {
  category?: string;
  pricing?: 'free' | 'paid' | 'freemium';
  search?: string;
  featured?: boolean;
  verified?: boolean;
}

export interface UpdateInfo {
  id: string;
  currentVersion: string;
  latestVersion: string;
  downloadUrl: string;
  changelog?: string;
}

export interface InstallProgress {
  pluginId: string;
  status: 'downloading' | 'extracting' | 'validating' | 'installing' | 'complete' | 'error';
  progress: number; // 0-100
  message?: string;
  error?: string;
}

export interface InstalledPlugin {
  id: string;
  version: string;
  installedAt: string;
  enabled: boolean;
}
