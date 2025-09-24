export type RuntimeEnv = 'web' | 'electron' | 'tauri'

export function detectRuntime(): RuntimeEnv {
  // Tauri
  // @ts-ignore
  if (typeof (window as any).__TAURI__ !== 'undefined' || (import.meta as any)?.env?.TAURI) {
    return 'tauri'
  }
  // Electron
  const ua = navigator.userAgent.toLowerCase()
  // @ts-ignore
  const isElectron = !!(window as any).process?.versions?.electron || ua.includes('electron')
  if (isElectron) return 'electron'
  // Web
  return 'web'
}

import React from 'react'
export function useRuntime(): RuntimeEnv {
  const [env] = React.useState<RuntimeEnv>(() => detectRuntime())
  return env
}


