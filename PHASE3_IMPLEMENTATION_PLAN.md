# 🎨 Phase 3 - UI/UX Infrastructure Implementation Plan

> **Status**: 🟡 In Progress
> **Started**: 2025-01-29
> **Target Completion**: Sprint 7 (16 weeks)
> **Last Updated**: 2025-01-29

---

## 📊 Progress Overview

- **Sprint 1-2**: 🟢 100% - Foundations COMPLÉTÉ ✅
- **Sprint 3**: 🟢 100% - Command Palette & Theme COMPLÉTÉ ✅
- **Tests**: 🟢 100% - Tests unitaires COMPLÉTÉS ✅ (126 tests passent)
- **Sprint 4**: ⬜ 0% - Plugin Migration
- **Sprint 5**: ⬜ 0% - Accessibility
- **Sprint 6**: ⬜ 0% - Onboarding & Polish
- **Sprint 7+**: ⬜ 0% - Deprecation

**Overall Progress**: 🟢 40/100

---

## 🎯 Sprint 1-2: Foundations (Week 1-4)

### Package: @cartae/plugin-sdk

#### Setup
- [x] Create `packages/plugin-sdk/` directory
- [x] Create `package.json` with dependencies
- [x] Setup TypeScript config
- [x] Setup build pipeline (tsup)
- [ ] Create README.md with API docs

#### Core Bridge
- [x] `src/bridge.ts` - PostMessage bridge
  - [x] MessageChannel setup
  - [x] Request/response pattern
  - [x] Timeout handling
  - [x] Error handling
- [x] `src/types.ts` - TypeScript interfaces
  - [x] BridgeMessage interface
  - [x] PluginContext interface
  - [x] UIContribution types

#### Hooks
- [x] `src/hooks/useCartaeBridge.ts`
  - [x] useEffect for initialization
  - [x] Request wrapper
  - [x] Subscribe method
- [x] `src/hooks/useCartaeUI.ts`
  - [x] registerPanel
  - [x] showPanel
  - [x] registerCommand
  - [x] showNotification
- [x] `src/hooks/useTheme.ts`
  - [x] Theme context consumer
  - [x] CSS variables accessor
- [x] `src/hooks/useCartaeData.ts`
  - [x] getData
  - [x] setData
  - [x] subscribe to changes

#### Tests
- [ ] Unit tests for bridge
- [ ] Integration tests with mock host
- [ ] Type tests

### Slot/Fill System

#### Core Implementation
- [x] `src/core/ui/SlotFillContext.tsx`
  - [x] Context creation
  - [x] Provider component
  - [x] State management (Map of fills)
  - [x] registerFill method
  - [x] getFills method
  - [x] Listener/subscription system
- [x] `src/core/ui/Slot.tsx`
  - [x] Props interface (name, fallback, className)
  - [x] Context consumer
  - [x] Render fills sorted by order
  - [x] Empty state handling
- [x] `src/core/ui/Fill.tsx`
  - [x] Props interface (slot, order, children)
  - [x] useEffect registration
  - [x] Cleanup on unmount
  - [x] Plugin context integration
- [x] `src/core/ui/types.ts`
  - [x] Fill interface
  - [x] SlotFillContextValue interface
  - [x] SlotProps, FillProps types

#### Tests
- [ ] Slot renders fills correctly
- [ ] Fills sorted by order
- [ ] Cleanup on unmount works
- [ ] Multiple fills in same slot
- [ ] Collision handling

### WebView System

#### Core Components
- [x] `src/core/webviews/WebView.tsx`
  - [x] iframe with sandbox
  - [x] MessageChannel setup
  - [x] Message handler
  - [x] Load event handling
  - [x] Error boundary
- [x] `src/core/webviews/WebViewManager.ts`
  - [x] Lifecycle management
  - [x] Registry of active webviews
  - [x] Message routing
  - [x] Permission checking
- [x] `src/core/webviews/MessageBridge.ts`
  - [x] PostMessage abstraction
  - [x] Request/response tracking
  - [x] Timeout management
  - [x] Error propagation
