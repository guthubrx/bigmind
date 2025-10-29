/**
 * Type definitions for BigMind Plugin SDK
 * Phase 3 - UI Infrastructure
 */

// ============================================================================
// Message Types
// ============================================================================

export interface BridgeMessage {
  type: string;
  payload: any;
  requestId?: number;
}

export interface BridgeResponse {
  requestId: number;
  success: boolean;
  data?: any;
  error?: string;
}

// ============================================================================
// Plugin Context
// ============================================================================

export interface PluginContext {
  pluginId: string;
  version: string;
  permissions: string[];
}

// ============================================================================
// UI Contributions
// ============================================================================

export interface PanelConfig {
  id: string;
  title: string;
  icon?: string;
  location?: 'sidebar' | 'bottom' | 'modal';
  defaultSize?: { width: number; height: number };
}

export interface CommandConfig {
  id: string;
  title: string;
  shortcut?: string | string[];
  icon?: string;
  category?: string;
  when?: string;
}

export interface MenuContribution {
  id: string;
  label: string;
  icon?: string;
  command?: string;
  submenu?: MenuContribution[];
}

export interface NodePropertiesTabConfig {
  id: string;
  label: string;
  icon?: string;
  order?: number;
}

// ============================================================================
// Theme
// ============================================================================

export interface Theme {
  id: string;
  name: string;
  colors: {
    bg: string;
    bgSecondary: string;
    bgTertiary: string;
    fg: string;
    fgSecondary: string;
    fgTertiary: string;
    accent: string;
    accentHover: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

// ============================================================================
// Data Access
// ============================================================================

export interface MindMapData {
  id: string;
  name: string;
  rootNode: any;
  nodes: Record<string, any>;
  // ... other fields
}

// ============================================================================
// Bridge API
// ============================================================================

export interface BigMindBridge {
  // Data operations
  getData(path: string): Promise<any>;
  setData(path: string, data: any): Promise<void>;
  subscribe(event: string, callback: (data: any) => void): () => void;

  // UI operations
  showPanel(panelId: string, options?: any): Promise<void>;
  hidePanel(panelId: string): Promise<void>;
  showNotification(message: string, type?: 'info' | 'error' | 'success' | 'warning'): Promise<void>;
  showDialog(config: DialogConfig): Promise<any>;

  // Command operations
  executeCommand(commandId: string, ...args: any[]): Promise<any>;

  // Theme operations
  getTheme(): Promise<Theme>;
  setTheme(themeId: string): Promise<void>;

  // Storage operations
  getStorage(key: string): Promise<any>;
  setStorage(key: string, value: any): Promise<void>;
}

export interface DialogConfig {
  title: string;
  message: string;
  buttons?: Array<{
    label: string;
    value: any;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  input?: {
    label: string;
    placeholder?: string;
    defaultValue?: string;
  };
}

// ============================================================================
// UI API
// ============================================================================

export interface BigMindUI {
  registerPanel(config: PanelConfig): Promise<() => void>;
  showPanel(panelId: string): Promise<void>;
  registerCommand(config: CommandConfig): Promise<() => void>;
  showNotification(message: string, type?: 'info' | 'error' | 'success' | 'warning'): Promise<void>;
}

// ============================================================================
// Hooks Return Types
// ============================================================================

export interface UseBigMindBridgeReturn extends BigMindBridge {}

export interface UseBigMindUIReturn extends BigMindUI {}

export interface UseBigMindDataReturn {
  data: any;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseThemeReturn {
  theme: Theme;
  setTheme: (themeId: string) => Promise<void>;
  variant: (name: string) => string;
}
