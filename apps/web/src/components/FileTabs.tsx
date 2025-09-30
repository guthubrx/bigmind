/**
 * FR: Onglets de fichiers ouverts
 * EN: Open files tabs
 */

import React, { useState, useRef, useCallback } from 'react';
import { 
  FileText, 
  X, 
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  FolderOpen,
  Plus,
} from 'lucide-react';
import { useOpenFiles } from '../hooks/useOpenFiles.ts';
import './FileTabs.css';

interface FileTabsProps {
  type?: 'file-column' | 'tab-bar';
}

function FileTabs({ type = 'file-column' }: FileTabsProps) {
  const openFiles = useOpenFiles((state) => state.openFiles);
  const activeFileId = useOpenFiles((state) => state.activeFileId);
  const closeFile = useOpenFiles((state) => state.closeFile);
  const activateFile = useOpenFiles((state) => state.activateFile);
  const setActiveSheet = useOpenFiles((state) => state.setActiveSheet);

  // FR: États pour la barre d'onglets
  // EN: States for tab bar
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // FR: Ajouter des logs de debug
  // EN: Add debug logs
  // console.log('📁 FileTabs - openFiles:', openFiles.length);
  // console.log('📁 FileTabs - activeFileId:', activeFileId);
  // console.log('📁 FileTabs - type:', type);

  const handleCloseFile = (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    closeFile(fileId);
  };

  // FR: La barre d'onglets ne propose pas de création ici
  // EN: Tab bar does not create files here
  const handleOpenNewFile = () => {};

  // FR: Fonctions pour le scroll horizontal
  // EN: Functions for horizontal scrolling
  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 200;
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 200;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  // FR: Fonctions pour le drag & drop
  // EN: Functions for drag & drop
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setIsDragging(true);
    setDragStartIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragStartIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (dragStartIndex !== null && dragStartIndex !== dropIndex) {
      // FR: Réorganiser les onglets
      // EN: Reorder tabs
      const newFiles = [...openFiles];
      const draggedFile = newFiles[dragStartIndex];
      newFiles.splice(dragStartIndex, 1);
      newFiles.splice(dropIndex, 0, draggedFile);
      
      // FR: Mettre à jour l'ordre dans le store
      // EN: Update order in store
      // TODO: Implémenter la réorganisation dans useOpenFiles
      // console.log('🔄 Reordering tabs:', { from: dragStartIndex, to: dropIndex });
    }
    
    handleDragEnd();
  }, [dragStartIndex, openFiles, handleDragEnd]);

  // FR: Fonctions pour le menu de débordement
  // EN: Functions for overflow menu
  const toggleOverflowMenu = useCallback(() => {
    setShowOverflowMenu(prev => !prev);
  }, []);

  const closeOverflowMenu = useCallback(() => {
    setShowOverflowMenu(false);
  }, []);

  // FR: Vérifier si le scroll est nécessaire
  // EN: Check if scrolling is needed
  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < (openFiles.length * 200 - 400); // Approximation

  if (type === 'tab-bar') {
    // FR: Affichage en barre d'onglets horizontale améliorée
    // EN: Enhanced horizontal tab bar display
    const activeFile = openFiles.find((f) => f.id === activeFileId) || null;
    const sheets = activeFile?.sheets || [];
    return (
      <div className="file-tabs-horizontal" ref={tabsContainerRef}>
        {/* FR: Boutons de scroll */}
        {/* EN: Scroll buttons */}
        {canScrollLeft && (
          <button 
            type="button"
            className="scroll-btn scroll-left"
            onClick={scrollLeft}
            title="Faire défiler vers la gauche"
          >
            <ChevronLeft className="icon-small" />
          </button>
        )}

        {/* FR: Conteneur scrollable des onglets */}
        {/* EN: Scrollable container for tabs */}
        <div 
          className="tabs-scroll-container"
          ref={scrollContainerRef}
          onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
        >
          <div className="tabs-list">
            {sheets.map((sheet, index) => (
              <div 
                key={sheet.id}
                className={`file-tab-horizontal ${activeFile?.activeSheetId === sheet.id ? 'active' : ''} ${
                  isDragging && dragStartIndex === index ? 'dragging' : ''
                } ${dragOverIndex === index ? 'drag-over' : ''}`}
                onClick={() => { if (activeFile) setActiveSheet(activeFile.id, sheet.id); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (activeFile) setActiveSheet(activeFile.id, sheet.id);
                  }
                }}
                role="tab"
                tabIndex={0}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="file-tab-content">
                  <FileText className="icon-small" />
                  <span className="file-name">{sheet.title}</span>
                </div>
                <button 
                  type="button"
                  className="file-tab-close"
                  onClick={(e) => e.stopPropagation()}
                  title=""
                >
                  <X className="icon-small" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FR: Boutons de scroll */}
        {/* EN: Scroll buttons */}
        {canScrollRight && (
          <button 
            type="button"
            className="scroll-btn scroll-right"
            onClick={scrollRight}
            title="Faire défiler vers la droite"
          >
            <ChevronRight className="icon-small" />
          </button>
        )}

        {/* FR: Menu de débordement */}
        {/* EN: Overflow menu */}
        {sheets.length > 5 && (
          <div className="overflow-menu-container">
            <button 
              type="button"
              className="overflow-menu-btn"
              onClick={toggleOverflowMenu}
              title="Plus d'onglets"
            >
              <MoreHorizontal className="icon-small" />
            </button>
            {showOverflowMenu && (
              <div className="overflow-menu">
                {sheets.slice(5).map((sheet) => (
                  <div 
                    key={sheet.id}
                    className={`overflow-menu-item ${activeFile?.activeSheetId === sheet.id ? 'active' : ''}`}
                    onClick={() => {
                      if (activeFile) setActiveSheet(activeFile.id, sheet.id);
                      closeOverflowMenu();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        if (activeFile) setActiveSheet(activeFile.id, sheet.id);
                        closeOverflowMenu();
                      }
                    }}
                    role="menuitem"
                    tabIndex={0}
                  >
                    <FileText className="icon-small" />
                    <span className="file-name">{sheet.title}</span>
                    <button 
                      type="button"
                      className="file-tab-close"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeOverflowMenu();
                      }}
                    >
                      <X className="icon-small" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FR: Bouton nouveau fichier */}
        {/* EN: New file button */}
        {/* FR: Pas de bouton + pour la barre d'onglets des feuilles */}
      </div>
    );
  }

  // FR: Affichage en colonne verticale
  // EN: Vertical column display
  return (
    <div className="file-tabs">
      <div className="file-tabs-header">
        <div className="file-tabs-title">
          <FolderOpen className="icon-small" />
          <span>Fichiers ouverts</span>
        </div>
        <button 
          type="button"
          className="btn btn-small"
          onClick={handleOpenNewFile}
          title="Nouveau fichier"
        >
          <Plus className="icon-small" />
        </button>
      </div>
      
      <div className="file-tabs-list">
        {openFiles.map((file) => (
          <div 
            key={file.id}
            className={`file-tab ${activeFileId === file.id ? 'active' : ''}`}
            onClick={() => activateFile(file.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                activateFile(file.id);
              }
            }}
            role="tab"
            tabIndex={0}
          >
            <div className="file-tab-content">
              <FileText className="icon-small" />
              <span className="file-name">{file.name}</span>
              <span className="file-type">.{file.type}</span>
            </div>
            <button 
              type="button"
              className="file-tab-close"
              onClick={(e) => handleCloseFile(file.id, e)}
              title="Fermer"
            >
              <X className="icon-small" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileTabs;
