import { create } from 'zustand'
import i18n from '../i18n'
import { loadPrefsFromFs, loadPrefsSync, savePrefsToFs, savePrefsToLocalStorage } from '../utils/config'
import type { Topic } from './mindmap'

export type TabType = 'mindmap' | 'settings'

export type Tab = {
  id: string
  type: TabType
  title: string
  map?: Topic
  savedMap?: Topic
  dirty?: boolean
}

export type AppState = {
  tabs: Tab[]
  activeTabId: string
  openSettings: () => void
  openMindmap: (title?: string) => string
  closeTab: (id: string) => void
  activate: (id: string) => void
  moveTab: (fromIdx: number, toIdx: number) => void
  updateTabMap: (id: string, map: Topic) => void
  setTabSaved: (id: string, map: Topic) => void
  // preferences
  language: string
  theme: string
  setLanguage: (lang: string) => void
  setTheme: (theme: string) => void
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  setLeftSidebarOpen: (open: boolean) => void
  setRightSidebarOpen: (open: boolean) => void
  zoom: number
  setZoom: (k: number) => void
  leftSidebarWidth: number
  rightSidebarWidth: number
  setLeftSidebarWidth: (px: number) => void
  setRightSidebarWidth: (px: number) => void
  collapseDurationMs: number
  setCollapseDurationMs: (ms: number) => void
  showSidebarToggles: boolean
  setShowSidebarToggles: (show: boolean) => void
  accentColor: string
  setAccentColor: (hex: string) => void
  dropTolerancePx: number
  setDropTolerancePx: (px: number) => void
  nodeWidthPx?: number
  setNodeWidthPx?: (px: number) => void
  genGapPx?: number
  setGenGapPx?: (px: number) => void
  vGapPx?: number
  setVGapPx?: (px: number) => void
  loadPrefsExternal: (prefs: any) => Promise<void>
}

const uid = () => Math.random().toString(36).slice(2, 10)

