/**
 * Web Worker Sandbox
 * Level 2 isolation using Web Workers for plugin execution
 */

/* eslint-disable no-console, @typescript-eslint/no-explicit-any, class-methods-use-this */

import type { IPluginContext } from '../types/context';
import { debugLog } from '../utils/debug';

/**
 * Message types for Worker communication
 */
enum MessageType {
  INIT = 'init',
  API_CALL = 'api_call',
  API_RESPONSE = 'api_response',
  EVENT = 'event',
  ERROR = 'error',
}

/**
 * Worker message
 */
interface WorkerMessage {
  type: MessageType;
  id?: string;
  method?: string;
  args?: any[];
  result?: any;
  error?: string;
  eventName?: string;
}

/**
 * Web Worker Sandbox
 * Provides strong isolation for plugin code execution
 */
export class WebWorkerSandbox {
  private worker: Worker | null = null;

  private messageHandlers = new Map<string, (result: any) => void>();

  private errorHandlers = new Map<string, (error: Error) => void>();

  private context: IPluginContext;

  constructor(
    private pluginId: string,
    context: IPluginContext
  ) {
    this.context = context;
  }

  /**
   * Initialize the worker
   */
  async initialize(pluginCode: string): Promise<void> {
    // Create worker from blob
    const blob = new Blob([this.createWorkerScript(pluginCode)], {
      type: 'application/javascript',
    });
    const workerUrl = URL.createObjectURL(blob);

    this.worker = new Worker(workerUrl);
    this.worker.onmessage = this.handleWorkerMessage.bind(this);
    this.worker.onerror = this.handleWorkerError.bind(this);

    debugLog(`[WebWorkerSandbox] Initialized worker for plugin: ${this.pluginId}`);

    // Initialize worker with plugin context proxy
    this.sendMessage({
      type: MessageType.INIT,
      args: [this.pluginId],
    });
  }

  /**
   * Execute plugin method in worker
   */
  async execute(method: string, ...args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this.generateId();

      this.messageHandlers.set(id, resolve);
      this.errorHandlers.set(id, reject);

      this.sendMessage({
        type: MessageType.API_CALL,
        id,
        method,
        args,
      });
    });
  }

  /**
   * Terminate the worker
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      debugLog(`[WebWorkerSandbox] Terminated worker for plugin: ${this.pluginId}`);
    }
  }

  /**
   * Handle messages from worker
   */
  private handleWorkerMessage(event: MessageEvent<WorkerMessage>): void {
    const message = event.data;

    if (message.type === MessageType.API_RESPONSE && message.id) {
      const handler = this.messageHandlers.get(message.id);
      if (handler) {
        handler(message.result);
        this.messageHandlers.delete(message.id);
        this.errorHandlers.delete(message.id);
      }
    } else if (message.type === MessageType.ERROR && message.id) {
      const handler = this.errorHandlers.get(message.id);
      if (handler) {
        handler(new Error(message.error || 'Unknown error'));
        this.messageHandlers.delete(message.id);
        this.errorHandlers.delete(message.id);
      }
    } else if (message.type === MessageType.API_CALL) {
      // Worker is calling host API
      this.handleApiCallFromWorker(message);
    }
  }

  /**
   * Handle API calls from worker to host
   */
  private async handleApiCallFromWorker(message: WorkerMessage): Promise<void> {
    try {
      const { id, method, args = [] } = message;

      // Execute the API call on the host context
      const result = await this.executeContextMethod(method!, args);

      // Send result back to worker
      this.sendMessage({
        type: MessageType.API_RESPONSE,
        id,
        result,
      });
    } catch (error) {
      this.sendMessage({
        type: MessageType.ERROR,
        id: message.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Execute a method on the plugin context
   */
  private async executeContextMethod(method: string, args: any[]): Promise<any> {
    // Parse method path (e.g., "mindmap.getActive")
    const parts = method.split('.');
    let target: any = this.context;

    // Navigate to the method
    parts.slice(0, -1).forEach(part => {
      target = target?.[part];
    });

    const methodName = parts[parts.length - 1];
    const fn = target?.[methodName];

    if (typeof fn !== 'function') {
      throw new Error(`Method ${method} not found in context`);
    }

    return fn.apply(target, args);
  }

  /**
   * Handle worker errors
   */
  private handleWorkerError(error: ErrorEvent): void {
    console.error(`[WebWorkerSandbox] Worker error for plugin ${this.pluginId}:`, error);
  }

  /**
   * Send message to worker
   */
  private sendMessage(message: WorkerMessage): void {
    if (this.worker) {
      this.worker.postMessage(message);
    }
  }

  /**
   * Generate unique message ID
   */
  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Create the worker script
   */
  private createWorkerScript(pluginCode: string): string {
    return `
      // Worker script for plugin sandbox
      const MessageType = {
        INIT: 'init',
        API_CALL: 'api_call',
        API_RESPONSE: 'api_response',
        EVENT: 'event',
        ERROR: 'error'
      };

      let pluginId = null;
      const pendingCalls = new Map();

      // Create proxy for host API calls
      const createContextProxy = () => {
        const handler = {
          get: (target, prop) => {
            return new Proxy({}, {
              get: (_, method) => {
                return (...args) => {
                  return callHostAPI(\`\${prop}.\${method}\`, args);
                };
              }
            });
          }
        };
        return new Proxy({}, handler);
      };

      // Call host API
      const callHostAPI = (method, args) => {
        return new Promise((resolve, reject) => {
          const id = 'call_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

          pendingCalls.set(id, { resolve, reject });

          self.postMessage({
            type: MessageType.API_CALL,
            id,
            method,
            args
          });
        });
      };

      // Handle messages from host
      self.onmessage = async (event) => {
        const message = event.data;

        if (message.type === MessageType.INIT) {
          pluginId = message.args[0];
          // Note: debugLog not available in worker context, using console.log
          console.log('[Worker] Initialized for plugin:', pluginId);
        }
        else if (message.type === MessageType.API_CALL) {
          try {
            // Execute plugin code
            const context = createContextProxy();
            const result = await executePluginMethod(message.method, message.args, context);

            self.postMessage({
              type: MessageType.API_RESPONSE,
              id: message.id,
              result
            });
          } catch (error) {
            self.postMessage({
              type: MessageType.ERROR,
              id: message.id,
              error: error.message
            });
          }
        }
        else if (message.type === MessageType.API_RESPONSE) {
          const pending = pendingCalls.get(message.id);
          if (pending) {
            pending.resolve(message.result);
            pendingCalls.delete(message.id);
          }
        }
        else if (message.type === MessageType.ERROR) {
          const pending = pendingCalls.get(message.id);
          if (pending) {
            pending.reject(new Error(message.error));
            pendingCalls.delete(message.id);
          }
        }
      };

      // Execute plugin method
      const executePluginMethod = async (method, args, context) => {
        // Inject plugin code
        ${pluginCode}

        // Plugin code should expose methods via global scope
        if (typeof self[method] === 'function') {
          return self[method].apply(null, [context, ...args]);
        }

        throw new Error('Method ' + method + ' not found in plugin');
      };

      // Note: debugLog not available in worker context, using console.log
      console.log('[Worker] Script loaded');
    `;
  }

  /**
   * Check if Web Workers are supported
   */
  static isSupported(): boolean {
    return typeof Worker !== 'undefined';
  }
}