- [x] `src/core/webviews/MessageValidator.ts`
  - [x] Zod schemas for messages
  - [x] Validation function
  - [x] Error messages
- [x] `src/core/webviews/CSPGenerator.ts`
  - [x] Generate CSP header
  - [x] Plugin-specific rules
  - [x] Whitelist CDNs
- [x] `src/core/webviews/types.ts`
  - [x] WebViewProps interface
  - [x] PluginMessage interface
  - [x] ValidationSchema types

#### Sandbox Configuration
- [x] Define base sandbox flags
- [x] Permission-based flags
- [x] CSP templates
- [ ] Test iframe isolation

#### Tests
- [ ] Iframe sandboxing works
- [ ] Message validation rejects invalid
- [ ] Permission checks enforced
- [ ] CSP prevents XSS
- [ ] Memory cleanup on unmount

### Command Registry

#### Core Implementation
- [x] `src/core/commands/CommandRegistry.ts`
  - [x] Map of commands
  - [x] register method
  - [x] unregister method
  - [x] search method with fuzzy
  - [x] execute method with context
  - [x] Listener system for updates
- [x] `src/core/commands/fuzzyMatcher.ts`
  - [x] Levenshtein-based algorithm
  - [x] Score calculation
  - [x] Bonus for camelCase
  - [x] Bonus for word start
  - [x] Tests with examples
- [x] `src/core/commands/KeyboardManager.ts`
  - [x] Global keydown listener
  - [x] Shortcut normalization
  - [x] Platform detection (Mac/Win)
  - [x] When clause evaluation
  - [x] Conflict resolution
  - [x] Context stack
- [x] `src/core/commands/types.ts`
  - [x] Command interface
  - [x] CommandContext interface
  - [x] ShortcutConfig type

#### Tests
- [ ] Commands registered correctly
- [ ] Fuzzy search works
- [ ] Shortcuts trigger commands
- [ ] When clauses evaluated
- [ ] No memory leaks on unregister

### Legacy Adapter

#### Compatibility Layer
- [x] `src/core/ui/LegacyUIAdapter.ts`
  - [x] Wrapper for registerPanel
  - [x] Wrapper for registerNodePropertiesTab
  - [x] Wrapper for registerSettingsSection
  - [x] Wrapper for registerMapSettingsSection
  - [x] Deprecation warnings (console)
  - [x] Metrics tracking (how many use old API)
- [x] `src/core/ui/UnifiedUIManager.ts`
  - [x] Modern + Legacy managers
  - [x] Routing between them
  - [x] Migration helpers
  - [x] getAll methods

#### Tests
- [ ] Old plugins still work
- [ ] Warnings logged
- [ ] Migration path tested

### Manifest Extensions

#### Type Updates
- [ ] Update `packages/plugin-system/src/types/manifest.ts`
  - [ ] Add `ui.contributions` object
  - [ ] Add `ui.contributions.panels[]`
  - [ ] Add `ui.contributions.commands[]`
  - [ ] Add `ui.contributions.menus`
  - [ ] Add `ui.contributions.nodeProperties[]`
  - [ ] Add `ui.contributions.settings[]`
  - [ ] Add `webview` field to each contribution
- [ ] Rebuild plugin-system package
- [ ] Update all plugin manifests (prepare structure)

---

## 🎯 Sprint 3: Command Palette & Theme (Week 5-6)

### Command Palette UI

#### Component
- [x] `src/core/commands/CommandPalette.tsx`
  - [x] Dialog/Modal wrapper
  - [x] Search input with focus
  - [x] Virtual list for results
  - [x] Keyboard navigation (arrows, enter, escape)
  - [x] Category grouping
  - [x] Recent commands
  - [x] Highlighted matches
- [x] `src/core/commands/CommandPalette.css`
  - [x] Modal styles
  - [x] Input styles
  - [x] List item styles
  - [x] Keyboard focus indicators
  - [x] Animations (fade in, slide)
