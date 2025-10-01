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
} from 'lucide-react';
import { usePlatform, formatShortcut } from '../hooks/usePlatform';
import { useFileOperations } from '../hooks/useFileOperations';
import { useOpenFiles } from '../hooks/useOpenFiles';
import './MenuBar.css';
// import { useAppSettings } from '../hooks/useAppSettings.ts';

function MenuBar() {
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
    exportXMind,
    exportToFreeMind,
    exportToPDF,
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
    }, 300); // FR: 300ms de délai avant de fermer
    setMenuTimeout(timeout);
  };

  const handleSubmenuEnter = () => {
    if (menuTimeout) {
      clearTimeout(menuTimeout);
      setMenuTimeout(null);
    }
  };

  // FR: Nettoyer le timeout au démontage du composant
  // EN: Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (menuTimeout) {
        clearTimeout(menuTimeout);
      }
    };
  }, [menuTimeout]);

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
        case 'Ouvrir...':
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
        case 'Fermer':
          // console.warn('Close file...');
          const activeFile = getActiveFile();
          if (activeFile) {
            closeFile(activeFile.id);
            // console.warn('File closed');
          } else {
            // console.warn('No active file to close');
          }
          break;
        case 'Sauvegarder':
          // console.warn('Save file...');
          try {
            await exportActiveXMind();
            // console.warn('File saved');
          } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            alert('Erreur lors de la sauvegarde du fichier');
          }
          break;
        case 'Sauvegarder sous...':
          // console.warn('Save file as...');
          try {
            await saveAsXMind();
            // console.warn('File saved as');
          } catch (error) {
            console.error('Erreur lors de la sauvegarde sous:', error);
            alert('Erreur lors de la sauvegarde du fichier');
          }
          break;
        case 'Exporter vers FreeMind (.mm)':
          // console.warn('Export to FreeMind...');
          try {
            console.log('🧪 Test de téléchargement simple...');
            // FR: Test simple de téléchargement
            // EN: Simple download test
            const testBlob = new Blob(['Test content'], { type: 'text/plain' });
            const testUrl = URL.createObjectURL(testBlob);
            const testLink = document.createElement('a');
            testLink.href = testUrl;
            testLink.download = 'test.txt';
            testLink.style.display = 'none';
            document.body.appendChild(testLink);
            testLink.click();
            document.body.removeChild(testLink);
            URL.revokeObjectURL(testUrl);
            console.log('🧪 Test de téléchargement terminé');

            await exportToFreeMind();
            alert('✅ Fichier .mm téléchargé avec succès !');
          } catch (error) {
            console.error("Erreur lors de l'export FreeMind:", error);
            alert(
              "❌ Erreur lors de l'export vers FreeMind: " +
                (error instanceof Error ? error.message : String(error))
            );
          }
          break;
        case 'Exporter vers PDF':
          // console.warn('Export to PDF...');
          try {
            await exportToPDF();
            alert('✅ Fichier PDF téléchargé avec succès !');
          } catch (error) {
            console.error("Erreur lors de l'export PDF:", error);
            alert(
              "❌ Erreur lors de l'export vers PDF: " +
                (error instanceof Error ? error.message : String(error))
            );
          }
          break;
        default:
        // console.warn(`Action: ${action}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'action ${action}:`, error);
      const message = error instanceof Error ? error.message : String(error);
      alert(`Erreur: ${message}`);
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
          submenu: [{ label: 'FreeMind (.mm)' }, { label: 'PDF' }],
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
    <div className="menu-bar" style={{ justifyContent: 'flex-start' }}>
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
              {menu.items.map((item, index) => (
                <div key={index}>
                  {item.submenu ? (
                    // FR: Élément avec sous-menu
                    // EN: Item with submenu
                    <div
                      className="menu-item-option menu-item-with-submenu"
                      onMouseEnter={handleSubmenuEnter}
                    >
                      <span className="menu-item-label">{item.label}</span>
                      <span className="menu-item-shortcut">{item.shortcut}</span>
                      <ChevronRight className="icon-small" />

                      {/* FR: Sous-menu */}
                      {/* EN: Submenu */}
                      <div className="menu-submenu" onMouseEnter={handleSubmenuEnter}>
                        {item.submenu.map((subItem, subIndex) => (
                          <div
                            key={subIndex}
                            className="menu-item-option"
                            onClick={() => {
                              handleMenuAction(subItem.label);
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
    </div>
  );
}

export default MenuBar;
