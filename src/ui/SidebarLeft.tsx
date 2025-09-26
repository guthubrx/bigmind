import React from 'react'
import { useTranslation } from 'react-i18next'
import { Topic, useMindMap } from '../store/mindmap'
import { useApp } from '../store/app'

const OutlineNode: React.FC<{ node: Topic; level?: number }> = ({ node, level = 0 }) => {
  const { t } = useTranslation()
  const select = useMindMap((s) => s.select)
  const toggle = useMindMap((s) => s.toggleCollapse)
  const rename = useMindMap((s) => s.rename)
  const setSide = useMindMap((s) => s.setSide)
  const moveAsChild = useMindMap((s) => s.moveAsChild)
  const moveBefore = useMindMap((s) => s.moveBefore)
  const moveAfter = useMindMap((s) => s.moveAfter)
  const selectedId = useMindMap((s) => s.selectedId)
  const [editing, setEditing] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const isSelected = selectedId === node.id

  React.useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'F2' && isSelected) {
      e.preventDefault(); setEditing(true)
    }
  }

  const [dropPos, setDropPos] = React.useState<'before' | 'child' | 'after' | null>(null)

  const countDescendants = React.useCallback((n: Topic): number => {
    const kids = n.children || []
    if (kids.length === 0) return 0
    return kids.length + kids.reduce((sum, c) => sum + countDescendants(c), 0)
  }, [])

  const descendantCount = React.useMemo(() => countDescendants(node), [node, countDescendants])

  return (
    <div onKeyDown={onKeyDown}>
      <div
        onClick={() => select(node.id)}
        onDoubleClick={() => toggle(node.id)}
        style={{
          paddingLeft: 8 + level * 14,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          lineHeight: '22px',
          userSelect: 'none',
          background: isSelected ? 'rgba(59,130,246,.08)' : 'transparent',
          outline: dropPos ? '1px dashed #60a5fa' : 'none',
          position: 'relative',
        }}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/topic-id', node.id)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
          const y = e.clientY - rect.top
          if (y < rect.height * 0.25) setDropPos('before')
          else if (y > rect.height * 0.75) setDropPos('after')
          else setDropPos('child')
        }}
        onDrop={(e) => {
          const draggedId = e.dataTransfer.getData('text/topic-id')
          if (!draggedId || draggedId === node.id) return
          if (dropPos === 'before') moveBefore(draggedId, node.id)
          else if (dropPos === 'after') moveAfter(draggedId, node.id)
          else moveAsChild(draggedId, node.id)
          setDropPos(null)
        }}
        onDragLeave={() => {
          setDropPos(null)
        }}
      >
        {dropPos === 'before' && (
          <div style={{ position: 'absolute', left: 4 + level * 14, right: 4, top: -2, height: 0, borderTop: '2px solid #60a5fa' }} />
        )}
        {dropPos === 'after' && (
          <div style={{ position: 'absolute', left: 4 + level * 14, right: 4, bottom: -2, height: 0, borderTop: '2px solid #60a5fa' }} />
        )}
        {((node.children || []).length > 0) ? (
          <button
            onClick={(e) => { e.stopPropagation(); toggle(node.id) }}
            title={node.collapsed ? t('Expand') : t('Collapse')}
            style={{
              width: 18,
              height: 18,
              border: 'none',
              background: 'transparent',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            {node.collapsed ? '▶' : '▼'}
          </button>
        ) : (
          <span style={{ display: 'inline-block', width: 18, height: 18 }} />
        )}
        {editing ? (
          <input
            ref={inputRef}
            defaultValue={node.label}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                rename(node.id, (e.target as HTMLInputElement).value.trim() || node.label)
                setEditing(false)
              } else if (e.key === 'Escape') {
                setEditing(false)
              }
            }}
            onBlur={(e) => { rename(node.id, e.target.value.trim() || node.label); setEditing(false) }}
            style={{ flex: 1 }}
          />
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, maxWidth: '100%' }}>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {node.label}
            </span>
            {/* Bouton pour basculer côté pour enfants directs de la racine */}
            {level === 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setSide(node.id, (node as any).side === 'left' ? 'right' : 'left') }}
                title={(node as any).side === 'left' ? t('Move to right') : t('Move to left')}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--accent)' }}
              >↔</button>
            )}
            {descendantCount > 0 && (
              <span title={`${descendantCount} descendants`} style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 18, height: 18, padding: '0 6px', borderRadius: 999,
                background: 'var(--accent)', color: '#fff', fontSize: 11, lineHeight: '18px'
              }}>{descendantCount}</span>
            )}
          </span>
        )}
        {/* Badges modernes monochromes (affichés uniquement si données présentes) */}
        {(() => {
          const hasNote = !!(node as any).note && String((node as any).note).trim().length > 0
          const hasLinks = Array.isArray((node as any).links) && (node as any).links.length > 0
          const task = (node as any).task as ('todo' | 'doing' | 'done' | undefined)
          const showTask = task !== undefined && task !== null && task !== ''
          if (!hasNote && !hasLinks && !showTask) return null
          return (
            <span style={{ display: 'inline-flex', gap: 6, marginLeft: 8, opacity: 0.85, color: 'currentColor' }}>
              {hasNote && (
                <span title={t('Note')} style={{ display: 'inline-flex' }} onClick={(e) => { e.stopPropagation(); setEditing(true) }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                    <path d="M17 3l4 4" />
                  </svg>
                </span>
              )}
              {hasLinks && (
                <span title={t('Link')} style={{ display: 'inline-flex' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10 13a5 5 0 0 0 7.07 0l1.83-1.83a5 5 0 0 0-7.07-7.07L10 5" />
                    <path d="M14 11a5 5 0 0 0-7.07 0L5.1 12.83a5 5 0 1 0 7.07 7.07L14 19" />
                  </svg>
                </span>
              )}
              {showTask && (
                <span title={t('Task')} style={{ display: 'inline-flex' }}>
                  {task === 'done' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {task === 'doing' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 3v9l6 3" />
                    </svg>
                  )}
                  {task === 'todo' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  )}
                </span>
              )}
            </span>
          )
        })()}
        {/* moved descendant count next to label */}
      </div>
      {!node.collapsed && (node.children || []).map((c) => (
        <OutlineNode key={c.id} node={c} level={level + 1} />
      ))}
    </div>
  )
}

