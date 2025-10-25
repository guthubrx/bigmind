/**
 * FR: Tests pour le hook de sélection
 * EN: Tests for selection hook
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSelection } from '../useSelection';

describe('useSelection', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useSelection());
    act(() => {
      result.current.clearSelection();
    });
  });

  describe('setSelectedNodeId', () => {
    it('should set selected node id', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.setSelectedNodeId('node1');
      });

      expect(result.current.selectedNodeId).toBe('node1');
      expect(result.current.selectedNodeIds).toEqual(['node1']);
    });

    it('should clear selection when setting null', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.setSelectedNodeId('node1');
        result.current.setSelectedNodeId(null);
      });

      expect(result.current.selectedNodeId).toBeNull();
      expect(result.current.selectedNodeIds).toEqual([]);
    });

    it('should replace previous selection', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.setSelectedNodeId('node1');
        result.current.setSelectedNodeId('node2');
      });

      expect(result.current.selectedNodeId).toBe('node2');
      expect(result.current.selectedNodeIds).toEqual(['node2']);
    });
  });

  describe('toggleNodeSelection', () => {
    it('should select node in single select mode', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.toggleNodeSelection('node1', false);
      });

      expect(result.current.selectedNodeId).toBe('node1');
      expect(result.current.selectedNodeIds).toEqual(['node1']);
    });

    it('should replace selection in single select mode', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.toggleNodeSelection('node1', false);
        result.current.toggleNodeSelection('node2', false);
      });

      expect(result.current.selectedNodeId).toBe('node2');
      expect(result.current.selectedNodeIds).toEqual(['node2']);
    });

    it('should add to selection in multi-select mode', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.toggleNodeSelection('node1', false);
        result.current.toggleNodeSelection('node2', true);
      });

      expect(result.current.selectedNodeId).toBe('node2');
      expect(result.current.selectedNodeIds).toEqual(['node1', 'node2']);
    });

    it('should remove from selection in multi-select mode when toggling selected node', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.toggleNodeSelection('node1', false);
        result.current.toggleNodeSelection('node2', true);
        result.current.toggleNodeSelection('node1', true);
      });

      expect(result.current.selectedNodeIds).toEqual(['node2']);
      expect(result.current.selectedNodeId).toBe('node2');
    });

    it('should handle multi-select with multiple nodes', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.toggleNodeSelection('node1', false);
        result.current.toggleNodeSelection('node2', true);
        result.current.toggleNodeSelection('node3', true);
        result.current.toggleNodeSelection('node4', true);
      });

      expect(result.current.selectedNodeIds).toEqual(['node1', 'node2', 'node3', 'node4']);
      expect(result.current.selectedNodeId).toBe('node4');
    });
  });

  describe('addToSelection', () => {
    it('should add node to selection', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.addToSelection('node1');
      });

      expect(result.current.selectedNodeIds).toEqual(['node1']);
      expect(result.current.selectedNodeId).toBe('node1');
    });

    it('should add multiple nodes to selection', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.addToSelection('node1');
        result.current.addToSelection('node2');
        result.current.addToSelection('node3');
      });

      expect(result.current.selectedNodeIds).toEqual(['node1', 'node2', 'node3']);
      expect(result.current.selectedNodeId).toBe('node3');
    });

    it('should not add duplicate nodes', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.addToSelection('node1');
        result.current.addToSelection('node1');
      });

      expect(result.current.selectedNodeIds).toEqual(['node1']);
    });
  });

  describe('removeFromSelection', () => {
    it('should remove node from selection', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.addToSelection('node1');
        result.current.addToSelection('node2');
        result.current.removeFromSelection('node1');
      });

      expect(result.current.selectedNodeIds).toEqual(['node2']);
      expect(result.current.selectedNodeId).toBe('node2');
    });

    it('should update selectedNodeId when removing primary selection', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.addToSelection('node1');
        result.current.addToSelection('node2');
        result.current.removeFromSelection('node2');
      });

      expect(result.current.selectedNodeId).toBe('node1');
    });

    it('should set selectedNodeId to null when removing last node', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.addToSelection('node1');
        result.current.removeFromSelection('node1');
      });

      expect(result.current.selectedNodeId).toBeNull();
      expect(result.current.selectedNodeIds).toEqual([]);
    });

    it('should handle removing non-existent node', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.addToSelection('node1');
        result.current.removeFromSelection('node2');
      });

      expect(result.current.selectedNodeIds).toEqual(['node1']);
      expect(result.current.selectedNodeId).toBe('node1');
    });
  });

  describe('clearSelection', () => {
    it('should clear all selections', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.addToSelection('node1');
        result.current.addToSelection('node2');
        result.current.addToSelection('node3');
        result.current.clearSelection();
      });

      expect(result.current.selectedNodeId).toBeNull();
      expect(result.current.selectedNodeIds).toEqual([]);
    });

    it('should work when already empty', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedNodeId).toBeNull();
      expect(result.current.selectedNodeIds).toEqual([]);
    });
  });

  describe('isNodeSelected', () => {
    it('should return true for selected node', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.addToSelection('node1');
      });

      expect(result.current.isNodeSelected('node1')).toBe(true);
    });

    it('should return false for non-selected node', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.addToSelection('node1');
      });

      expect(result.current.isNodeSelected('node2')).toBe(false);
    });

    it('should work with multiple selections', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.addToSelection('node1');
        result.current.addToSelection('node2');
        result.current.addToSelection('node3');
      });

      expect(result.current.isNodeSelected('node1')).toBe(true);
      expect(result.current.isNodeSelected('node2')).toBe(true);
      expect(result.current.isNodeSelected('node3')).toBe(true);
      expect(result.current.isNodeSelected('node4')).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex multi-select workflow', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        // Start with single selection
        result.current.toggleNodeSelection('node1', false);
      });
      expect(result.current.selectedNodeIds).toEqual(['node1']);

      act(() => {
        // Add to selection (Ctrl+Click)
        result.current.toggleNodeSelection('node2', true);
        result.current.toggleNodeSelection('node3', true);
      });
      expect(result.current.selectedNodeIds).toEqual(['node1', 'node2', 'node3']);

      act(() => {
        // Toggle off one node (Ctrl+Click on selected)
        result.current.toggleNodeSelection('node2', true);
      });
      expect(result.current.selectedNodeIds).toEqual(['node1', 'node3']);

      act(() => {
        // Single click should replace selection
        result.current.toggleNodeSelection('node4', false);
      });
      expect(result.current.selectedNodeIds).toEqual(['node4']);
    });

    it('should maintain selection consistency', () => {
      const { result } = renderHook(() => useSelection());

      act(() => {
        result.current.setSelectedNodeId('node1');
      });

      // selectedNodeId should always be in selectedNodeIds
      expect(result.current.selectedNodeIds).toContain(result.current.selectedNodeId);

      act(() => {
        result.current.addToSelection('node2');
        result.current.addToSelection('node3');
      });

      // selectedNodeId should still be in selectedNodeIds
      expect(result.current.selectedNodeIds).toContain(result.current.selectedNodeId);
    });
  });
});
