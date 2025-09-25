export function exportSettings(): void {
  const prefsRaw = localStorage.getItem('bm2:prefs') || '{}'
  const blob = new Blob([prefsRaw], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'bigmind-settings.json'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function importSettings(): Promise<void> {
  try {
    // @ts-ignore
    if (window.showOpenFilePicker) {
      // @ts-ignore
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }]
      })
      const file = await handle.getFile()
      const text = await file.text()
      const prefs = JSON.parse(text)
      localStorage.setItem('bm2:prefs', JSON.stringify(prefs))
      window.location.reload()
    }
  } catch {}
  
  // Fallback: input[type=file]
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return resolve()
      try {
        const text = await file.text()
        const prefs = JSON.parse(text)
        localStorage.setItem('bm2:prefs', JSON.stringify(prefs))
        window.location.reload()
      } catch {}
      resolve()
    }
    input.click()
  })
}
