/**
 * FR: Hook pour gérer l'historique undo/redo
 * EN: Hook for managing undo/redo history
 */

import { useCallback, useRef, useState } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export const useUndoRedo = <T>(initialState: T) => {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const maxHistory = useRef(50); // Limit history to 50 states

  const push = useCallback((newState: T) => {
    setState(prevState => ({
      past: [...prevState.past, prevState.present].slice(-maxHistory.current),
      present: newState,
      future: [],
    }));
  }, []);

  const undo = useCallback(() => {
    setState(prevState => {
      if (prevState.past.length === 0) return prevState;

      const newPast = prevState.past.slice(0, -1);
      const newPresent = prevState.past[prevState.past.length - 1];
      const newFuture = [prevState.present, ...prevState.future];

      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(prevState => {
      if (prevState.future.length === 0) return prevState;

      const newPast = [...prevState.past, prevState.present];
      const newPresent = prevState.future[0];
      const newFuture = prevState.future.slice(1);

      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  return {
    state: state.present,
    push,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
