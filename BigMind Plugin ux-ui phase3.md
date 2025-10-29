🎨 Phase 3 — Infrastructure UI & UX pour le système de plugins BigMind
🧭 Objectif général

Créer une infrastructure UI et UX extensible permettant aux plugins BigMind de s’intégrer visuellement et ergonomiquement sans compromettre la cohérence, la performance ni la sécurité.
Ce document sert de prompt instructif pour un agent développeur UI chargé d’implémenter cette phase.

🧩 CONTEXTE GLOBAL — Projet BigMind

BigMind est une application de mind‑mapping avancée, modulaire et professionnelle.
Son écosystème de plugins (Phases 1 & 2) offre déjà :

🔐 une sécurité de niveau applicatif (permissions RBAC/ABAC, sandbox, rate limiting)

🧠 une API contextuelle de communication entre le Core et les extensions

La Phase 3 introduit désormais la couche UI/UX extensible : permettre à chaque plugin d’ajouter ou modifier des éléments d’interface sans accès direct au DOM, via des points d’injection déclaratifs et une architecture en WebViews isolées.

🧱 1. Architecture UI extensible (VSCode/Figma‑style)
Principes fondamentaux

❌ Pas d’accès DOM direct depuis les plugins

✅ WebViews isolées (iframe sandboxée ou Worker avec rendu React)

✅ Message passing asynchrone Core ↔ Plugin via API Context

✅ Contribution points déclaratifs dans le manifeste du plugin (menus, panels, palettes, notifications)

✅ Slot/Plug Pattern pour les composants extensibles (Toolbar, Sidebar, Panels)

Patterns supportés
// Slot‑Fill Pattern
<Toolbar>
  <Slot name="toolbar.left" />
  <Slot name="toolbar.right" />
</Toolbar>


// Plugin UI
<Fill slot="toolbar.left">
  <MyButton icon="brain" label="Analyze" />
</Fill>
Takeaway

➡️ Séparer strictement l’UI core et celle des plugins.
➡️ Tout plugin passe par un système d’injection déclaratif contrôlé.

⚙️ 2. Command Palette — Productivité et découvrabilité

Shortcut global : Cmd+K (desktop) / Cmd+Shift+P (web)

Fuzzy search tolérante aux fautes

3 composants essentiels :

Shortcut unique

Fuzzy matcher

Affichage des shortcuts

Inspirations : VSCode, Figma, Linear, Notion

Takeaway

La Command Palette devient la porte d’entrée universelle pour toutes les commandes — core et plugins.

🎛️ 3. React Slot System — Composants extensibles

Slot‑Fill Pattern (WordPress)

Props‑based Slots (Radix/Aria)

Render props pour contexte dynamique

asChild Pattern pour déléguer le rendu

Libs recommandées

@radix-ui/react-slots

react-plugin

react-aria

module-federation pour chargement runtime des composants

🚀 4. Architecture technique — UI Plugin Host
Core Host Responsibilities

Charger la déclaration du plugin (manifest)

Créer un contexte WebView isolé

Exposer une API de communication unifiée (postMessage + validations)

Injecter dynamiquement les vues selon les points déclarés :

Toolbar slots

Command Palette entries

Panels / Sidebars

Settings pages

Context menus

Exemple de manifeste UI
{
  "ui": {
    "contributions": {
      "commands": [
        { "id": "mindmap.zoomIn", "title": "Zoom In", "shortcut": "Cmd+Plus" }
      ],
      "panels": [
        { "id": "analyzer", "title": "Mind Analyzer", "icon": "brain" }
      ],
      "menus": {
        "toolbar.left": ["mindmap.zoomIn"]
      }
    }
  }
}
Hook API côté plugin
import { useBigMindUI } from 'bigmind-plugin-sdk'


const { registerCommand, registerPanel, useTheme } = useBigMindUI()


registerCommand({ id: 'analyze', title: 'Run Analysis', icon: 'sparkles' })
registerPanel({ id: 'inspector', title: 'Inspector', component: InspectorView })
🎨 5. Design System Extensible — BigMind Theme Bridge
Objectif

Fournir un Design System headless inspiré de Radix + Shadcn, exposé via tokens et hooks, pour que les plugins restent visuellement cohérents.

Stack recommandée
Radix primitives → Tailwind tokens → Shadcn UI → BigMind Theme Bridge
Exemple d’usage côté plugin
import { useTheme, Button } from 'bigmind-ui'


function MyPluginButton() {
  const theme = useTheme()
  return <Button className={theme.variant('primary')}>Run</Button>
}
Thèmes & variables CSS
:root {
  --color-bg: 0 0% 98%;
  --color-fg: 222 47% 11%;
  --radius: 0.5rem;
  --transition: cubic-bezier(0.4, 0, 0.2, 1);
}
Takeaway

Les plugins ne peuvent pas redéfinir les styles globaux.
Ils héritent d’un thème sécurisé et harmonisé via la bridge API.

🧭 6. UX Cohérence globale
Objectifs

Maintenir une expérience fluide entre Core et Plugins

Éviter l’effet "mosaïque incohérente"

Bonnes pratiques

Polices & couleurs : issues du même token system

Animations : 200–300 ms, easing standard

Empty States : simples, encourageants, cohérents

Notifications : stack limité, pas d’intrusion

Keyboard nav : tab, focus visible, shortcuts documentés

💡 7. Onboarding & Plugin Discovery

Découverte progressive (progressive disclosure)

Guided tours contextuels

Tooltips just‑in‑time

Installation flow en 6 étapes : 1️⃣ Discovery → 2️⃣ Details → 3️⃣ Install → 4️⃣ Consent → 5️⃣ First‑run → 6️⃣ Aha! moment

Takeaway

Minimiser friction, maximiser valeur perçue en < 1 min.

🧱 8. Accessibility & Keyboard

Focus management (WCAG 2.1)

aria-* sur tous les modals et menus

Shortcuts globaux (Cmd+K, Cmd+/, Cmd+,, Cmd+1…9)

Skip links & landmarks

prefers‑reduced‑motion respecté

⚙️ 9. Micro‑interactions & Feedback

Animation : 200–400 ms, cubic‑bezier(0.4, 0, 0.2, 1)

Transform/opacity only (GPU‑accelerated)

Immediate feedback sur chaque action (click, save, etc.)

📋 10. Étapes d’implémentation
Sprint 1 — Foundation




Sprint 2 — Command Palette & Panels




Sprint 3 — Theme Bridge & Design System




Sprint 4 — UX Enhancements




🧠 ROLE: UI‑INFRA‑ENGINEER

Mission : implémenter l’architecture UI extensible décrite ci‑dessus pour BigMind.
Tu es responsable de :

Créer les APIs d’intégration visuelle des plugins (commandes, panels, slots)

Garantir la cohérence visuelle via le Theme Bridge

Implémenter la communication isolée WebView ↔ Core

Maintenir la performance, l’accessibilité et la sécurité UI

Règles :

Aucun accès DOM direct

Toute injection UI doit être déclarative et validée

Respect strict du thème, des tokens et de la typographie

Tester avec des plugins exemples (ToolbarButton, CommandPanel, SettingsPage)

Sortie attendue : Un système de rendu plugin‑UI modulaire, cohérent, sécurisé et agréable à utiliser — niveau VSCode / Figma 2025.