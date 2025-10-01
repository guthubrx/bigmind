/**
 * FR: Hook pour gérer l'ouverture de fichiers
 * EN: Hook to handle file opening
 */

import { useCallback } from 'react';
import { useOpenFiles } from './useOpenFiles';
import { FreeMindParser } from '../parsers/FreeMindParser';
import { XMindParser } from '../parsers/XMindParser';
import JSZip from 'jszip';
import { useViewport } from './useViewport';
import { useCanvasOptions } from './useCanvasOptions';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * FR: Fonction utilitaire pour télécharger un fichier dans le navigateur
 * EN: Utility function to download a file in the browser
 */
const downloadFile = (blob: Blob, fileName: string, mimeType: string = 'application/octet-stream') => {
  console.log('🔄 downloadFile - Début du téléchargement:', fileName, 'Type:', mimeType, 'Taille:', blob.size);
  
  try {
    // FR: Créer un blob avec le bon type MIME
    // EN: Create blob with correct MIME type
    const fileBlob = new Blob([blob], { type: mimeType });
    const url = URL.createObjectURL(fileBlob);
    
    console.log('📎 URL blob créée:', url);
    
    // FR: Créer un lien de téléchargement
    // EN: Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    
    console.log('🔗 Lien de téléchargement créé:', a.href, 'Download:', a.download);
    
    // FR: Ajouter au DOM, déclencher le téléchargement, puis nettoyer
    // EN: Add to DOM, trigger download, then clean up
    document.body.appendChild(a);
    console.log('📄 Lien ajouté au DOM');
    
    // FR: Déclencher le téléchargement
    // EN: Trigger download
    a.click();
    console.log('👆 Clic sur le lien déclenché');
    
    // FR: Attendre un peu avant de nettoyer
    // EN: Wait a bit before cleaning up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('🧹 Nettoyage effectué');
    }, 1000);
    
    console.log('✅ Fichier téléchargé:', fileName);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du téléchargement:', error);
    return false;
  }
};

/**
 * FR: Hook pour gérer l'ouverture de fichiers
 * EN: Hook to handle file opening
 */