- [x] `src/core/commands/CommandItem.tsx`
  - [x] Icon display
  - [x] Title with highlighting
  - [x] Shortcut display
  - [x] Category badge
  - [x] Selected state

#### Integration
- [x] Add to App.tsx or DockableLayout (exported via hook)
- [x] Global Cmd+K listener (via useCommandPalette)
- [ ] Register default commands (à faire lors migration plugins)
  - [ ] File operations
  - [ ] Edit operations
  - [ ] View operations
  - [ ] Plugin management
- [x] Command execution with context

#### Tests
- [ ] Opens on Cmd+K
- [ ] Search filters results
- [ ] Arrow keys navigate
- [ ] Enter executes
- [ ] Escape closes
- [ ] Accessibility (aria-labels)

### Theme Bridge API

#### Theme Tokens
- [x] `src/core/theme/types.ts`
  - [x] Export color tokens
  - [x] Export spacing tokens
  - [x] Export typography tokens
  - [x] Export radius, shadows, etc.
- [x] `src/core/theme/defaultThemes.ts`
  - [x] Light theme definition
  - [x] Dark theme definition
  - [x] Theme configuration

#### Theme Provider
- [x] `src/core/theme/ThemeProvider.tsx`
  - [x] Context creation
  - [x] State (current theme)
  - [x] setTheme method
  - [x] CSS variables injection
  - [x] localStorage persistence
- [x] `src/core/theme/ThemeManager.ts`
  - [x] getTheme API for plugins
  - [x] Subscribe to theme changes
  - [x] Get CSS variable value
  - [x] System theme detection
  - [x] CSS variable generation
- [x] Integrated in main.tsx

#### CSS Migration
- [ ] Audit all .css files for hardcoded colors (Sprint 4)
- [ ] Replace with CSS variables (Sprint 4)
  - [ ] `src/index.css` - Root variables
  - [ ] `src/components/**/*.css` - Component styles
  - [ ] `src/layouts/**/*.css` - Layout styles
- [ ] Test light/dark mode switching
- [ ] Test custom accent colors

#### Tests
- [ ] Theme switches work
- [ ] CSS variables update
- [ ] Persistence works
- [ ] Plugins receive theme updates

---

## 🎯 Sprint 4: Plugin Migration (Week 7-8)

### Tags Manager Migration

#### Manifest Update
- [ ] Update `src/plugins/core/tags-manager/manifest.json`
  - [ ] Add ui.contributions.panels
  - [ ] Add ui.contributions.nodeProperties
  - [ ] Add ui.contributions.commands
  - [ ] Add webview paths

#### WebView Creation
- [ ] Create `src/plugins/core/tags-manager/webviews/`
  - [ ] `tags-panel.html` - Entry point
  - [ ] `tags-panel.tsx` - React component
  - [ ] `node-tags-panel.html` - Entry point
  - [ ] `node-tags-panel.tsx` - React component
  - [ ] Build config for webviews

#### Bridge Integration
- [ ] Replace direct state access with bridge calls
  - [ ] getTags() via bridge
  - [ ] createTag() via bridge
  - [ ] updateTag() via bridge
  - [ ] deleteTag() via bridge
  - [ ] Subscribe to tag changes
- [ ] Use Theme Bridge for styling
- [ ] Register commands in manifest

#### Testing
- [ ] Panel renders in WebView
- [ ] Tag CRUD operations work
- [ ] Theme updates work
- [ ] No regressions

### Palette Settings Migration

#### Manifest Update
- [ ] Update `src/plugins/core/palette-settings/manifest.json`
  - [ ] Add ui.contributions.settings
  - [ ] Add ui.contributions.mapSettings
  - [ ] Add webview paths

#### WebView Creation
- [ ] Create webviews for palette selector
- [ ] Bridge integration
- [ ] Theme Bridge usage

#### Testing
- [ ] Palette selection works
- [ ] Theme consistency
- [ ] No regressions

### Export Manager Migration

