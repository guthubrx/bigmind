/*
  SettingsPane – Paramètres utilisateur
  - Langue, thème, couleur d'accent
  - Gaps horizontaux/verticaux (avec validation différée sur blur/Enter)
  - Largeur nœuds, durée d'animation, tolérance de drag, barres latérales
  Astuce UX: on utilise un "draft" pour l'espacement horizontal afin d'éviter de
  bloquer la saisie pendant que l'utilisateur tape (ex: "45").
*/
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '../store/app'
import { applyTheme } from '../utils/themeUtils'
import { UI_CONSTANTS } from '../utils/constants'
import { commonStyles } from '../utils/styleUtils'

const SettingsPane: React.FC = () => {
  const { t } = useTranslation()
  const language = useApp((s) => s.language)
  const accentColor = useApp((s) => s.accentColor)
  const setLanguage = useApp((s) => s.setLanguage)
  const theme = useApp((s) => s.theme)
  const setTheme = useApp((s) => s.setTheme)
  const collapseMs = useApp((s) => s.collapseDurationMs)
  const setCollapseMs = useApp((s) => s.setCollapseDurationMs)
  const genGapPref = useApp((s) => s.genGapPx || UI_CONSTANTS.DEFAULT_GEN_GAP)
  const setGenGapPx = useApp((s) => s.setGenGapPx)
  const vGapPref = useApp((s) => s.vGapPx || UI_CONSTANTS.DEFAULT_V_GAP)
  const setVGapPx = useApp((s) => s.setVGapPx)
  const nodeWidthPref = useApp((s) => s.nodeWidthPx || UI_CONSTANTS.NODE_WIDTH)
  const setNodeWidthPx = useApp((s) => s.setNodeWidthPx)
  const dropTolerancePref = useApp((s) => s.dropTolerancePx || UI_CONSTANTS.DEFAULT_DROP_TOLERANCE)
  const setDropTolerancePx = useApp((s) => s.setDropTolerancePx)
  const showToggles = useApp((s) => s.showSidebarToggles)
  const setShowToggles = useApp((s) => s.setShowSidebarToggles)
  const leftSidebarOpen = useApp((s) => s.leftSidebarOpen)
  const setLeftSidebarOpen = useApp((s) => s.setLeftSidebarOpen)
  const rightSidebarOpen = useApp((s) => s.rightSidebarOpen)
  const setRightSidebarOpen = useApp((s) => s.setRightSidebarOpen)
  const leftWidth = useApp((s) => s.leftSidebarWidth)
  const setLeftWidth = useApp((s) => s.setLeftSidebarWidth)
  const rightWidth = useApp((s) => s.rightSidebarWidth)
  const setRightWidth = useApp((s) => s.setRightSidebarWidth)

  React.useEffect(() => {
    applyTheme(theme, accentColor)
  }, [theme, accentColor])

  const [genGapDraft, setGenGapDraft] = useState(genGapPref.toString())

  const handleGenGapBlur = () => {
    const num = Number(genGapDraft)
    if (num < UI_CONSTANTS.MIN_GEN_GAP) {
      alert(`La valeur minimale est ${UI_CONSTANTS.MIN_GEN_GAP}px`)
      setGenGapDraft(UI_CONSTANTS.MIN_GEN_GAP.toString())
      setGenGapPx?.(UI_CONSTANTS.MIN_GEN_GAP)
    } else {
      setGenGapPx?.(num)
    }
  }

  const handleGenGapKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenGapBlur()
    }
  }

  return (
    <div style={{ height: '100%', padding: 16, color: 'var(--fg)' }}>
      <h2 style={{ margin: '0 0 16px 0' }}>Paramètres</h2>
      
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>Langue</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={commonStyles.input}>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>Thème</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)} style={commonStyles.input}>
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
            <option value="nord">Nord</option>
            <option value="gruvbox">Gruvbox</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>Couleur d'accent</label>
          <input
            type="color"
            value={accentColor}
            onChange={(e) => useApp.getState().setAccentColor(e.target.value)}
            style={{ width: 40, height: 40, border: 'none', borderRadius: 4, cursor: 'pointer' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>Durée d'animation (ms)</label>
          <input
            type="number"
            value={collapseMs}
            onChange={(e) => setCollapseMs(Number(e.target.value))}
            style={commonStyles.input}
            min="0"
            max="2000"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>Espacement horizontal entre générations (px)</label>
          <input
            type="number"
            value={genGapDraft}
            onChange={(e) => setGenGapDraft(e.target.value)}
            onBlur={handleGenGapBlur}
            onKeyDown={handleGenGapKeyDown}
            style={commonStyles.input}
            min={UI_CONSTANTS.MIN_GEN_GAP}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>Espacement vertical (px)</label>
          <input
            type="number"
            value={vGapPref}
            onChange={(e) => setVGapPx?.(Number(e.target.value))}
            style={commonStyles.input}
            min="10"
            max="100"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>Largeur des nœuds (px)</label>
          <input
            type="number"
            value={nodeWidthPref}
            onChange={(e) => setNodeWidthPx?.(Number(e.target.value))}
            style={commonStyles.input}
            min="80"
            max="300"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>Tolérance de glisser-déposer (px)</label>
          <input
            type="number"
            value={dropTolerancePref}
            onChange={(e) => setDropTolerancePx(Number(e.target.value))}
            style={commonStyles.input}
            min="5"
            max="50"
          />
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={showToggles}
              onChange={(e) => setShowToggles(e.target.checked)}
            />
            Afficher les boutons de toggle
          </label>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={leftSidebarOpen}
              onChange={(e) => setLeftSidebarOpen(e.target.checked)}
            />
            Afficher la barre latérale gauche
          </label>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={rightSidebarOpen}
              onChange={(e) => setRightSidebarOpen(e.target.checked)}
            />
            Afficher la barre latérale droite
          </label>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>Largeur barre gauche (px)</label>
          <input
            type="range"
            value={leftWidth}
            onChange={(e) => setLeftWidth(Number(e.target.value))}
            min={UI_CONSTANTS.MIN_SIDEBAR_WIDTH}
            max={UI_CONSTANTS.MAX_SIDEBAR_WIDTH}
            style={{ width: '100%' }}
          />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{leftWidth}px</span>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>Largeur barre droite (px)</label>
          <input
            type="range"
            value={rightWidth}
            onChange={(e) => setRightWidth(Number(e.target.value))}
            min={UI_CONSTANTS.MIN_SIDEBAR_WIDTH}
            max={UI_CONSTANTS.MAX_SIDEBAR_WIDTH}
            style={{ width: '100%' }}
          />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{rightWidth}px</span>
        </div>
      </div>
    </div>
  )
}

export default SettingsPane
