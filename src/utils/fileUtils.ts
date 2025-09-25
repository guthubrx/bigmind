/*
  Utils d'ouverture/chargement de fichiers

  Objectif
  --------
  Fournir une API simple et factorisée pour ouvrir une carte mentale (.xmind ou
  .mm), parser son contenu et retourner des feuilles prêtes à charger.

  Points clés
  -----------
  - parseFreeMind(): XML → structure Topic (récursif)
  - parseXMind(): supporte XMind 2021 (content.json), robuste aux variantes
  - pickFile(): boîte d'ouverture (File System Access si dispo, sinon input)
  - openFile(): ouvre un fichier choisi et renvoie { fileName, sheets }
  - openRecentByPath(): en desktop, ouverture directe par chemin/handle

  Nota navigateur: en pur Web, on ne peut pas rouvrir par chemin sans demander
  l'utilisateur; on mémorise des "handles" quand c'est possible pour rouvrir
  plus vite. En Tauri/Electron, on pourra ouvrir directement via fs.
*/
import JSZip from 'jszip'
import { generateId } from './layoutUtils'
import { saveHandle as persistHandle, getHandle as loadHandle } from './handles'

export type Topic = {
  id: string
  label: string
  children: Topic[]
  rootSide?: 'left' | 'right' | 'balanced'
}

export type SheetParsed = { title: string; root: Topic }
export type OpenFileResult = { fileName: string; sheets: SheetParsed[] }

/**
 * parseFreeMind
 * Convertit le XML FreeMind (.mm) en structure Topic (récursif).
 */
export function parseFreeMind(xml: string): Topic {
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const xmlRoot = doc.querySelector('node')
  if (!xmlRoot) return { id: 'root', label: 'Imported', children: [] }
  const walk = (el: Element): Topic => {
    const label = el.getAttribute('TEXT') || 'Node'
    const id = el.getAttribute('ID') || generateId()
    const children: Topic[] = []
    el.querySelectorAll(':scope > node').forEach((child) => {
      children.push(walk(child))
    })
    return { id, label, children }
  }
  return walk(xmlRoot)
}

/**
 * parseXMind
 * Lit un fichier XMind 2021 (.xmind) et extrait les feuilles depuis content.json.
 * Retourne une liste de { title, root } (une entrée par feuille).
 */
export async function parseXMind(file: File): Promise<SheetParsed[] | null> {
  try {
    const zip = await JSZip.loadAsync(file)
    const contentEntry = zip.file('content.json')
    if (!contentEntry) return null
    const jsonText = await contentEntry.async('string')
    const content = JSON.parse(jsonText)
    const sheetsAny: any[] = Array.isArray(content) ? content : (content?.sheets || (content?.sheet ? [content.sheet] : []))
    if (!sheetsAny.length) return null
    const results: SheetParsed[] = []
    for (const sheet of sheetsAny) {
      const rootTopic = sheet?.rootTopic || sheet?.topic || null
      if (!rootTopic) continue
      const walk = (n: any): Topic => {
        const id = n.id || generateId()
        const label = n.title || n.plainText || n.text || 'Node'
        const buckets: any[] = []
        if (Array.isArray(n.children)) buckets.push(...n.children)
        if (n.children && typeof n.children === 'object') {
          for (const key of Object.keys(n.children)) {
            const arr = (n.children as any)[key]
            if (Array.isArray(arr)) buckets.push(...arr)
          }
        }
        const kids: Topic[] = buckets.map(walk)
        const t: Topic = { id, label, children: kids }
        const sideOrBranch = (n.branch || n.side) as string | undefined
        if (sideOrBranch === 'left' || sideOrBranch === 'right') (t as any).side = sideOrBranch
        if (sideOrBranch === 'folded') (t as any).collapsed = true
        return t
      }
      const rootParsed = walk(rootTopic)
      const struct: string | undefined = rootTopic.structureClass || sheet?.structureClass
      if (struct && /tree\.right/i.test(struct)) (rootParsed as any).rootSide = 'right'
      else if (struct && /tree\.left/i.test(struct)) (rootParsed as any).rootSide = 'left'
      else (rootParsed as any).rootSide = 'balanced'
      results.push({ title: sheet.title || 'Sheet', root: rootParsed })
    }
    return results
  } catch {
    return null
  }
}

