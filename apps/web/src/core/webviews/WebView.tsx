/**
 * WebView Component
 * Sandboxed iframe for plugin UI
 */

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { webViewManager } from './WebViewManager';
import { MessageBridge } from './MessageBridge';
import { generateCSP } from './CSPGenerator';
import type { WebViewProps } from './types';

/**
 * Default sandbox permissions
 */
const DEFAULT_SANDBOX = [
  'allow-scripts',
  'allow-same-origin', // Needed for MessageChannel
  'allow-forms',
];

/**
 * Restricted sandbox (no same-origin)
 */
const RESTRICTED_SANDBOX = ['allow-scripts'];

export function WebView({
  id,
  pluginId,
  src,
  sandbox = DEFAULT_SANDBOX,
  csp,
  onLoad,
  onError,
  className = '',
  title = 'Plugin WebView',
}: WebViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const bridgeRef = useRef<MessageBridge | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Create message channel
    const channel = new MessageChannel();
    const bridge = new MessageBridge(channel.port1);
    bridgeRef.current = bridge;

    // Setup message handlers
    setupMessageHandlers(bridge, pluginId);

    // Wait for iframe to load
    const handleLoad = () => {
      try {
        // Send init message with port
        iframe.contentWindow?.postMessage(
          {
            type: 'bridge:init',
          },
          '*',
          [channel.port2]
        );

        // Register webview
        webViewManager.register(id, pluginId, iframe, channel, getPermissions(sandbox));

        setIsReady(true);
        onLoad?.();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to initialize webview:', error);
        onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    };

    const handleError = (event: ErrorEvent) => {
      // eslint-disable-next-line no-console
      console.error('WebView error:', event);
      onError?.(new Error(event.message));
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError as any);

    // Cleanup
    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError as any);

      webViewManager.unregister(id);
      bridge.destroy();
    };
  }, [id, pluginId, onLoad, onError, sandbox]);

  // Generate CSP meta tag content
  const cspContent = generateCSP(csp);

  // Iframe styles
  const iframeStyles: CSSProperties = {
    width: '100%',
    height: '100%',
    border: 'none',
  };

  return (
    <div className={`webview-container ${className}`.trim()} data-webview-id={id}>
      <iframe
        ref={iframeRef}
        src={src}
        sandbox={sandbox.join(' ')}
        title={title}
        style={iframeStyles}
        // CSP via meta tag (some browsers don't support csp attribute)
        data-csp={cspContent}
      />
    </div>
  );
}

/**
 * Setup message handlers for plugin bridge
 */
function setupMessageHandlers(bridge: MessageBridge, pluginId: string): void {
  // Data operations
  bridge.on(
    'data.read',
    async ({ path }) =>
      // TODO: Implement data read
      null
  );

  bridge.on('data.write', async ({ path, data }) => {
    // TODO: Implement data write
  });

  // UI operations
  bridge.on('ui.showPanel', async ({ panelId, options }) => {
    // TODO: Implement show panel
  });

  bridge.on('ui.showNotification', async ({ message, type }) => {
    // TODO: Implement notification
  });

  // Command operations
  bridge.on('command.execute', async ({ commandId, args }) => {
    // TODO: Implement command execution
  });

  // Theme operations
  bridge.on('theme.get', async () =>
    // TODO: Implement theme get
    ({
      id: 'default',
      name: 'Default',
      colors: {},
    })
  );

  // Storage operations
  bridge.on(
    'storage.get',
    async ({ key }) =>
      // TODO: Implement storage get
      null
  );

  bridge.on('storage.set', async ({ key, value }) => {
    // TODO: Implement storage set
  });
}

/**
 * Extract permissions from sandbox flags
 */
function getPermissions(sandbox: string[]): string[] {
  const permissions: string[] = [];

  if (sandbox.includes('allow-scripts')) {
    permissions.push('scripts');
  }

  if (sandbox.includes('allow-forms')) {
    permissions.push('forms');
  }

  if (sandbox.includes('allow-same-origin')) {
    permissions.push('same-origin');
  }

  return permissions;
}
