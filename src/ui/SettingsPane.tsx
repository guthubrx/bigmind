/*
  SettingsPane – Paramètres utilisateur style macOS
  - Interface moderne inspirée de macOS System Settings
  - Support des modes clair et sombre
  - Navigation latérale avec sections organisées
*/
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '../store/app'
import { applyTheme } from '../utils/themeUtils'
import { UI_CONSTANTS } from '../utils/constants'

const SettingsPane: React.FC = () => {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = React.useState('interface')
  
  // FR: États des paramètres - EN: Settings states
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
  const dropTolerancePref = useApp((s) => s.dropTolerancePx || UI_CONSTANTS.DROP_TOLERANCE)
  const setDropTolerancePx = useApp((s) => s.setDropTolerancePx)
  const showToggles = useApp((s) => s.showSidebarToggles)
  const setShowToggles = useApp((s) => s.setShowSidebarToggles)
  const leftSidebarOpen = useApp((s) => s.leftSidebarOpen)
  const setLeftSidebarOpen = useApp((s) => s.setLeftSidebarOpen)
  const rightSidebarOpen = useApp((s) => s.rightSidebarOpen)
  const setRightSidebarOpen = useApp((s) => s.setRightSidebarOpen)
  const leftWidth = useApp((s) => s.leftWidth)
  const setLeftWidth = useApp((s) => s.setLeftWidth)
  const rightWidth = useApp((s) => s.rightWidth)
  const setRightWidth = useApp((s) => s.setRightWidth)
  const tabActiveColor = useApp((s) => s.tabActiveColor)
  const setTabActiveColor = useApp((s) => s.setTabActiveColor)
  const tabInactiveColor = useApp((s) => s.tabInactiveColor)
  const setTabInactiveColor = useApp((s) => s.setTabInactiveColor)
  const tabBarBackgroundColor = useApp((s) => s.tabBarBackgroundColor)
  const setTabBarBackgroundColor = useApp((s) => s.setTabBarBackgroundColor)
  const checkUpdates = useApp((s) => s.checkUpdates)
  const setCheckUpdates = useApp((s) => s.setCheckUpdates)

  // FR: Sections de paramètres - EN: Settings sections
  const sections = [
    { id: 'interface', title: 'Interface', icon: '⚙' },
    { id: 'animation', title: 'Animation et Performance', icon: '⚡' },
    { id: 'sidebars', title: 'Barres latérales', icon: '📱' },
    { id: 'colors', title: 'Couleurs des onglets', icon: '🎨' },
    { id: 'privacy', title: 'Confidentialité', icon: '🔒' }
  ]

  // FR: Styles macOS - EN: macOS styles
  const labelStyle = {
    display: 'block' as const,
    marginBottom: '8px',
    color: 'var(--fg)',
    fontWeight: '500' as const,
    fontSize: '14px'
  }

  const inputStyle = {
    background: 'var(--panel)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '8px 12px',
    color: 'var(--fg)',
    fontSize: '14px',
    fontWeight: '400' as const,
    transition: 'all 0.2s ease',
    width: '100%',
    boxSizing: 'border-box' as const
  }

  const groupStyle = {
    background: 'var(--panel)',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid var(--border)',
    marginBottom: '20px'
  }

  const groupTitleStyle = {
    fontSize: '16px',
    fontWeight: '600' as const,
    margin: '0 0 16px 0',
    color: 'var(--fg)'
  }

  return (
    <div style={{ 
      height: '100%',
      display: 'flex',
      color: 'var(--fg)',
      background: 'var(--bg)',
      position: 'relative'
    }}>
      {/* FR: Navigation latérale style macOS - EN: macOS-style sidebar navigation */}
      <div style={{
        width: 240,
        background: 'var(--panel)',
        borderRight: '1px solid var(--border)',
        padding: '0',
        overflow: 'auto',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ 
          padding: '20px 16px 16px',
          borderBottom: '1px solid var(--border)'
        }}>
          <h2 style={{ 
            margin: '0', 
            fontSize: '20px', 
            fontWeight: '600',
            color: 'var(--fg)'
          }}>
            Paramètres
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                padding: '12px 16px',
                background: activeSection === section.id 
                  ? 'var(--accent)' 
                  : 'transparent',
                color: activeSection === section.id ? 'white' : 'var(--fg)',
                border: 'none',
                borderRadius: '0',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeSection === section.id ? '600' : '400',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                position: 'relative',
                width: '100%',
                borderLeft: activeSection === section.id ? '3px solid var(--accent)' : '3px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.background = 'var(--muted)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{section.icon}</span>
              <span>{section.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FR: Contenu de la section active - EN: Active section content */}
      <div style={{ 
        flex: 1, 
        padding: '20px', 
        overflow: 'auto',
        background: 'var(--bg)'
      }}>
        {/* FR: Section Interface - EN: Interface section */}
        {activeSection === 'interface' && (
          <div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              margin: '0 0 8px 0', 
              color: 'var(--fg)' 
            }}>
              Interface
            </h1>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--muted-foreground)', 
              margin: '0 0 24px 0' 
            }}>
              Personnalisez l'apparence et le comportement de l'interface
            </p>
            
            <div style={groupStyle}>
              <h3 style={groupTitleStyle}>Apparence</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Langue</label>
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)} 
                    style={inputStyle}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Thème</label>
                  <select value={theme} onChange={(e) => setTheme(e.target.value)} style={inputStyle}>
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                    <option value="nord">Nord</option>
                    <option value="gruvbox">Gruvbox</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Couleur d'accent</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => useApp.getState().setAccentColor(e.target.value)}
                      style={{ 
                        width: 32, 
                        height: 32, 
                        border: '1px solid var(--border)', 
                        borderRadius: 4, 
                        cursor: 'pointer',
                        background: 'var(--panel)'
                      }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{accentColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FR: Section Animation et Performance - EN: Animation and Performance section */}
        {activeSection === 'animation' && (
          <div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              margin: '0 0 8px 0', 
              color: 'var(--fg)' 
            }}>
              Animation et Performance
            </h1>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--muted-foreground)', 
              margin: '0 0 24px 0' 
            }}>
              Ajustez les paramètres d'animation et de performance
            </p>
            
            <div style={groupStyle}>
              <h3 style={groupTitleStyle}>Animation</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Durée d'animation (ms)</label>
                  <input
                    type="number"
                    value={collapseMs}
                    onChange={(e) => setCollapseMs(Number(e.target.value))}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div style={groupStyle}>
              <h3 style={groupTitleStyle}>Espacement</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Espacement horizontal (px)</label>
                  <input
                    type="number"
                    value={genGapPref}
                    onChange={(e) => setGenGapPx(Number(e.target.value))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Espacement vertical (px)</label>
                  <input
                    type="number"
                    value={vGapPref}
                    onChange={(e) => setVGapPx(Number(e.target.value))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Largeur des nœuds (px)</label>
                  <input
                    type="number"
                    value={nodeWidthPref}
                    onChange={(e) => setNodeWidthPx(Number(e.target.value))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Tolérance de drag (px)</label>
                  <input
                    type="number"
                    value={dropTolerancePref}
                    onChange={(e) => setDropTolerancePx(Number(e.target.value))}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FR: Section Barres latérales - EN: Sidebars section */}
        {activeSection === 'sidebars' && (
          <div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              margin: '0 0 8px 0', 
              color: 'var(--fg)' 
            }}>
              Barres latérales
            </h1>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--muted-foreground)', 
              margin: '0 0 24px 0' 
            }}>
              Configurez l'affichage et le comportement des barres latérales
            </p>
            
            <div style={groupStyle}>
              <h3 style={groupTitleStyle}>Affichage</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, ...labelStyle, marginBottom: 0 }}>
                    <input
                      type="checkbox"
                      checked={showToggles}
                      onChange={(e) => setShowToggles(e.target.checked)}
                      style={{ transform: 'scale(1.2)' }}
                    />
                    Afficher les boutons d'ouverture/fermeture
                  </label>
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, ...labelStyle, marginBottom: 0 }}>
                    <input
                      type="checkbox"
                      checked={leftSidebarOpen}
                      onChange={(e) => setLeftSidebarOpen(e.target.checked)}
                      style={{ transform: 'scale(1.2)' }}
                    />
                    Ouvrir la barre latérale gauche au démarrage
                  </label>
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, ...labelStyle, marginBottom: 0 }}>
                    <input
                      type="checkbox"
                      checked={rightSidebarOpen}
                      onChange={(e) => setRightSidebarOpen(e.target.checked)}
                      style={{ transform: 'scale(1.2)' }}
                    />
                    Ouvrir la barre latérale droite au démarrage
                  </label>
                </div>
              </div>
            </div>

            <div style={groupStyle}>
              <h3 style={groupTitleStyle}>Dimensions</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Largeur barre latérale gauche (px)</label>
                  <input
                    type="number"
                    value={leftWidth}
                    onChange={(e) => setLeftWidth(Number(e.target.value))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Largeur barre latérale droite (px)</label>
                  <input
                    type="number"
                    value={rightWidth}
                    onChange={(e) => setRightWidth(Number(e.target.value))}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FR: Section Couleurs des onglets - EN: Tab colors section */}
        {activeSection === 'colors' && (
          <div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              margin: '0 0 8px 0', 
              color: 'var(--fg)' 
            }}>
              Couleurs des onglets
            </h1>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--muted-foreground)', 
              margin: '0 0 24px 0' 
            }}>
              Personnalisez les couleurs de la barre d'onglets
            </p>
            
            <div style={groupStyle}>
              <h3 style={groupTitleStyle}>Couleurs</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Couleur onglet actif</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="color"
                      value={tabActiveColor}
                      onChange={(e) => setTabActiveColor(e.target.value)}
                      style={{ 
                        width: 32, 
                        height: 32, 
                        border: '1px solid var(--border)', 
                        borderRadius: 4, 
                        cursor: 'pointer',
                        background: 'var(--panel)'
                      }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{tabActiveColor}</span>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Couleur onglets inactifs</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="color"
                      value={tabInactiveColor}
                      onChange={(e) => setTabInactiveColor(e.target.value)}
                      style={{ 
                        width: 32, 
                        height: 32, 
                        border: '1px solid var(--border)', 
                        borderRadius: 4, 
                        cursor: 'pointer',
                        background: 'var(--panel)'
                      }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{tabInactiveColor}</span>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Couleur fond barre d'onglets</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="color"
                      value={tabBarBackgroundColor}
                      onChange={(e) => setTabBarBackgroundColor(e.target.value)}
                      style={{ 
                        width: 32, 
                        height: 32, 
                        border: '1px solid var(--border)', 
                        borderRadius: 4, 
                        cursor: 'pointer',
                        background: 'var(--panel)'
                      }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{tabBarBackgroundColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FR: Section Confidentialité - EN: Privacy section */}
        {activeSection === 'privacy' && (
          <div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              margin: '0 0 8px 0', 
              color: 'var(--fg)' 
            }}>
              Confidentialité
            </h1>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--muted-foreground)', 
              margin: '0 0 24px 0' 
            }}>
              Contrôlez les communications réseau facultatives.
            </p>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={checkUpdates} onChange={(e) => setCheckUpdates(e.target.checked)} />
                Autoriser la vérification des mises à jour (GitHub Releases)
              </label>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 8 }}>
                Quand désactivé, BigMind reste entièrement hors-ligne et n'effectue aucune requête vers GitHub.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsPane