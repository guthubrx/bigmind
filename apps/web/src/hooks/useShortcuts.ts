import { create } from 'zustand';

export type ShortcutAction =
  | 'file.new'
  | 'file.open'
  | 'file.close'
  | 'file.save'
  | 'file.saveAs'
  | 'file.export'
  | 'file.print'
  | 'edit.undo'
  | 'edit.redo'
  | 'edit.cut'
  | 'edit.copy'
  | 'edit.paste'
  | 'edit.delete'
  | 'edit.selectAll'
  | 'view.zoomIn'
  | 'view.zoomOut'
  | 'view.zoomReset'
  | 'view.fit'
  | 'view.fullscreen'
  | 'view.follow'
  | 'insert.newNode'
  | 'insert.newChild'
  | 'insert.newParent'
  | 'tools.preferences';

type ShortcutsMap = Record<ShortcutAction, string>;

interface ShortcutsState {
  map: ShortcutsMap;
  setShortcut: (action: ShortcutAction, accelerator: string) => void;
  getShortcut: (action: ShortcutAction) => string;
  resetDefaults: () => void;
}

const STORAGE_KEY = 'bigmind_shortcuts_v1';

const defaultMap: ShortcutsMap = {
  'file.new': 'Ctrl+N',
  'file.open': 'Ctrl+O',
  'file.close': 'Ctrl+W',
  'file.save': 'Ctrl+S',
  'file.saveAs': 'Ctrl+Shift+S',
  'file.export': 'Ctrl+E',
  'file.print': 'Ctrl+P',
  'edit.undo': 'Ctrl+Z',
  'edit.redo': 'Ctrl+Y',
  'edit.cut': 'Ctrl+X',
  'edit.copy': 'Ctrl+C',
  'edit.paste': 'Ctrl+V',
  'edit.delete': 'Delete',
  'edit.selectAll': 'Ctrl+A',
  'view.zoomIn': 'Ctrl+=',
  'view.zoomOut': 'Ctrl+-',
  'view.zoomReset': 'Ctrl+0',
  'view.fit': 'Ctrl+Shift+0',
  'view.fullscreen': 'F11',
  'view.follow': 'F',
  'insert.newNode': 'Enter',
  'insert.newChild': 'Tab',
  'insert.newParent': 'Shift+Tab',
  'tools.preferences': 'Ctrl+,',
};

function loadFromStorage(): ShortcutsMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultMap;
    const parsed = JSON.parse(raw);
    return { ...defaultMap, ...parsed };
  } catch (e) {
    // Ignore errors
    return defaultMap;
  }
}

export const useShortcuts = create<ShortcutsState>((set, get) => ({
  map: loadFromStorage(),
  setShortcut: (action, accelerator) => {
    set(state => {
      const map = { ...state.map, [action]: accelerator };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
      } catch (e) {
        // Ignore errors
      }
      return { map };
    });
  },
  getShortcut: action => get().map[action],
  resetDefaults: () => {
    set({ map: defaultMap });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMap));
    } catch (e) {
      // Ignore errors
    }
  },
}));
