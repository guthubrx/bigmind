/**
 * FR: Onglets de fichiers ouverts
 * EN: Open files tabs
 */

import React from 'react';
import { 
  FileText, 
  X, 
  Plus,
  FolderOpen
} from 'lucide-react';
import { useOpenFiles, OpenFile } from '../hooks/useOpenFiles';
import './FileTabs.css';

interface FileTabsProps {
  type?: 'file-column' | 'tab-bar';
}

const FileTabs: React.FC<FileTabsProps> = ({ type = 'file-column' }) => {
  const openFiles = useOpenFiles((state) => state.openFiles);
  const activeFileId = useOpenFiles((state) => state.activeFileId);
  const closeFile = useOpenFiles((state) => state.closeFile);
  const activateFile = useOpenFiles((state) => state.activateFile);
  const createNewFile = useOpenFiles((state) => state.createNewFile);

  // FR: Ajouter des logs de debug
  // EN: Add debug logs
  console.log('📁 FileTabs - openFiles:', openFiles.length);
  console.log('📁 FileTabs - activeFileId:', activeFileId);
  console.log('📁 FileTabs - type:', type);

  const handleCloseFile = (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    closeFile(fileId);
  };

  const handleOpenNewFile = () => {
    createNewFile();
  };

  if (type === 'tab-bar') {
    // FR: Affichage en barre d'onglets horizontale
    // EN: Horizontal tab bar display
    return (
      <div className="file-tabs-horizontal">
        {openFiles.map((file) => (
          <div 
            key={file.id}
            className={`file-tab-horizontal ${activeFileId === file.id ? 'active' : ''}`}
            onClick={() => activateFile(file.id)}
          >
            <div className="file-tab-content">
              <FileText className="icon-small" />
              <span className="file-name">{file.name}</span>
            </div>
            <button 
              className="file-tab-close"
              onClick={(e) => handleCloseFile(file.id, e)}
              title="Fermer"
            >
              <X className="icon-small" />
            </button>
          </div>
        ))}
        <button 
          className="btn btn-small add-tab-btn"
          onClick={handleOpenNewFile}
          title="Nouveau fichier"
        >
          <Plus className="icon-small" />
        </button>
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
          >
            <div className="file-tab-content">
              <FileText className="icon-small" />
              <span className="file-name">{file.name}</span>
              <span className="file-type">.{file.type}</span>
            </div>
            <button 
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
