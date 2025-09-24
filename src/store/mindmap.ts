import { create } from 'zustand'

export type Topic = {
  id: string
  label: string
  children?: Topic[]
  collapsed?: boolean
  note?: string
  links?: string[]
  task?: 'todo' | 'doing' | 'done'
  side?: 'left' | 'right'
  // optional absolute coordinates imported from external formats
  x?: number
  y?: number
  w?: number
  h?: number
}

export type MindMapState = {
  root: Topic
  past: Topic[]
  future: Topic[]
  selectedId: string | null
  select: (id: string | null) => void
  resetEmpty: () => void
  setNote: (id: string, note: string) => void
  addLink: (id: string, url: string) => void
  removeLink: (id: string, url: string) => void
  setTask: (id: string, task: 'todo' | 'doing' | 'done') => void
  setSide: (id: string, side: 'left' | 'right') => void
  addSibling: (id: string) => void
  addChild: (id: string) => void
  toggleCollapse: (id: string) => void
  rename: (id: string, label: string) => void
  moveAsChild: (nodeId: string, newParentId: string) => void
  moveBefore: (nodeId: string, targetId: string) => void
  moveAfter: (nodeId: string, targetId: string) => void
  remove: (id: string) => void
  undo: () => void
  redo: () => void
}

const uid = () => Math.random().toString(36).slice(2, 10)

const findAnd = (node: Topic, pred: (t: Topic, parent?: Topic) => boolean, parent?: Topic): Topic | undefined => {
  if (pred(node, parent)) return node
  for (const child of node.children || []) {
    const found = findAnd(child, pred, node)
    if (found) return found
  }
  return undefined
}

