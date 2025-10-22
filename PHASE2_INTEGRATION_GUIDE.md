# 📚 Phase 2 - Guide d'Intégration

## Vue d'ensemble

Ce guide explique comment intégrer les composants Phase 2 dans l'interface existante de BigMind.

---

## 1. Integration dans les Paramètres (Settings)

### Fichier: `apps/web/src/pages/Settings.tsx`

```typescript
import { ThemeSelector } from '../components/ThemeSelector';
import { TemplateGallery } from '../components/TemplateGallery';

export function Settings() {
  return (
    <div className="space-y-8">
      {/* ... sections existantes ... */}

      {/* Nouveau: Section Thèmes */}
      <section>
        <h2 className="text-xl font-bold mb-4">Apparence</h2>
        <ThemeSelector
          onThemeSelect={(theme) => {
            // Appliquer le thème sélectionné
            console.log('Theme selected:', theme.name);
          }}
        />
      </section>

      {/* Nouveau: Section Templates */}
      <section>
        <h2 className="text-xl font-bold mb-4">Templates</h2>
        <TemplateGallery
          onTemplateSelect={(mindMap) => {
            // Créer une nouvelle carte à partir du template
            console.log('Template selected, creating mind map');
          }}
        />
      </section>
    </div>
  );
}
```

---

## 2. Intégration dans le MenuBar

### Fichier: `apps/web/src/components/MenuBar.tsx`

Ajouter dans les éléments du menu "Insertion":

```typescript
{
  id: 'insert',
  label: 'Insertion',
  icon: Plus,
  items: [
    { label: 'Nouveau nœud', shortcut: 'Entrée' },
    { label: 'Nouveau nœud enfant', shortcut: 'Tab' },
    { label: 'Nouveau nœud parent', shortcut: 'Shift+Tab' },
    // Nouveau:
    { label: 'Image...', shortcut: getShortcut('Ctrl+I'), action: 'insertImage' },
    { label: 'Sticker...', shortcut: getShortcut('Ctrl+Shift+S'), action: 'insertSticker' },
  ],
}
```

Ajouter dans les éléments du menu "Format":

```typescript
{
  id: 'format',
  label: 'Format',
  icon: Palette,
  items: [
    { label: 'Police...', shortcut: getShortcut('Ctrl+Shift+F') },
    { label: 'Couleur...', shortcut: getShortcut('Ctrl+Shift+C') },
    { label: 'Style...', shortcut: getShortcut('Ctrl+Shift+S') },
    // Nouveau:
    { label: 'Thème de la carte...', action: 'changeTheme' },
    { label: 'Alignement...', shortcut: getShortcut('Ctrl+Shift+A') },
  ],
}
```

Gestionnaires d'actions:

```typescript
const handleMenuAction = (action: string) => {
  switch (action) {
    case 'insertImage':
      setShowImageManager(true);
      break;
    case 'insertSticker':
      setShowStickerPicker(true);
      break;
    case 'changeTheme':
      setShowThemeSelector(true);
      break;
    // ... autres actions ...
  }
};
```

---

## 3. Intégration dans la Sidebar

### Fichier: `apps/web/src/components/Sidebar.tsx`

Ajouter un nouvel onglet "Assets":

