/**
 * Command Palette
 * VSCode-style universal command interface (Cmd+K)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { commandRegistry } from './CommandRegistry';
import { commandExecutor } from './CommandExecutor';
import { fuzzySearch } from './fuzzyMatcher';
import { keyboardManager } from './KeyboardManager';
import type { Command, CommandMatch } from './types';
import './CommandPalette.css';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CommandMatch[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load all commands
  useEffect(() => {
    if (isOpen) {
      const commands = commandRegistry.getAll();
      const matches = fuzzySearch(commands, query);
      setResults(matches);
      setSelectedIndex(0);
    }
  }, [query, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
    }
  }, [isOpen]);

  // Subscribe to registry changes
  useEffect(() => {
    const unsubscribe = commandRegistry.subscribe(() => {
      if (isOpen) {
        const commands = commandRegistry.getAll();
        const matches = fuzzySearch(commands, query);
        setResults(matches);
      }
    });

    return unsubscribe;
  }, [isOpen, query]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;

        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;

        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            executeCommand(results[selectedIndex].command);
          }
          break;

        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            setSelectedIndex((prev) => Math.max(prev - 1, 0));
          } else {
            setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          }
          break;
      }
    },
    [results, selectedIndex, onClose]
  );

  // Execute selected command
  const executeCommand = async (command: Command) => {
    onClose();
    setQuery('');

    try {
      await commandExecutor.execute(command.id);
    } catch (error) {
      console.error('Failed to execute command:', error);
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && results.length > 0) {
      const selectedItem = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, results]);

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        {/* Search input */}
        <div className="command-palette-input-container">
          <svg className="command-palette-search-icon" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder="Rechercher une commande..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              className="command-palette-clear"
              onClick={() => setQuery('')}
              title="Effacer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Results list */}
        <div ref={listRef} className="command-palette-results">
          {results.length === 0 ? (
            <div className="command-palette-empty">
              {query ? 'Aucune commande trouvée' : 'Tapez pour rechercher...'}
            </div>
          ) : (
            results.map((result, index) => (
              <CommandItem
                key={result.command.id}
                result={result}
                isSelected={index === selectedIndex}
                onClick={() => executeCommand(result.command)}
                onMouseEnter={() => setSelectedIndex(index)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="command-palette-footer">
          <div className="command-palette-hint">
            <kbd>↑</kbd>
            <kbd>↓</kbd> naviguer
          </div>
          <div className="command-palette-hint">
            <kbd>Enter</kbd> exécuter
          </div>
          <div className="command-palette-hint">
            <kbd>Esc</kbd> fermer
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Command item component
 */
interface CommandItemProps {
  result: CommandMatch;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

function CommandItem({ result, isSelected, onClick, onMouseEnter }: CommandItemProps) {
  const { command, matches } = result;

  // Highlight matched characters
  const highlightText = (text: string, matches: Array<{ start: number; end: number }>) => {
    if (matches.length === 0) return text;

    const parts: Array<{ text: string; highlighted: boolean }> = [];
    let lastIndex = 0;

    for (const match of matches) {
      // Add text before match
      if (match.start > lastIndex) {
        parts.push({ text: text.slice(lastIndex, match.start), highlighted: false });
      }

      // Add matched text
      parts.push({ text: text.slice(match.start, match.end), highlighted: true });
      lastIndex = match.end;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ text: text.slice(lastIndex), highlighted: false });
    }

    return parts.map((part, i) =>
      part.highlighted ? (
        <mark key={i} className="command-palette-highlight">
          {part.text}
        </mark>
      ) : (
        <span key={i}>{part.text}</span>
      )
    );
  };

  // Get shortcut label
  const shortcutLabel = command.shortcut
    ? keyboardManager.getPlatformShortcutLabel(
        Array.isArray(command.shortcut) ? command.shortcut[0] : command.shortcut
      )
    : null;

  return (
    <div
      className={`command-palette-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <div className="command-palette-item-main">
        {command.icon && <span className="command-palette-item-icon">{command.icon}</span>}
        <div className="command-palette-item-text">
          <div className="command-palette-item-title">
            {highlightText(command.title, matches)}
          </div>
          {command.category && (
            <div className="command-palette-item-category">{command.category}</div>
          )}
        </div>
      </div>
      {shortcutLabel && <kbd className="command-palette-shortcut">{shortcutLabel}</kbd>}
    </div>
  );
}

/**
 * Hook to control command palette
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Register Cmd+K / Ctrl+K shortcut
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
