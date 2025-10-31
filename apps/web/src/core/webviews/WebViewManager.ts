/**
 * WebView Manager
 * Manages lifecycle of plugin webviews and message routing
 */

import { MessageBridge } from './MessageBridge';
import type { WebViewInstance } from './types';

export class WebViewManager {
  private static instance: WebViewManager;

  private webviews = new Map<string, WebViewInstance>();

  private constructor() {}

  static getInstance(): WebViewManager {
    if (!WebViewManager.instance) {
      WebViewManager.instance = new WebViewManager();
    }
    return WebViewManager.instance;
  }

  /**
   * Register a new webview
   */
  register(
    id: string,
    pluginId: string,
    iframe: HTMLIFrameElement,
    channel: MessageChannel,
    permissions: string[]
  ): void {
    if (this.webviews.has(id)) {
      throw new Error(`WebView with id ${id} already exists`);
    }

    const instance: WebViewInstance = {
      id,
      pluginId,
      iframe,
      messageChannel: channel,
      permissions,
      createdAt: new Date(),
    };

    this.webviews.set(id, instance);
  }

  /**
   * Unregister webview
   */
  unregister(id: string): void {
    const instance = this.webviews.get(id);
    if (!instance) return;

    // Close message channel
    instance.messageChannel.port1.close();
    instance.messageChannel.port2.close();

    this.webviews.delete(id);
  }

  /**
   * Get webview instance
   */
  get(id: string): WebViewInstance | undefined {
    return this.webviews.get(id);
  }

  /**
   * Get all webviews for a plugin
   */
  getByPlugin(pluginId: string): WebViewInstance[] {
    return Array.from(this.webviews.values()).filter(wv => wv.pluginId === pluginId);
  }

  /**
   * Check if plugin has permission
   */
  hasPermission(webviewId: string, permission: string): boolean {
    const instance = this.webviews.get(webviewId);
    if (!instance) return false;

    return instance.permissions.includes(permission);
  }

  /**
   * Send message to webview
   */
  sendMessage(webviewId: string, type: string, payload?: any): void {
    const instance = this.webviews.get(webviewId);
    if (!instance) {
      // eslint-disable-next-line no-console
      console.error(`WebView ${webviewId} not found`);
      return;
    }

    instance.messageChannel.port1.postMessage({ type, payload });
  }

  /**
   * Cleanup all webviews
   */
  cleanup(): void {
    for (const id of this.webviews.keys()) {
      this.unregister(id);
    }
  }
}

// Export singleton instance
export const webViewManager = WebViewManager.getInstance();
