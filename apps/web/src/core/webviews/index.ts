/**
 * WebView System
 * Secure sandboxed iframes for plugin UI
 */

export { WebView } from './WebView';
export { webViewManager, WebViewManager } from './WebViewManager';
export { MessageBridge } from './MessageBridge';
export { generateCSP, generateCSPWithCDNs } from './CSPGenerator';
export { validateMessage, validateResponse, sanitizePayload } from './MessageValidator';
export type { WebViewProps, PluginMessage, HostMessage, WebViewInstance, CSPConfig } from './types';
