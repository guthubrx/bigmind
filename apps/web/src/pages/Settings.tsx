import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnSizeSettings } from '../components/ColumnSizeSettings';
import FileTabs from '../components/FileTabs';
import MenuBar from '../components/MenuBar';
import StatusBar from '../components/StatusBar';
import { useAppSettings } from '../hooks/useAppSettings';
import { useColumnResize } from '../hooks/useColumnResize';
import '../layouts/MainLayout.css';
import { getPastelBackground } from '../utils/colorUtils';
import './Settings.css';
import { AppearanceSection } from './SettingsAppearanceSection';
import { InteractionSection } from './SettingsInteractionSection';
import { ShortcutsSection } from './SettingsShortcutsSection';
// Phase 2 imports
import { ThemeSelector } from '../components/ThemeSelector';
import { TemplateGallery } from '../components/TemplateGallery';

type SettingsSection = 'appearance' | 'interface' | 'interaction' | 'shortcuts' | 'themes' | 'templates';

function SettingsPage() {
  const navigate = useNavigate();
  const [section, setSection] = useState<SettingsSection>('appearance');

  // Hooks pour les paramètres
  const accentColor = useAppSettings((s) => s.accentColor);
  const setAccentColor = useAppSettings((s) => s.setAccentColor);
  const selectedPalette = useAppSettings((s) => s.selectedPalette);
  const setSelectedPalette = useAppSettings((s) => s.setSelectedPalette);
  const dragTolerance = useAppSettings((s) => s.dragTolerance);
  const setDragTolerance = useAppSettings((s) => s.setDragTolerance);
  const columnBorderThickness = useAppSettings((s) => s.columnBorderThickness);
  const setColumnBorderThickness = useAppSettings((s) => s.setColumnBorderThickness);

  // Hook pour le redimensionnement des colonnes
  const {
    columnSizes,
    updateColumnSize,
    resetColumnSizes,
    COLUMN_SIZE_LIMITS
  } = useColumnResize();

  // Utilitaires
  const pastelBg = (alpha: number = 0.06) => getPastelBackground(accentColor, alpha);

  return (
    <div className="main-layout">
      <div className="frameset-vertical-1">
        <div className="menu-bar-container">
          <MenuBar isSettingsPage={true} onBack={() => navigate('/')} />
        </div>

        {/* FR: Barre d'onglets normale pour l'écran des paramètres */}
        {/* EN: Normal tab bar for settings screen */}
        <div className="tab-bar-container">
          <FileTabs type="tab-bar" />
        </div>

        <div style={{ padding: 16, flex: '1 1 auto', overflow: 'hidden' }}>
          <div className="settings-layout">
            {/* Sidebar */}
            <aside className="settings-nav">
              <div className="settings-nav-header">Paramètres</div>
              <nav>
                <button
                  type="button"
                  className={`settings-nav-button ${section === 'appearance' ? 'active' : ''}`}
                  onClick={() => setSection('appearance')}
                >
                  Apparence
                </button>
                <button
                  type="button"
                  className={`settings-nav-button ${section === 'interface' ? 'active' : ''}`}
                  onClick={() => setSection('interface')}
                >
                  Interface
                </button>
                <button
                  type="button"
                  className={`settings-nav-button ${section === 'interaction' ? 'active' : ''}`}
                  onClick={() => setSection('interaction')}
                >
                  Interaction
                </button>
                <button
                  type="button"
                  className={`settings-nav-button ${section === 'shortcuts' ? 'active' : ''}`}
                  onClick={() => setSection('shortcuts')}
                >
                  Raccourcis clavier
                </button>
                {/* Phase 2 sections */}
                <button
                  type="button"
                  className={`settings-nav-button ${section === 'themes' ? 'active' : ''}`}
                  onClick={() => setSection('themes')}
                >
                  🎨 Thèmes
                </button>
                <button
                  type="button"
                  className={`settings-nav-button ${section === 'templates' ? 'active' : ''}`}
                  onClick={() => setSection('templates')}
                >
                  📑 Templates
                </button>
              </nav>
            </aside>

            {/* Content */}
            <section className="settings-content">
              {section === 'appearance' && (
                <AppearanceSection
                  accentColor={accentColor}
                  setAccentColor={setAccentColor}
                  selectedPalette={selectedPalette}
                  setSelectedPalette={setSelectedPalette}
                  pastelBg={pastelBg}
                />
              )}

              {section === 'interface' && (
                <ColumnSizeSettings
                  columnSizes={columnSizes}
                  onSizeChange={updateColumnSize}
                  onReset={resetColumnSizes}
                  sizeLimits={COLUMN_SIZE_LIMITS}
                  accentColor={accentColor}
                  borderThickness={columnBorderThickness}
                  onBorderThicknessChange={setColumnBorderThickness}
                />
              )}

              {section === 'interaction' && (
                <InteractionSection
                  dragTolerance={dragTolerance}
                  setDragTolerance={setDragTolerance}
                  accentColor={accentColor}
                  pastelBg={pastelBg}
                />
              )}

              {section === 'shortcuts' && (
                <ShortcutsSection pastelBg={pastelBg} />
              )}

              {/* Phase 2 Thèmes */}
              {section === 'themes' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-6">🎨 Thèmes</h2>
                  <p className="text-gray-600 mb-6">Sélectionnez ou créez un thème pour personnaliser votre interface.</p>
                  <ThemeSelector onThemeSelect={(theme) => console.log('Thème sélectionné:', theme.name)} />
                </div>
              )}

              {/* Phase 2 Templates */}
              {section === 'templates' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-6">📑 Templates</h2>
                  <p className="text-gray-600 mb-6">Démarrez une nouvelle carte mentale avec un template prédéfini ou personnalisé.</p>
                  <TemplateGallery onTemplateSelect={(mindMap) => {
                    console.log('Template sélectionné:', mindMap.meta.name);
                  }} />
                </div>
              )}
            </section>
          </div>
        </div>
        <div className="status-bar-container">
          <StatusBar />
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;


