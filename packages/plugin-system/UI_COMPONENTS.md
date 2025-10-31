# UI Components - Plugin System

React components for managing the Cartae Plugin System with Phase 2 security features.

## Components Overview

### 1. PermissionDialog

Modal dialog for requesting user consent for plugin permissions.

**Features:**

- Display permissions with risk levels
- Color-coded by risk (low/medium/high)
- Detailed permission descriptions
- Approve/Deny actions

**Usage:**

```tsx
import { PermissionDialog } from './components/plugins';

<PermissionDialog
  pluginId="com.example.plugin"
  pluginName="Example Plugin"
  permissions={['mindmap:read', 'mindmap:write', 'network']}
  onApprove={() => console.log('Approved')}
  onDeny={() => console.log('Denied')}
/>;
```

**Screenshot:**

- Permission list with risk badges
- Details toggle
- Security warning
- Action buttons

---

### 2. PluginManager

Main interface for managing installed plugins.

**Features:**

- Plugin list with state indicators
- Filter by state (all/active/inactive/error)
- Statistics dashboard
- Activate/Deactivate/Uninstall actions
- View permissions

**Usage:**

```tsx
import { PluginManager } from './components/plugins';

<PluginManager
  plugins={pluginMap}
  onActivate={id => registry.activate(id)}
  onDeactivate={id => registry.deactivate(id)}
  onUninstall={id => registry.unregister(id)}
  onViewPermissions={id => viewPermissions(id)}
/>;
```

**Features:**

- Real-time plugin stats
- State filters
- Action buttons with loading states
- Error display
- Responsive grid layout

---

### 3. AuditDashboard

Security audit log viewer with filtering and analysis.

**Features:**

- Real-time event display
- Filter by severity/type
- Statistics cards
- Color-coded severity levels
- Exportable data

**Usage:**

```tsx
import { AuditDashboard } from './components/plugins';

<AuditDashboard onQuery={filters => auditLogger.query(filters)} />;
```

**Features:**

- Total events counter
- Critical/Error counters
- Last 24h counter
- Severity filter (info/warning/error/critical)
- Event type filter
- Sortable table
- Auto-refresh

---

### 4. PolicyEditor

Visual editor for creating ABAC policies.

**Features:**

- Add/remove policy statements
- Effect selection (Allow/Deny)
- Action and resource configuration
- JSON preview
- Validation

**Usage:**

```tsx
import { PolicyEditor } from './components/plugins';

<PolicyEditor
  pluginId="com.example.plugin"
  initialPolicy={existingPolicy}
  onSave={policy => policyEngine.registerPolicy(pluginId, policy)}
  onCancel={() => closeEditor()}
/>;
```

**Features:**

- Statement builder
- Effect toggle (Allow/Deny)
- Action input with wildcards
- Resource pattern support
- Live JSON preview
- Statement list with remove

---

## Complete Example: PluginsPage

Full-featured plugin management page integrating all components:

```tsx
import React, { useState } from 'react';
import {
  PluginManager,
  PermissionDialog,
  AuditDashboard,
  PolicyEditor,
} from './components/plugins';
import { createEnhancedPluginSystem } from '@cartae/plugin-system';

export const PluginsPage: React.FC = () => {
  const [view, setView] = useState('manager');
  const system = createEnhancedPluginSystem({...});

  return (
    <div>
      {/* Navigation */}
      <nav>
        <button onClick={() => setView('manager')}>Manager</button>
        <button onClick={() => setView('audit')}>Audit</button>
        <button onClick={() => setView('policy')}>Policies</button>
      </nav>

      {/* Content */}
      {view === 'manager' && <PluginManager {...} />}
      {view === 'audit' && <AuditDashboard {...} />}
      {view === 'policy' && <PolicyEditor {...} />}

      {/* Modals */}
      {permissionRequest && <PermissionDialog {...} />}
    </div>
  );
};
```

## Styling

All components use inline styles for maximum portability. Key design tokens:

**Colors:**

- Primary: `#3b82f6` (Blue)
- Success: `#22c55e` (Green)
- Warning: `#f59e0b` (Orange)
- Error: `#ef4444` (Red)
- Gray: `#6b7280`

**Borders:**

- Default: `1px solid #e5e7eb`
- Active: `2px solid #3b82f6`

**Spacing:**

- Small: `8px`
- Medium: `16px`
- Large: `24px`

**Typography:**

- Heading: `24px`, `600` weight
- Subheading: `20px`, `600` weight
- Body: `14px`, `400` weight
- Small: `12px`

## Accessibility

All components include:

- Semantic HTML
- ARIA labels where appropriate
- Keyboard navigation support
- Focus states
- Loading states
- Error states

## State Management

Components are designed to work with:

- React hooks (useState, useEffect)
- External state management (Redux, Zustand)
- Direct plugin system API calls

## Best Practices

**1. Permission Requests:**

```tsx
// Always wrap activation in try/catch
try {
  await registry.activate(pluginId);
  await auditLogger.logPluginActivated(pluginId);
} catch (error) {
  await auditLogger.logSecurityAlert(pluginId, error.message);
}
```

**2. Audit Logging:**

```tsx
// Log all security-relevant actions
await auditLogger.logPermissionRequested(pluginId, permission, granted);
await auditLogger.logApiCall(pluginId, 'mindmap.getActive');
```

**3. Policy Updates:**

```tsx
// Validate before saving
const validation = validatePolicy(policy);
if (!validation.valid) {
  alert(`Invalid policy: ${validation.errors.join(', ')}`);
  return;
}
policyEngine.registerPolicy(pluginId, policy);
```

## Customization

### Theme Override

```tsx
const theme = {
  colors: {
    primary: '#yourColor',
    // ...
  },
};

// Pass to components
<PluginManager theme={theme} {...} />
```

### Custom Filters

```tsx
// Add custom audit filters
const customFilters = {
  ...filters,
  pluginId: 'specific-plugin',
  startDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // Last week
};
```

## Performance

**Optimizations:**

- React.memo for static components
- Virtual scrolling for large lists (recommended for >100 items)
- Debounced filters
- Lazy loading for audit logs

```tsx
import React from 'react';

export const PluginManager = React.memo(({ plugins, ... }) => {
  // Component code
});
```

## Testing

```tsx
import { render, fireEvent } from '@testing-library/react';
import { PermissionDialog } from './PermissionDialog';

test('calls onApprove when approved', () => {
  const onApprove = jest.fn();
  const { getByText } = render(
    <PermissionDialog
      pluginId="test"
      pluginName="Test"
      permissions={['mindmap:read']}
      onApprove={onApprove}
      onDeny={() => {}}
    />
  );

  fireEvent.click(getByText('Autoriser'));
  expect(onApprove).toHaveBeenCalled();
});
```

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile: ⚠️ Touch optimized (swipe actions recommended)

## Future Enhancements

- Dark mode support
- Export audit logs (CSV/JSON)
- Bulk plugin actions
- Advanced policy builder with visual conditions
- Real-time notifications
- Plugin marketplace integration

---

**Version:** 1.0.0
**Last Updated:** 2025-10-27
