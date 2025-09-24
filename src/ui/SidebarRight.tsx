import React from 'react'
import { useTranslation } from 'react-i18next'
import { useMindMap } from '../store/mindmap'

const SidebarRight: React.FC = () => {
  const { t } = useTranslation()
  const root = useMindMap((s) => s.root)
  const selectedId = useMindMap((s) => s.selectedId)
  const select = useMindMap((s) => s.select)

  const find = (node: any, id: string): any | null => {
    if (node.id === id) return node
    for (const c of node.children || []) {
      const r = find(c, id)
      if (r) return r
    }
    return null
  }

  const current = selectedId ? find(root, selectedId) : null
  const rename = useMindMap((s) => s.rename)
  const [localLabel, setLocalLabel] = React.useState<string>('')

  React.useEffect(() => {
    setLocalLabel(current?.label || '')
  }, [current?.id, current?.label])

  return (
    <div style={{ height: '100%', padding: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{t('Properties')}</div>
      {!current ? (
        <div style={{ opacity: 0.7 }}>{t('No node selected')}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ fontSize: 12, opacity: 0.8 }}>{t('ID')}</label>
          <input value={current.id} readOnly />

          <label style={{ fontSize: 12, opacity: 0.8 }}>{t('Label')}</label>
          <input
            value={localLabel}
            onChange={(e) => setLocalLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                rename(current.id, localLabel.trim() || current.label)
                e.currentTarget.blur()
              }
            }}
            onBlur={() => rename(current.id, localLabel.trim() || current.label)}
          />

          <label style={{ fontSize: 12, opacity: 0.8 }}>Note</label>
          <textarea
            rows={6}
            defaultValue={current.note || ''}
            onBlur={(e) => useMindMap.getState().setNote(current.id, e.target.value)}
          />

          <label style={{ fontSize: 12, opacity: 0.8 }}>{t('Link')}</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input placeholder="https://" id="link-input" />
            <button className="btn" onClick={() => {
              const el = (document.getElementById('link-input') as HTMLInputElement)
              const url = el?.value.trim()
              if (url) useMindMap.getState().addLink(current.id, url)
              if (el) el.value = ''
            }}>Add</button>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {(current.links || []).map((u: string) => (
              <div key={u} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href={u} target="_blank" rel="noreferrer">{u}</a>
                <button className="icon-btn" onClick={() => useMindMap.getState().removeLink(current.id, u)}>×</button>
              </div>
            ))}
          </div>

          <label style={{ fontSize: 12, opacity: 0.8 }}>Task</label>
          <select value={current.task || 'todo'} onChange={(e) => useMindMap.getState().setTask(current.id, e.target.value as any)}>
            <option value="todo">To‑do</option>
            <option value="doing">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      )}
    </div>
  )
}

export default SidebarRight


