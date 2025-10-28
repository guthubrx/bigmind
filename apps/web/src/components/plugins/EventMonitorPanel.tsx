/**
 * Event Monitor Panel
 * UI for the Event Monitor plugin
 */

import React, { useState, useEffect } from 'react';
import { eventMonitorStore, type EventLogEntry } from '../../plugins/event-monitor-plugin';

export const EventMonitorPanel: React.FC = () => {
  const [events, setEvents] = useState<EventLogEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [maxEvents, setMaxEvents] = useState(1000);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    // Subscribe to event updates
    const unsubscribe = eventMonitorStore.subscribe(newEvents => {
      setEvents(newEvents);
    });

    // Load initial events
    setEvents(eventMonitorStore.getEvents());

    return () => {
      unsubscribe();
    };
  }, []);

  const filteredEvents = events.filter(event => {
    // Filter by category
    if (filter !== 'all' && event.category !== filter) {
      return false;
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        event.type.toLowerCase().includes(searchLower) ||
        JSON.stringify(event.data).toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const categories = ['all', 'nodes', 'files', 'viewport', 'colors', 'settings', 'canvas', 'tags'];

  const categoryColors: Record<string, string> = {
    nodes: '#3b82f6',
    files: '#10b981',
    viewport: '#8b5cf6',
    colors: '#f59e0b',
    settings: '#ec4899',
    canvas: '#06b6d4',
    tags: '#ef4444',
  };

  const getCategoryColor = (category: string) => categoryColors[category] || '#6b7280';

  const handleClear = () => {
    eventMonitorStore.clear();
  };

  const handleMaxEventsChange = (value: number) => {
    setMaxEvents(value);
    eventMonitorStore.setMaxEvents(value);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  const exportEvents = () => {
    const dataStr = JSON.stringify(filteredEvents, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `events-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>
          🔍 Event Monitor
        </h2>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
          Surveillance en temps réel de tous les événements système
        </p>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* Category filter */}
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'Toutes catégories' : cat}
            </option>
          ))}
        </select>

        {/* Search */}
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            fontSize: '14px',
            flex: '1',
            minWidth: '200px',
          }}
        />

        {/* Auto-scroll toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={e => setAutoScroll(e.target.checked)}
          />
          Auto-scroll
        </label>

        {/* Max events */}
        <select
          value={maxEvents}
          onChange={e => handleMaxEventsChange(Number(e.target.value))}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <option value={100}>100 événements</option>
          <option value={500}>500 événements</option>
          <option value={1000}>1000 événements</option>
          <option value={5000}>5000 événements</option>
        </select>

        {/* Actions */}
        <button
          onClick={exportEvents}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            background: 'white',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          📥 Exporter
        </button>

        <button
          onClick={handleClear}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            background: '#ef4444',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          🗑️ Effacer
        </button>

        {/* Event count */}
        <div style={{ fontSize: '14px', color: '#6b7280', marginLeft: 'auto' }}>
          {filteredEvents.length} / {events.length} événements
        </div>
      </div>

      {/* Events list */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          background: '#f9fafb',
        }}
      >
        {filteredEvents.length === 0 ? (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '14px',
            }}
          >
            Aucun événement à afficher
          </div>
        ) : (
          <div style={{ padding: '10px' }}>
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} categoryColor={getCategoryColor(event.category)} formatTimestamp={formatTimestamp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface EventCardProps {
  event: EventLogEntry;
  categoryColor: string;
  formatTimestamp: (timestamp: number) => string;
}

const EventCard: React.FC<EventCardProps> = ({ event, categoryColor, formatTimestamp }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '12px',
        marginBottom: '8px',
        fontSize: '13px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: categoryColor,
            flexShrink: 0,
          }}
        />
        <div style={{ fontFamily: 'monospace', color: '#6b7280', fontSize: '12px' }}>
          {formatTimestamp(event.timestamp)}
        </div>
        <div
          style={{
            padding: '2px 8px',
            borderRadius: '4px',
            background: categoryColor + '20',
            color: categoryColor,
            fontSize: '11px',
            fontWeight: 'bold',
          }}
        >
          {event.category}
        </div>
        <div style={{ fontWeight: '500', flex: 1 }}>{event.type}</div>
        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{expanded ? '▼' : '▶'}</div>
      </div>

      {/* Expanded data */}
      {expanded && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px',
            background: '#f9fafb',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '12px',
            overflow: 'auto',
            maxHeight: '300px',
          }}
        >
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(event.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
