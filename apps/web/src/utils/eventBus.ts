/**
 * FR: Bus d'événements centralisé pour les tags et nœuds
 * EN: Centralized event bus for tags and nodes
 */

export interface EventMap {
  'node:tagged': { nodeId: string; tagId: string };
  'node:untagged': { nodeId: string; tagId: string };
  'node:updated': { nodeId: string; updates: Record<string, any> };
  'node:deleted': { nodeId: string };
  'tag:created': { tagId: string; label: string };
  'tag:removed': { tagId: string };
  'tag:updated': { tagId: string; updates: Record<string, any> };
  'sync:refresh': Record<string, never>;
}

type EventCallback<K extends keyof EventMap> = (data: EventMap[K]) => void;

interface Listener<K extends keyof EventMap> {
  callback: EventCallback<K>;
  once: boolean;
}

class EventBus {
  private listeners: Map<keyof EventMap, Listener<any>[]> = new Map();

  /**
   * Subscribe to an event
   */
  on<K extends keyof EventMap>(event: K, callback: EventCallback<K>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const listener: Listener<K> = { callback, once: false };
    this.listeners.get(event)!.push(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(listener as any);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to an event once
   */
  once<K extends keyof EventMap>(event: K, callback: EventCallback<K>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const listener: Listener<K> = { callback, once: true };
    this.listeners.get(event)!.push(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(listener as any);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Emit an event
   */
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const listeners = this.listeners.get(event) || [];

    // Create a copy to avoid issues with listeners being removed during iteration
    const listenersCopy = [...listeners];

    listenersCopy.forEach(listener => {
      listener.callback(data);

      // Remove once listeners
      if (listener.once) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    });
  }

  /**
   * Remove all listeners for an event
   */
  off<K extends keyof EventMap>(event: K): void {
    this.listeners.delete(event);
  }

  /**
   * Remove all listeners
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Get the count of listeners for an event
   */
  listenerCount<K extends keyof EventMap>(event: K): number {
    return this.listeners.get(event)?.length ?? 0;
  }
}

// Export singleton instance
export const eventBus = new EventBus();
