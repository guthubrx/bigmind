# Cartae DAG (Directed Acyclic Graph) System Integration

## Overview

The DAG system provides a comprehensive tag and relationship management system for Cartae. It supports multi-parent relationships, multiple relation types, and advanced analytics.

## Architecture

### Core Components

**Data Layer:**

- `hooks/useTagGraph.ts` - Zustand store managing DAG state with 30+ actions
- `hooks/useNodeTags.ts` - Node-to-tag associations (SINGLE SOURCE OF TRUTH)
- `types/dag.ts` - Type definitions (DagTag, DagLink, RelationType)

**UI Components:**

- `components/TagLayersPanelDAG.tsx` - Main container with view switcher
- `components/TagGraph.tsx` - SVG visualization with zoom/pan
- `components/TagLayersPanel.tsx` - Hierarchical tree view
- `components/DagStatsPanel.tsx` - Statistics and metrics
- `components/DagSearchPanel.tsx` - Search with highlighting
- `components/NodeTagPanel.tsx` - Quick tag assignment
- `components/MindMapNodeTags.tsx` - Tag display on nodes

**Utilities:**

- `utils/dagLayouts.ts` - 4 layout algorithms
- `utils/dagTemplates.ts` - Predefined DAG structures
- `utils/dagCollaboration.ts` - Metadata and sharing
- `hooks/useDagExportImport.ts` - JSON export/import
- `hooks/useDagCollaboration.ts` - Collaboration features
- `hooks/useUndoRedo.ts` - History management

## Features

### 1. Multi-Parent DAG

- Tags support multiple parents (not just single parent tree)
- Bidirectional parent-child validation
- Cycle detection with visual feedback
- Automatic reference cleanup on deletion

### 2. Relation Types

- `IS_TYPE_OF` - Hierarchical classification
- `IS_RELATED_TO` - Generic relationships
- `IS_PART_OF` - Composition relationships

### 3. Drag-Drop Interactions

```
Drag a tag onto another tag → creates IS_RELATED_TO relation
Visual feedback with blue glow + scale effect
```

### 4. Visualization Modes

Toggle between 5 views using header buttons:

- **Graph** (🚫) - SVG visualization with zoom/pan
- **List** (👁️) - Hierarchical tree with expand/collapse
- **Stats** (📊) - Real-time metrics and validation
- **Search** (🔍) - Full-text search with highlighting
- **Tools** (⚡) - Export/Import and utilities

### 5. Statistics Dashboard

- Total tags and relations count
- Root and leaf node count
- Maximum and average depth
- Relations breakdown by type
- DAG validation status with error reporting

### 6. Search & Highlighting

- Real-time search as you type
- Highlight matching terms in results
- Color-coded tag badges
- Keyboard shortcuts (Escape to clear)

### 7. Export/Import

```typescript
// Export DAG as JSON
<button onClick={handleExport}>Export</button>

// Import from JSON file
<button onClick={handleImportClick}>Import</button>
```

### 8. Layout Algorithms

```typescript
import { applyLayout, LayoutAlgorithm } from '@utils/dagLayouts';

// Available: 'hierarchical' | 'circular' | 'radial' | 'force-directed'
const positions = applyLayout('hierarchical', tags, getChildren, getParents);
```

### 9. Predefined Templates

```typescript
import { getTemplate, applyTemplate } from '@utils/dagTemplates';

// Available templates:
// - 'Biological Taxonomy'
// - 'Software Architecture'
// - 'Project Process'

const template = getTemplate('Biological Taxonomy');
const { tags, links } = applyTemplate(template);
```

### 10. Collaboration Features

```typescript
import { useDagCollaboration } from '@hooks/useDagCollaboration';

const { initializeDagMetadata, addCommentToDag, shareDagWith, makeDagPublic, hasAccess } =
  useDagCollaboration();
```

## Usage Examples

### Create a Tag

```typescript
const addTag = useTagGraph(state => state.addTag);

addTag({
  id: 'tag-123',
  label: 'Programming',
  color: '#3b82f6',
  parentIds: [],
  children: [],
  relations: [],
});
```

### Create a Relation