export const useMindMap = create<MindMapState>((set, get) => ({
  root: {
    id: 'root',
    label: 'Idée principale',
    children: [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
    ],
  },
  past: [],
  future: [],
  selectedId: null,
  select: (id) => set({ selectedId: id }),
  resetEmpty: () => set(() => ({
    root: { id: 'root', label: 'Nouvelle carte', children: [] },
    past: [],
    future: [],
    selectedId: null,
  })),
  setNote: (id, note) => set((state) => {
    const pushPast = () => state.past.concat([structuredClone(state.root)])
    const next = structuredClone(state.root)
    const t = findAnd(next, (n) => n.id === id)
    if (t) t.note = note
    return { root: next, past: pushPast(), future: [] }
  }),
  addLink: (id, url) => set((state) => {
    const pushPast = () => state.past.concat([structuredClone(state.root)])
    const next = structuredClone(state.root)
    const t = findAnd(next, (n) => n.id === id)
    if (t) {
      t.links = t.links || []
      if (!t.links.includes(url)) t.links.push(url)
    }
    return { root: next, past: pushPast(), future: [] }
  }),
  removeLink: (id, url) => set((state) => {
    const pushPast = () => state.past.concat([structuredClone(state.root)])
    const next = structuredClone(state.root)
    const t = findAnd(next, (n) => n.id === id)
    if (t && t.links) t.links = t.links.filter((u) => u !== url)
    return { root: next, past: pushPast(), future: [] }
  }),
  setTask: (id, task) => set((state) => {
    const pushPast = () => state.past.concat([structuredClone(state.root)])
    const next = structuredClone(state.root)
    const t = findAnd(next, (n) => n.id === id)
    if (t) t.task = task
    return { root: next, past: pushPast(), future: [] }
  }),
  setSide: (id, side) => set((state) => {
    const pushPast = () => state.past.concat([structuredClone(state.root)])
    const next = structuredClone(state.root)
    const t = findAnd(next, (n, parent) => n.id === id && (parent?.id === 'root'))
    if (t) (t as any).side = side
    return { root: next, past: pushPast(), future: [] }
  }),
  addSibling: (id) => set((state) => {
    const pushPast = () => state.past.concat([structuredClone(state.root)])
    const addNextTo = (node: Topic): boolean => {
      if (!node.children) return false
      const idx = node.children.findIndex((c) => c.id === id)
      if (idx >= 0) {
        const newNode: Topic = { id: uid(), label: 'Nouveau nœud' }
        node.children.splice(idx + 1, 0, newNode)
        return true
      }
      return node.children.some(addNextTo)
    }
    const next = structuredClone(state.root)
    addNextTo(next)
    return { root: next, past: pushPast(), future: [] }
  }),
  addChild: (id) => set((state) => {
    const pushPast = () => state.past.concat([structuredClone(state.root)])
    const addTo = (node: Topic): boolean => {
      if (node.id === id) {
        node.children = node.children || []
        node.children.push({ id: uid(), label: 'Nouveau fils' })
        return true
      }
      return (node.children || []).some(addTo)
    }
    const next = structuredClone(state.root)
    addTo(next)
    return { root: next, past: pushPast(), future: [] }
  }),
  toggleCollapse: (id) => set((state) => {
    const pushPast = () => state.past.concat([structuredClone(state.root)])
    const next = structuredClone(state.root)
    const t = findAnd(next, (n) => n.id === id)
    if (t) t.collapsed = !t.collapsed
    return { root: next, past: pushPast(), future: [] }
  }),
  rename: (id, label) => set((state) => {
    const pushPast = () => state.past.concat([structuredClone(state.root)])
    const next = structuredClone(state.root)
    const t = findAnd(next, (n) => n.id === id)
    if (t) t.label = label
    return { root: next, past: pushPast(), future: [] }
  }),
  moveAsChild: (nodeId, newParentId) => set((state) => {
    if (nodeId === 'root' || nodeId === newParentId) return {}
    const pushPast = () => state.past.concat([structuredClone(state.root)])
    const next = structuredClone(state.root)

    // retirer du parent courant
    const removeFromParent = (node: Topic, parent?: Topic): Topic | null => {
      if (node.id === nodeId) {
        if (!parent) return null
        parent.children = (parent.children || []).filter((c) => c.id !== nodeId)
        return node
      }
      for (const c of node.children || []) {
        const res = removeFromParent(c, node)
        if (res) return res
      }
      return null
    }
    const moving = removeFromParent(next, undefined)
    if (!moving) return { root: state.root }

    const target = findAnd(next, (n) => n.id === newParentId)
    if (!target) return { root: state.root }
    target.children = target.children || []
    target.children.push(moving)
    target.collapsed = false
    return { root: next, past: pushPast(), future: [] }
  }),
  moveBefore: (nodeId, targetId) => set((state) => {
    if (nodeId === 'root' || nodeId === targetId) return {}
    const pushPast = () => state.past.concat([structuredClone(state.root)])
    const next = structuredClone(state.root)
    // detach
    const detach = (node: Topic, parent?: Topic): Topic | null => {
      if (node.id === nodeId) {
        if (!parent) return null
        parent.children = (parent.children || []).filter(c => c.id !== nodeId)
        return node
      }
      for (const c of node.children || []) {
        const r = detach(c, node)
        if (r) return r
      }
      return null
    }
    const moving = detach(next, undefined)
    if (!moving) return { root: state.root }
    // find target parent and index
    const insert = (node: Topic, parent?: Topic): boolean => {
      if (node.id === targetId && parent) {
        const idx = (parent.children || []).findIndex(c => c.id === targetId)
        parent.children!.splice(idx, 0, moving)
        return true
      }
      return (node.children || []).some(c => insert(c, node))
    }
    insert(next, undefined)
    return { root: next, past: pushPast(), future: [] }
  }),
  moveAfter: (nodeId, targetId) => set((state) => {
    if (nodeId === 'root' || nodeId === targetId) return {}
    const pushPast = () => state.past.concat([structuredClone(state.root)])
    const next = structuredClone(state.root)
    const detach = (node: Topic, parent?: Topic): Topic | null => {
      if (node.id === nodeId) {
        if (!parent) return null
        parent.children = (parent.children || []).filter(c => c.id !== nodeId)
        return node
      }
      for (const c of node.children || []) {
        const r = detach(c, node)
        if (r) return r
      }
      return null
    }
    const moving = detach(next, undefined)
    if (!moving) return { root: state.root }
    const insert = (node: Topic, parent?: Topic): boolean => {
      if (node.id === targetId && parent) {
        const idx = (parent.children || []).findIndex(c => c.id === targetId)
        parent.children!.splice(idx + 1, 0, moving)
        return true
      }
      return (node.children || []).some(c => insert(c, node))
    }
    insert(next, undefined)
    return { root: next, past: pushPast(), future: [] }
  }),
  remove: (id) => set((state) => {
    if (id === 'root') return {}
    const pushPast = () => state.past.concat([structuredClone(state.root)])
    const next = structuredClone(state.root)
    const removeFrom = (node: Topic): boolean => {
      if (!node.children) return false
      const before = node.children.length
      node.children = node.children.filter((c) => c.id !== id)
      if (node.children.length !== before) return true
      return node.children.some(removeFrom)
    }
    removeFrom(next)
    return { root: next, past: pushPast(), future: [] }
  }),
  undo: () => set((state) => {
    if (state.past.length === 0) return {}
    const prev = state.past[state.past.length - 1]
    const newPast = state.past.slice(0, -1)
    const newFuture = [structuredClone(state.root), ...state.future]
    return { root: prev, past: newPast, future: newFuture }
  }),
  redo: () => set((state) => {
    if (state.future.length === 0) return {}
    const nextRoot = state.future[0]
    const newFuture = state.future.slice(1)
    const newPast = state.past.concat([structuredClone(state.root)])
    return { root: nextRoot, past: newPast, future: newFuture }
  })
}))

export const toG6Tree = (topic: Topic): any => ({
  id: topic.id,
  label: topic.label,
  collapsed: topic.collapsed,
  children: (topic.children || []).map(toG6Tree),
})