/*
  FR: Panneau gauche – Fichiers ouverts + Plan (outline)
  Affiche d'abord la liste des onglets de type "mindmap" pour naviguer rapidement
  entre les fichiers ouverts, puis le plan hiérarchique de la carte active.

  EN: Left panel – Open files + Outline
  Shows first the list of open tabs of type "mindmap" to quickly switch between
  open files, then the hierarchical outline of the active map.
*/
const SidebarLeft: React.FC = () => {
  const { t } = useTranslation()
  const root = useMindMap((s) => s.root)
  const tabs = useApp((s) => s.tabs)
  const activeTabId = useApp((s) => s.activeTabId)
  const activate = useApp((s) => s.activate)
  const files = useApp((s) => s.files)
  const activeFileId = useApp((s) => s.activeFileId)
  const setActiveFile = useApp((s) => s.setActiveFile)

  const mindmapTabs = React.useMemo(() => tabs.filter(t => t.type === 'mindmap'), [tabs])
  const mindmapTabsByFile = React.useMemo(() => {
    const by: Record<string, typeof mindmapTabs> = {}
    mindmapTabs.forEach(t => {
      const fid = t.fileId || 'unassigned'
      if (!by[fid]) by[fid] = [] as any
      ;(by[fid] as any).push(t)
    })
    return by
  }, [mindmapTabs])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'row', minWidth: 0 }}>
      {/*
        FR: Colonne 1 – Fichiers ouverts (liste verticale fixe, scroll indépendant)

        EN: Column 1 – Open files (fixed vertical list, independent scroll)
      */}
      <div style={{ 
        width: 200, 
        borderRight: '1px solid #e5e7eb', 
        display: 'flex', 
        flexDirection: 'column', 
        minWidth: 160,
        height: 'calc(100% + 40px)', // FR: Hauteur totale + barre d'onglets - EN: Full height + tabs bar
        backgroundColor: 'var(--panel)', // FR: Utiliser le fond du thème (fin debug) - EN: Use themed panel background (end of debug)
        color: 'var(--fg)' // FR: Forcer la couleur du texte pour garantir la lisibilité - EN: Force text color to ensure readability
      }}>
        <div style={{ padding: '8px 8px 4px', fontWeight: 600 }}>{t('Open files')}</div>
        <div style={{ padding: '0 4px 8px', overflow: 'auto' }}>
          {files.length === 0 ? (
            <div style={{ opacity: .7, padding: '4px 8px' }}>{t('No open files')}</div>
          ) : (
            files.map((file) => {
              const tabsForFile = mindmapTabsByFile[file.id] || []
              const isActive = file.id === activeFileId
              const displayName = ((): string => {
                if (file.path && typeof file.path === 'string') {
                  const p = file.path.replace(/\\/g, '/')
                  return p.split('/').filter(Boolean).pop() || file.title
                }
                return file.title || 'Sans titre' // FR: Secours si titre absent - EN: Fallback when title missing
              })()
              return (
                <button
                  key={file.id}
                  onClick={() => {
                    setActiveFile(file.id)
                    // FR: Activer un onglet de ce fichier si possible
                    // EN: Activate a tab of this file if possible
                    const first = tabsForFile[0]
                    if (first) activate(first.id)
                  }}
                  title={file.path || file.title}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '6px 8px',
                    border: 'none',
                    borderRadius: 6,
                    background: isActive ? '#fff' : 'transparent',
                    color: 'var(--fg)', // FR: Couleur explicite pour éviter l'héritage problématique - EN: Explicit color to avoid inheritance issues
                    cursor: 'pointer',
                    boxShadow: isActive ? 'inset 0 0 0 1px var(--muted)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    margin: '2px 0'
                  }}
                >
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</span>
                  {/* FR: Compteur d’onglets (feuilles) / EN: Tabs (sheets) counter */}
                  <span style={{ fontSize: 11, opacity: .7 }}>{tabsForFile.length}</span>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/*
        FR: Colonne 2 – Plan (outline) de la carte active, avec son propre scroll

        EN: Column 2 – Active map outline, with its own scroll
      */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        <div style={{ padding: 8, fontWeight: 600 }}>{t('Outline')}</div>
        <div style={{ paddingBottom: 8 }}>
          <OutlineNode node={root} />
        </div>
      </div>
    </div>
  )
}

export default SidebarLeft


