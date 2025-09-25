import { DEFAULTS } from './constants'

export const themes: Record<string, Record<string, string>> = {
  light: { '--bg': '#f8fafc', '--fg': '#0f172a', '--panel': '#ffffff' },
  dark: { '--bg': '#0f172a', '--fg': '#e5e7eb', '--panel': '#111827' },
  nord: { '--bg': '#2e3440', '--fg': '#e5e9f0', '--panel': '#3b4252' },
  gruvbox: { '--bg': '#282828', '--fg': '#ebdbb2', '--panel': '#3c3836' },
}

export function applyTheme(theme: string, accentColor: string): void {
  const root = document.documentElement
  const t = themes[theme] || themes[DEFAULTS.THEME]
  for (const [k, v] of Object.entries(t)) {
    root.style.setProperty(k, v)
  }
  root.style.setProperty('--accent', accentColor)
}