export const useApp = create<AppState>((set, get) => {
  const initialMindmapId = uid()
  const loadPrefs = () => loadPrefsSync() || {}
  const savePrefs = async (overrides: Partial<{ language: string; theme: string; leftSidebarOpen: boolean; rightSidebarOpen: boolean; zoom: number; leftSidebarWidth: number; rightSidebarWidth: number; collapseDurationMs: number; showSidebarToggles: boolean; accentColor: string; dropTolerancePx: number; nodeWidthPx: number; genGapPx: number; vGapPx: number }>) => {
    const current = loadPrefs() || {}
    const next = { ...current, ...overrides }
    savePrefsToLocalStorage(next)
    await savePrefsToFs(next)
  }
  const prefs = loadPrefs() || {}
  // Set initial language in i18n
  if (prefs.language) i18n.changeLanguage(prefs.language)
  // Try to hydrate from external config file asynchronously
  ;(async () => {
    const fsPrefs = await loadPrefsFromFs()
    if (fsPrefs) {
      // merge and persist
      const next = { ...prefs, ...fsPrefs }
      savePrefsToLocalStorage(next)
      set({
        language: next.language || 'fr',
        theme: next.theme || 'light',
        leftSidebarOpen: next.leftSidebarOpen ?? true,
        rightSidebarOpen: next.rightSidebarOpen ?? true,
        zoom: typeof next.zoom === 'number' ? next.zoom : 1,
        leftSidebarWidth: typeof next.leftSidebarWidth === 'number' ? next.leftSidebarWidth : 260,
        rightSidebarWidth: typeof next.rightSidebarWidth === 'number' ? next.rightSidebarWidth : 280,
        collapseDurationMs: typeof next.collapseDurationMs === 'number' ? next.collapseDurationMs : 200,
        showSidebarToggles: next.showSidebarToggles ?? true,
        accentColor: next.accentColor || '#3b82f6',
        dropTolerancePx: typeof next.dropTolerancePx === 'number' ? next.dropTolerancePx : 18,
        nodeWidthPx: typeof next.nodeWidthPx === 'number' ? next.nodeWidthPx : 200,
        genGapPx: typeof next.genGapPx === 'number' ? next.genGapPx : 40,
        vGapPx: typeof next.vGapPx === 'number' ? next.vGapPx : 28,
      })
      if (next.language) i18n.changeLanguage(next.language)
    }
  })()
  return {
    tabs: [{ id: initialMindmapId, type: 'mindmap', title: 'MindMap 1' }],
    activeTabId: initialMindmapId,
    openSettings: () => {
      const existing = get().tabs.find((t) => t.type === 'settings')
      if (existing) return set({ activeTabId: existing.id })
      const id = uid()
      set({ tabs: [...get().tabs, { id, type: 'settings', title: 'Settings' }], activeTabId: id })
    },
    openMindmap: (title?: string) => {
      const id = uid()
      set({ tabs: [...get().tabs, { id, type: 'mindmap', title: title || `MindMap ${get().tabs.length + 1}`, map: undefined, savedMap: undefined, dirty: false }], activeTabId: id })
      return id
    },
    closeTab: (id: string) => {
      const tabs = get().tabs.filter((t) => t.id !== id)
      let active = get().activeTabId
      if (active === id && tabs.length) active = tabs[tabs.length - 1].id
      set({ tabs, activeTabId: active })
    },
    activate: (id: string) => set({ activeTabId: id }),
    updateTabMap: (id: string, map) => set((state) => {
      const existing = state.tabs.find(t => t.id === id)?.map
      try {
        const saved = state.tabs.find(t => t.id === id)?.savedMap
        const isSameAsSaved = saved && JSON.stringify(saved) === JSON.stringify(map)
        if (existing && JSON.stringify(existing) === JSON.stringify(map)) {
          return {}
        }
      } catch {}
      return { tabs: state.tabs.map(t => t.id === id ? { ...t, map, dirty: (t.savedMap && JSON.stringify(t.savedMap) === JSON.stringify(map)) ? false : true } : t) }
    }),
    setTabSaved: (id: string, map) => set((state) => ({
      tabs: state.tabs.map(t => t.id === id ? { ...t, savedMap: map, dirty: false } : t)
    })),
    accentColor: prefs.accentColor || '#3b82f6',
    setAccentColor: (hex: string) => { savePrefs({ accentColor: hex }); set({ accentColor: hex }) },
    dropTolerancePx: typeof prefs.dropTolerancePx === 'number' ? prefs.dropTolerancePx : 18,
    setDropTolerancePx: (px: number) => { const v = Math.max(0, Math.min(64, Math.floor(px))); savePrefs({ dropTolerancePx: v }); set({ dropTolerancePx: v }) },
    nodeWidthPx: typeof (prefs as any).nodeWidthPx === 'number' ? (prefs as any).nodeWidthPx : 200,
    setNodeWidthPx: (px: number) => { const v = Math.max(80, Math.min(600, Math.floor(px))); savePrefs({ nodeWidthPx: v }); set({ nodeWidthPx: v } as any) },
    genGapPx: typeof (prefs as any).genGapPx === 'number' ? (prefs as any).genGapPx : 40,
    setGenGapPx: (px: number) => { const v = Math.max(8, Math.min(200, Math.floor(px))); savePrefs({ genGapPx: v }); set({ genGapPx: v } as any) },
    vGapPx: typeof (prefs as any).vGapPx === 'number' ? (prefs as any).vGapPx : 28,
    setVGapPx: (px: number) => { const v = Math.max(4, Math.min(200, Math.floor(px))); savePrefs({ vGapPx: v }); set({ vGapPx: v } as any) },
    loadPrefsExternal: async (incoming: any) => {
      const next = {
        language: incoming.language ?? get().language,
        theme: incoming.theme ?? get().theme,
        leftSidebarOpen: incoming.leftSidebarOpen ?? get().leftSidebarOpen,
        rightSidebarOpen: incoming.rightSidebarOpen ?? get().rightSidebarOpen,
        zoom: typeof incoming.zoom === 'number' ? incoming.zoom : get().zoom,
        leftSidebarWidth: typeof incoming.leftSidebarWidth === 'number' ? incoming.leftSidebarWidth : get().leftSidebarWidth,
        rightSidebarWidth: typeof incoming.rightSidebarWidth === 'number' ? incoming.rightSidebarWidth : get().rightSidebarWidth,
        collapseDurationMs: typeof incoming.collapseDurationMs === 'number' ? incoming.collapseDurationMs : get().collapseDurationMs,
        showSidebarToggles: incoming.showSidebarToggles ?? get().showSidebarToggles,
        accentColor: incoming.accentColor ?? get().accentColor,
        dropTolerancePx: typeof incoming.dropTolerancePx === 'number' ? incoming.dropTolerancePx : get().dropTolerancePx,
      }
      set(next as any)
      if (next.language) i18n.changeLanguage(next.language)
      await savePrefs(next)
    },
    moveTab: (fromIdx: number, toIdx: number) => set(() => {
      const list = [...get().tabs]
      const [moved] = list.splice(fromIdx, 1)
      list.splice(Math.max(0, Math.min(list.length, toIdx)), 0, moved)
      return { tabs: list }
    }),
    language: prefs.language || 'fr',
    theme: prefs.theme || 'light',
    setLanguage: (lang: string) => { savePrefs({ language: lang }); set({ language: lang }); i18n.changeLanguage(lang) },
    setTheme: (theme: string) => { savePrefs({ theme }); set({ theme }) },
    leftSidebarOpen: prefs.leftSidebarOpen ?? true,
    rightSidebarOpen: prefs.rightSidebarOpen ?? true,
    setLeftSidebarOpen: (open: boolean) => { savePrefs({ leftSidebarOpen: open }); set({ leftSidebarOpen: open }) },
    setRightSidebarOpen: (open: boolean) => { savePrefs({ rightSidebarOpen: open }); set({ rightSidebarOpen: open }) },
    zoom: typeof prefs.zoom === 'number' ? prefs.zoom : 1,
    setZoom: (k: number) => { savePrefs({ zoom: k }); set({ zoom: k }) },
    leftSidebarWidth: typeof prefs.leftSidebarWidth === 'number' ? prefs.leftSidebarWidth : 260,
    rightSidebarWidth: typeof prefs.rightSidebarWidth === 'number' ? prefs.rightSidebarWidth : 280,
    setLeftSidebarWidth: (px: number) => { savePrefs({ leftSidebarWidth: px }); set({ leftSidebarWidth: px }) },
    setRightSidebarWidth: (px: number) => { savePrefs({ rightSidebarWidth: px }); set({ rightSidebarWidth: px }) },
    collapseDurationMs: typeof prefs.collapseDurationMs === 'number' ? prefs.collapseDurationMs : 200,
    setCollapseDurationMs: (ms: number) => { savePrefs({ collapseDurationMs: ms }); set({ collapseDurationMs: ms }) },
    showSidebarToggles: prefs.showSidebarToggles ?? true,
    setShowSidebarToggles: (show: boolean) => { savePrefs({ showSidebarToggles: show }); set({ showSidebarToggles: show }) },
  }
})



