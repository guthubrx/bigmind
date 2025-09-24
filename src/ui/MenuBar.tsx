import React from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '../store/app'
import { useMindMap, type Topic } from '../store/mindmap'
import JSZip from 'jszip'

const MenuBar: React.FC = () => {
  const { t } = useTranslation()
  const openMindmap = useApp((s) => s.openMindmap)
  const activeTabId = useApp((s) => s.activeTabId)
  const updateTabMap = useApp((s) => s.updateTabMap)
  const setTabSaved = useApp((s) => s.setTabSaved)
  const tabs = useApp((s) => s.tabs)
  const resetEmpty = useMindMap((s) => s.resetEmpty)
  const loadPrefsExternal = useApp((s) => s.loadPrefsExternal)
  const root = useMindMap((s) => s.root)

  const Menu: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [open, setOpen] = React.useState(false)
    return (
      <div style={{ position: 'relative' }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}>
        <button style={{ background: 'transparent', border: 'none', padding: '6px 10px', cursor: 'default', color: 'var(--fg)' }}>{title}</button>
        {open && (
          <div style={{ position: 'absolute', top: '100%', left: 0, background: 'var(--panel)', border: '1px solid var(--muted)', borderRadius: 6, boxShadow: '0 6px 24px rgba(0,0,0,.08)', padding: 6, minWidth: 180, zIndex: 20 }}>
            {children}
          </div>
        )}
      </div>
    )
  }

  const Item: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
    <button {...props} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '8px 10px', borderRadius: 6, color: 'var(--fg)', cursor: 'pointer' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#eef2f7' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
    />
  )

  return (
    <div style={{ display: 'flex', gap: 6, padding: '4px 8px', borderBottom: '1px solid var(--muted)', background: 'var(--panel)' }}>
      <Menu title={t('menu.file')}>
        <Item onClick={() => openMindmap()}>{t('menu.newTab')}</Item>
        <Item onClick={async () => {
          // Save As… current map to FreeMind .mm
          const toFreeMindXML = (topic: Topic): string => {
            const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            const walk = (n: Topic): string => {
              const children = (n.children || []).map(walk).join('')
              const attrs = `TEXT="${esc(n.label)}" ID="${esc(n.id)}"`
              return `<node ${attrs}>${children}</node>`
            }
            return `<?xml version="1.0" encoding="UTF-8"?>\n<map version="0.9.0">${walk(topic)}</map>`
          }

          const xml = toFreeMindXML(root)
          const suggested = (tabs.find(t=>t.id===activeTabId)?.title || 'MindMap').replace(/\s+/g,'_') + '.mm'
          // Try FS Access API first
          try {
            // @ts-ignore
            if (window.showSaveFilePicker) {
              // @ts-ignore
              const handle = await window.showSaveFilePicker({ suggestedName: suggested, types: [{ description: 'FreeMind', accept: { 'text/xml': ['.mm'], 'application/xml': ['.mm'] } }] })
              const writable = await handle.createWritable()
              await writable.write(new Blob([xml], { type: 'application/xml' }))
              await writable.close()
              setTabSaved(activeTabId, root)
              return
            }
          } catch {}
          // Fallback: download
          const blob = new Blob([xml], { type: 'application/xml' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = suggested
          document.body.appendChild(a)
          a.click()
          a.remove()
          URL.revokeObjectURL(url)
          setTabSaved(activeTabId, root)
        }}>{t('menu.saveAs') || 'Enregistrer sous…'}</Item>
        <Item onClick={async () => {
          // Open .mm or .xmind via File System Access API with fallback
          async function pickFile(): Promise<File | null> {
            try {
              // @ts-ignore
              if (window.showOpenFilePicker) {
                // @ts-ignore
                const [handle] = await window.showOpenFilePicker({ types: [
                  { description: 'Mind map', accept: { 'application/octet-stream': ['.xmind'], 'application/zip': ['.xmind'], 'application/json': ['.xmind'], 'text/xml': ['.mm'], 'application/xml': ['.mm'] } }
                ] })
                const file = await handle.getFile()
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

          function parseFreeMind(xml: string): Topic {
            const doc = new DOMParser().parseFromString(xml, 'text/xml')
            const xmlRoot = doc.querySelector('node')
            if (!xmlRoot) return { id: 'root', label: 'Imported', children: [] }
            const walk = (el: Element): Topic => {
              const label = el.getAttribute('TEXT') || 'Node'
              const id = el.getAttribute('ID') || Math.random().toString(36).slice(2, 10)
              const children: Topic[] = []
              el.querySelectorAll(':scope > node').forEach((child) => {
                children.push(walk(child))
              })
              return { id, label, children }
            }
            return walk(xmlRoot)
          }

          type SheetParsed = { title: string; root: Topic }
          async function parseXMind(file: File): Promise<SheetParsed[] | null> {
            try {
              const zip = await JSZip.loadAsync(file)
              // XMind 2021 stores content.json at root
              const contentEntry = zip.file('content.json')
              if (!contentEntry) return null
              const jsonText = await contentEntry.async('string')
              const content = JSON.parse(jsonText)
              const sheets: any[] = Array.isArray(content) ? content : (content?.sheets || (content?.sheet ? [content.sheet] : []))
              if (!sheets.length) return null
              const results: SheetParsed[] = []
              for (const sheet of sheets) {
                const rootTopic = sheet?.rootTopic || sheet?.topic || null
                if (!rootTopic) continue
              const walk = (n: any): Topic => {
                const id = n.id || Math.random().toString(36).slice(2, 10)
                const label = n.title || n.plainText || n.text || 'Node'
                const buckets: any[] = []
                if (Array.isArray(n.children)) buckets.push(...n.children)
                if (n.children && typeof n.children === 'object') {
                  for (const key of Object.keys(n.children)) {
                    const arr = n.children[key]
                    if (Array.isArray(arr)) buckets.push(...arr)
                  }
                }
                const kids: Topic[] = buckets.map(walk)
                const sideOrBranch = n.branch || n.side // some exports use branch
                const t: Topic = { id, label, children: kids }
                // XMind 2021 may carry position data in extensions or 'position'
                const ext = (n.extensions && (n.extensions['bigmind:layout'] || n.extensions['xmind:layout'])) || null
                const pos = n.position || n.pos || null
                if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
                  ;(t as any).x = pos.x; (t as any).y = pos.y
                }
                if (ext && typeof ext.x === 'number' && typeof ext.y === 'number') {
                  ;(t as any).x = ext.x; (t as any).y = ext.y
                }
                if (sideOrBranch === 'left' || sideOrBranch === 'right') (t as any).side = sideOrBranch
                // If branch is folded, mark node collapsed so its children are hidden in layout
                if (sideOrBranch === 'folded') (t as any).collapsed = true
                return t
              }
              const rootParsed = walk(rootTopic)
              const struct: string | undefined = rootTopic.structureClass || sheet?.structureClass
              if (struct && /tree\.right/i.test(struct)) {
                ;(rootParsed as any).rootSide = 'right'
              } else if (struct && /tree\.left/i.test(struct)) {
                ;(rootParsed as any).rootSide = 'left'
              } else {
                ;(rootParsed as any).rootSide = 'balanced'
              }
                results.push({ title: sheet.title || 'Sheet', root: rootParsed })
              }
              return results
            } catch {
              return null
            }
          }

          const file = await pickFile()
          if (!file) return
          let sheetsParsed: SheetParsed[] | null = null
          if (/\.xmind$/i.test(file.name)) {
            sheetsParsed = await parseXMind(file)
          } else if (/\.mm$/i.test(file.name)) {
            const text = await file.text()
            const root = parseFreeMind(text)
            sheetsParsed = [{ title: (file.name || 'Imported').replace(/\.(mm|xmind)$/i, ''), root }]
          } else {
            // sniff by content if needed
            const buf = await file.arrayBuffer()
            try { await JSZip.loadAsync(buf); sheetsParsed = await parseXMind(new File([buf], file.name)) } catch {}
            if (!sheetsParsed) {
              const text = new TextDecoder().decode(new Uint8Array(buf))
              const root = parseFreeMind(text)
              sheetsParsed = [{ title: (file.name || 'Imported').replace(/\.(mm|xmind)$/i, ''), root }]
            }
          }
          if (!sheetsParsed || sheetsParsed.length === 0) return
          // Open one tab per sheet
          let firstId: string | null = null
          for (const s of sheetsParsed) {
            const id = openMindmap(s.title)
            if (!firstId) firstId = id
            updateTabMap(id, s.root)
            useApp.getState().setTabSaved(id, s.root)
          }
          // Load the first sheet into the mindmap store (active tab already points to it)
          const active = firstId || useApp.getState().activeTabId
          const sheet0 = sheetsParsed[0]
          if (active && sheet0) {
            useMindMap.setState({ root: sheet0.root, past: [], future: [], selectedId: null })
          }
        }}>{t('menu.open')}…</Item>
        <Item onClick={async () => {
          // Export settings
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
        }}>Exporter réglages…</Item>
        <Item onClick={async () => {
          // Import settings
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = 'application/json'
          input.onchange = async () => {
            const f = input.files?.[0]
            if (!f) return
            const text = await f.text()
            try { await loadPrefsExternal(JSON.parse(text)) } catch {}
          }
          input.click()
        }}>Importer réglages…</Item>
      </Menu>
      <Menu title={t('menu.edit')}>
        <Item disabled>Undo</Item>
        <Item disabled>Redo</Item>
        <Item disabled>{t('menu.cut')}</Item>
        <Item disabled>{t('menu.copy')}</Item>
        <Item disabled>{t('menu.paste')}</Item>
      </Menu>
      <Menu title={t('menu.view')}>
        <Item disabled>{t('menu.zoomIn')}</Item>
        <Item disabled>{t('menu.zoomOut')}</Item>
        <Item disabled>{t('menu.resetZoom')}</Item>
      </Menu>
      <Menu title={t('menu.help')}>
        <Item disabled>{t('menu.about')}</Item>
      </Menu>
    </div>
  )
}

export default MenuBar