#### Manifest Update
- [ ] Update `src/plugins/core/export-manager/manifest.json`
  - [ ] Add commands for each export format
  - [ ] Add panel for export preview (optional)

#### Command Registration
- [ ] Register in Command Palette
  - [ ] Export to PDF
  - [ ] Export to PNG
  - [ ] Export to Markdown
  - [ ] Export to XMind
  - [ ] etc.

#### Testing
- [ ] Commands appear in palette
- [ ] Export operations work
- [ ] Shortcuts work

---

## 🎯 Sprint 5: Accessibility (Week 9-10)

### ARIA Implementation

#### Component Audits
- [ ] `src/components/MenuBar.tsx`
  - [ ] aria-label on all buttons
  - [ ] aria-haspopup on menus
  - [ ] role="menubar"
  - [ ] role="menuitem"
- [ ] `src/components/Toolbar.tsx`
  - [ ] aria-label on tools
  - [ ] aria-pressed for toggles
  - [ ] role="toolbar"
- [ ] `src/components/Sidebar.tsx`
  - [ ] aria-label
  - [ ] aria-expanded for collapsible
- [ ] `src/layouts/DockableLayout.tsx`
  - [ ] Landmarks (main, aside, nav)
  - [ ] aria-label for regions
- [ ] All Modals/Dialogs
  - [ ] role="dialog"
  - [ ] aria-modal="true"
  - [ ] aria-labelledby
  - [ ] aria-describedby

#### Command Palette
- [ ] role="combobox"
- [ ] aria-autocomplete
- [ ] aria-activedescendant
- [ ] aria-expanded
- [ ] Announce results count

### Focus Management

#### Focus Trap
- [ ] `src/core/a11y/useFocusTrap.ts`
  - [ ] Trap focus in modals
  - [ ] Return focus on close
  - [ ] Tab cycles within
- [ ] Install react-focus-lock
- [ ] Apply to all modals

#### Focus Indicators
- [ ] Visible focus rings (CSS)
- [ ] :focus-visible support
- [ ] High contrast mode
- [ ] Test with keyboard only

#### Focus Order
- [ ] Logical tab order in all layouts
- [ ] Skip links to main content
- [ ] `src/core/a11y/SkipLinks.tsx`
  - [ ] Skip to main
  - [ ] Skip to navigation

### Keyboard Navigation

#### Global Shortcuts
- [ ] Document all shortcuts
- [ ] Cmd+K - Command Palette
- [ ] Cmd+/ - Help/Shortcuts
- [ ] Cmd+, - Settings
- [ ] Cmd+1-9 - Switch tabs
- [ ] Escape - Close modals

#### Component Navigation
- [ ] Arrow keys in lists
- [ ] Enter/Space to activate
- [ ] Home/End in lists
- [ ] Tab/Shift+Tab navigation

#### Tests
- [ ] axe-core audits pass
- [ ] Manual keyboard tests
- [ ] Screen reader tests (VoiceOver, NVDA)

---

## 🎯 Sprint 6: Onboarding & Polish (Week 11-12)

### Tour System

#### Tour Framework
- [ ] Install driver.js
- [ ] `src/core/onboarding/TourProvider.tsx`
  - [ ] Tour state management
  - [ ] Current step tracking
  - [ ] Progress persistence
- [ ] `src/core/onboarding/TourStep.tsx`
  - [ ] Highlight element
  - [ ] Popover with text
  - [ ] Navigation buttons
  - [ ] Skip option
- [ ] `src/core/onboarding/TourOverlay.tsx`
  - [ ] Dim background
  - [ ] Highlight cutout

#### Tours
- [ ] `src/core/onboarding/tours/first-run.ts`
  - [ ] Welcome message
  - [ ] Create first node
  - [ ] Navigate UI
  - [ ] Save file
- [ ] `src/core/onboarding/tours/plugin-install.ts`
  - [ ] Open marketplace
  - [ ] Browse plugins
  - [ ] Install plugin
  - [ ] Activate plugin
