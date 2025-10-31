# DAG-MindMap Synchronization Architecture

## Overview

The DAG-MindMap synchronization system creates a bidirectional link between the Directed Acyclic Graph (DAG) of tags and the MindMap structure. This ensures that tags can be managed independently in the DAG while maintaining consistent associations with mind map nodes.

## Architecture Layers

```
┌─────────────────────────────────────────┐
│ LAYER 3: DISPLAY (Interface)            │
├─────────────────────────────────────────┤
│ MindMapNode (renders tags)              │
│ NodeTagPanel (quick tagging UI)         │
│ TagLayersPanelDAG (hierarchy view)      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ LAYER 2: SYNCHRONIZATION (Flux)         │
├─────────────────────────────────────────┤
│ eventBus (global events)                │
│ useMindMapDAGSync (listeners)           │
│ tagNodeSync / untagNodeSync (helpers)   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ LAYER 1: STORAGE (Data)                 │
├─────────────────────────────────────────┤
│ useTagGraph (DAG structure)             │
│ useNodeTags (Associations - TRUTH)      │
│ node.tags (XMind/cartae.json)          │
└─────────────────────────────────────────┘
```

## Core Components

### 1. useNodeTags Store (Single Source of Truth)

**File**: `hooks/useNodeTags.ts`

Maintains the definitive mapping between nodes and tags.

**State**:

```typescript
nodeTagMap: Record<string, Set<string>>; // node -> tags
tagNodeMap: Record<string, Set<string>>; // tag -> nodes
```

**Key Operations**:

- `tagNode(nodeId, tagId)` - Add association
- `untagNode(nodeId, tagId)` - Remove association
- `getNodeTags(nodeId)` - Get all tags for a node
- `getTagNodes(tagId)` - Get all nodes with a tag
- `removeNodeCompletely(nodeId)` - Clean up when node deleted
- `removeTagCompletely(tagId)` - Clean up when tag deleted

**Persistence**: Automatically synced to localStorage via zustand persist middleware.

### 2. Event Bus (Central Communication)

**File**: `utils/eventBus.ts`

Provides a singleton event emitter for all tag and node-related events.

**Events**:

- `node:tagged` - When a node gets a tag
- `node:untagged` - When a node loses a tag
- `node:updated` - When a node's properties change
- `node:deleted` - When a node is removed
- `tag:created` - When a tag is created
- `tag:removed` - When a tag is deleted
- `tag:updated` - When a tag is modified
- `sync:refresh` - Request full synchronization

**Usage**:

```typescript
eventBus.on('node:tagged', ({ nodeId, tagId }) => {
  // Handle event
});

eventBus.emit('node:tagged', { nodeId: 'n1', tagId: 't1' });
```

### 3. useMindMapDAGSync Hook (Synchronization Logic)

**File**: `hooks/useMindMapDAGSync.ts`

Orchestrates all synchronization between DAG and MindMap using event listeners.

**Key Functions**:

- `tagNodeSync(nodeId, tagId)` - Add tag to node + sync
- `untagNodeSync(nodeId, tagId)` - Remove tag from node + sync
- `syncNodeTags(nodeId)` - Emit update event for a node

**Listeners**:

- `tag:created` → Initialize empty node set for new tag
- `tag:removed` → Remove tag from all nodes
- `node:deleted` → Remove all tags from node
- `sync:refresh` → Update all nodes

### 4. NodeTagPanel Component (Quick Tagging UI)

**File**: `components/NodeTagPanel.tsx`

Provides a user interface for quickly adding/removing tags from a selected node.

**Features**:

- Search/filter available tags
- Display current tags with remove buttons
- Add tags from available list
- Show count of tags assigned

## Data Flow

### Adding a Tag to a Node

```
User clicks "Add tag" in NodeTagPanel
         ↓
tagNodeSync(nodeId, tagId) called
         ↓
useNodeTags.tagNode() - Update store
         ↓
eventBus.emit('node:tagged')
         ↓
Listeners receive event:
  - Update displayed node
  - Sync with persistence
  - Trigger any dependent updates
```

### Removing a Tag from a Node

```
User clicks remove on tag
         ↓
untagNodeSync(nodeId, tagId) called
         ↓
useNodeTags.untagNode() - Update store
         ↓
eventBus.emit('node:untagged')
         ↓
Listeners receive event and clean up associations
```

### Deleting a Tag from DAG

```
User deletes tag in TagLayersPanelDAG
         ↓
useTagGraph.removeTag(tagId)
         ↓
eventBus.emit('tag:removed', { tagId })
         ↓
useMindMapDAGSync listener:
  useNodeTags.removeTagCompletely(tagId)
         ↓
All nodes lose this tag
```

### Deleting a Node from MindMap

```
User deletes node
         ↓
eventBus.emit('node:deleted', { nodeId })
         ↓
useMindMapDAGSync listener:
  useNodeTags.removeNodeCompletely(nodeId)
         ↓
All tags are removed from node
```

## Synchronization Rules

1. **Single Source of Truth**: useNodeTags is THE source for node-tag associations
2. **No Duplicate Paths**: Only add/remove through useNodeTags, never directly on node
3. **Event-Driven Updates**: Changes propagate via eventBus
4. **Bidirectional Consistency**: DAG changes update nodes, node deletions clean DAG
5. **Cascade Cleanup**: Deleting a node removes its tags; deleting a tag removes from nodes

## Integration Points

### 1. With MindMapNode Component

```typescript
// Read tags from store
const tags = useNodeTags(state => state.getNodeTags(nodeId));

// Render tags visually
tags.forEach(tagId => {
  const tag = useTagGraph(state => state.getTag(tagId));
  // Display tag
});
```

### 2. With File Operations

When saving a file, persist both:

```typescript
const nodeTagsData = {
  nodeTagMap: state.nodeTagMap,
  tagNodeMap: state.tagNodeMap,
};
// Save to cartae.json
```

When loading a file:

```typescript
const { nodeTagMap, tagNodeMap } = loadedFile;
useNodeTags.initialize(nodeTagMap, tagNodeMap);
```

### 3. With Tag Context Menu

```typescript
// When user selects "Assign tag" in context menu
const handleAssignTag = (tagId: string) => {
  tagNodeSync(nodeId, tagId);
};
```

## Error Handling

- **Invalid node**: Check if node exists in MindMap before tagging
- **Invalid tag**: Check if tag exists in DAG before associating
- **Circular references**: DAG's hasCycle() prevents tag cycles
- **Orphaned associations**: Cleanup functions handle missing nodes/tags

## Performance Considerations

1. **Lazy Loading**: Tags only loaded when needed
2. **Set-based Storage**: O(1) lookup time for associations
3. **Event Debouncing**: High-frequency updates can be debounced if needed
4. **Selective Updates**: Only affected components re-render via event listeners

## Testing

Key scenarios to test:

- ✅ Add tag to node → node displays tag
- ✅ Remove tag from node → node no longer shows tag
- ✅ Delete tag → automatically removed from all nodes
- ✅ Delete node → all tags cleaned up
- ✅ Load file → associations restored correctly
- ✅ Save file → associations persisted
- ✅ Multiple rapid changes → no race conditions
- ✅ Event listeners properly cleaned up on unmount

## Future Enhancements

- Batch operations (add/remove multiple tags at once)
- Tag history/undo-redo
- Tag suggestions based on content
- Tag-based filtering of mind map
- Export nodes grouped by tags
