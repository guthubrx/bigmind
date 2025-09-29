/**
 * FR: Barre de menu de BigMind
 * EN: BigMind menu bar
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Edit, 
  Eye, 
  Plus, 
  Palette, 
  Settings, 
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { usePlatform, formatShortcut } from '../hooks/usePlatform';
import { useFileOperations } from '../hooks/useFileOperations';
import './MenuBar.css';

const MenuBar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const platformInfo = usePlatform();
  const { openFileDialog, openFile, createNew } = useFileOperations();

  // FR: Raccourcis adaptés selon la plateforme
  // EN: Shortcuts adapted according to platform
  const getShortcut = (shortcut: string) => formatShortcut(shortcut, platformInfo);

  // FR: Gestionnaire pour les actions de menu
  // EN: Handler for menu actions
  const handleMenuAction = async (action: string) => {
    try {
      console.log(`🔄 Action de menu: ${action}`);
      switch (action) {
        case 'Nouveau':
          console.log('📝 Création d\'un nouveau fichier...');
          createNew();
          break;
        case 'Ouvrir...':
          console.log('📂 Ouverture d\'un fichier...');
          const file = await openFileDialog();
          if (file) {
            console.log(`📄 Fichier sélectionné: ${file.name} (${file.size} bytes)`);
            await openFile(file);
            console.log('✅ Fichier ouvert avec succès');
          } else {
            console.log('❌ Aucun fichier sélectionné');
          }
          break;
        default:
          console.log(`Action: ${action}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'action ${action}:`, error);
      alert(`Erreur: ${error.message}`);
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
        { label: 'Exporter...', shortcut: getShortcut('Ctrl+E') },
        { label: 'Imprimer...', shortcut: getShortcut('Ctrl+P') },
      ]
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
      ]
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
      ]
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
      ]
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
      ]
    },
    {
      id: 'tools',
      label: 'Outils',
      icon: Settings,
      items: [
        { label: 'Préférences...', shortcut: getShortcut('Ctrl+,') },
        { label: 'Thèmes...', shortcut: getShortcut('Ctrl+Shift+T') },
        { label: 'Plugins...', shortcut: getShortcut('Ctrl+Shift+P') },
      ]
    },
    {
      id: 'help',
      label: 'Aide',
      icon: HelpCircle,
      items: [
        { label: 'Documentation', shortcut: 'F1' },
        { label: 'Raccourcis clavier', shortcut: getShortcut('Ctrl+?') },
        { label: 'À propos', shortcut: getShortcut('Ctrl+Shift+A') },
      ]
    }
  ];

  return (
    <div className="menu-bar">
      {menuItems.map((menu) => (
        <div 
          key={menu.id}
          className={`menu-item ${activeMenu === menu.id ? 'active' : ''}`}
          onMouseEnter={() => setActiveMenu(menu.id)}
          onMouseLeave={() => setActiveMenu(null)}
        >
          <button className="menu-button">
            <menu.icon className="icon-small" />
            <span>{menu.label}</span>
            <ChevronDown className="icon-small" />
          </button>
          
          {activeMenu === menu.id && (
            <div className="menu-dropdown">
              {menu.items.map((item, index) => (
                <div 
                  key={index} 
                  className="menu-item-option"
                  onClick={() => handleMenuAction(item.label)}
                >
                  <span className="menu-item-label">{item.label}</span>
                  <span className="menu-item-shortcut">{item.shortcut}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MenuBar;
