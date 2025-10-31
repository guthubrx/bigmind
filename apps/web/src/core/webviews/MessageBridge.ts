/**
 * Message Bridge
 * Handles PostMessage communication with plugin webviews
 */

import type { PluginMessage, HostMessage } from './types';
import { validateMessage, sanitizePayload } from './MessageValidator';

export class MessageBridge {
  private port: MessagePort;

  private requestId = 0;

  private pendingRequests = new Map<
    number,
    {
      resolve: (value: any) => void;
      reject: (error: any) => void;
      timeout: ReturnType<typeof setTimeout>;
    }
  >();

  private messageHandlers = new Map<string, (payload: any) => Promise<any>>();

  constructor(port: MessagePort) {
    this.port = port;
    this.setupPort();
  }

  /**
   * Setup port message listener
   */
  private setupPort(): void {
    this.port.onmessage = async (event: MessageEvent) => {
      const message = event.data;

      // Validate message structure
      if (!validateMessage(message)) {
        console.error('Invalid message received:', message);
        return;
      }

      // Handle response to request
      if ('success' in message && typeof message.requestId === 'number') {
        this.handleResponse(message);
        return;
      }

      // Handle new request
      if (message.type && typeof message.requestId === 'number') {
        await this.handleRequest(message);
      }
    };
  }

  /**
   * Handle response from plugin
   */
  private handleResponse(response: HostMessage): void {
    const pending = this.pendingRequests.get(response.requestId!);
    if (!pending) return;

    clearTimeout(pending.timeout);
    this.pendingRequests.delete(response.requestId!);

    if (response.success) {
      pending.resolve(response.payload);
    } else {
      pending.reject(new Error(response.error || 'Request failed'));
    }
  }

  /**
   * Handle request from plugin
   */
  private async handleRequest(message: PluginMessage): Promise<void> {
    const handler = this.messageHandlers.get(message.type);

    let response: HostMessage;

    if (!handler) {
      response = {
        type: 'response',
        requestId: message.requestId!,
        success: false,
        error: `No handler for message type: ${message.type}`,
      };
    } else {
      try {
        // Sanitize payload
        const cleanPayload = sanitizePayload(message.payload);
        const result = await handler(cleanPayload);

        response = {
          type: 'response',
          requestId: message.requestId!,
          success: true,
          payload: result,
        };
      } catch (error) {
        response = {
          type: 'response',
          requestId: message.requestId!,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    this.port.postMessage(response);
  }

  /**
   * Send request to plugin and wait for response
   */
  async request<T = any>(type: string, payload?: any, timeoutMs = 30000): Promise<T> {
    const requestId = this.requestId++;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Request timeout: ${type}`));
      }, timeoutMs);

      this.pendingRequests.set(requestId, { resolve, reject, timeout });

      const message: PluginMessage = {
        type,
        payload,
        requestId,
      };

      this.port.postMessage(message);
    });
  }

  /**
   * Register handler for message type
   */
  on(type: string, handler: (payload: any) => Promise<any>): void {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Unregister handler
   */
  off(type: string): void {
    this.messageHandlers.delete(type);
  }

  /**
   * Send event to plugin (no response expected)
   */
  emit(type: string, payload?: any): void {
    const message: HostMessage = {
      type: `event:${type}`,
      payload,
    };

    this.port.postMessage(message);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    // Clear pending requests
    this.pendingRequests.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error('Bridge destroyed'));
    });
    this.pendingRequests.clear();

    // Clear handlers
    this.messageHandlers.clear();

    // Close port
    this.port.close();
  }
}
