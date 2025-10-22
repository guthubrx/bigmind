# ⚡ Phase 2 - Quick Start Guide

## 🎯 Vue Rapide

BigMind Phase 2 ajoute:
- **8 thèmes visuels** customisables
- **Gestion d'images** avec upload et preview
- **48 stickers** pour annoter les nœuds
- **6 templates** pour démarrer rapidement

Tout cela avec **zéro configuration** et **100% compatible** avec Phase 1 !

---

## 🚀 Installation Rapide

### 1. Vérifier les dépendances
```bash
node --version      # >= 18.0.0
npm --version       # >= 9.0.0
pnpm --version      # >= 8.0.0
```

### 2. Installer le projet
```bash
cd bigmind
pnpm install
```

### 3. Lancer l'app web
```bash
pnpm dev:web
```

Accédez à: `http://localhost:5173`

---

## 📚 Utiliser les Composants Phase 2

### Dans votre composant React

```typescript
import { ThemeSelector } from './components/ThemeSelector';
import { ImageManager } from './components/ImageManager';
import { StickerPicker } from './components/StickerPicker';
import { TemplateGallery } from './components/TemplateGallery';

export function MyComponent() {
  return (
    <>
      {/* Sélecteur de thèmes */}
      <ThemeSelector onThemeSelect={(theme) => console.log(theme.name)} />

      {/* Gestionnaire d'images */}
      <ImageManager mapId="map-123" />

      {/* Sélecteur de stickers */}
      <StickerPicker mapId="map-123" />

      {/* Galerie de templates */}
      <TemplateGallery onTemplateSelect={(mindMap) => console.log(mindMap)} />
    </>
  );
}
```

---

## 🎨 Utiliser les Hooks Phase 2

### useThemes() - Gestion des thèmes

```typescript
import { useThemes } from './hooks/useThemes';

function MyThemeComponent() {
  const {
    activeTheme,
    allThemes,
    setActiveTheme,
    createCustomTheme,
    favoriteThemes,
    toggleFavorite,
  } = useThemes();

  return (
    <div>
      <h2>Thème actif: {activeTheme.name}</h2>

      {/* Lister tous les thèmes */}
      {allThemes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => setActiveTheme(theme.id)}
          className={activeTheme.id === theme.id ? 'active' : ''}
        >
          {theme.name}
        </button>
      ))}

      {/* Créer un thème personnalisé */}
      <button onClick={() => createCustomTheme('Mon Thème', {
        description: 'Ma création'
      })}>
        Créer thème
      </button>

      {/* Gérer les favoris */}
      {favoriteThemes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => toggleFavorite(theme.id)}
        >
          ⭐ {theme.name}
        </button>
      ))}
    </div>
  );
}
```

### useAssets() - Gestion images et stickers

```typescript
import { useAssets } from './hooks/useAssets';

function MyAssetsComponent() {
  const {
    images,
    customStickers,
    uploadImage,
    removeImage,
    addSticker,
    usagePercentage,
  } = useAssets('map-123');

  const handleUpload = async (file: File) => {
    const image = await uploadImage(file);
    if (image) {
      console.log('Image uploaded:', image.fileName);
    }
  };

  return (
    <div>
      <h2>Images ({images.length})</h2>
      <p>Espace utilisé: {usagePercentage}%</p>

      {images.map((img) => (
        <div key={img.id}>
          <img src={img.data} alt={img.fileName} />
          <button onClick={() => removeImage(img.id)}>Supprimer</button>
        </div>
      ))}

      <h2>Stickers ({customStickers.length})</h2>
      {customStickers.map((sticker) => (
        <button
          key={sticker.id}
          onClick={() => console.log('Sticker selected:', sticker.name)}
        >
          {sticker.name}
        </button>
      ))}
    </div>
  );
}
```

### useTemplates() - Gestion des templates

```typescript
import { useTemplates } from './hooks/useTemplates';

function MyTemplatesComponent() {
  const {
    allTemplates,
    favoriteTemplates,
    createMindMapFromTemplate,
    toggleFavorite,
  } = useTemplates();

  return (
    <div>
      <h2>Templates ({allTemplates.length})</h2>

      {allTemplates.map((template) => (
        <div key={template.metadata.id}>
          <h3>{template.metadata.name}</h3>
          <p>{template.metadata.description}</p>

          <button
            onClick={() => createMindMapFromTemplate(template.metadata.id)}
          >
            Utiliser
          </button>

          <button
            onClick={() => toggleFavorite(template.metadata.id)}
          >
            ⭐
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🧪 Exécuter les Tests

### Tests Unitaires

```bash
# Tests des hooks
pnpm test -- useThemes.test
pnpm test -- useAssets.test
pnpm test -- useTemplates.test

# Tous les tests
pnpm test
```

### Tests E2E (Playwright)

```bash
# Lancer les tests E2E
pnpm test:e2e -- tests/phase2.spec.ts

# Mode headed (voir le navigateur)
pnpm test:e2e -- --headed

# Mode debug
pnpm test:e2e -- --debug
```

### Coverage

```bash
# Générer le rapport de couverture
pnpm test -- --coverage

# Ouvrir le rapport HTML
open coverage/index.html
```

---

## 📦 Importer/Exporter

### Exporter un thème

```typescript
const { exportTheme } = useThemes();

const json = exportTheme('theme-id');
// Télécharger manuellement
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'mon-theme.json';
a.click();
```

### Importer un thème

```typescript
const { importTheme } = useThemes();