```typescript
const createRelation = useTagGraph(state => state.createRelation);

// Create relation from sourceId to targetId
createRelation(sourceId, targetId, RelationType.IS_RELATED_TO);
```

### Add Parent Relationship

```typescript
const addParent = useTagGraph(state => state.addParent);

// Make childId a child of parentId (bidirectional)
addParent(childId, parentId);
```

### Toggle Tag Visibility

```typescript
const toggleTagVisibility = useTagGraph(state => state.toggleTagVisibility);

toggleTagVisibility(tagId);
```

### Add Comment

```typescript
import { addComment } from '@utils/dagCollaboration';

const updatedMetadata = addComment(metadata, 'user@example.com', 'This tag needs review');
```

### Undo/Redo History

```typescript
import { useUndoRedo } from '@hooks/useUndoRedo';

const { state, push, undo, redo, canUndo, canRedo } = useUndoRedo(initialState);

// Push a new state
push(newState);

// Undo/Redo
if (canUndo) undo();
if (canRedo) redo();
```

## Data Structure

### DagTag

```typescript
interface DagTag {
  id: string;
  label: string;
  color?: string;
  parentIds: string[]; // Multiple parents (DAG support)
  children: string[];
  relations: DagLink[];
  createdAt?: number;
  updatedAt?: number;
  metadata?: CollaborationMetadata;
}
```

### DagLink

```typescript
interface DagLink {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  metadata?: Record<string, any>;
}
```

## Persistence

All data is automatically persisted to localStorage:

- Tags and links → `cartae-tags` (v3)
- Node-tag associations → `cartae-node-tags` (v1)
- App settings, history, etc. → respective stores

Auto-migration from v1/v2 to v3 for schema changes.

## Validation

The system automatically validates:

- Reference integrity (all parent/child IDs exist)
- Bidirectional relationships (if A → B, then B includes A)
- Cycle detection (prevents circular dependencies)
- ID uniqueness and format

```typescript
const validation = useTagGraph(state => state.validateDAG)();

if (!validation.valid) {
  console.log(validation.errors); // Array of error messages
}
```

## Performance

- **Memoization**: useMemo prevents unnecessary recalculations
- **Stable Keys**: tagIdKey prevents infinite loops
- **Lazy Loading**: Components only render visible elements
- **History Limit**: Undo/Redo capped at 50 states
- **Batch Operations**: Use batchTagNode for multiple assignments

## Keyboard Shortcuts

| Key    | Action                      |
| ------ | --------------------------- |
| Escape | Clear search                |
| Enter  | Create tag / Confirm action |
| Ctrl+S | Export (custom)             |
| Ctrl+O | Import (custom)             |

## Integration Points

The DAG system is integrated into:

- **MainLayout**: Tags & Layers column on the right
- **MindMapCanvas**: Nodes can be tagged/untagged
- **NodeProperties**: Quick tag panel for selected node
- **MenuBar**: Access to DAG tools and settings

## Future Enhancements

- [ ] Relation type visual differentiation (different arrow styles)
- [ ] Mode édition des relations (edit relation properties)
- [ ] Filtres par type de relation (filter by relation type)
- [ ] Navigation breadcrumbs (show path to tag)
- [ ] Focus mode sur branche (zoom to subtree)
- [ ] Real-time collaboration (WebSocket sync)
- [ ] Advanced search filters
- [ ] Custom layout algorithms
- [ ] Batch import/export operations

## Troubleshooting

### Tags not showing

- Check `useTagGraph` state in DevTools
- Verify localStorage `cartae-tags` exists
- Clear cache and refresh

### Infinite loops/performance issues

- Check dependency arrays in useEffect
- Verify memoization is working
- Monitor DevTools Performance tab

### Import failing

- Ensure JSON format is valid
- Check file size (no limit enforced)
- Check console for detailed error messages

## Resources

- **Zustand**: State management
- **React**: UI framework
- **Lucide React**: Icons
- **TypeScript**: Type safety
- **CSS Grid/Flexbox**: Responsive layouts

---

**Version**: 1.0.0
**Last Updated**: October 25, 2025
