import React from 'react'
import { useTranslation } from 'react-i18next'
import { useMindMap } from '../store/mindmap'
import { useApp } from '../store/app'

const Topbar: React.FC = () => {
  const { t } = useTranslation()
  const selectedId = useMindMap((s) => s.selectedId)
  const addChild = useMindMap((s) => s.addChild)
  const addSibling = useMindMap((s) => s.addSibling)

  const openSettings = useApp((s) => s.openSettings)
  const openMindmap = useApp((s) => s.openMindmap)

  return (
    <div className="toolbar" style={{ display: 'flex', gap: 8, padding: 10, alignItems: 'center' }}>
      {/* Left: logo */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {/* Accent-colored logo using CSS mask */}
        <div
          aria-label="logo"
          style={{
            width: 88,
            height: 88,
            background: 'var(--accent)',
            WebkitMaskImage: 'url(/logo.svg)',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            WebkitMaskSize: 'contain',
            maskImage: 'url(/logo.svg)',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            maskSize: 'contain',
          }}
        />
      </div>
      {/* Center: actions */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 8 }}>
        <button className="btn" onClick={() => addChild(selectedId || 'root')}>{t('Add Child')}</button>
        <button className="btn" onClick={() => selectedId && addSibling(selectedId)}>{t('Add Sibling')}</button>
        <button className="btn" onClick={() => openMindmap()}>+ {t('MindMap')}</button>
      </div>
      {/* Right: settings */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => openSettings()} title={t('Settings')} style={{
          width: 48, height: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--accent)'
        }}>
          <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 9 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0A1.65 1.65 0 0 0 20.91 11H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Topbar


