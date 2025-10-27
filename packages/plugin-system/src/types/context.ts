/**
 * Plugin Context - API exposed to plugins
 * This is the main interface plugins use to interact with BigMind
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IPluginContext {
  // ===== Plugin Info =====
  readonly pluginId: string;
  readonly version: string;

  // ===== API Namespace (convenience accessor) =====
  readonly api: {
    mindmap: IPluginContext['mindmap'];
    storage: IPluginContext['storage'];
    commands: IPluginContext['commands'];
    ui: IPluginContext['ui'];
    events: IPluginContext['events'];
    http?: IPluginContext['http'];
    fs?: IPluginContext['fs'];
    clipboard?: IPluginContext['clipboard'];
  };

  // ===== Mind Map API =====
  mindmap: {
    /**
     * Get the active mind map
     */
    getActive(): any | null;

    /**
     * Get all open mind maps
     */
    getAll(): any[];

    /**
     * Get selected nodes in active mind map
     */
    getSelection(): any[];

    /**
     * Update a node
     */
    updateNode(nodeId: string, updates: any): void;

    /**
     * Create a new node
     */
    createNode(parentId: string, data: any): any;

    /**
     * Delete a node
     */
    deleteNode(nodeId: string): void;

    /**
     * Find nodes matching criteria
     */
    findNodes(predicate: (node: any) => boolean): any[];
  };

  // ===== Convenience Hook Registration =====
  /**
   * Register a hook (convenience method that maps to hooks.registerFilter)
   * This is a simplified API for common plugin use cases
   */
  registerHook<T>(
    hookName: string,
    callback: (value: T, ...args: any[]) => T | Promise<T>,
    priority?: number
  ): () => void;

  // ===== Hooks API =====
  hooks: {
    /**
     * Register an action hook (observers notified when action occurs)
     */
    registerAction(
      hookName: string,
      callback: (...args: any[]) => void | Promise<void>,
      priority?: number
    ): () => void;

    /**
     * Register a filter hook (transform data)
     */
    registerFilter<T>(
      hookName: string,
      callback: (value: T, ...args: any[]) => T | Promise<T>,
      priority?: number
    ): () => void;

    /**
     * Register a validation hook (validate data)
     */
    registerValidation(
      hookName: string,
      callback: (...args: any[]) => boolean | string | Promise<boolean | string>,
      priority?: number
    ): () => void;

    /**
     * Trigger an action hook
     */
    doAction(hookName: string, ...args: any[]): Promise<void>;

    /**
     * Apply filters
     */
    applyFilters<T>(hookName: string, value: T, ...args: any[]): Promise<T>;

    /**
     * Run validations
     */
    validate(hookName: string, ...args: any[]): Promise<{ valid: boolean; errors: string[] }>;
  };

  // ===== Commands API =====
  commands: {
    /**
     * Register a command
     */
    registerCommand(id: string, handler: (...args: any[]) => void | Promise<void>): () => void;

    /**
     * Execute a command
     */
    executeCommand(id: string, ...args: any[]): Promise<void>;

    /**
     * Get all available commands
     */
    getCommands(): string[];
  };

  // ===== UI API =====
  ui: {
    /**
     * Show a notification
     */
    showNotification(message: string, type?: 'info' | 'success' | 'warning' | 'error'): void;

    /**
     * Show a confirmation dialog
     */
    showConfirmDialog(message: string, options?: { title?: string }): Promise<boolean>;

    /**
     * Register a menu item
     */
    registerMenuItem(location: string, item: MenuItem): () => void;

    /**
     * Register a panel
     */
    registerPanel(id: string, panel: PanelOptions): () => void;
  };

  // ===== Storage API =====
  storage: {
    /**
     * Get a value from plugin storage
     */
    get<T>(key: string): Promise<T | undefined>;

    /**
     * Set a value in plugin storage
     */
    set<T>(key: string, value: T): Promise<void>;

    /**
     * Remove a value from plugin storage
     */
    remove(key: string): Promise<void>;

    /**
     * Clear all plugin storage
     */
    clear(): Promise<void>;
  };

  // ===== Events API =====
  events: {
    /**
     * Subscribe to an event
     */
    on(event: string, handler: (...args: any[]) => void): () => void;

    /**
     * Emit an event
     */
    emit(event: string, ...args: any[]): void;
  };

  // ===== HTTP API (requires 'network' permission) =====
  http?: {
    /**
     * Make an HTTP request
     */
    request<T>(url: string, options?: RequestOptions): Promise<T>;
  };

  // ===== Filesystem API (requires 'filesystem:read' permission) =====
  fs?: {
    /**
     * Read a file
     */
    readFile(path: string): Promise<string>;

    /**
     * Write a file (requires 'filesystem:write' permission)
     */
    writeFile(path: string, content: string): Promise<void>;
  };

  // ===== Clipboard API (requires 'clipboard' permission) =====
  clipboard?: {
    /**
     * Read from clipboard
     */
    read(): Promise<string>;

    /**
     * Write to clipboard
     */
    write(text: string): Promise<void>;
  };
}

// ===== Supporting Types =====

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  onClick: () => void | Promise<void>;
  when?: () => boolean;
}

export interface PanelOptions {
  title: string;
  icon?: string;
  content: () => any;
  location: 'left' | 'right' | 'bottom';
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}