export const useFileOperations = () => {
  const { openFile: addFileToOpenFiles, createNewFile } = useOpenFiles();
  const getActiveFile = useOpenFiles.getState().getActiveFile;

  /**
   * FR: Ouvrir un fichier .mm (FreeMind)
   * EN: Open a .mm file (FreeMind)
   */
  const openFreeMindFile = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const freeMindMap = FreeMindParser.parse(text);
      const bigMindData = FreeMindParser.convertToBigMind(freeMindMap);
      
      // FR: Adapter la structure pour useOpenFiles
      // EN: Adapt structure for useOpenFiles
      const adaptedContent = {
        id: bigMindData.id,
        name: bigMindData.name,
        rootNode: {
          id: bigMindData.rootId,
          title: bigMindData.nodes[bigMindData.rootId]?.title || 'Racine',
          children: bigMindData.nodes[bigMindData.rootId]?.children || []
        },
        nodes: bigMindData.nodes
      };
      
      return addFileToOpenFiles({
        name: file.name,
        type: 'mm',
        content: adaptedContent
      });
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du fichier .mm:', error);
      throw error;
    }
  }, [addFileToOpenFiles]);

  /**
   * FR: Ouvrir un fichier .xmind
   * EN: Open a .xmind file
   */
  const openXMindFile = useCallback(async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // FR: Essayer d'abord le parser standard
      // EN: Try standard parser first
      try {
        const xMindMap = await XMindParser.parse(arrayBuffer);
        const bigMindData = XMindParser.convertToBigMind(xMindMap);
        
        // FR: Adapter la structure pour useOpenFiles
        // EN: Adapt structure for useOpenFiles
        const adaptedContent: any = {
          id: bigMindData.id,
          name: bigMindData.name,
          rootNode: {
            id: bigMindData.rootId,
            title: bigMindData.nodes[bigMindData.rootId]?.title || 'Racine',
            children: bigMindData.nodes[bigMindData.rootId]?.children || []
          },
          nodes: bigMindData.nodes
        };

        // FR: Appliquer un overlay local persisté (titre/notes/style par id)
        try {
          const key = `bigmind_overlay_${file.name}`;
          const raw = localStorage.getItem(key);
          if (raw) {
            const overlay = JSON.parse(raw);
            if (overlay?.nodes) {
              Object.entries(overlay.nodes).forEach(([id, patch]: any) => {
                if (adaptedContent.nodes?.[id]) {
                  adaptedContent.nodes[id] = { ...adaptedContent.nodes[id], ...patch };
                }
              });
              // Mettre à jour aussi le titre du root affiché si modifié
              const rid = adaptedContent.rootNode.id;
              if (overlay.nodes[rid]?.title) {
                adaptedContent.rootNode.title = overlay.nodes[rid].title;
              }
            }
          }
        } catch (e) {
      // Ignore errors
    }

        // FR: Appliquer bigmind.json embarqué si présent dans l'archive
        let embeddedOverlay: any = null;
        try {
          const zip = await JSZip.loadAsync(arrayBuffer);
          const sidecar = zip.file('bigmind.json');
          if (sidecar) {
            const text = await sidecar.async('text');
            embeddedOverlay = JSON.parse(text);
            if (embeddedOverlay?.nodes) {
              Object.entries(embeddedOverlay.nodes).forEach(([id, patch]: any) => {
                if (adaptedContent.nodes?.[id]) {
                  adaptedContent.nodes[id] = { ...adaptedContent.nodes[id], ...patch };
                }
              });
            }
          }
        } catch (e) {
          console.warn('Erreur lors de la lecture de bigmind.json:', e);
        }
        
        const fileId = addFileToOpenFiles({
          name: file.name,
          type: 'xmind',
          content: adaptedContent,
          sheets: xMindMap.sheetsMeta,
          sheetsData: xMindMap.sheetsData,
          themeColors: xMindMap.themeColors,
          activeSheetId: xMindMap.sheetsMeta && xMindMap.sheetsMeta.length > 0 ? xMindMap.sheetsMeta[0].id : null,
          // FR: Restaurer les données personnalisées de l'overlay
          paletteId: embeddedOverlay?.paletteId,
          mapStyle: embeddedOverlay?.mapStyle,
        });

        // FR: Restaurer les options de canvas si présentes dans l'overlay
        if (embeddedOverlay?.options) {
          try {
            if (embeddedOverlay.options.zoom !== undefined) {
              useViewport.getState().setZoom(embeddedOverlay.options.zoom);
            }
            if (embeddedOverlay.options.nodesDraggable !== undefined) {
              const currentState = useCanvasOptions.getState();
              if (currentState.nodesDraggable !== embeddedOverlay.options.nodesDraggable) {
                currentState.toggleNodesDraggable();
              }
            }
          } catch (e) {
            console.warn('Erreur lors de la restauration des options de canvas:', e);
          }
        }
        return fileId;
      } catch (standardError) {
        const stdMsg = standardError instanceof Error ? standardError.message : String(standardError);
        console.warn('Parser standard échoué, tentative avec le parser simple:', stdMsg);
        
        // FR: Essayer le parser de fallback
        // EN: Try fallback parser
        const xMindMap = await XMindParser.parseSimple(arrayBuffer);
        const bigMindData = XMindParser.convertToBigMind(xMindMap);
        
        // FR: Adapter la structure pour useOpenFiles
        // EN: Adapt structure for useOpenFiles
        const adaptedContent: any = {
          id: bigMindData.id,
          name: bigMindData.name,
          rootNode: {
            id: bigMindData.rootId,
            title: bigMindData.nodes[bigMindData.rootId]?.title || 'Racine',
            children: bigMindData.nodes[bigMindData.rootId]?.children || []
          },
          nodes: bigMindData.nodes
        };
        try {
          const key = `bigmind_overlay_${file.name}`;
          const raw = localStorage.getItem(key);
          if (raw) {
            const overlay = JSON.parse(raw);
            if (overlay?.nodes) {
              Object.entries(overlay.nodes).forEach(([id, patch]: any) => {
                if (adaptedContent.nodes?.[id]) {
                  adaptedContent.nodes[id] = { ...adaptedContent.nodes[id], ...patch };
                }
              });
              const rid = adaptedContent.rootNode.id;
              if (overlay.nodes[rid]?.title) {
                adaptedContent.rootNode.title = overlay.nodes[rid].title;
              }
            }
          }
        } catch (e) {
      // Ignore errors
    }

        // FR: Appliquer bigmind.json embarqué si présent dans l'archive (fallback)
        let embeddedOverlayFallback: any = null;
        try {
          const zip = await JSZip.loadAsync(arrayBuffer);
          const sidecar = zip.file('bigmind.json');
          if (sidecar) {
            const text = await sidecar.async('text');
            embeddedOverlayFallback = JSON.parse(text);
            if (embeddedOverlayFallback?.nodes) {
              Object.entries(embeddedOverlayFallback.nodes).forEach(([id, patch]: any) => {
                if (adaptedContent.nodes?.[id]) {
                  adaptedContent.nodes[id] = { ...adaptedContent.nodes[id], ...patch };
                }
              });
            }
          }
        } catch (e) {
          console.warn('Erreur lors de la lecture de bigmind.json (fallback):', e);
        }
        
        const fileIdFallback = addFileToOpenFiles({
          name: file.name,
          type: 'xmind',
          content: adaptedContent,
          themeColors: bigMindData.themeColors,
          // FR: Restaurer les données personnalisées de l'overlay (fallback)
          paletteId: embeddedOverlayFallback?.paletteId,
          mapStyle: embeddedOverlayFallback?.mapStyle,
        });

        // FR: Restaurer les options de canvas si présentes dans l'overlay (fallback)
        if (embeddedOverlayFallback?.options) {
          try {
            if (embeddedOverlayFallback.options.zoom !== undefined) {
              useViewport.getState().setZoom(embeddedOverlayFallback.options.zoom);
            }
            if (embeddedOverlayFallback.options.nodesDraggable !== undefined) {
              const currentState = useCanvasOptions.getState();
              if (currentState.nodesDraggable !== embeddedOverlayFallback.options.nodesDraggable) {
                currentState.toggleNodesDraggable();
              }
            }
          } catch (e) {
            console.warn('Erreur lors de la restauration des options de canvas (fallback):', e);
          }
        }
        
        return fileIdFallback;
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du fichier .xmind:', error);
      throw error;
    }
  }, [addFileToOpenFiles]);

  /**
   * FR: Ouvrir un fichier (détection automatique du type)
   * EN: Open a file (automatic type detection)
   */
  const openFile = useCallback(async (file: File) => {
    const extension = file.name.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'mm':
        return openFreeMindFile(file);
      case 'xmind':
        return openXMindFile(file);
      default:
        throw new Error(`Format de fichier non supporté: .${extension}`);
    }
  }, [openFreeMindFile, openXMindFile]);

  /**
   * FR: Créer un nouveau fichier
   * EN: Create a new file
   */
  const createNew = useCallback((name?: string) => {
    return createNewFile(name);
  }, [createNewFile]);

  /**
   * FR: Ouvrir un fichier via le sélecteur de fichiers
   * EN: Open a file via file picker
   */
  const openFileDialog = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.mm,.xmind';
      input.multiple = false;
      
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0] || null;
        resolve(file);
      };
      
      input.oncancel = () => resolve(null);
      input.click();
    });
  }, []);

  // FR: Exporter le fichier actif en .xmind en fusionnant l'overlay local dans content.json
  // EN: Export the active file to .xmind merging overlay into content.json
  const exportActiveXMind = useCallback(async (customFileName?: string) => {
    console.log('🔄 exportActiveXMind - Début de la sauvegarde');
    const active = getActiveFile();
    console.log('📁 Fichier actif:', active);
    
    if (!active) {
      console.error('❌ Aucun fichier actif');
      throw new Error('Aucun fichier actif');
    }
    
    if (active.type !== 'xmind') {
      console.error('❌ Le fichier actif n\'est pas un fichier XMind:', active.type);
      throw new Error('Le fichier actif n\'est pas un fichier XMind');
    }
    
    if (!active.content) {
      console.error('❌ Le fichier actif n\'a pas de contenu');
      throw new Error('Le fichier actif n\'a pas de contenu');
    }
    
    console.log('✅ Fichier XMind valide, début de la génération...');

    // FR: Créer une nouvelle archive ZIP
    // EN: Create a new ZIP archive
    const zip = new JSZip();
    
    // FR: Si nous avons accès au fichier original, le copier pour préserver tous les fichiers
    // EN: If we have access to original file, copy it to preserve all files
    let originalZip: JSZip | null = null;
    if (active.path) {
      try {
        // FR: Essayer de charger le fichier original depuis le système de fichiers
        // EN: Try to load original file from filesystem
        // Note: Dans un navigateur, nous ne pouvons pas accéder directement au système de fichiers
        // Mais nous pouvons essayer de reconstruire l'archive avec les fichiers essentiels
      } catch (e) {
        console.warn('Impossible de charger le fichier original:', e);
      }
    }
    
    // FR: Préserver la structure originale du content.json pour la compatibilité XMind
    // EN: Preserve original content.json structure for XMind compatibility
    let contentJson: any;
    
    if (active.sheetsData && active.sheetsData.length > 0) {
      // FR: Utiliser les données originales des feuilles comme base
      // EN: Use original sheets data as base
      contentJson = [...active.sheetsData];
      
      // FR: Mettre à jour la feuille active avec nos modifications
      // EN: Update active sheet with our modifications
      const activeSheetIndex = active.sheets?.findIndex(s => s.id === active.activeSheetId) || 0;
      if (contentJson[activeSheetIndex]) {
        const buildTopic = (id: string): any => {
          const n = active.content.nodes[id];
          if (!n) return null;
          return {
            id: n.id,
            title: n.title,
            notes: n.notes ? { plain: n.notes } : undefined,
            style: n.style,
            children: n.children && n.children.length > 0 ? { attached: n.children.map(buildTopic).filter(Boolean) } : undefined,
          };
        };
        
        // FR: Mettre à jour le rootTopic de la feuille active
        // EN: Update rootTopic of active sheet
        contentJson[activeSheetIndex] = {
          ...contentJson[activeSheetIndex],
          rootTopic: buildTopic(active.content.rootNode.id)
        };
      }
    } else {
      // FR: Fallback si pas de données originales - créer une structure minimale compatible
      // EN: Fallback if no original data - create minimal compatible structure
      const buildTopic = (id: string): any => {
        const n = active.content.nodes[id];
        if (!n) return null;
        return {
          id: n.id,
          title: n.title,
          notes: n.notes ? { plain: n.notes } : undefined,
          style: n.style,
          children: n.children && n.children.length > 0 ? { attached: n.children.map(buildTopic).filter(Boolean) } : undefined,
        };
      };
      
      contentJson = [{
        id: active.activeSheetId || 'sheet-1',
        title: active.content.name || 'Carte mentale',
        class: 'sheet',
        rootTopic: buildTopic(active.content.rootNode.id),
        creator: 'BigMind',
        created: new Date().toISOString()
      }];
    }
    
    console.log('📄 Génération du content.json...');
    zip.file('content.json', JSON.stringify(contentJson, null, 2));
    console.log('✅ content.json généré');

    // FR: Ajouter les fichiers essentiels pour la compatibilité XMind
    // EN: Add essential files for XMind compatibility
    
    // FR: META-INF/manifest.xml (requis par XMind)
    // EN: META-INF/manifest.xml (required by XMind)
    const manifestXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<manifest xmlns="urn:xmind:xmap:xmlns:manifest:1.0">
  <file-entry full-path="content.json" media-type="text/json"/>
  <file-entry full-path="META-INF/" media-type=""/>
  <file-entry full-path="styles.xml" media-type="text/xml"/>
  <file-entry full-path="theme.xml" media-type="text/xml"/>
</manifest>`;
    zip.file('META-INF/manifest.xml', manifestXml);

    // FR: styles.xml (styles par défaut)
    // EN: styles.xml (default styles)
    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<xmap-styles xmlns="urn:xmind:xmap:xmlns:style:2.0" version="2.0">
  <styles>
    <style id="default" type="topic">
      <topic-properties border-line-width="1pt" line-color="#000000" line-pattern="solid"/>
    </style>
  </styles>
</xmap-styles>`;
    zip.file('styles.xml', stylesXml);

    // FR: theme.xml (thème par défaut)
    // EN: theme.xml (default theme)
    const themeXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<xmap-themes xmlns="urn:xmind:xmap:xmlns:theme:2.0" version="2.0">
  <themes>
    <theme id="default" name="Default">
      <topic-styles>
        <topic-style id="default" type="topic">
          <topic-properties border-line-width="1pt" line-color="#000000" line-pattern="solid"/>
        </topic-style>
      </topic-styles>
    </theme>
  </themes>
</xmap-themes>`;
    zip.file('theme.xml', themeXml);

    // FR: Ecrire le sidecar embarqué avec toutes les données personnalisées
    try {
      const overlay: any = { 
        nodes: {},
        // FR: Sauvegarder les styles de carte
        mapStyle: active.mapStyle,
        // FR: Sauvegarder la palette sélectionnée
        paletteId: active.paletteId,
        // FR: Sauvegarder les couleurs du thème
        themeColors: active.themeColors,
        // FR: Sauvegarder les options de canvas
        options: {
          zoom: useViewport.getState().zoom,
          nodesDraggable: useCanvasOptions.getState().nodesDraggable,
        }
      };
      
      // FR: Sauvegarder toutes les données des nœuds (y compris computedStyle, collapsed, etc.)
      Object.values(active.content.nodes).forEach((n: any) => {
        overlay.nodes[n.id] = { 
          title: n.title, 
          notes: n.notes, 
          style: n.style,
          // FR: Sauvegarder les styles calculés (couleurs inférées)
          computedStyle: n.computedStyle,
          // FR: Sauvegarder l'état des nœuds
          collapsed: n.collapsed,
          // FR: Sauvegarder les enfants pour la structure
          children: n.children
        };
      });
      
      zip.file('bigmind.json', JSON.stringify(overlay, null, 2));
    } catch (e) {
      console.error('Erreur lors de la sauvegarde des données personnalisées:', e);
    }

    console.log('📦 Génération du fichier ZIP...');
    const blob = await zip.generateAsync({ type: 'blob' });
    console.log('✅ ZIP généré, taille:', blob.size, 'bytes');
    
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    
    // FR: Utiliser le nom personnalisé ou le nom original
    // EN: Use custom name or original name
    const fileName = customFileName || active.name.replace(/\.xmind$/i, '') + '.xmind';
    a.download = fileName;
    console.log('💾 Téléchargement du fichier:', fileName);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 0);
    console.log('✅ Sauvegarde terminée avec succès');
  }, []);

  // FR: Sauvegarder sous avec dialogue de nom de fichier
  // EN: Save as with file name dialog
  const saveAsXMind = useCallback(async () => {
    const active = getActiveFile();
    if (!active || active.type !== 'xmind' || !active.content) throw new Error('Aucun fichier XMind actif');

    // FR: Demander le nouveau nom de fichier
    // EN: Ask for new file name
    const newFileName = prompt('Nom du fichier:', active.name.replace(/\.xmind$/i, ''));
    if (!newFileName) return; // FR: Annulé par l'utilisateur

    const fileName = newFileName.endsWith('.xmind') ? newFileName : newFileName + '.xmind';
    await exportActiveXMind(fileName);
  }, [exportActiveXMind]);

  // FR: Exporter vers le format FreeMind .mm
  // EN: Export to FreeMind .mm format
  const exportToFreeMind = useCallback(async () => {
    const active = getActiveFile();
    if (!active || !active.content) {
      alert('Aucun fichier ouvert. Veuillez ouvrir une carte mentale avant d\'exporter.');
      throw new Error('Aucun fichier actif');
    }

    console.log('🔄 exportToFreeMind - Début de l\'export vers .mm');
    console.log('📁 Fichier actif:', active);

    try {
      // FR: Convertir les données BigMind vers le format FreeMind
      // EN: Convert BigMind data to FreeMind format
      const freeMindXML = FreeMindParser.convertFromBigMind(active);
      console.log('✅ XML FreeMind généré, taille:', freeMindXML.length, 'caractères');

      // FR: Créer le blob et télécharger
      // EN: Create blob and download
      const blob = new Blob([freeMindXML], { type: 'application/xml' });
      const baseName = active.name.replace(/\.(xmind|mm)$/i, '');
      const fileName = `${baseName}.mm`;
      
      console.log('💾 Téléchargement du fichier .mm:', fileName);
      
      // FR: Utiliser la fonction utilitaire de téléchargement
      // EN: Use utility download function
      const success = downloadFile(blob, fileName, 'application/xml');
      if (!success) {
        throw new Error('Échec du téléchargement du fichier .mm');
      }
      console.log('✅ Export .mm terminé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'export .mm:', error);
      throw error;
    }
  }, []);

  // FR: Exporter vers le format PDF
  // EN: Export to PDF format
  const exportToPDF = useCallback(async () => {
    const active = getActiveFile();
    if (!active || !active.content) {
      alert('Aucun fichier ouvert. Veuillez ouvrir une carte mentale avant d\'exporter.');
      throw new Error('Aucun fichier actif');
    }

    console.log('🔄 exportToPDF - Début de l\'export vers PDF');
    console.log('📁 Fichier actif:', active);

    try {
      // FR: Trouver l'élément React Flow
      // EN: Find React Flow element
      const reactFlowElement = document.querySelector('.react-flow');
      if (!reactFlowElement) {
        throw new Error('Élément React Flow non trouvé');
      }

      console.log('📸 Élément React Flow trouvé:', reactFlowElement);

      // FR: Capturer le canvas avec html2canvas
      // EN: Capture canvas with html2canvas
      console.log('📸 Capture du canvas...');
      
      let canvas;
      try {
        canvas = await html2canvas(reactFlowElement as HTMLElement, {
          backgroundColor: active.mapStyle?.backgroundColor || '#ffffff',
          scale: 1, // FR: Réduire le scale pour éviter les problèmes
          useCORS: true,
          allowTaint: true,
          logging: true, // FR: Activer les logs pour debug
          width: reactFlowElement.scrollWidth,
          height: reactFlowElement.scrollHeight,
        });
        console.log('✅ Canvas capturé avec html2canvas, dimensions:', canvas.width, 'x', canvas.height);
      } catch (html2canvasError) {
        console.warn('⚠️ html2canvas échoué, tentative de fallback:', html2canvasError);
        
        // FR: Fallback: créer un canvas simple avec du texte
        // EN: Fallback: create simple canvas with text
        canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = active.mapStyle?.backgroundColor || '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#000000';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Export PDF - BigMind', canvas.width / 2, canvas.height / 2);
          ctx.fillText('Carte: ' + (active.name || 'Sans nom'), canvas.width / 2, canvas.height / 2 + 40);
        }
        console.log('✅ Canvas de fallback créé');
      }

      // FR: Créer le PDF
      // EN: Create PDF
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // FR: Calculer les dimensions pour ajuster l'image au format A4
      // EN: Calculate dimensions to fit image to A4 format
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // FR: Calculer le ratio pour ajuster l'image
      // EN: Calculate ratio to fit image
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      // FR: Centrer l'image sur la page
      // EN: Center image on page
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      console.log('📄 Ajout de l\'image au PDF...');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, finalWidth, finalHeight);

      // FR: Ajouter des métadonnées
      // EN: Add metadata
      pdf.setProperties({
        title: active.name || 'Carte mentale',
        subject: 'Export BigMind',
        author: 'BigMind',
        creator: 'BigMind'
      });

      // FR: Télécharger le PDF
      // EN: Download PDF
      const baseName = active.name.replace(/\.(xmind|mm)$/i, '');
      const fileName = `${baseName}.pdf`;
      
      console.log('💾 Téléchargement du PDF:', fileName);
      
      // FR: Utiliser la fonction utilitaire de téléchargement
      // EN: Use utility download function
      const pdfBlob = pdf.output('blob');
      const success = downloadFile(pdfBlob, fileName, 'application/pdf');
      if (!success) {
        throw new Error('Échec du téléchargement du fichier PDF');
      }
      console.log('✅ Export PDF terminé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'export PDF:', error);
      throw error;
    }
  }, []);

  // FR: Exporter avec un nom suggéré (ajoute un suffixe) - DÉPRÉCIÉ
  // EN: Export with suggested name (adds suffix) - DEPRECATED
  const exportXMind = useCallback(async () => {
    const active = getActiveFile();
    if (!active || active.type !== 'xmind' || !active.content) throw new Error('Aucun fichier XMind actif');

    // FR: Ajouter un suffixe avec la date/heure pour l'export
    // EN: Add suffix with date/time for export
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '');
    const baseName = active.name.replace(/\.xmind$/i, '');
    const exportFileName = `${baseName}_export_${timestamp}.xmind`;
    
    await exportActiveXMind(exportFileName);
  }, [exportActiveXMind]);

  return {
    openFile,
    openFreeMindFile,
    openXMindFile,
    createNew,
    openFileDialog,
    exportActiveXMind,
    saveAsXMind,
    exportXMind,
    exportToFreeMind,
    exportToPDF
  };
};
