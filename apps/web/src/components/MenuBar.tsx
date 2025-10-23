/**
 * FR: Barre de menu de BigMind
 * EN: BigMind menu bar
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Edit,
  Eye,
  Plus,
  Palette,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { usePlatform, formatShortcut } from '../hooks/usePlatform';
import { useFileOperations } from '../hooks/useFileOperations';
import { useOpenFiles } from '../hooks/useOpenFiles';
import { toast } from '../utils/toast';
import './MenuBar.css';
// import { useAppSettings } from '../hooks/useAppSettings.ts';

interface MenuBarProps {
  isSettingsPage?: boolean;
  onBack?: () => void;
}

function MenuBar({ isSettingsPage = false, onBack }: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuTimeout, setMenuTimeout] = useState<NodeJS.Timeout | null>(null);
  // const accentColor = useAppSettings((s) => s.accentColor);
  const platformInfo = usePlatform();
  const {
    openFileDialog,
    openFile,
    createNew,
    exportActiveXMind,
    saveAsXMind,
    exportToFreeMind,
    exportToPDF,
    exportToPNG,
    exportToJPEG,
    exportToSVG,
    exportToMarkdown,
    exportToWord,
    exportToExcel,
  } = useFileOperations();
  const { closeFile, getActiveFile } = useOpenFiles();
  const navigate = useNavigate();

  // FR: Raccourcis adaptés selon la plateforme
  // EN: Shortcuts adapted according to platform
  const getShortcut = (shortcut: string) => formatShortcut(shortcut, platformInfo);

  // FR: Gestion du délai pour les menus
  // EN: Menu delay management
  const handleMenuEnter = (menuId: string) => {
    if (menuTimeout) {
      clearTimeout(menuTimeout);
      setMenuTimeout(null);
    }
    setActiveMenu(menuId);
  };

  const handleMenuLeave = () => {
    const timeout = setTimeout(() => {
      setActiveMenu(null);
    }, 800); // FR: 800ms de délai avant de fermer (augmenté pour permettre la navigation vers les sous-menus)
    setMenuTimeout(timeout);
  };

  const handleSubmenuEnter = () => {
    if (menuTimeout) {
      clearTimeout(menuTimeout);
      setMenuTimeout(null);
    }
  };

  const handleSubmenuLeave = () => {
    const timeout = setTimeout(() => {
      setActiveMenu(null);
    }, 200); // FR: Délai plus court pour fermer quand on quitte le sous-menu
    setMenuTimeout(timeout);
  };

  // FR: Nettoyer le timeout au démontage du composant
  // EN: Clean up timeout on component unmount
  useEffect(
    () => () => {
      if (menuTimeout) {
        clearTimeout(menuTimeout);
      }
    },
    [menuTimeout]
  );

  // FR: Gestionnaire pour les actions de menu
  // EN: Handler for menu actions
  const handleMenuAction = async (action: string) => {
    try {
      // console.warn(`Action menu: ${action}`);
      switch (action) {
        case 'Nouveau':
          // console.warn('Create new file');
          createNew();
          break;
        case 'Ouvrir...': {
          // console.warn('Open file...');
          const file = await openFileDialog();
          if (file) {
            // console.warn(`Selected file: ${file.name} (${file.size} bytes)`);
            await openFile(file);
            // console.warn('File opened');
          } else {
            // console.warn('No file selected');
          }
          break;
        }
        case 'Fermer': {
          // console.warn('Close file...');
          const activeFile = getActiveFile();
          if (activeFile) {
            closeFile(activeFile.id);
            // console.warn('File closed');
          } else {
            // console.warn('No active file to close');
          }
          break;
        }
        case 'Sauvegarder':
          // console.warn('Save file...');
          try {
            await exportActiveXMind();
            // console.warn('File saved');
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            toast.error(`Erreur lors de la sauvegarde: ${message}`);
          }
          break;
        case 'Sauvegarder sous...':
          // console.warn('Save file as...');
          try {
            await saveAsXMind();
            // console.warn('File saved as');
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            toast.error(`Erreur lors de la sauvegarde: ${message}`);
          }
          break;
        case 'FreeMind (.mm)':
          try {
            await exportToFreeMind();
            toast.success('Fichier .mm téléchargé avec succès !');
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            toast.error(`Erreur lors de l'export vers FreeMind: ${message}`);
          }
          break;
        case 'PDF':
          try {
            await exportToPDF();
            toast.success('Fichier PDF téléchargé avec succès !');
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            toast.error(`Erreur lors de l'export vers PDF: ${message}`);
          }
          break;
        case 'PNG': {
          try {
            await exportToPNG();
            toast.success('Fichier PNG téléchargé avec succès !');
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            toast.error(`Erreur lors de l'export vers PNG: ${message}`);
          }
          break;
        }
        case 'JPEG': {
          try {
            await exportToJPEG();
            toast.success('Fichier JPEG téléchargé avec succès !');
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            toast.error(`Erreur lors de l'export vers JPEG: ${message}`);
          }
          break;
        }
        case 'SVG':
          try {
            await exportToSVG();
            toast.success('Fichier SVG téléchargé avec succès !');
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            toast.error(`Erreur lors de l'export vers SVG: ${message}`);
          }
          break;
        case 'Markdown':
          try {
            await exportToMarkdown();
            toast.success('Fichier Markdown téléchargé avec succès !');
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            toast.error(`Erreur lors de l'export vers Markdown: ${message}`);
          }
          break;
        case 'Word (.docx)':
          try {
            await exportToWord();
            toast.success('Fichier Word téléchargé avec succès !');
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            toast.error(`Erreur lors de l'export vers Word: ${message}`);
          }
          break;
        case 'Excel (.xlsx)':
          try {
            await exportToExcel();
            toast.success('Fichier Excel téléchargé avec succès !');
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            toast.error(`Erreur lors de l'export vers Excel: ${message}`);
          }
          break;
        default:
        // console.warn(`Action: ${action}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Erreur lors de l'action "${action}": ${message}`);
    }
    setActiveMenu(null);
  };

  const menuItems = [
    {
      id: 'file',
      label: 'Fichier',
      icon: FileText,
      items: [
        { label: 'Nouveau', shortcut: getShortcut('Ctrl+N') },
        { label: 'Ouvrir...', shortcut: getShortcut('Ctrl+O') },
        { label: 'Fermer', shortcut: getShortcut('Ctrl+W') },
        { label: 'Sauvegarder', shortcut: getShortcut('Ctrl+S') },
        { label: 'Sauvegarder sous...', shortcut: getShortcut('Ctrl+Shift+S') },
        {
          label: 'Exporter vers',
          shortcut: getShortcut('Ctrl+E'),
          submenu: [
            { label: 'FreeMind (.mm)' },
            { label: 'PDF' },
            { label: 'PNG' },
            { label: 'JPEG' },
            { label: 'SVG' },
            { label: 'Markdown' },
            { label: 'Word (.docx)' },
            { label: 'Excel (.xlsx)' },
          ],
        },
        { label: 'Imprimer...', shortcut: getShortcut('Ctrl+P') },
      ],
    },
    {
      id: 'edit',
      label: 'Édition',
      icon: Edit,
      items: [
        { label: 'Annuler', shortcut: getShortcut('Ctrl+Z') },
        { label: 'Refaire', shortcut: getShortcut('Ctrl+Y') },
        { label: 'Couper', shortcut: getShortcut('Ctrl+X') },
        { label: 'Copier', shortcut: getShortcut('Ctrl+C') },
        { label: 'Coller', shortcut: getShortcut('Ctrl+V') },
        { label: 'Supprimer', shortcut: 'Suppr' },
        { label: 'Sélectionner tout', shortcut: getShortcut('Ctrl+A') },
      ],
    },
    {
      id: 'view',
      label: 'Affichage',
      icon: Eye,
      items: [
        { label: 'Zoom avant', shortcut: getShortcut('Ctrl++') },
        { label: 'Zoom arrière', shortcut: getShortcut('Ctrl+-') },
        { label: 'Zoom normal', shortcut: getShortcut('Ctrl+0') },
        { label: 'Ajuster à la fenêtre', shortcut: getShortcut('Ctrl+Shift+0') },
        { label: 'Plein écran', shortcut: 'F11' },
      ],
    },
    {
      id: 'insert',
      label: 'Insertion',
      icon: Plus,
      items: [
        { label: 'Nouveau nœud', shortcut: 'Entrée' },
        { label: 'Nouveau nœud enfant', shortcut: 'Tab' },
        { label: 'Nouveau nœud parent', shortcut: 'Shift+Tab' },
        { label: 'Image...', shortcut: getShortcut('Ctrl+I') },
        { label: 'Lien...', shortcut: getShortcut('Ctrl+L') },
      ],
    },
    {
      id: 'format',
      label: 'Format',
      icon: Palette,
      items: [
        { label: 'Police...', shortcut: getShortcut('Ctrl+Shift+F') },
        { label: 'Couleur...', shortcut: getShortcut('Ctrl+Shift+C') },
        { label: 'Style...', shortcut: getShortcut('Ctrl+Shift+S') },
        { label: 'Alignement...', shortcut: getShortcut('Ctrl+Shift+A') },
      ],
    },
    {
      id: 'tools',
      label: 'Outils',
      icon: Settings,
      items: [
        { label: 'Préférences...', shortcut: getShortcut('Ctrl+,') },
        { label: 'Thèmes...', shortcut: getShortcut('Ctrl+Shift+T') },
        { label: 'Plugins...', shortcut: getShortcut('Ctrl+Shift+P') },
      ],
    },
    {
      id: 'help',
      label: 'Aide',
      icon: HelpCircle,
      items: [
        { label: 'Documentation', shortcut: 'F1' },
        { label: 'Raccourcis clavier', shortcut: getShortcut('Ctrl+?') },
        { label: 'À propos', shortcut: getShortcut('Ctrl+Shift+A') },
      ],
    },
  ];

  return (
    <div
      className="menu-bar"
      style={{ justifyContent: 'flex-start', padding: '0 16px', width: '100%' }}
    >
      <div className="menu-logo" />
      {menuItems.map(menu => (
        <div
          key={menu.id}
          className={`menu-item ${activeMenu === menu.id ? 'active' : ''}`}
          onMouseEnter={() => handleMenuEnter(menu.id)}
          onMouseLeave={handleMenuLeave}
        >
          <button type="button" className="menu-button">
            <menu.icon className="icon-small" />
            <span>{menu.label}</span>
            <ChevronDown className="icon-small" />
          </button>

          {activeMenu === menu.id && (
            <div className="menu-dropdown">
              {menu.items.map(item => (
                <div key={item.label}>
                  {item.submenu ? (
                    // FR: Élément avec sous-menu
                    // EN: Item with submenu
                    <div className="menu-item-option has-submenu" onMouseEnter={handleSubmenuEnter}>
                      <span className="menu-item-label">{item.label}</span>
                      <ChevronRight className="chevron" />

                      {/* FR: Sous-menu */}
                      {/* EN: Submenu */}
                      <div
                        className="menu-submenu"
                        onMouseEnter={handleSubmenuEnter}
                        onMouseLeave={handleSubmenuLeave}
                      >
                        {item.submenu.map(subItem => (
                          <div
                            key={subItem.label}
                            className="menu-item-option"
                            role="menuitem"
                            tabIndex={0}
                            onClick={() => {
                              handleMenuAction(subItem.label);
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleMenuAction(subItem.label);
                              }
                            }}
                          >
                            <span className="menu-item-label">{subItem.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // FR: Élément normal
                    // EN: Normal item
                    <div
                      className="menu-item-option"
                      role="menuitem"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          if (menu.id === 'tools' && item.label.startsWith('Préférences')) {
                            navigate('/settings');
                          } else {
                            handleMenuAction(item.label);
                          }
                        }
                      }}
                      onClick={() => {
                        if (menu.id === 'tools' && item.label.startsWith('Préférences')) {
                          navigate('/settings');
                        } else {
                          handleMenuAction(item.label);
                        }
                      }}
                    >
                      <span className="menu-item-label">{item.label}</span>
                      <span className="menu-item-shortcut">{item.shortcut}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* FR: Bouton paramètres ou retour selon le contexte */}
      {/* EN: Settings or back button depending on context */}
      <div className="menu-settings-icon">
        {isSettingsPage ? (
          <button
            type="button"
            className="btn"
            onClick={onBack}
            title="Retour aux cartes"
            aria-label="Retour aux cartes"
            style={{
              padding: '6px 8px',
              fontSize: '12px',
              minWidth: 'auto',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <ArrowLeft className="icon-small" />
            <span style={{ fontSize: '11px' }}>Retour</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn"
            onClick={() => navigate('/settings')}
            title="Paramètres"
            aria-label="Ouvrir les paramètres"
            style={{
              padding: '6px 8px',
              fontSize: '12px',
              minWidth: 'auto',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Settings className="icon-small" />
            <span style={{ fontSize: '11px' }}>Paramètres</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default MenuBar;