// Persistence helpers (IndexedDB); no-throw wrappers
async function saveHandle(key: string, handle: any) { try { await persistHandle(key, handle) } catch {} }
async function getSavedHandle(key: string): Promise<any | null> { try { return await loadHandle(key) } catch { return null } }

/**
 * pickFile
 * Ouvre une boîte de dialogue pour choisir un fichier .xmind/.mm.
 * Utilise l'API File System Access quand disponible, sinon <input type="file">.
 */
export async function pickFile(): Promise<File | null> {
  try {
    // @ts-ignore
    if (window.showOpenFilePicker) {
      // @ts-ignore
      const [handle] = await window.showOpenFilePicker({ types: [
        { description: 'Mind map', accept: { 'application/octet-stream': ['.xmind'], 'application/zip': ['.xmind'], 'application/json': ['.xmind'], 'text/xml': ['.mm'], 'application/xml': ['.mm'] } }
      ] })
      const file = await handle.getFile()
      // persist handle for recents
      await saveHandle(file.name, handle)
      return file
    }
  } catch {}
  return new Promise<File | null>((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.mm,.xmind, text/xml, application/xml, application/zip, application/json'
    input.onchange = () => resolve(input.files?.[0] || null)
    input.click()
  })
}

/**
 * openFile
 * Demande un fichier à l'utilisateur puis tente de le parser (.xmind ou .mm).
 * Retourne { fileName, sheets } prêt à être chargé dans les onglets.
 */
export async function openFile(): Promise<OpenFileResult | null> {
  const file = await pickFile()
  if (!file) return null
  
  let sheetsParsed: SheetParsed[] | null = null
  if (/\.xmind$/i.test(file.name)) {
    sheetsParsed = await parseXMind(file)
  } else if (/\.mm$/i.test(file.name)) {
    const text = await file.text()
    const root = parseFreeMind(text)
    sheetsParsed = [{ title: (file.name || 'Imported').replace(/\.(mm|xmind)$/i, ''), root }]
  } else {
    // Try both formats
    const buf = await file.arrayBuffer()
    try { 
      await JSZip.loadAsync(buf)
      sheetsParsed = await parseXMind(new File([buf], file.name))
    } catch {}
    if (!sheetsParsed) {
      const text = new TextDecoder().decode(new Uint8Array(buf))
      const root = parseFreeMind(text)
      sheetsParsed = [{ title: (file.name || 'Imported').replace(/\.(mm|xmind)$/i, ''), root }]
    }
  }
  
  return sheetsParsed && sheetsParsed.length > 0 ? { fileName: file.name, sheets: sheetsParsed } : null
}

/**
 * openRecentByPath
 * En desktop: tente d'ouvrir directement via un handle/chemin persistant.
 * En Web: retombe sur openFile() (boîte de dialogue) si non autorisé.
 */
export async function openRecentByPath(path: string): Promise<OpenFileResult | null> {
  // Try using saved handle first
  const handle = await getSavedHandle(path)
  if (handle && typeof handle.getFile === 'function') {
    try {
      // @ts-ignore
      if (handle.requestPermission && (await handle.requestPermission({ mode: 'read' })) !== 'granted') {
        // permission denied → fallback to picker
      } else {
        const file: File = await handle.getFile()
        let sheetsParsed: SheetParsed[] | null = null
        if (/\.xmind$/i.test(file.name)) {
          sheetsParsed = await parseXMind(file)
        } else if (/\.mm$/i.test(file.name)) {
          const text = await file.text()
          const root = parseFreeMind(text)
          sheetsParsed = [{ title: (file.name || 'Imported').replace(/\.(mm|xmind)$/i, ''), root }]
        }
        if (sheetsParsed && sheetsParsed.length) return { fileName: file.name, sheets: sheetsParsed }
      }
    } catch {}
  }
  // Fallback: let user pick again
  return await openFile()
}
