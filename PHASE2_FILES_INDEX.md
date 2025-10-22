# 📑 Phase 2 - Index Complet des Fichiers

## 🗂️ Structure Complète Phase 2

### Core Package (@bigmind/core)

**Location**: `packages/core/src/`

#### Types & Interfaces
- **`themes.ts`** (185 lignes)
  - `ThemeColorScheme` - Schéma de couleurs
  - `ThemeNodeStyles` - Styles de nœuds par niveau
  - `Theme` - Configuration thème complète
  - `ThemeCategory` enum
  - `ThemePreferences` - Préférences utilisateur
  - `ThemeUtils` - Utilitaires (validation, export, import)

- **`assets.ts`** (285 lignes)
  - `AssetPosition` enum
  - `ImageAsset` - Interface pour images
  - `StickerAsset` - Interface pour stickers
  - `StickerCategory` enum
  - `NodeAsset` - Asset attaché à nœud
  - `AssetLibrary` - Bibliothèque d'assets
  - `AssetUtils` - Utilitaires (validation, resize, etc.)

- **`templates.ts`** (280 lignes)
  - `TemplateMetadata` - Métadonnées
  - `Template` - Template complet
  - `TemplateCollection` - Collection de templates
  - `TemplatePreferences` - Préférences
  - `TemplateFilter` - Critères de filtrage
  - `TemplateCategory` & `TemplateComplexity` enums
  - `TemplateUtils` - Utilitaires

#### Parsers
- **`parsers/xmind-phase2.ts`** (340 lignes)
  - `XMindPhase2Parser` - Parser Phase 2 complet
  - `extractImagesFromZip()` - Extraction d'images
  - `extractNodeAssets()` - Assets depuis nœuds
  - `createXMindFromMindMap()` - Export vers .xmind
  - `exportMindMapAsXMind()` - Export avec téléchargement
  - `validatePhase2Compatibility()` - Validation

#### Exports
- **`index.ts`** (updated)
  - Export de `themes.ts`, `assets.ts`, `templates.ts`, `xmind-phase2.ts`

---

### Design Package (@bigmind/design)

**Location**: `packages/design/src/`

#### Thèmes
- **`theme-presets.ts`** (450 lignes)
  - `classicTheme` - Thème par défaut
  - `darkProfessionalTheme` - Thème sombre professionnel
  - `minimalTheme` - Thème minimaliste
  - `creativeColorfulTheme` - Thème créatif
  - `natureTheme` - Thème nature
  - `oceanTheme` - Thème océan
  - `sunsetTheme` - Thème coucher de soleil
  - `corporateTheme` - Thème corporate
  - `PRESET_THEMES` constant
  - `getThemeById()` function
  - `getThemesByCategory()` function
  - `DEFAULT_THEME` constant

#### Stickers
- **`sticker-library.ts`** (420 lignes)
  - `priorityStickers` array (4 stickers)
  - `statusStickers` array (5 stickers)
  - `progressStickers` array (5 stickers)
  - `emotionStickers` array (4 stickers)
  - `businessStickers` array (5 stickers)
  - `techStickers` array (5 stickers)
  - `natureStickers` array (4 stickers)
  - `ALL_STICKERS` constant
  - `getStickerById()` function
  - `getStickersByCategory()` function
  - `searchStickersByTag()` function
  - `getCustomizableStickers()` function

#### Templates
- **`template-presets.ts`** (350 lignes)
  - `createBrainstormingTemplate()` function
  - `createProjectPlanningTemplate()` function
  - `createSwotTemplate()` function
  - `createDecisionMakingTemplate()` function
  - `createLearningTemplate()` function
  - `createOrganizationTemplate()` function
  - `PRESET_TEMPLATES` constant
  - `getTemplateById()` function
  - `getTemplatesByCategory()` function
  - `searchTemplates()` function

#### Exports
- **`index.ts`** (updated)
  - Export de `theme-presets.ts`, `sticker-library.ts`, `template-presets.ts`

---

### Web Components (apps/web/src)

#### Components
**Location**: `apps/web/src/components/`

- **`ThemeSelector.tsx`** (320 lignes)
  - Props: `onThemeSelect`
  - Displays themes in grid with color preview
  - Favorite management
  - Custom theme creation
  - Export/Import functionality
  - Category grouping

- **`ImageManager.tsx`** (280 lignes)
  - Props: `mapId`, `onImageSelect`
  - File upload with validation
  - Space usage bar
  - Image previews
  - Download/Copy/Delete actions
  - File size formatting

- **`StickerPicker.tsx`** (350 lignes)
  - Props: `mapId`, `selectedNodeId`, `onStickerSelect`
  - Search by tag
  - Category filtering
  - Color customization
  - Custom sticker library display
  - Sticker info and tips

- **`TemplateGallery.tsx`** (380 lignes)
  - Props: `onTemplateSelect`
  - Multiple views (all, recent, favorites, custom)
  - Search functionality
  - Category grouping
  - Template preview cards
  - Export/Delete actions