- [ ] `src/core/onboarding/tours/features.ts`
  - [ ] Command Palette
  - [ ] Tags
  - [ ] Export
  - [ ] Themes

#### Integration
- [ ] Trigger on first launch
- [ ] Settings to replay tours
- [ ] "?" button for contextual help

### Tooltips

#### Component
- [ ] `src/core/ui/Tooltip.tsx`
  - [ ] Install @radix-ui/react-tooltip
  - [ ] Wrapper component
  - [ ] Delay config
  - [ ] Placement options
- [ ] `src/core/ui/Tooltip.css`
  - [ ] Styles
  - [ ] Animations

#### Application
- [ ] Add to all icon-only buttons
- [ ] Add to all toolbar items
- [ ] Add to all shortcuts
- [ ] Contextual hints

### Empty States

#### Component
- [ ] `src/core/ui/EmptyState.tsx`
  - [ ] Icon
  - [ ] Title
  - [ ] Description
  - [ ] Action button (optional)
- [ ] `src/core/ui/EmptyState.css`

#### Application
- [ ] PluginManager - "No plugins"
- [ ] NodeExplorer - "No nodes"
- [ ] FileTabs - "No files open"
- [ ] Search - "No results"

### Analytics

#### Setup
- [ ] Choose analytics provider (PostHog, Mixpanel, or custom)
- [ ] `src/core/analytics/AnalyticsProvider.tsx`
  - [ ] Opt-in/opt-out
  - [ ] Privacy controls
  - [ ] Event batching
- [ ] `src/core/analytics/useAnalytics.ts`
  - [ ] track() method
  - [ ] identify() method
  - [ ] page() method

#### Events to Track
- [ ] Command Palette opened
- [ ] Commands executed
- [ ] Plugins activated/deactivated
- [ ] Features used
- [ ] Errors occurred
- [ ] Tour completion

### Error Boundaries

#### Components
- [ ] `src/core/error/ErrorBoundary.tsx`
  - [ ] Generic error boundary
  - [ ] Error UI
  - [ ] Reset button
- [ ] `src/core/error/PluginErrorBoundary.tsx`
  - [ ] Plugin-specific boundary
  - [ ] Isolate plugin errors
  - [ ] Report to analytics
- [ ] `src/core/error/ErrorFallback.tsx`
  - [ ] User-friendly error message
  - [ ] Retry option
  - [ ] Report bug link

#### Application
- [ ] Wrap App in ErrorBoundary
- [ ] Wrap each plugin panel
- [ ] Wrap WebViews

---

## 🎯 Sprint 7+: Deprecation & Cleanup (Week 13-16)

### Deprecation Warnings

#### Logging
- [ ] Add console.warn to legacy APIs
  - [ ] registerPanel → "Use manifest contributions"
  - [ ] registerNodePropertiesTab → "Use manifest contributions"
  - [ ] etc.
- [ ] Link to migration guide in warnings
- [ ] Track usage metrics

#### Documentation
- [ ] Migration guide for each API
- [ ] Video tutorial
- [ ] Code examples
- [ ] FAQ

### Communication

#### Announcements
- [ ] Blog post about Phase 3
- [ ] Changelog entry
- [ ] Email to plugin developers
- [ ] Discord/Slack announcement

#### Timeline
- [ ] Month 1-2: Warnings only
- [ ] Month 3-4: Encourage migration
- [ ] Month 5-6: Final warnings
- [ ] Month 6: Remove legacy APIs

### Removal

#### Code Cleanup
- [ ] Remove LegacyUIAdapter
- [ ] Remove old registries
  - [ ] panelRegistry.tsx
  - [ ] nodePropertiesRegistry.tsx
  - [ ] settingsRegistry.tsx
  - [ ] mapSettingsRegistry.tsx
- [ ] Remove compatibility code
- [ ] Update TypeScript types

#### Tests
- [ ] Remove legacy tests
- [ ] Ensure all plugins use new system
- [ ] Performance benchmarks
- [ ] Bundle size check

