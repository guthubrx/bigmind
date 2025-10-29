# BigMind Core Systems - Phase 3

Infrastructure de base pour l'extensibilité des plugins avec isolation et sécurité.

## 📦 Systèmes implémentés

### 1. Slot/Fill System (`./ui`)

Système d'extension UI déclaratif inspiré de WordPress Gutenberg.

**Utilisation:**

```tsx
import { Slot, Fill, SlotFillProvider } from '@/core/ui';

// Dans le composant hôte
<Slot name="toolbar" fallback={<div>Pas d'extensions</div>} />

// Dans un plugin
<Fill slot="toolbar" order={10}>
  <button>Mon bouton</button>
</Fill>
```

**Fichiers:**
- `SlotFillContext.tsx` - Context Provider avec gestion d'état
- `Slot.tsx` - Composant pour recevoir des Fills
- `Fill.tsx` - Composant pour injecter du contenu
- `types.ts` - Interfaces TypeScript

### 2. WebView System (`./webviews`)

Système de sandboxing sécurisé pour les UIs de plugins via iframes.

**Utilisation:**

```tsx
import { WebView } from '@/core/webviews';

<WebView
  id="my-plugin-view"
  pluginId="my-plugin"
  src="/plugins/my-plugin/ui.html"
  sandbox={['allow-scripts']}
/>
```

**Fichiers:**
- `WebView.tsx` - Composant iframe sandboxed
- `WebViewManager.ts` - Gestionnaire de lifecycle
- `MessageBridge.ts` - Communication PostMessage
- `MessageValidator.ts` - Validation Zod
- `CSPGenerator.ts` - Génération Content Security Policy

### 3. Command System (`./commands`)

Registre de commandes universel avec Command Palette (Cmd+K).

**Utilisation:**

```tsx
import { commandRegistry, CommandPalette, useCommandPalette } from '@/core/commands';

// Enregistrer une commande
commandRegistry.register({
  id: 'file.save',
  title: 'Enregistrer le fichier',
  category: 'Fichier',
  shortcut: 'Cmd+S',
  handler: async () => {
    await saveFile();
  }
});

// Utiliser la palette
function App() {
  const { isOpen, close } = useCommandPalette();

  return <CommandPalette isOpen={isOpen} onClose={close} />;
}
```

**Fichiers:**
- `CommandRegistry.ts` - Registre centralisé
- `CommandExecutor.ts` - Exécution avec contexte
- `KeyboardManager.ts` - Gestion raccourcis clavier
- `fuzzyMatcher.ts` - Recherche floue (Levenshtein)
- `CommandPalette.tsx` - UI modale VSCode-style

### 4. Theme System (`./theme`)

Système de thèmes avec design tokens et CSS variables.

**Utilisation:**

```tsx
import { ThemeProvider, useTheme } from '@/core/theme';

function App() {
  return (
    <ThemeProvider>
      <MyApp />
    </ThemeProvider>
  );
}

function MyComponent() {
  const { theme, setTheme, toggleMode } = useTheme();

  return (
    <div style={{ color: theme.colors.fg }}>
      <button onClick={toggleMode}>
        Mode: {theme.mode}
      </button>
    </div>
  );
}
```

**CSS Variables:**

```css
.my-component {
  background: var(--color-bg);
  color: var(--color-fg);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}
```

**Fichiers:**
- `ThemeManager.ts` - Gestion état et CSS variables
- `ThemeProvider.tsx` - Context Provider React
- `defaultThemes.ts` - Thèmes light/dark
- `types.ts` - Interfaces design tokens

## 🔒 Sécurité

### WebView Isolation

- **Sandbox**: `allow-scripts` uniquement (pas de `allow-same-origin` par défaut)
- **CSP**: Content Security Policy strict
- **MessageChannel**: Communication isolée via ports dédiés
- **Validation**: Schémas Zod pour tous les messages
- **Sanitization**: Nettoyage des payloads (suppression __proto__, etc.)

### Permission System

Chaque WebView déclare ses permissions:

```json
{
  "permissions": ["data.read", "ui.showPanel", "storage.get"]
}
```

Le système vérifie les permissions avant chaque opération.

## 🔄 Legacy Adapter

Compatibilité avec les anciennes APIs pour migration progressive.

**Fichiers:**
- `ui/LegacyUIAdapter.ts` - Wrappers pour registerPanel(), etc.
- `ui/UnifiedUIManager.ts` - Bridge modern/legacy

**Métriques de migration:**

```ts
import { legacyUIAdapter } from '@/core/ui/LegacyUIAdapter';

const metrics = legacyUIAdapter.getMetrics();
console.log(metrics); // { registerPanel: 3, ... }
```

## 📊 Architecture

```
apps/web/src/core/
├── ui/              # Slot/Fill System
│   ├── SlotFillContext.tsx
│   ├── Slot.tsx
│   ├── Fill.tsx
│   ├── LegacyUIAdapter.ts
│   ├── UnifiedUIManager.ts
│   └── types.ts
│
├── webviews/        # WebView System
│   ├── WebView.tsx
│   ├── WebViewManager.ts
│   ├── MessageBridge.ts
│   ├── MessageValidator.ts
│   ├── CSPGenerator.ts
│   └── types.ts
│
├── commands/        # Command System
│   ├── CommandRegistry.ts
│   ├── CommandExecutor.ts
│   ├── KeyboardManager.ts
│   ├── fuzzyMatcher.ts
│   ├── CommandPalette.tsx
│   ├── CommandPalette.css
│   └── types.ts
│
├── theme/           # Theme System
│   ├── ThemeManager.ts
│   ├── ThemeProvider.tsx
│   ├── defaultThemes.ts
│   └── types.ts
│
└── index.ts         # Exports centralisés
```

## 🚀 Migration depuis Phase 2

### Avant (Phase 2)
```ts
// Plugin ancien style
import { registerPanel } from '@/utils/panelRegistry';

registerPanel({
  id: 'my-panel',
  component: <MyPanel />
});
```

### Après (Phase 3)
```json
// manifest.json
{
  "ui": {
    "contributions": {
      "panels": [{
        "id": "my-panel",
        "slot": "sidebarPanel",
        "webview": {
          "src": "/plugins/my-plugin/panel.html"
        }
      }]
    }
  }
}
```

## 📝 TODO

- [ ] Tests unitaires pour chaque système
- [ ] Tests d'intégration
- [ ] Documentation API complète
- [ ] Exemples de plugins
- [ ] Migration des plugins existants
- [ ] Audit CSS pour CSS variables
- [ ] Tests d'accessibilité WCAG 2.1
- [ ] Performance benchmarks

## 📚 Resources

- [Plan d'implémentation Phase 3](../../../PHASE3_IMPLEMENTATION_PLAN.md)
- [Plugin SDK](../../../packages/plugin-sdk/)
- [Documentation plugins](https://docs.bigmind.dev/plugins)