#### Dialogs
**Location**: `apps/web/src/components/dialogs/`

- **`InsertImageDialog.tsx`** (45 lignes)
  - Modal for inserting images
  - Wraps ImageManager
  - Props: `mapId`, `onClose`, `onImageInsert`

- **`InsertStickerDialog.tsx`** (50 lignes)
  - Modal for inserting stickers
  - Wraps StickerPicker
  - Props: `mapId`, `selectedNodeId`, `onClose`, `onStickerInsert`

#### Hooks
**Location**: `apps/web/src/hooks/`

- **`useThemes.ts`** (170 lignes)
  - State management for themes
  - Zustand store with persist + immer
  - Returns:
    - `activeThemeId`, `activeTheme`, `customThemes`, `favoriteThemeIds`, `allThemes`, `favoriteThemes`
    - `setActiveTheme()`, `addCustomTheme()`, `updateCustomTheme()`, `deleteCustomTheme()`, `toggleFavorite()`
    - `createCustomTheme()`, `getThemesByCategory()`, `exportTheme()`, `importTheme()`

- **`useAssets.ts`** (240 lignes)
  - State management for images and stickers
  - Zustand store with persist + immer
  - Returns:
    - `library`, `images`, `customStickers`, `availableSpace`, `usagePercentage`
    - `uploadImage()`, `removeImage()`, `updateImage()`
    - `addSticker()`, `removeSticker()`
    - `getStickersInCategory()`, `searchStickers()`

- **`useTemplates.ts`** (280 lignes)
  - State management for templates
  - Zustand store with persist + immer
  - Returns:
    - `allTemplates`, `customTemplates`, `favoriteTemplates`, `recentTemplates`
    - `addCustomTemplate()`, `deleteCustomTemplate()`, `toggleFavorite()`
    - `getTemplateById()`, `filterTemplates()`, `searchByText()`
    - `getTemplatesByCategory()`, `getTemplatesByComplexity()`
    - `createMindMapFromTemplate()`, `createTemplateFromMindMap()`
    - `exportTemplate()`, `importTemplate()`

---

### Tests

**Location**: `tests/` et `apps/web/src/hooks/__tests__/`

#### Unit Tests
- **`useThemes.test.ts`** (90 lignes)
  - 9 tests complets
  - Tests de chargement, changement, création, favoris, export/import

- **`useAssets.test.ts`** (85 lignes)
  - 8 tests complets
  - Tests d'upload, suppression, stickers, recherche

- **`useTemplates.test.ts`** (110 lignes)
  - 10 tests complets
  - Tests de création, favoris, recherche, export

#### E2E Tests
- **`phase2.spec.ts`** (220 lignes)
  - 20 tests Playwright
  - Tests complets des fonctionnalités Phase 2
  - Thèmes, Images, Stickers, Templates, Intégration

---

### Documentation

**Location**: Racine du projet

- **`PHASE2_PROGRESS.md`**
  - Documentation détaillée de l'implémentation
  - Architecture et patterns
  - Statistiques du projet

- **`PHASE2_INTEGRATION_GUIDE.md`**
  - Guide complet d'intégration
  - Exemples de code pour chaque composant
  - Checklist d'intégration

- **`PHASE2_COMPLETION_REPORT.md`**
  - Rapport détaillé de complétude
  - Métriques et statistiques
  - Notes importantes

- **`PHASE2_QUICKSTART.md`**
  - Guide rapide de démarrage
  - Exemples concis et directs
  - Troubleshooting

- **`CHANGELOG_PHASE2.md`**
  - Changelog complète
  - Features ajoutées
  - Compatibilité et migration

- **`PHASE2_FILES_INDEX.md`**
  - Ce fichier!
  - Index complet des fichiers

---

## 📊 Résumé par Catégorie

### Core Types (851 lignes)
- themes.ts: 185 lignes
- assets.ts: 285 lignes
- templates.ts: 280 lignes
- xmind-phase2.ts: 340 lignes

**Total Core**: 1,090 lignes

### Design System (1,220 lignes)
- theme-presets.ts: 450 lignes
- sticker-library.ts: 420 lignes
- template-presets.ts: 350 lignes

**Total Design**: 1,220 lignes

### Components (1,425 lignes)
- ThemeSelector.tsx: 320 lignes
- ImageManager.tsx: 280 lignes
- StickerPicker.tsx: 350 lignes
- TemplateGallery.tsx: 380 lignes
- Dialogs: 95 lignes

**Total Components**: 1,425 lignes

### Hooks (690 lignes)
- useThemes.ts: 170 lignes
- useAssets.ts: 240 lignes
- useTemplates.ts: 280 lignes

**Total Hooks**: 690 lignes

### Tests (505 lignes)
- Unitaires: 285 lignes (27 tests)
- E2E: 220 lignes (20 tests)

**Total Tests**: 505 lignes