```typescript
export function Sidebar() {
  const [activeTab, setActiveTab] = useState<'files' | 'assets' | 'layers'>('files');
  const { activeFile } = useOpenFiles();

  return (
    <div className="flex flex-col">
      {/* Tabs */}
      <div className="flex gap-2 border-b p-2">
        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2 text-sm ${activeTab === 'files' ? 'border-b-2 border-blue-500' : ''}`}
        >
          Fichiers
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2 text-sm ${activeTab === 'assets' ? 'border-b-2 border-blue-500' : ''}`}
        >
          Assets
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`px-4 py-2 text-sm ${activeTab === 'layers' ? 'border-b-2 border-blue-500' : ''}`}
        >
          Calques
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'files' && <FilesPanel />}
        {activeTab === 'assets' && activeFile && (
          <AssetsPanelContent mapId={activeFile.id} />
        )}
        {activeTab === 'layers' && <LayersPanel />}
      </div>
    </div>
  );
}

function AssetsPanelContent({ mapId }: { mapId: string }) {
  const [view, setView] = useState<'images' | 'stickers'>('images');

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setView('images')}
          className={`flex-1 py-2 rounded text-sm ${
            view === 'images' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Images
        </button>
        <button
          onClick={() => setView('stickers')}
          className={`flex-1 py-2 rounded text-sm ${
            view === 'stickers' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Stickers
        </button>
      </div>

      {view === 'images' && (
        <ImageManager mapId={mapId} />
      )}
      {view === 'stickers' && (
        <StickerPicker mapId={mapId} />
      )}
    </div>
  );
}
```

---

## 4. Dialogue Modal pour Insertion

### Nouveau Fichier: `apps/web/src/components/dialogs/InsertImageDialog.tsx`

```typescript
import React, { useState } from 'react';
import { ImageManager } from '../ImageManager';
import { X } from 'lucide-react';

interface InsertImageDialogProps {
  mapId: string;
  onClose: () => void;
  onImageInsert: (imageId: string) => void;
}

export function InsertImageDialog({
  mapId,
  onClose,
  onImageInsert,
}: InsertImageDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Insérer une image</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <ImageManager
            mapId={mapId}
            onImageSelect={(image) => {
              onImageInsert(image.id);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

### Nouveau Fichier: `apps/web/src/components/dialogs/InsertStickerDialog.tsx`

```typescript
import React from 'react';
import { StickerPicker } from '../StickerPicker';
import { X } from 'lucide-react';

interface InsertStickerDialogProps {
  mapId: string;
  selectedNodeId?: string;
  onClose: () => void;
  onStickerInsert: (stickerId: string) => void;
}

export function InsertStickerDialog({
  mapId,
  selectedNodeId,
  onClose,
  onStickerInsert,
}: InsertStickerDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Ajouter un sticker</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <StickerPicker
            mapId={mapId}
            selectedNodeId={selectedNodeId}
            onStickerSelect={(sticker) => {
              onStickerInsert(sticker.id);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Intégration dans MainLayout

### Fichier: `apps/web/src/pages/MainLayout.tsx`

```typescript
import { useState } from 'react';
import { InsertImageDialog } from '../components/dialogs/InsertImageDialog';
import { InsertStickerDialog } from '../components/dialogs/InsertStickerDialog';
import { ThemeSelector } from '../components/ThemeSelector';
import { useOpenFiles } from '../hooks/useOpenFiles';

export function MainLayout() {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showStickerDialog, setShowStickerDialog] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const { activeFile } = useOpenFiles();

  return (
    <div className="flex h-screen">
      {/* ... Sidebar, Canvas, etc. ... */}

      {/* Dialogues Phase 2 */}
      {activeFile && showImageDialog && (
        <InsertImageDialog
          mapId={activeFile.id}
          onClose={() => setShowImageDialog(false)}
          onImageInsert={(imageId) => {
            // Appliquer l'image au nœud sélectionné
            console.log('Image inserted:', imageId);
          }}
        />
      )}

      {activeFile && showStickerDialog && (
        <InsertStickerDialog
          mapId={activeFile.id}
          onClose={() => setShowStickerDialog(false)}
          onStickerInsert={(stickerId) => {
            // Appliquer le sticker au nœud sélectionné
            console.log('Sticker inserted:', stickerId);
          }}
        />
      )}

      {showThemeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 flex flex-col overflow-auto">
            <div className="p-4 flex items-center justify-between border-b sticky top-0 bg-white">
              <h2 className="text-lg font-bold">Choisir un thème</h2>
              <button
                onClick={() => setShowThemeSelector(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <ThemeSelector
                onThemeSelect={(theme) => {
                  // Appliquer le thème à la carte
                  if (activeFile) {
                    console.log('Theme applied:', theme.name);
                  }
                  setShowThemeSelector(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 6. Hooks d'Utilisation pour les Composants

### Utiliser les hooks dans vos composants

```typescript
import { useThemes } from '../hooks/useThemes';
import { useAssets } from '../hooks/useAssets';
import { useTemplates } from '../hooks/useTemplates';

export function MyComponent() {
  // Gestion des thèmes
  const {
    activeTheme,
    setActiveTheme,
    favoriteThemes,
    createCustomTheme,
  } = useThemes();

  // Gestion des assets
  const {
    images,
    uploadImage,
    removeImage,
  } = useAssets(mapId);

  // Gestion des templates
  const {
    allTemplates,
    createMindMapFromTemplate,
    favoriteTemplates,
  } = useTemplates();

  return (
    // ... utiliser les hooks ...
  );
}
```

---

## 7. Stockage Persistant

Les hooks utilisent Zustand avec persistence automatique:

- **Thèmes**: `localStorage` → clé `bigmind-themes`
- **Assets**: `localStorage` → clé `bigmind-assets`
- **Templates**: `localStorage` → clé `bigmind-templates`

Aucune configuration supplémentaire n'est nécessaire !

---

## 8. Actions Clavier Suggérées

Ajouter les raccourcis clavier Phase 2:

```typescript
const shortcuts = {
  'Ctrl+I': 'insertImage',
  'Ctrl+Shift+S': 'insertSticker',
  'Ctrl+Shift+T': 'changeTheme',
  'Ctrl+T': 'showTemplateGallery',
};
```

---

## 9. Migration des Données Existantes

Pour supporter les cartes existantes:

```typescript
// Enrichir les MindMaps existantes avec les nouvelles fonctionnalités
import { XMindPhase2Parser } from '@bigmind/core';

async function enrichLegacyMindMap(mindMap: MindMap) {
  // Ajouter une AssetLibrary vide
  if (!mindMap.assetLibrary) {
    mindMap.assetLibrary = {
      images: {},
      stickers: {},
      totalSize: 0,
      sizeLimit: 50 * 1024 * 1024,
    };
  }

  // Ajouter un thème par défaut
  if (!mindMap.themeId) {
    mindMap.themeId = 'classic';
  }

  return mindMap;
}
```

---

## 10. Checklist d'Intégration

- [ ] Importer les hooks dans `MainLayout.tsx`
- [ ] Ajouter les dialogues pour insertion d'images/stickers
- [ ] Mettre à jour le `MenuBar` avec les nouvelles actions
- [ ] Ajouter l'onglet "Assets" dans la `Sidebar`
- [ ] Ajouter la section "Thèmes" dans `Settings`
- [ ] Ajouter la section "Templates" dans `Settings`
- [ ] Configurer les raccourcis clavier
- [ ] Tester l'upload d'images
- [ ] Tester l'insertion de stickers
- [ ] Tester la sélection de thèmes
- [ ] Tester la création depuis templates
- [ ] Valider la persistance localStorage

---

## Notes Importantes

1. **Tous les composants sont standalone** - Utilisez-les indépendamment
2. **Les hooks gèrent l'état global** - Pas besoin de props drilling
3. **Persistence automatique** - Les données sont sauvegardées dans localStorage
4. **TypeScript strict** - Tous les types sont définis
5. **Responsive design** - Fonctionne sur mobile/tablette/desktop

---

**Version**: Phase 2 - Integration Guide
**Dernière mise à jour**: Octobre 2025
