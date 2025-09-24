import { detectRuntime } from './runtime'

export type Prefs = Record<string, any>

const LS_KEY = 'bm2:prefs'
const CONFIG_DIR = 'BigMind'
const CONFIG_FILE = 'config.json'

export function loadPrefsSync(): Prefs | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function loadPrefsFromFs(): Promise<Prefs | null> {
  const env = detectRuntime()
  try {
    if (env === 'tauri') {
      // @ts-ignore
      const { readTextFile, createDir, exists, writeFile } = (window as any).__TAURI__.fs
      // @ts-ignore
      const { join, appConfigDir } = (window as any).__TAURI__.path
      const cfgDir = await appConfigDir()
      const dirPath = await join(cfgDir, CONFIG_DIR)
      const filePath = await join(dirPath, CONFIG_FILE)
      const fileExists = await exists(filePath)
      if (!fileExists) {
        await createDir(dirPath, { recursive: true })
        await writeFile({ path: filePath, contents: '{}' })
      }
      const text = await readTextFile(filePath)
      return JSON.parse(text || '{}')
    }
    if (env === 'electron') {
      // Expect preload to expose fs helpers
      // @ts-ignore
      const api = (window as any).electronAPI
      if (api?.loadConfig) {
        const text = await api.loadConfig(CONFIG_DIR, CONFIG_FILE)
        return text ? JSON.parse(text) : {}
      }
    }
    return null
  } catch {
    return null
  }
}

export function savePrefsToLocalStorage(prefs: Prefs) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(prefs)) } catch {}
}

export async function savePrefsToFs(prefs: Prefs) {
  const env = detectRuntime()
  try {
    if (env === 'tauri') {
      // @ts-ignore
      const { writeFile, createDir } = (window as any).__TAURI__.fs
      // @ts-ignore
      const { join, appConfigDir } = (window as any).__TAURI__.path
      const cfgDir = await appConfigDir()
      const dirPath = await join(cfgDir, CONFIG_DIR)
      const filePath = await join(dirPath, CONFIG_FILE)
      await createDir(dirPath, { recursive: true })
      await writeFile({ path: filePath, contents: JSON.stringify(prefs, null, 2) })
      return
    }
    if (env === 'electron') {
      // @ts-ignore
      const api = (window as any).electronAPI
      if (api?.saveConfig) {
        await api.saveConfig(CONFIG_DIR, CONFIG_FILE, JSON.stringify(prefs, null, 2))
      }
    }
  } catch {
    // swallow
  }
}


