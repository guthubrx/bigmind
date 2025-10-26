/**
 * FR: Panneau de recherche avec highlighting
 * EN: Search panel with highlighting
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useTagStore } from '../hooks/useTagStore';
import { DagTag } from '../types/dag';
import { Search, X } from 'lucide-react';
import './DagSearchPanel.css';

interface SearchResult {
  tag: DagTag;
  matchType: 'label' | 'both';
}

function DagSearchPanel() {
  const [query, setQuery] = useState('');
  const tags = useTagStore(state => Object.values(state.tags));

  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    const searchTerm = query.toLowerCase();
    const matchedTags: SearchResult[] = [];

    tags.forEach((tag: DagTag) => {
      const labelMatch = tag.label.toLowerCase().includes(searchTerm);

      if (labelMatch) {
        matchedTags.push({
          tag,
          matchType: 'label',
        });
      }
    });

    return matchedTags.sort((a, b) => a.tag.label.localeCompare(b.tag.label));
  }, [query, tags]);

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  const highlightMatch = (text: string, term: string): React.ReactNode => {
    if (!term.trim()) return text;

    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map(part => (
      <span
        key={`${part}-${parts.indexOf(part)}`}
        className={part.toLowerCase() === term.toLowerCase() ? 'highlight' : ''}
      >
        {part}
      </span>
    ));
  };

  return (
    <div className="dag-search-panel">
      <div className="search-input-container">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search tags..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Escape') handleClear();
          }}
        />
        {query && <X size={16} className="clear-icon" onClick={handleClear} />}
      </div>

      {query && (
        <div className="search-results">
          <div className="results-header">
            Found <span className="result-count">{results.length}</span>
            {results.length === 1 ? ' tag' : ' tags'}
          </div>

          {results.length > 0 ? (
            <div className="results-list">
              {results.map(result => (
                <div
                  key={result.tag.id}
                  className="result-item"
                  style={{
                    borderLeftColor: result.tag.color || '#3b82f6',
                  }}
                >
                  <div
                    className="result-badge"
                    style={{
                      backgroundColor: result.tag.color || '#3b82f6',
                    }}
                  >
                    {highlightMatch(result.tag.label, query)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">No tags match your search</div>
          )}
        </div>
      )}
    </div>
  );
}

export default DagSearchPanel;
