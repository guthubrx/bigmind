/**
 * Types for WebView System
 * Sandboxed iframe-based plugin UI with secure messaging
 */

import type { ReactNode } from 'react';

/**
 * WebView props
 */
export interface WebViewProps {
  /** Unique ID for this webview */
  id: string;
  /** Plugin ID that owns this webview */
  pluginId: string;
  /** URL to load in iframe */
  src: string;
  /** Sandbox permissions */
  sandbox?: string[];
  /** Custom CSP directives */
  csp?: Record<string, string[]>;
  /** Callback when webview loads */
  onLoad?: () => void;
  /** Callback when webview errors */
  onError?: (error: Error) => void;
  /** Additional CSS class */
  className?: string;
  /** Title for accessibility */
  title?: string;
}

/**
 * Message sent from plugin to host
 */
export interface PluginMessage {
  type: string;
  payload?: any;
  requestId?: number;
}

/**
 * Message sent from host to plugin
 */
export interface HostMessage {
  type: string;
  payload?: any;
  requestId?: number;
  success?: boolean;
  error?: string;
}

/**
 * WebView instance metadata
 */
export interface WebViewInstance {
  id: string;
  pluginId: string;
  iframe: HTMLIFrameElement;
  messageChannel: MessageChannel;
  permissions: string[];
  createdAt: Date;
}

/**
 * Message validation schema
 */
export interface ValidationSchema {
  type: 'object' | 'string' | 'number' | 'boolean' | 'array';
  required?: boolean;
  properties?: Record<string, ValidationSchema>;
  items?: ValidationSchema;
}

/**
 * CSP configuration
 */
export interface CSPConfig {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'font-src': string[];
  'connect-src': string[];
  'frame-ancestors': string[];
}
