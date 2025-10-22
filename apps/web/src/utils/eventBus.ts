/**
 * FR: Bus d'événements pour la synchronisation DAG-MindMap
 * EN: Event bus for DAG-MindMap synchronization
 */

export type EventType =
  | 'tag:added'
  | 'tag:removed'
  | 'tag:updated'
  | 'tag:selected'
  | 'node:tagged'
  | 'node:untagged'
  | 'node:selected'
  | 'link:created'
  | 'link:deleted'
  | 'sync:refresh';

export interface EventData {
  type: EventType;
  payload: any;
  source: 'dag' | 'mindmap' | 'system';
  timestamp: number;
}

class EventBus {
  private listeners: Map<EventType, Set<(data: EventData) => void>>;
  private eventQueue: EventData[];
  private processing: boolean;

  constructor() {
    this.listeners = new Map();
    this.eventQueue = [];
    this.processing = false;
  }

  /**
   * FR: S'abonner à un type d'événement
   * EN: Subscribe to an event type
   */
  on(event: EventType, callback: (data: EventData) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Retourner une fonction de désabonnement
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * FR: Émettre un événement
   * EN: Emit an event
   */
  emit(type: EventType, payload: any, source: 'dag' | 'mindmap' | 'system') {
    const eventData: EventData = {
      type,
      payload,
      source,
      timestamp: Date.now()
    };

    this.eventQueue.push(eventData);
    this.processQueue();
  }

  /**
   * FR: Traiter la file d'événements
   * EN: Process event queue
   */
  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      const callbacks = this.listeners.get(event.type);

      if (callbacks) {
        // eslint-disable-next-line no-restricted-syntax, no-await-in-loop
        for (const callback of callbacks) {
          try {
            // eslint-disable-next-line no-await-in-loop
            await Promise.resolve(callback(event));
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Error processing event ${event.type}:`, error);
          }
        }
      }
    }

    this.processing = false;
  }

  /**
   * FR: Effacer tous les écouteurs
   * EN: Clear all listeners
   */
  clear() {
    this.listeners.clear();
    this.eventQueue = [];
  }

  /**
   * FR: Obtenir le nombre d'écouteurs pour un événement
   * EN: Get listener count for an event
   */
  getListenerCount(event: EventType): number {
    return this.listeners.get(event)?.size || 0;
  }
}

// Singleton
export const eventBus = new EventBus();

// FR: Rendre le bus disponible globalement pour le développement
// EN: Make the bus globally available for development
if (typeof window !== 'undefined') {
  (window as any).eventBus = eventBus;
}