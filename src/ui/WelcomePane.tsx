/*
  WelcomePane – Écran d'accueil
  - Propose: Nouvelle carte, Ouvrir une carte, Paramètres
  - Affiche les fichiers récents (en desktop seulement).
  - Quand on ouvre un fichier .xmind: on crée un onglet par feuille.
*/
import React from 'react'
import { useApp } from '../store/app'
import { useMindMap } from '../store/mindmap'
import { useTranslation } from 'react-i18next'
import { openFile, openRecentByPath } from '../utils/fileUtils'
import { isWeb } from '../utils/env'
import { commonStyles } from '../utils/styleUtils'

const WelcomePane: React.FC = () => {
  const { t } = useTranslation()
  const openMindmap = useApp((s) => s.openMindmap)
  const openSettings = useApp((s) => s.openSettings)
  const recents = useApp((s) => s.recentFiles)
  const updateTabMap = useApp((s) => s.updateTabMap)
  const setTabSaved = useApp((s) => s.setTabSaved)
  const closeTab = useApp((s) => s.closeTab)
  const tabs = useApp((s) => s.tabs)
  const addRecentFile = useApp((s) => s.addRecentFile)
  const ensureFile = useApp((s) => s.ensureFile)
  const setActiveFile = useApp((s) => s.setActiveFile)
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ ...commonStyles.card, display: 'grid', gap: 16 }}>
        <h2 style={{ margin: 0 }}>{t('Bienvenue')}</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => openMindmap()} style={commonStyles.button}>{t('Nouvelle carte')}</button>
          <button onClick={async () => {
            /*
              FR: Ouverture d'un fichier depuis l'écran d'accueil: créer un onglet par feuille,
              charger la première dans le store, puis fermer l'onglet "welcome".

              EN: Opening a file from the welcome screen: create one tab per sheet,
              load the first into the store, then close the "welcome" tab.
            */
            const result = await openFile()
            if (!result) return
            const { sheets, fileName } = result
            // FR: Créer un fichier dans le store pour ce fichier ouvert
            // EN: Create a file in the store for this opened file
            const fileId = ensureFile({ title: fileName, path: fileName })
            setActiveFile(fileId)
            // Open one tab per sheet
            let firstId: string | null = null
            for (const s of sheets) {
              const id = openMindmap(s.title, fileId)
              if (!firstId) firstId = id
              updateTabMap(id, s.root)
              setTabSaved(id, s.root)
              addRecentFile({ path: fileName, title: s.title, thumbnailDataUrl: undefined })
            }
            // Load the first sheet into the mindmap store (active tab already points to it)
            const active = firstId || useApp.getState().activeTabId
            const sheet0 = sheets[0]
            if (active && sheet0) {
              useMindMap.setState({ root: sheet0.root, past: [], future: [], selectedId: null })
            }
            // Close welcome tab if present
            const welcome = (tabs || useApp.getState().tabs).find(t => t.type === 'welcome')
            if (welcome) closeTab(welcome.id)
          }} style={commonStyles.button}>{t('Ouvrir une carte')}</button>
          <button onClick={() => openSettings()} style={commonStyles.button}>{t('Paramètres')}</button>
        </div>
        <div>
          {!isWeb() && <h4 style={{ margin: '8px 0' }}>{t('Récents')}</h4>}
          {!isWeb() && recents && recents.length ? (
            <div style={{ display: 'grid', gap: 8 }}>
              {recents.map((f, i) => (
                <div
                  key={f.path + i}
                  style={{ ...commonStyles.recentFileItem, cursor: 'pointer' }}
                  title={f.path}
                  onClick={async () => {
                    /*
                      FR: Ouverture d'un fichier récent: même logique que ci-dessus, puis
                      fermeture de l'onglet "welcome" s'il est présent.

                      EN: Opening a recent file: same logic as above, then close the
                      "welcome" tab if present.
                    */
                    const result = await openRecentByPath(f.path)
                    if (!result) return
                    const { sheets, fileName } = result
                    let firstId: string | null = null
                    for (const s of sheets) {
                      const id = openMindmap(s.title)
                      if (!firstId) firstId = id
                      updateTabMap(id, s.root)
                      setTabSaved(id, s.root)
                      addRecentFile({ path: fileName, title: s.title, thumbnailDataUrl: undefined })
                    }
                    const active = firstId || useApp.getState().activeTabId
                    const sheet0 = sheets[0]
                    if (active && sheet0) {
                      useMindMap.setState({ root: sheet0.root, past: [], future: [], selectedId: null })
                    }
                    // Close welcome tab if present
                    const welcome = (tabs || useApp.getState().tabs).find(t => t.type === 'welcome')
                    if (welcome) closeTab(welcome.id)
                  }}
                >
                  {f.thumbnailDataUrl ? 
                    <img src={f.thumbnailDataUrl} alt="thumb" style={commonStyles.recentFileThumbnail} /> : 
                    <div style={commonStyles.recentFilePlaceholder} />
                  }
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>{f.title || f.path.split('/').pop()}</span>
                    <span className="tag-muted" style={{ fontSize: 12 }}>{new Date(f.openedAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : !isWeb() ? (
            <span className="tag-muted">{t('Aucun fichier récent')}</span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default WelcomePane


