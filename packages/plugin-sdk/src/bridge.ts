/**
 * Plugin Bridge - Communication layer between plugin WebView and BigMind host
 * Uses MessageChannel API for secure, isolated communication
 */

import type { BridgeMessage, BridgeResponse, BigMindBridge, DialogConfig, Theme } from './types';

export class PluginBridge implements BigMindBridge {
  private port: MessagePort | null = null;
  private requestId = 0;
  private pendingRequests = new Map<
    number,
    {
      resolve: (value: any) => void;
      reject: (error: any) => void;
      timeout: ReturnType<typeof setTimeout>;
    }
  >();
  private eventListeners = new Map<string, Set<(data: any) => void>>();
  private initialized = false;
  private initPromise: Promise<void>;

  constructor() {
    // Wait for init message from host
    this.initPromise = new Promise((resolve) => {
      const handler = (event: MessageEvent) => {
        if (event.data.type === 'bridge:init') {
          this.port = event.ports[0];
          this.setupPort();
          this.initialized = true;
          window.removeEventListener('message', handler);
          resolve();
        }
      };
      window.addEventListener('message', handler);
    });
  }

  /**
   * Wait for bridge to be initialized
   */
  async waitForInit(): Promise<void> {
    return this.initPromise;
  }

  /**
   * Setup message port listeners
   */
  private setupPort(): void {
    if (!this.port) return;

    this.port.onmessage = (event: MessageEvent) => {
      const message = event.data;

      // Handle responses to requests
      if ('requestId' in message && typeof message.requestId === 'number') {
        this.handleResponse(message as BridgeResponse);
      }
      // Handle events
      else if (message.type?.startsWith('event:')) {
        this.handleEvent(message);
      }
    };
  }

  /**
   * Handle response from host
   */
  private handleResponse(response: BridgeResponse): void {
    const pending = this.pendingRequests.get(response.requestId);
    if (!pending) return;

    clearTimeout(pending.timeout);
    this.pendingRequests.delete(response.requestId);

    if (response.success) {
      pending.resolve(response.data);
    } else {
      pending.reject(new Error(response.error || 'Request failed'));
    }
  }

  /**
   * Handle event from host
   */
  private handleEvent(message: BridgeMessage): void {
    const eventName = message.type.replace('event:', '');
    const listeners = this.eventListeners.get(eventName);

    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(message.payload);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Send request to host and wait for response
   */
  private async request<T = any>(type: string, payload?: any, timeoutMs = 30000): Promise<T> {
    if (!this.initialized) {
      await this.waitForInit();
    }

    if (!this.port) {
      throw new Error('Bridge not initialized');
    }

    const requestId = this.requestId++;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Request timeout: ${type}`));
      }, timeoutMs);

      this.pendingRequests.set(requestId, { resolve, reject, timeout });

      const message: BridgeMessage = {
        type,
        payload,
        requestId,
      };

      this.port!.postMessage(message);
    });
  }

  // ============================================================================
  // Public API - Data Operations
  // ============================================================================

  async getData(path: string): Promise<any> {
    return this.request('data.read', { path });
  }

  async setData(path: string, data: any): Promise<void> {
    return this.request('data.write', { path, data });
  }

  subscribe(event: string, callback: (data: any) => void): () => void {
    let listeners = this.eventListeners.get(event);
    if (!listeners) {
      listeners = new Set();
      this.eventListeners.set(event, listeners);

      // Subscribe on host side
      this.request('event.subscribe', { event }).catch((error) => {
        console.error(`Failed to subscribe to ${event}:`, error);
      });
    }

    listeners.add(callback);

    // Return unsubscribe function
    return () => {
      listeners!.delete(callback);
      if (listeners!.size === 0) {
        this.eventListeners.delete(event);

        // Unsubscribe on host side
        this.request('event.unsubscribe', { event }).catch((error) => {
          console.error(`Failed to unsubscribe from ${event}:`, error);
        });
      }
    };
  }

  // ============================================================================
  // Public API - UI Operations
  // ============================================================================

  async registerPanel(config: any): Promise<void> {
    return this.request('ui.registerPanel', config);
  }

  async unregisterPanel(panelId: string): Promise<void> {
    return this.request('ui.unregisterPanel', { panelId });
  }

  async showPanel(panelId: string, options?: any): Promise<void> {
    return this.request('ui.showPanel', { panelId, options });
  }

  async hidePanel(panelId: string): Promise<void> {
    return this.request('ui.hidePanel', { panelId });
  }

  async showNotification(
    message: string,
    type: 'info' | 'error' | 'success' | 'warning' = 'info'
  ): Promise<void> {
    return this.request('ui.showNotification', { message, type });
  }

  async showDialog(config: DialogConfig): Promise<any> {
    return this.request('ui.showDialog', config);
  }

  // ============================================================================
  // Public API - Command Operations
  // ============================================================================

  async registerCommand(config: any): Promise<void> {
    return this.request('command.register', config);
  }

  async unregisterCommand(commandId: string): Promise<void> {
    return this.request('command.unregister', { commandId });
  }

  async executeCommand(commandId: string, ...args: any[]): Promise<any> {
    return this.request('command.execute', { commandId, args });
  }

  // ============================================================================
  // Public API - Theme Operations
  // ============================================================================

  async getTheme(): Promise<Theme> {
    return this.request('theme.get');
  }

  async setTheme(themeId: string): Promise<void> {
    return this.request('theme.set', { themeId });
  }

  // ============================================================================
  // Public API - Storage Operations
  // ============================================================================

  async getStorage(key: string): Promise<any> {
    return this.request('storage.get', { key });
  }

  async setStorage(key: string, value: any): Promise<void> {
    return this.request('storage.set', { key, value });
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  destroy(): void {
    // Clear pending requests
    this.pendingRequests.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error('Bridge destroyed'));
    });
    this.pendingRequests.clear();

    // Clear event listeners
    this.eventListeners.clear();

    // Close port
    if (this.port) {
      this.port.close();
      this.port = null;
    }

    this.initialized = false;
  }
}

// Export singleton instance
export const bridge = new PluginBridge();
