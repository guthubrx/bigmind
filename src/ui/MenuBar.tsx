/*
  MenuBar – Barre de menus
  - Fichier: nouveau, ouvrir, enregistrer sous, export/import réglages
  - Édition/Vue: actions placeholder (évolutif)
  - Ouverture factorisée via utils/fileUtils (openFile)
*/
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '../store/app'
import { useMindMap, type Topic } from '../store/mindmap'
import { openFile } from '../utils/fileUtils'
import { exportSettings, importSettings } from '../utils/settingsUtils'
import JSZip from 'jszip'

const MenuBar: React.FC = () => {
  const { t } = useTranslation()
  const openMindmap = useApp((s) => s.openMindmap)
  const activeTabId = useApp((s) => s.activeTabId)
  const updateTabMap = useApp((s) => s.updateTabMap)
  const setTabSaved = useApp((s) => s.setTabSaved)
  const closeTab = useApp((s) => s.closeTab)
  const tabsState = useApp((s) => s.tabs)
  const tabs = useApp((s) => s.tabs)
  const resetEmpty = useMindMap((s) => s.resetEmpty)
  const loadPrefsExternal = useApp((s) => s.loadPrefsExternal)
  const root = useMindMap((s) => s.root)

  const Menu: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [open, setOpen] = React.useState(false)
    
    const handleClick = () => {
      setOpen(!open)
    }
    
    // FR: Fermer le menu si on clique ailleurs - EN: Close menu if clicking elsewhere
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (open && !(event.target as Element).closest('[data-menu]')) {
          setOpen(false)
        }
      }
      
      if (open) {
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
      }
    }, [open])
    
    return (
      <div style={{ position: 'relative' }} data-menu>
        <button 
          style={{ background: 'transparent', border: 'none', padding: '6px 10px', cursor: 'pointer', color: 'var(--fg)' }}
          onClick={handleClick}
        >
          {title}
        </button>
        {open && (
          <div 
            style={{ 
              position: 'absolute', 
              top: '100%', 
              left: 0, 
              background: 'var(--panel)', 
              border: '1px solid var(--muted)', 
              borderRadius: 6, 
              boxShadow: '0 6px 24px rgba(0,0,0,.08)', 
              padding: 6, 
              minWidth: 180, 
              zIndex: 20,
              marginTop: 2
            }}
          >
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
    <div style={{ display: 'flex', gap: 6, padding: '4px 8px', borderBottom: '1px solid var(--muted)', background: 'var(--panel)', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', gap: 6 }}>
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
          /*
            FR: Ouvrir un fichier depuis le menu Fichier. On crée les onglets, on charge
            la première feuille, puis on ferme l'onglet d'accueil s'il est présent.

            EN: Open a file from the File menu. Create tabs, load the first sheet,
            then close the welcome tab if present.
          */
          const result = await openFile()
          if (!result) return
          const { sheets, fileName } = result
          // FR: Créer un fichier dans le store pour ce fichier ouvert
          // EN: Create a file in the store for this opened file
          const fileId = useApp.getState().ensureFile({ title: fileName, path: fileName })
          useApp.getState().setActiveFile(fileId)
          // Open one tab per sheet
          let firstId: string | null = null
          for (const s of sheets) {
            const id = openMindmap(s.title, fileId)
            if (!firstId) firstId = id
            updateTabMap(id, s.root)
            useApp.getState().setTabSaved(id, s.root)
            useApp.getState().addRecentFile({ path: fileName, title: s.title })
          }
          // Load the first sheet into the mindmap store (active tab already points to it)
          const active = firstId || useApp.getState().activeTabId
          const sheet0 = sheets[0]
          if (active && sheet0) {
            useMindMap.setState({ root: sheet0.root, past: [], future: [], selectedId: null })
          }
          // Close welcome tab if present
          const welcome = (tabsState || useApp.getState().tabs).find(t => t.type === 'welcome')
          if (welcome) closeTab(welcome.id)
        }}>{t('menu.open')}…</Item>
        <Item onClick={exportSettings}>Exporter réglages…</Item>
        <Item onClick={importSettings}>Importer réglages…</Item>
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
      
      {/* FR: Bouton fermer paramètres - EN: Close settings button */}
      {activeTabId && tabs.find(t => t.id === activeTabId)?.type === 'settings' && (
        <button
          onClick={() => {
            const settingsTab = tabs.find(t => t.id === activeTabId)
            if (settingsTab) {
              closeTab(settingsTab.id)
            }
          }}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '4px 8px',
            cursor: 'pointer',
            color: 'var(--fg)',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--muted)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          ✕ Fermer
        </button>
      )}
    </div>
  )
}

export default MenuBar