---

## 📦 Package Creation Checklist

### @cartae/plugin-sdk
- [ ] package.json with correct metadata
- [ ] TypeScript config
- [ ] Build script (tsup)
- [ ] ESM + CJS outputs
- [ ] Type declarations
- [ ] README with examples
- [ ] License
- [ ] Publish to npm (or private registry)

### @cartae/theme-tokens
- [ ] tokens.json
- [ ] Build script (Style Dictionary)
- [ ] CSS variables output
- [ ] TypeScript types
- [ ] README
- [ ] Publish

### @cartae/ui-kit (optional)
- [ ] Component library
- [ ] Storybook
- [ ] Documentation
- [ ] Publish

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] All core utilities (fuzzyMatcher, etc.)
- [ ] All hooks
- [ ] Bridge message handling
- [ ] Theme switching

### Integration Tests
- [ ] Slot/Fill system
- [ ] Command Palette with real commands
- [ ] WebView communication
- [ ] Plugin activation with new system

### E2E Tests
- [ ] Complete user flows
- [ ] Plugin installation
- [ ] Command execution
- [ ] Theme switching
- [ ] Accessibility (Playwright + axe)

### Performance Tests
- [ ] Command Palette with 1000+ commands
- [ ] 50+ plugins registered
- [ ] Memory leaks
- [ ] Bundle size

---

## 📚 Documentation Tasks

### Developer Docs
- [ ] `/docs/phase3/migration-guide.md`
  - [ ] Step-by-step for each old API
  - [ ] Code examples before/after
  - [ ] Troubleshooting
- [ ] `/docs/phase3/slot-fill-api.md`
  - [ ] Concepts
  - [ ] API reference
  - [ ] Examples
- [ ] `/docs/phase3/command-palette.md`
  - [ ] User guide
  - [ ] Developer guide
  - [ ] Customization
- [ ] `/docs/phase3/webview-security.md`
  - [ ] Security model
  - [ ] Permissions
  - [ ] Best practices
- [ ] `/docs/phase3/theme-bridge.md`
  - [ ] Theme structure
  - [ ] Using themes in plugins
  - [ ] Custom tokens

### User Docs
- [ ] Command Palette guide
- [ ] Keyboard shortcuts reference
- [ ] Accessibility features
- [ ] Plugin installation guide

### Examples
- [ ] Basic plugin example
- [ ] Panel plugin example
- [ ] Toolbar plugin example
- [ ] Command plugin example
- [ ] Theme-aware plugin example

---

## 🐛 Known Issues & Risks

### Technical Risks
- [ ] Performance impact of WebViews
  - Mitigation: Lazy loading, virtualization
- [ ] Breaking changes for existing plugins
  - Mitigation: Legacy adapter, long deprecation
- [ ] Theme consistency across plugins
  - Mitigation: Strict Theme Bridge, linting
- [ ] Accessibility compliance
  - Mitigation: Automated testing, manual audits

### Dependencies
- [ ] React Context performance with many providers
  - Mitigation: Careful optimization, memoization
- [ ] iframe sandbox limitations
  - Mitigation: Test edge cases, fallbacks

---

## 📈 Success Metrics

### Phase 3 Goals
- [ ] 100% of core plugins migrated
- [ ] 0 console errors from legacy APIs after 6 months
- [ ] Command Palette used in >80% of sessions
- [ ] WCAG 2.1 AA compliance
- [ ] <100ms Command Palette open time
- [ ] <5% bundle size increase

### KPIs
- Plugin activation time: <200ms
- WebView communication latency: <50ms
- Theme switch time: <100ms
- Accessibility score: >90 (Lighthouse)
- Test coverage: >80%

---

## 🔄 Iteration Plan

After each sprint:
1. Demo to stakeholders
2. Gather feedback
3. Adjust priorities
4. Update this document
5. Continue next sprint

---

**Last Updated**: 2025-01-29
**Next Review**: After Sprint 1 completion
