import React from 'react'
import { create } from 'zustand'
import G6, { TreeGraph } from '@antv/g6'

type Topic = {
  id: string
  label: string
  children?: Topic[]
  collapsed?: boolean
}

type MindMapState = {
  root: Topic
  selectedId: string | null
  select: (id: string | null) => void
  addSibling: (id: string) => void
  addChild: (id: string) => void
}

const uid = () => Math.random().toString(36).slice(2, 10)

const useMindMap = create<MindMapState>((set, get) => ({
  root: {
    id: 'root',
    label: 'Idée principale',
    children: [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
    ],
  },
  selectedId: null,
  select: (id) => set({ selectedId: id }),
  addSibling: (id) => set((state) => {
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
    return { root: next }
  }),
  addChild: (id) => set((state) => {
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
    return { root: next }
  }),
}))

const MindMap: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const graphRef = React.useRef<TreeGraph | null>(null)
  const root = useMindMap((s) => s.root)
  const selectedId = useMindMap((s) => s.selectedId)
  const select = useMindMap((s) => s.select)
  const addSibling = useMindMap((s) => s.addSibling)
  const addChild = useMindMap((s) => s.addChild)

  React.useEffect(() => {
    if (!containerRef.current) return
    if (graphRef.current) return

    const graph = new G6.TreeGraph({
      container: containerRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      modes: { default: ['drag-canvas', 'zoom-canvas'] },
      defaultNode: {
        size: [200, 60],
        type: 'rect',
        style: { radius: 8 },
        labelCfg: { style: { fontSize: 14 } },
      },
      defaultEdge: { type: 'polyline' },
      layout: {
        type: 'mindmap',
        direction: 'H',
        getHeight: () => 60,
        getWidth: () => 200,
        getVGap: () => 30,
        getHGap: () => 60,
      },
    })

    graph.on('node:click', (evt) => {
      const id = evt.item?.getID?.() as string | undefined
      if (id) select(id)
    })

    graphRef.current = graph
  }, [])

  // Render graph data
  React.useEffect(() => {
    const graph = graphRef.current
    const container = containerRef.current
    if (!graph || !container) return
    graph.changeSize(container.clientWidth, container.clientHeight)
    const data = toG6Tree(root)
    graph.data(data)
    graph.render()
    graph.fitView(20)
  }, [root])

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (document.activeElement && (document.activeElement as HTMLElement).isContentEditable) return
      if (e.key === 'Enter' && selectedId) {
        e.preventDefault()
        addSibling(selectedId)
      } else if (e.key === 'Tab' && selectedId) {
        e.preventDefault()
        addChild(selectedId)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedId, addSibling, addChild])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 8, borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
        <button onClick={() => addChild(selectedId || 'root')}>+ Fils (Tab)</button>
        <button onClick={() => selectedId && addSibling(selectedId)}>+ Frère (Enter)</button>
        <div style={{ marginLeft: 'auto' }}>Sélection: {selectedId || '—'}</div>
      </div>
      <div ref={containerRef} style={{ flex: 1 }} />
    </div>
  )
}

function toG6Tree(topic: Topic): any {
  return {
    id: topic.id,
    label: topic.label,
    collapsed: topic.collapsed,
    children: (topic.children || []).map(toG6Tree),
  }
}

const App: React.FC = () => {
  return <MindMap />
}

export default App