### Documentation (~2,000 lignes)
- PHASE2_PROGRESS.md: 400 lignes
- PHASE2_INTEGRATION_GUIDE.md: 450 lignes
- PHASE2_COMPLETION_REPORT.md: 500 lignes
- PHASE2_QUICKSTART.md: 350 lignes
- CHANGELOG_PHASE2.md: 300 lignes

**Total Documentation**: ~2,000 lignes

---

## 🔍 Recherche Rapide

### Par Fonctionnalité

**Thèmes**
- Types: `packages/core/src/themes.ts`
- Présets: `packages/design/src/theme-presets.ts`
- Component: `apps/web/src/components/ThemeSelector.tsx`
- Hook: `apps/web/src/hooks/useThemes.ts`
- Tests: `apps/web/src/hooks/__tests__/useThemes.test.ts`

**Images**
- Types: `packages/core/src/assets.ts`
- Component: `apps/web/src/components/ImageManager.tsx`
- Dialog: `apps/web/src/components/dialogs/InsertImageDialog.tsx`
- Hook: `apps/web/src/hooks/useAssets.ts`
- Tests: `apps/web/src/hooks/__tests__/useAssets.test.ts`

**Stickers**
- Types: `packages/core/src/assets.ts`
- Library: `packages/design/src/sticker-library.ts`
- Component: `apps/web/src/components/StickerPicker.tsx`
- Dialog: `apps/web/src/components/dialogs/InsertStickerDialog.tsx`
- Hook: `apps/web/src/hooks/useAssets.ts`
- Tests: `apps/web/src/hooks/__tests__/useAssets.test.ts`

**Templates**
- Types: `packages/core/src/templates.ts`
- Présets: `packages/design/src/template-presets.ts`
- Component: `apps/web/src/components/TemplateGallery.tsx`
- Hook: `apps/web/src/hooks/useTemplates.ts`
- Tests: `apps/web/src/hooks/__tests__/useTemplates.test.ts`

**Parsers**
- Parser XMind Phase 2: `packages/core/src/parsers/xmind-phase2.ts`
- E2E Tests: `tests/phase2.spec.ts`

### Par Type de Fichier

**Types TypeScript**
- `packages/core/src/themes.ts`
- `packages/core/src/assets.ts`
- `packages/core/src/templates.ts`

**Composants React**
- `apps/web/src/components/ThemeSelector.tsx`
- `apps/web/src/components/ImageManager.tsx`
- `apps/web/src/components/StickerPicker.tsx`
- `apps/web/src/components/TemplateGallery.tsx`

**Dialogs**
- `apps/web/src/components/dialogs/InsertImageDialog.tsx`
- `apps/web/src/components/dialogs/InsertStickerDialog.tsx`

**Hooks**
- `apps/web/src/hooks/useThemes.ts`
- `apps/web/src/hooks/useAssets.ts`
- `apps/web/src/hooks/useTemplates.ts`

**Tests**
- `apps/web/src/hooks/__tests__/useThemes.test.ts`
- `apps/web/src/hooks/__tests__/useAssets.test.ts`
- `apps/web/src/hooks/__tests__/useTemplates.test.ts`
- `tests/phase2.spec.ts`

**Documentation**
- `PHASE2_PROGRESS.md`
- `PHASE2_INTEGRATION_GUIDE.md`
- `PHASE2_COMPLETION_REPORT.md`
- `PHASE2_QUICKSTART.md`
- `CHANGELOG_PHASE2.md`

---

## 💡 Navigation Tips

1. **Pour comprendre les types**: Commencez par `packages/core/src/`
2. **Pour utiliser les présets**: Allez voir `packages/design/src/`
3. **Pour implémenter l'UI**: Regardez `apps/web/src/components/`
4. **Pour gérer l'état**: Consultez `apps/web/src/hooks/`
5. **Pour tester**: Voir `tests/` et `__tests__/`
6. **Pour intégrer**: Lisez `PHASE2_INTEGRATION_GUIDE.md`
7. **Pour démarrer**: Lisez `PHASE2_QUICKSTART.md`

---

## 📦 Dépendances entre fichiers

```
themes.ts
  ↓
theme-presets.ts
  ↓
ThemeSelector.tsx + useThemes.ts

assets.ts
  ↓
sticker-library.ts
  ↓
ImageManager.tsx + StickerPicker.tsx + useAssets.ts

templates.ts
  ↓
template-presets.ts
  ↓
TemplateGallery.tsx + useTemplates.ts

xmind-phase2.ts
  ↓
Parsers (support images et thèmes)
```

---

## ✅ Checklist d'Intégration

- [ ] Importer les types depuis `packages/core/src/`
- [ ] Importer les présets depuis `packages/design/src/`
- [ ] Importer les composants depuis `apps/web/src/components/`
- [ ] Importer les dialogs depuis `apps/web/src/components/dialogs/`
- [ ] Utiliser les hooks depuis `apps/web/src/hooks/`
- [ ] Configurer les tests
- [ ] Lire le guide d'intégration

---

**Generated**: Octobre 2025
**Version**: Phase 2 Complete
**Status**: ✅ Ready for Integration

