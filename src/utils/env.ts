export function isTauri(): boolean {
  // @ts-ignore
  return typeof window !== 'undefined' && !!(window.__TAURI__ || (window as any).__TAURI_METADATA__)
}

export function isElectron(): boolean {
  // @ts-ignore
  return typeof window !== 'undefined' && !!((window as any).process?.versions?.electron)
}

export function isDesktop(): boolean {
  return isTauri() || isElectron()
}

export function isWeb(): boolean {
  return !isDesktop()
}