const json = `{"id":"...","name":"...",...}`;
const theme = importTheme(json);
if (theme) {
  console.log('Thème importé:', theme.name);
}
```

### Exporter une MindMap avec assets

```typescript
import { XMindPhase2Parser } from '@bigmind/core';

async function exportMap(mindMap: MindMap) {
  const blob = await XMindPhase2Parser.createXMindFromMindMap(mindMap);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${mindMap.meta.name}.xmind`;
  a.click();
}
```

---

## 🎭 Exemples Complets

### Exemple 1: Sélecteur de thème dans un modal

```typescript
import { useState } from 'react';
import { ThemeSelector } from './components/ThemeSelector';

export function ThemeModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Changer le thème</button>

      {open && (
        <div className="modal">
          <div className="modal-content">
            <h2>Sélectionner un thème</h2>
            <ThemeSelector
              onThemeSelect={(theme) => {
                console.log('Thème choisi:', theme.name);
                setOpen(false);
              }}
            />
            <button onClick={() => setOpen(false)}>Fermer</button>
          </div>
        </div>
      )}
    </>
  );
}
```

### Exemple 2: Créer une carte depuis un template

```typescript
import { useTemplates } from './hooks/useTemplates';

export function StartFromTemplate() {
  const { allTemplates, createMindMapFromTemplate } = useTemplates();

  const handleStart = (templateId: string) => {
    const mindMap = createMindMapFromTemplate(
      templateId,
      'Ma nouvelle carte'
    );

    if (mindMap) {
      // Rediriger vers l'éditeur
      window.location.href = `/editor/${mindMap.id}`;
    }
  };

  return (
    <div className="templates-grid">
      {allTemplates.map((template) => (
        <div key={template.metadata.id} className="template-card">
          <h3>{template.metadata.name}</h3>
          <p>{template.metadata.description}</p>
          <button
            onClick={() => handleStart(template.metadata.id)}
          >
            Commencer
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Exemple 3: Gestion complète des assets

```typescript
import { useAssets } from './hooks/useAssets';
import { ImageManager } from './components/ImageManager';
import { StickerPicker } from './components/StickerPicker';

export function AssetManager({ mapId }: { mapId: string }) {
  const [view, setView] = useState<'images' | 'stickers'>('images');
  const { images, customStickers } = useAssets(mapId);

  return (
    <div>
      <div className="tabs">
        <button
          onClick={() => setView('images')}
          className={view === 'images' ? 'active' : ''}
        >
          Images ({images.length})
        </button>
        <button
          onClick={() => setView('stickers')}
          className={view === 'stickers' ? 'active' : ''}
        >
          Stickers ({customStickers.length})
        </button>
      </div>

      {view === 'images' && <ImageManager mapId={mapId} />}
      {view === 'stickers' && <StickerPicker mapId={mapId} />}
    </div>
  );
}
```

---

## 💾 Données Persistantes

Tous les données Phase 2 sont automatiquement sauvegardées:

```javascript
// localStorage keys
localStorage['bigmind-themes']     // Thèmes personnalisés
localStorage['bigmind-assets']     // Images et stickers
localStorage['bigmind-templates']  // Templates personnalisés
```

Vous pouvez exporter/importer:

```typescript
// Exporter les données
const data = {
  themes: localStorage.getItem('bigmind-themes'),
  assets: localStorage.getItem('bigmind-assets'),
  templates: localStorage.getItem('bigmind-templates'),
};
const json = JSON.stringify(data);

// Importer les données
const data = JSON.parse(json);
localStorage.setItem('bigmind-themes', data.themes);
localStorage.setItem('bigmind-assets', data.assets);
localStorage.setItem('bigmind-templates', data.templates);
```

---

## 🐛 Troubleshooting

### Problème: Thèmes ne se chargent pas
```bash
# Solution: Vérifier l'import
import { PRESET_THEMES } from '@bigmind/design';

// Vérifier
console.log(PRESET_THEMES.length); // Should be 8
```

### Problème: Images ne s'upload pas
```bash
# Vérifier la console du navigateur
console.log(availableSpace); // Doit être > 0

# Vérifier le type MIME
console.log(file.type); // image/png, image/jpeg, etc.
```

### Problème: Tests échouent
```bash
# Nettoyer et réinstaller
pnpm clean
pnpm install

# Exécuter les tests
pnpm test -- --watch
```

---

## 📖 Documentation Complète

Pour plus de détails:

- **PHASE2_PROGRESS.md** - Architecture et design
- **PHASE2_INTEGRATION_GUIDE.md** - Guide d'intégration complet
- **PHASE2_COMPLETION_REPORT.md** - Rapport détaillé

---

## ✅ Checklist de Déploiement

- [ ] Phase 2 installée et testée localement
- [ ] Tests unitaires passent
- [ ] Tests E2E passent
- [ ] Composants intégrés dans l'UI existante
- [ ] localStorage fonctionne
- [ ] Export/Import testé
- [ ] Performance acceptable
- [ ] Code review complété
- [ ] Documentation mise à jour
- [ ] Prêt pour production

---

## 🎓 Ressources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Playwright Docs](https://playwright.dev)
- [BigMind GitHub](https://github.com/guthubrx/bigmind)

---

## 🤝 Support

Pour des questions ou problèmes:
1. Vérifier la documentation Phase 2
2. Vérifier les tests pour des exemples
3. Consulter les logs du navigateur (F12)
4. Créer une issue sur GitHub

---

**Happy coding! 🚀**

*Version: Phase 2 QuickStart*
*Last Updated: Octobre 2025*
