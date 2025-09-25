/*
  FR: BigMind – Composant principal de l'application
  Ce fichier assemble l'interface principale (barres d'outils, zone de cartes,
  onglets) et la logique d'affichage du mindmap avec d3.
  
  EN: BigMind – Main application component
  This file wires the main UI (toolbars, canvas, tabs) and the mindmap rendering
  logic using d3.

  FR: Principes généraux
  - L'état global (onglets, préférences) vit dans `useApp` et l'état de carte
    (nœuds, actions) vit dans `useMindMap`.
  - Le rendu se fait en SVG avec d3: un calque "zoomPane" (grand rect
    transparent) porte le zoom/pan. Le groupe <g> des nœuds/liens hérite ensuite
    de la transform (translate/scale) d3.
  - Interactions (sélection, drag, zoom) conçues pour ne pas interférer:
    • Molette seule → pan vertical
    • Shift + molette → pan horizontal
    • Ctrl/Cmd + molette → zoom
  - Les pastilles rouges montrent le nombre total de descendants; la racine a 2
    pastilles (gauche/droite), calculées à partir de la position relative.

  EN: General principles
  - Global state (tabs, preferences) lives in `useApp` and map state (nodes,
    actions) in `useMindMap`.
  - Rendering uses SVG with d3: a "zoomPane" (big transparent rect) carries
    zoom/pan; the <g> containing nodes/links inherits the d3 transform.
  - Interactions are designed not to conflict:
    • Wheel only → vertical pan
    • Shift + wheel → horizontal pan
    • Ctrl/Cmd + wheel → zoom
  - Red badges show total descendant count; root has 2 side buttons (L/R),
    computed from relative positions.

  FR: Points d'architecture importants
  - fitToView(): calcule l'emprise de la carte et centre/scale dans le viewport
  - buildFromRoot(): génère des positions sans chevauchements visibles
  - Drag des nœuds: déplace un nœud et sa descendance, surlignant un parent cible
  - Liens orthogonaux arrondis: voir `buildOrthRoundedPath()` dans utils

  EN: Key architectural points
  - fitToView(): computes map bounds and centers/scales into the viewport
  - buildFromRoot(): produces positions avoiding visual overlaps
  - Node drag: moves a node and its descendants, highlighting a drop parent
  - Orthogonal rounded links: see `buildOrthRoundedPath()` in utils
*/
import React from 'react'
import * as d3 from 'd3'
import { useTranslation } from 'react-i18next'
import Topbar from './ui/Topbar'
import SidebarLeft from './ui/SidebarLeft'
import SidebarRight from './ui/SidebarRight'
import { useApp } from './store/app'
import { useMindMap } from './store/mindmap'
import MenuBar from './ui/MenuBar'
import WelcomePane from './ui/WelcomePane'
import SettingsPane from './ui/SettingsPane'
import { buildOrthRoundedPath, countDescendants, countLeftDescendants, countRightDescendants } from './utils/layoutUtils'
import { UI_CONSTANTS, CSS_CLASSES } from './utils/constants'
import { createToggleButtonStyle, createNodeToggleButtonStyle } from './utils/styleUtils'


const MindMap: React.FC = () => {
  const { t } = useTranslation()
  const root = useMindMap((s) => s.root)
  const selectedId = useMindMap((s) => s.selectedId)
  const select = useMindMap((s) => s.select)
  const addSibling = useMindMap((s) => s.addSibling)
  const addChild = useMindMap((s) => s.addChild)
  const remove = useMindMap((s) => s.remove)
  const undo = useMindMap((s) => s.undo)
  const redo = useMindMap((s) => s.redo)
  const moveAsChildStore = useMindMap((s) => s.moveAsChild)
  const toggleCollapse = useMindMap((s) => s.toggleCollapse)
  const collapseSide = useMindMap((s) => s.collapseSide)
  const accentColor = useApp((s) => s.accentColor)
  const renameInStore = useMindMap((s) => s.rename)

  // FR: Adapter toute la carte à la vue (la fonction est définie plus bas)
  //
  // EN: Fit the entire map into view (function defined further below)

  const svgRef = React.useRef<SVGSVGElement>(null)
  const svgSelRef = React.useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null)
  const zoomBehaviorRef = React.useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const zoomTransformRef = React.useRef<d3.ZoomTransform | null>(null)
  const [dimensions, setDimensions] = React.useState({ width: 800, height: 600 })
  const language = useApp((s) => s.language)
  const [zoom, setZoom] = React.useState(1)
  const [editing, setEditing] = React.useState<{ id: string; value: string; left: number; top: number; width: number; height: number } | null>(null)
  const hoverTargetIdRef = React.useRef<string | null>(null)
  const showLeft = useApp((s) => s.leftSidebarOpen)
  const showRight = useApp((s) => s.rightSidebarOpen)
  const setShowLeft = useApp((s) => s.setLeftSidebarOpen)
  const setShowRight = useApp((s) => s.setRightSidebarOpen)
  const leftWidth = useApp((s) => s.leftSidebarWidth)
  const rightWidth = useApp((s) => s.rightSidebarWidth)
  const setLeftWidth = useApp((s) => s.setLeftSidebarWidth)
  const setRightWidth = useApp((s) => s.setRightSidebarWidth)
  const collapseMs = useApp((s) => s.collapseDurationMs)
  const showToggles = useApp((s) => s.showSidebarToggles)
  const dropTolerancePx = useApp((s) => s.dropTolerancePx)
  const nodeWidthPx = useApp((s) => s.nodeWidthPx || UI_CONSTANTS.NODE_WIDTH)
  const genGapPx = useApp((s) => s.genGapPx || UI_CONSTANTS.DEFAULT_GEN_GAP)
  const vGapPxSetting = useApp((s) => s.vGapPx || UI_CONSTANTS.DEFAULT_V_GAP)
  const didInitialFitRef = React.useRef(false)

  // Layout en arbre hiérarchique
  const [nodes, setNodes] = React.useState([
    { id: 'root', label: root.label, x: 600, y: 360, color: '#e1f5fe', borderColor: '#01579b' },
    { id: 'a', label: 'A', x: 450, y: 280, color: '#f3e5f5', borderColor: '#4a148c' },
    { id: 'b', label: 'B', x: 750, y: 280, color: '#e8f5e8', borderColor: '#1b5e20' }
  ])
  const [links, setLinks] = React.useState([
    { source: 'root', target: 'a' },
    { source: 'root', target: 'b' }
  ])

  // Fit the entire map into view
  /**
   * FR: fitToView
   * Calcule un cadre englobant tous les nœuds et applique une transformation d3
   * (translate + scale) de façon à ce que la carte entière rentre dans le viewport.
   *
   * EN: fitToView
   * Computes the bounding box of all nodes and applies a d3 transform
   * (translate + scale) so the whole map fits into the viewport.
   */
  const fitToView = React.useCallback(() => {
    if (!zoomBehaviorRef.current || !svgSelRef.current || nodes.length === 0) return
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    nodes.forEach((n: any) => {
      const w = n.width || 120
      const h = n.height || 40
      minX = Math.min(minX, n.x - w / 2)
      maxX = Math.max(maxX, n.x + w / 2)
      minY = Math.min(minY, n.y - h / 2)
      maxY = Math.max(maxY, n.y + h / 2)
    })
    const boundsWidth = maxX - minX
    const boundsHeight = maxY - minY
    if (boundsWidth <= 0 || boundsHeight <= 0) return
    const padding = 40
    const k = Math.min(
      (dimensions.width - padding * 2) / boundsWidth,
      (dimensions.height - padding * 2) / boundsHeight,
    )
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2
    const translateX = dimensions.width / 2 - centerX * k
    const translateY = dimensions.height / 2 - centerY * k
    const transform = d3.zoomIdentity.translate(translateX, translateY).scale(k)
    // @ts-ignore
    svgSelRef.current.transition().duration(200).call(zoomBehaviorRef.current.transform, transform)
  }, [nodes, dimensions.width, dimensions.height])

  // FR: Construire nœuds/liens avec un empilement par côté pour éviter les recouvrements
  //
  // EN: Build nodes/links with a tidy per-side stacking to avoid overlaps
  /**
   * FR: buildFromRoot
   * Construit les positions x/y de tous les nœuds et la liste des liens.
   * Stratégie: on répartit les enfants à gauche/droite autour de la racine, puis
   * on empile verticalement les sous-arbres en s'appuyant sur une estimation de
   * hauteur pour éviter les chevauchements.
   *
   * EN: buildFromRoot
   * Computes x/y positions for all nodes and the list of links.
   * Strategy: split children to the left/right of the root, then vertically
   * stack subtrees using an estimated height to avoid overlaps.
   */
  const buildFromRoot = React.useCallback((topicRoot: any) => {
    const resultNodes: Array<{ id: string; label: string; x: number; y: number; color: string; borderColor: string }> = []
    const resultLinks: Array<{ source: string; target: string }> = []
    const cx = dimensions.width / 2
    const cy = dimensions.height / 2
    const nodeFixedW = nodeWidthPx
    const genGap = genGapPx
    const vGap = vGapPxSetting

    // Estimation de la hauteur des nœuds AVANT rendu, basée sur largeur fixe 200 et font 14px
    const measureCtx = ((): CanvasRenderingContext2D | null => {
      try {
        const c = document.createElement('canvas')
        const ctx = c.getContext('2d')
        if (ctx) { ctx.font = 'bold 14px sans-serif' }
        return ctx
      } catch { return null }
    })()
    const wrapWidth = 190
    const lineHeight = 18
    const basePadY = 12
    const estimateHeight = (text: string): number => {
      if (!measureCtx) return 40
      const words = String(text || '').split(/\s+/).filter(Boolean)
      let lines = 0
      let line = ''
      for (const w of words) {
        const test = line ? line + ' ' + w : w
        const wpx = measureCtx.measureText(test).width
        if (wpx > wrapWidth) {
          if (line) { lines++ }
          line = w
        } else {
          line = test
        }
      }
      if (line) lines++
      return Math.max(32, lines * lineHeight + basePadY)
    }

    // FR: Calculer la hauteur cumulée d'un sous-arbre (en pixels) pour éviter les chevauchements verticaux
    //
    // EN: Compute cumulative subtree height (in pixels) to prevent vertical overlaps
    const heightOf = (n: any): number => {
      const kidsAll = n.children || []
      const kids = kidsAll.filter((k: any) => !k.collapsed)
      const selfH = estimateHeight(String(n.label || ''))
      if (kids.length === 0) return selfH
      const sumKids = kids.map(heightOf).reduce((a: number, b: number) => a + b, 0)
      return Math.max(selfH, sumKids + (kids.length - 1) * vGap)
    }

    // FR: Table de correspondance des positions Y (id → y centré)
    //
    // EN: Y-position lookup table (id → centered y)
    const yMap = new Map<string, number>()

    // FR: Empiler une liste de frères autour d'un centerY d'après leurs hauteurs de sous-arbre
    //
    // EN: Stack a list of siblings around a centerY using subtree heights
    const stackGroup = (siblings: any[], centerY: number) => {
      if (!siblings.length) return
      const total = siblings.map(heightOf).reduce((a: number, b: number) => a + b, 0) + Math.max(0, siblings.length - 1) * vGap
      let cursor = centerY - total / 2
      siblings.forEach((s) => {
        const h = heightOf(s)
        const ky = cursor + h / 2
        yMap.set(s.id, ky)
        cursor += h + vGap
      })
    }

    const children: any[] = topicRoot.children || []
    // FR: Répartition en tenant compte d'une contrainte explicite side='left'|'right' ou d'une structure de carte (tree.right)
    //     Les autres enfants restants sont alternés pour préserver la symétrie.
    //
    // EN: Split using explicit side='left'|'right' or map structure (tree.right).
    //     Remaining children are alternated to keep visual symmetry.
    const rightChildren: any[] = []
    const leftChildren: any[] = []
    const unspecified: any[] = []
    children.forEach((c, idx) => {
      if (c.side === 'left') leftChildren.push(c)
      else if (c.side === 'right') rightChildren.push(c)
      else unspecified.push(c)
    })
    // FR: Si la carte provient d'un layout "tree.right", orienter à droite par défaut.
    //
    // EN: If the map was exported with a "tree.right" layout, default children to right.
    const rootSidePref = (topicRoot as any).rootSide
    if (rootSidePref === 'right') {
      unspecified.forEach((c) => rightChildren.push(c))
    } else if (rootSidePref === 'left') {
      unspecified.forEach((c) => leftChildren.push(c))
    } else {
      unspecified.forEach((c, i) => { (i % 2 === 0 ? rightChildren : leftChildren).push(c) })
    }

    // FR: Racine centrée; on ignore d'éventuelles coordonnées absolues externes pour garder un layout cohérent
    //
    // EN: Root is centered; ignore external absolute coords for a consistent tidy layout
    const rootX = cx
    const rootY = cy
    resultNodes.push({ id: topicRoot.id, label: topicRoot.label, x: rootX, y: rootY, color: '#e1f5fe', borderColor: '#01579b' })

    const placeStack = (arr: any[], dir: 1 | -1) => {
      arr.forEach((child) => {
        const y = yMap.get(child.id) ?? cy
        const x = rootX + dir * (nodeFixedW / 2 + nodeFixedW / 2 + genGap)
        resultNodes.push({ id: child.id, label: child.label, x, y, color: '#f0f0f0', borderColor: '#666' })
        resultLinks.push({ source: topicRoot.id, target: child.id })
        // FR: Placer les descendants empilés sous cet enfant
        //
        // EN: Place descendants stacked under this child
        const placeRec = (node: any, px: number, py: number, depth: number) => {
          const kids = node.children || []
          if (!kids.length || node.collapsed) return
          kids.forEach((k: any) => {
            const ky = yMap.get(k.id) ?? py
            const kx = px + dir * (nodeFixedW / 2 + nodeFixedW / 2 + genGap)
            resultNodes.push({ id: k.id, label: k.label, x: kx, y: ky, color: '#f9fafb', borderColor: '#888' })
            resultLinks.push({ source: node.id, target: k.id })
            placeRec(k, kx, ky, depth + 1)
          })
        }
        placeRec(child, x, y, 2)
      })
    }

    // FR: Centrer verticalement chaque côté autour de cy pour une symétrie maximale
    //     Appliquer le masquage par côté via les indicateurs root.hideLeft/hideRight
    //
    // EN: Vertically center each side around cy for maximal symmetry
    //     Apply side hiding via root.hideLeft/hideRight flags
    const hideLeft = !!(topicRoot as any).hideLeft
    const hideRight = !!(topicRoot as any).hideRight

    stackGroup(hideRight ? [] : rightChildren, cy)
    stackGroup(hideLeft ? [] : leftChildren, cy)
    placeStack(hideRight ? [] : rightChildren, 1)
    placeStack(hideLeft ? [] : leftChildren, -1)

    return { nodes: resultNodes, links: resultLinks }
  }, [dimensions.width, dimensions.height, nodeWidthPx, genGapPx, vGapPxSetting])

  // Recalculer le layout complet dès que la structure/labels du store changent
  React.useEffect(() => {
    const built = buildFromRoot(root as any)
    setNodes(built.nodes)
    setLinks(built.links)
    // Auto-fit uniquement au premier rendu pour éviter les "sauts" lors des interactions
    if (!didInitialFitRef.current) {
      didInitialFitRef.current = true
      setTimeout(() => fitToView(), 0)
    }
  }, [root, buildFromRoot])

  const hexToRgba = React.useCallback((hex: string, alpha: number) => {
    let h = hex.replace('#', '')
    if (h.length === 3) h = h.split('').map(c => c + c).join('')
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }, [])

  // FR: Utilitaire – obtenir tous les identifiants descendants (via les liens) pour un nœud donné
  //
  // EN: Utility – get all descendant ids from links for a given node id
  const getDescendantIds = React.useCallback((parentId: string): string[] => {
    const childrenMap = new Map<string, string[]>()
    links.forEach(l => {
      const arr = childrenMap.get(l.source as string) || []
      arr.push(l.target as string)
      childrenMap.set(l.source as string, arr)
    })
    const result: string[] = []
    const queue: string[] = [...(childrenMap.get(parentId) || [])]
    while (queue.length) {
      const id = queue.shift()!
      result.push(id)
      const kids = childrenMap.get(id) || []
      queue.push(...kids)
    }
    return result
  }, [links])

  // FR: Relayout pur – renvoie un nouveau tableau de nœuds à partir de nodes/links
  //
  // EN: Pure relayout – returns a new nodes array given current nodes/links
  const relayoutSubtreePure = (nodesArg: typeof nodes, linksArg: typeof links, startParentId: string) => {
    const horizontalGap = 160
    const verticalGap = 70

    const idToNode = new Map(nodesArg.map(n => [n.id, { ...n }]))
    const rootNode = idToNode.get('root')
    if (!rootNode) return nodesArg

    const parentToChildren = new Map<string, string[]>()
    for (const lk of linksArg) {
      const arr = parentToChildren.get(lk.source) || []
      arr.push(String(lk.target))
      parentToChildren.set(lk.source, arr)
    }

    const sideOf = (nodeId: string) => {
      const n = idToNode.get(nodeId)
      if (!n) return 1
      return n.x < rootNode.x ? -1 : 1
    }

    const layoutChildren = (parentId: string) => {
      const childIds = parentToChildren.get(parentId) || []
      if (!childIds.length) return
      const parent = idToNode.get(parentId)
      if (!parent) return

      if (parentId === 'root') {
        const left: string[] = []
        const right: string[] = []
        for (const cid of childIds) {
          const child = idToNode.get(cid)
          if (!child) continue
          if (child.x < rootNode.x) left.push(cid); else right.push(cid)
        }
        const applyGroup = (group: string[], dir: -1 | 1) => {
          const count = group.length
          group.forEach((cid, idx) => {
            const ch = idToNode.get(cid)
            if (!ch) return
            const offsetY = (idx - (count - 1) / 2) * verticalGap
            ch.x = parent.x + dir * horizontalGap
            ch.y = parent.y + offsetY
          })
        }
        applyGroup(left, -1)
        applyGroup(right, 1)
      } else {
        const dir = sideOf(parentId) as -1 | 1
        const count = childIds.length
        childIds.forEach((cid, idx) => {
          const ch = idToNode.get(cid)
          if (!ch) return
          const offsetY = (idx - (count - 1) / 2) * verticalGap
          ch.x = parent.x + dir * horizontalGap
          ch.y = parent.y + offsetY
        })
      }

      for (const cid of childIds) layoutChildren(cid)
    }

    layoutChildren(startParentId)
    return nodesArg.map(n => idToNode.get(n.id) || n)
  }

  // Rendu D3.js avec layout en arbre
  React.useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Pane de zoom séparé en arrière-plan
    const zoomPane = svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .style('fill', 'transparent')
      .style('cursor', 'grab')

    // Calque principal
    const g = svg.append('g')
    // Réappliquer le transform courant si existant (évite le "jump" au re-render)
    if (zoomTransformRef.current) {
      const t = zoomTransformRef.current
      g.attr('transform', `translate(${t.x},${t.y}) scale(${t.k})`)
    }

    // Dessiner les liens rectangulaires avec coins arrondis
    const link = g.selectAll('path.connection')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'connection')
      .attr('d', (d) => {
        const source = nodes.find(n => n.id === d.source)
        const target = nodes.find(n => n.id === d.target)
        if (!source || !target) return ''
        // FR: Largeurs approximatives à partir des attributs des rectangles si dispo; sinon 120 par défaut
        //
        // EN: Approximate widths from rect attributes if available; otherwise default to 120
        const sw = (source as any).width || 120
        const tw = (target as any).width || 120
        return buildOrthRoundedPath(source.x, source.y, target.x, target.y, sw, tw)
      })
      .attr('fill', 'none')
      .attr('stroke', '#666')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.8)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')

    // Dessiner les nœuds
    const nodeGroups = g.selectAll('g.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')

    // FR: Rectangles des nœuds (les dimensions exactes seront ajustées après mesure du texte)
    //
    // EN: Node rectangles (final sizes are adjusted later after measuring text)
    nodeGroups.append('rect')
      .attr('width', 80)
      .attr('height', 32)
      .attr('x', -40)
      .attr('y', -16)
      .attr('rx', 8)
      .attr('fill', (d) => d.color)
      .attr('stroke', (d) => d.borderColor)
      .attr('stroke-width', (d) => selectedId === d.id ? 4 : 2)

    // FR: Texte des nœuds (retour à la ligne via tspans, largeur fixe)
    //
    // EN: Node text (line wrapping with tspans, fixed width)
    const textSel = nodeGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#000')

    const wrapText = (text: d3.Selection<SVGTextElement, any, any, any>, width: number, lineHeight = 18) => {
      text.each(function(d: any) {
        const words = String(d.label || '').split(/\s+/).filter(Boolean)
        const lines: string[] = []
        let line: string[] = []
        const temp = d3.select(this as SVGTextElement)
        const test = temp.text('')
        words.forEach((w) => {
          line.push(w)
          test.text(line.join(' '))
          if (test.node()!.getComputedTextLength() > width) {
            line.pop()
            lines.push(line.join(' '))
            line = [w]
            test.text(line.join(' '))
          }
        })
        if (line.length) lines.push(line.join(' '))
        temp.text('')
        // FR: Positionner le bloc de texte centré verticalement
        //
        // EN: Vertically center the text block
        temp.attr('y', -(lines.length - 1) * lineHeight / 2)
        lines.forEach((ln, i) => {
          temp.append('tspan')
            .attr('x', 0)
            .attr('dy', i === 0 ? 0 : `${lineHeight}px`)
            .text(ln)
        })
        ;(d as any).__lines = lines.length
      })
    }
    wrapText(textSel as any, 190)

    // FR: Ajuster la taille des rectangles selon le texte et stocker la taille dans les données
    //
    // EN: Adjust rectangle sizes based on text and store size back into data
    nodeGroups.each(function(d: any) {
      const gEl = d3.select(this)
      const textEl = gEl.select('text').node() as SVGTextElement | null
      const rectEl = gEl.select('rect')
      if (!textEl) return
      const bbox = textEl.getBBox()
      const padX = 10
      const padY = 12
      const width = 200
      const lines = (d as any).__lines || 1
      const lineHeight = 18
      const height = Math.max(32, lines * lineHeight + padY)
      rectEl
        .attr('width', width)
        .attr('height', height)
        .attr('x', -width / 2)
        .attr('y', -height / 2)
      d.width = width
      d.height = height
    })

    // FR: Ajuster la position X des enfants selon les largeurs réelles pour garantir que
    //     le bord droit d'un enfant à gauche soit à gauche du bord gauche du parent (et inversement à droite)
    //
    // EN: Adjust children X positions using real widths to ensure the right edge of a left child
    //     stays left of the parent's left edge (and symmetrically on the right)
    try {
      // FR: Construire la map parent → enfants à partir du store
      //
      // EN: Build the parent → children map from the store
      const parentOf = new Map<string, string>()
      const buildParent = (n: any, parentId?: string) => {
        if (parentId) parentOf.set(n.id, parentId)
        ;(n.children || []).forEach((c: any) => buildParent(c, n.id))
      }
      buildParent(root as any, undefined)

      const idToSel = new Map<string, d3.Selection<SVGRectElement, unknown, null, undefined>>()
      g.selectAll('g.node').each(function(d: any) {
        idToSel.set(d.id, d3.select(this).select('rect') as any)
      })

      const rootNodeObj = nodes.find(n => n.id === 'root') as any
      // FR: Utiliser l'écart paramétré pour l'espacement horizontal entre générations
      //
      // EN: Use the configured gap for horizontal spacing between generations
      const gapPad = genGapPx
      const updated: any[] = nodes.map(n => ({ ...n }))
      updated.forEach((n: any) => {
        if (n.id === 'root') return
        const parentId = parentOf.get(n.id)
        if (!parentId) return
        const p = updated.find(x => x.id === parentId)
        if (!p) return
        const pRect = idToSel.get(parentId)
        const cRect = idToSel.get(n.id)
        const pw = Number(pRect?.attr('width')) || (p as any).width || 200
        const cw = Number(cRect?.attr('width')) || (n as any).width || 200
        const dir = n.x < rootNodeObj.x ? -1 : 1
        let targetX: number
        if (dir < 0) {
          // FR: Gauche — bord droit enfant = bord gauche parent - gap
          //
          // EN: Left — child right edge = parent left edge - gap
          const parentLeft = p.x - pw / 2
          targetX = parentLeft - gapPad - cw / 2
        } else {
          // FR: Droite — bord gauche enfant = bord droit parent + gap
          //
          // EN: Right — child left edge = parent right edge + gap
          const parentRight = p.x + pw / 2
          targetX = parentRight + gapPad + cw / 2
        }
        n.x = targetX
      })
      // FR: Appliquer la transform si des positions ont changé
      //
      // EN: Apply transform if positions changed
      const changedX = updated.some((n: any, i: number) => Math.abs(n.x - (nodes[i] as any).x) > 0.5)
      if (changedX) {
        setNodes(updated)
        g.selectAll('g.node').attr('transform', (d: any) => {
          const nu = updated.find(n => n.id === d.id) as any
          return `translate(${nu.x}, ${nu.y})`
        })
        // FR: Recalculer les liens avec les nouvelles positions X
        //
        // EN: Recompute links with updated X positions
        g.selectAll('path.connection')
          .attr('d', (link: any) => {
            const source = updated.find(n => n.id === link.source)
            const target = updated.find(n => n.id === link.target)
            if (!source || !target) return ''
            const srcRect = g.selectAll('g.node').filter((n: any) => n.id === link.source).select('rect')
            const tgtRect = g.selectAll('g.node').filter((n: any) => n.id === link.target).select('rect')
            const sw = Number(srcRect.attr('width')) || (source as any).width || 120
            const tw = Number(tgtRect.attr('width')) || (target as any).width || 120
            return buildOrthRoundedPath(source.x, source.y, target.x, target.y, sw, tw)
          })
      }
    } catch {}

    // FR: Pastilles de toggle (affichage/masquage) sur chaque nœud + boutons gauche/droite de la racine
    //
    // EN: Toggle badges (show/hide) on each node + left/right buttons on the root
    try {
      if (showToggles) {
        // FR: Index des topics par id pour calculer les descendants
        //
        // EN: Topic index by id to compute descendants
        const topicIndex = new Map<string, any>()
        const buildIndex = (n: any) => { topicIndex.set(n.id, n); (n.children || []).forEach(buildIndex) }
        buildIndex(root as any)

        // FR: Nettoyer d'anciens toggles avant de recréer
        //
        // EN: Remove previous toggles before recreating
        g.selectAll('g.node .node-toggle').remove()
        g.selectAll('g.root-side-toggle').remove()

        // FR: Ajouter une pastille à chaque nœud ayant des enfants
        //
        // EN: Add a toggle badge to each node that has children
        const rootNodeForDir = nodes.find(n => n.id === 'root') as any
        let togglesCreated = 0
        g.selectAll('g.node').each(function(d: any) {
          // FR: Ne pas dessiner de pastille générique pour la racine (elle a 2 pastilles côté)
          //
          // EN: Do not draw a generic toggle for the root (it has 2 side toggles)
          if (d.id === 'root') return
          const topic = topicIndex.get(d.id)
          const hasChildren = !!(topic && (topic.children || []).length)
          if (!hasChildren) return
          const total = countDescendants(topic)
          const group = d3.select(this)
          const rect = group.select('rect')
          const w = Number(rect.attr('width')) || (d as any).width || 200
          const dir = rootNodeForDir && d.x < rootNodeForDir.x ? -1 : 1
          const offset = w / 2 + 10
          const toggleG = group.append('g')
            .attr('class', 'node-toggle')
            .style('cursor', 'pointer')
            .style('pointer-events', 'all')
            // FR: À gauche si le nœud est à gauche de la racine; sinon à droite
            //
            // EN: On the left if node is left of root; otherwise on the right
            .attr('transform', `translate(${dir * offset}, 0)`)
            .on('mousedown', (event: any) => { console.log('[md] node-toggle', d.id); event.stopPropagation(); event.preventDefault(); })
            .on('click', (event: any) => { console.log('[click] node-toggle', d.id); event.stopPropagation(); event.preventDefault(); toggleCollapse(d.id) })
          toggleG.append('circle').attr('r', 12).attr('fill', accentColor).attr('stroke', '#fff').attr('stroke-width', 2).style('pointer-events', 'all')
          toggleG.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em').attr('fill', '#fff').style('font-size', '11px').text(String(total)).style('pointer-events', 'none')
          togglesCreated++
        })
        console.log('[render] node toggles created =', togglesCreated)

        // FR: Boutons côté gauche/droite sur la racine
        //
        // EN: Left/right side buttons on the root
        const rootNode = nodes.find(n => n.id === 'root') as any
        if (rootNode) {
          // FR: Map id → node pour déterminer gauche/droite par rapport à la racine
          //
          // EN: Map id → node to determine left/right relative to root
          const idToNode = new Map(nodes.map(n => [n.id, n]))
          const topicRoot: any = root
          const children = (topicRoot.children || []) as any[]
          const leftChildren = children.filter(c => {
            const n = idToNode.get(c.id)
            return n ? n.x < rootNode.x : (c.side === 'left')
          })
          const rightChildren = children.filter(c => {
            const n = idToNode.get(c.id)
            return n ? n.x >= rootNode.x : (c.side === 'right')
          })
          const hideLeft = !!(topicRoot as any).hideLeft
          const hideRight = !!(topicRoot as any).hideRight
          // FR: Calculer par côté en se basant sur la position actuelle des nœuds (robuste même sans side explicite)
          //
          // EN: Compute per side based on current node positions (robust even without explicit side)
          const sumDesc = (t: any): number => 1 + (t.children || []).reduce((s: number, c: any) => s + sumDesc(c), 0)
          let leftCount = 0
          let rightCount = 0
          for (const c of topicRoot.children || []) {
            const n = idToNode.get(c.id)
            const isRight = n ? n.x >= rootNode.x : (c.side === 'right')
            if (isRight) rightCount += sumDesc(c)
            else leftCount += sumDesc(c)
          }

          const rootSel = g.selectAll('g.node').filter((n: any) => n.id === 'root')
          const rootRect = rootSel.select('rect')
          const rw = Number(rootRect.attr('width')) || (rootNode.width || 200)

          const makeBtn = (dx: number, cls: string, count: number, side: 'left' | 'right') => {
            const btn = rootSel.append('g')
              .attr('class', `root-side-toggle ${cls}`)
              .style('cursor', 'pointer')
              .style('pointer-events', 'all')
              .attr('transform', `translate(${dx}, 0)`)
              .on('mousedown', (event: any) => { console.log('[md] root-side-toggle', side); event.stopPropagation(); event.preventDefault(); })
              .on('click', (event: any) => {
                console.log('[click] root-side-toggle', side)
                event.stopPropagation(); event.preventDefault()
                const currentHidden = side === 'left' ? !!(topicRoot as any).hideLeft : !!(topicRoot as any).hideRight
                collapseSide(side, !currentHidden)
              })
            btn.append('circle').attr('r', 12).attr('fill', accentColor).attr('stroke', '#fff').attr('stroke-width', 2).style('pointer-events', 'all')
            btn.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em').attr('fill', '#fff').style('font-size', '11px').text(String(count)).style('pointer-events', 'none')
          }

          makeBtn(-(rw / 2) - 14, 'left', leftCount, 'left')
          makeBtn((rw / 2) + 14, 'right', rightCount, 'right')
        }
      }
    } catch {}

    // FR: Recalage des positions selon les hauteurs mesurées pour éviter les chevauchements
    //
    // EN: Reflow positions using measured heights to avoid vertical overlaps
    try {
      const heightMap = new Map<string, number>()
      nodes.forEach((n: any) => heightMap.set(n.id, n.height || 40))

      // FR: Construire la correspondance parent → enfants à partir de l'arbre logique (racine du store)
      //
      // EN: Build child mapping from the logical tree (root from store)
      const topicRoot: any = root
      const nodeH = (id: string) => heightMap.get(id) || 40
      const gap = 28

      // FR: Calculer la hauteur en pixels d'un sous-arbre
      //
      // EN: Compute subtree pixel heights
      const subtreeHeight = (n: any): number => {
        const kidsAll = n.children || []
        const kids = kidsAll.filter((k: any) => !k.collapsed)
        if (kids.length === 0) return nodeH(n.id)
        const sum = kids.map(subtreeHeight).reduce((a: number, b: number) => a + b, 0)
        return sum + (kids.length - 1) * gap
      }

      const yCenter = new Map<string, number>()
      const assign = (n: any, centerY: number) => {
        const kidsAll = n.children || []
        const kids = kidsAll.filter((k: any) => !k.collapsed)
        if (!kids.length) return
        const total = kids.map(subtreeHeight).reduce((a: number, b: number) => a + b, 0) + Math.max(0, kids.length - 1) * gap
        let cursor = centerY - total / 2
        kids.forEach((k: any) => {
          const h = subtreeHeight(k)
          const ky = cursor + h / 2
          yCenter.set(k.id, ky)
          assign(k, ky)
          cursor += h + gap
        })
      }
      assign(topicRoot, (nodes.find(n => n.id === 'root') as any)?.y || dimensions.height / 2)

      // FR: Mettre à jour uniquement les positions Y en respectant le placement gauche/droite existant
      //
      // EN: Update only Y positions, keeping previously computed side placement
      const newNodes = nodes.map((n: any) => {
        if (n.id === 'root') return n
        const ny = yCenter.get(n.id)
        return ny ? { ...n, y: ny } : n
      })
      const changed = newNodes.some((n: any, i: number) => Math.abs(n.y - (nodes[i] as any).y) > 0.5)
      if (changed) {
        setNodes(newNodes as any)
      }
    } catch {}

    // FR: Recalculer les liens après ajustement des largeurs/hauteurs réelles
    //
    // EN: Recompute links after adjusting actual widths/heights
    g.selectAll('path.connection')
      .attr('d', (link: any) => {
        const source = nodes.find(n => n.id === link.source)
        const target = nodes.find(n => n.id === link.target)
        if (!source || !target) return ''
        // Récupérer les dimensions réelles depuis les groupes déjà rendus
        const srcRect = g.selectAll('g.node').filter((n: any) => n.id === link.source).select('rect')
        const tgtRect = g.selectAll('g.node').filter((n: any) => n.id === link.target).select('rect')
        const sw = Number(srcRect.attr('width')) || (source as any).width || 120
        const tw = Number(tgtRect.attr('width')) || (target as any).width || 120
        return buildOrthRoundedPath(source.x, source.y, target.x, target.y, sw, tw)
      })

    // FR: Sélection immédiate sur mousedown (plus réactif qu'un clic et compatible avec le drag)
    //
    // EN: Immediate selection on mousedown (more responsive than click and compatible with drag)
    nodeGroups.on('mousedown', (event, d) => {
      console.log('NODE MOUSEDOWN:', d.id, 'event:', event)
      // Ne pas preventDefault pour laisser D3-drag initier le drag immédiatement
      event.stopPropagation()
      if (editing) setEditing(null)
    })
    nodeGroups.on('click', (event, d) => {
      console.log('NODE CLICK:', d.id, 'event:', event)
      event.stopPropagation()
      event.preventDefault()
      select(d.id)
    })
    nodeGroups.on('dblclick', function(event, d) {
      console.log('[dblclick] group node id=', d.id, 'detail=', (event as any).detail, 'target=', (event.target as Element).tagName)
      event.stopPropagation()
      event.preventDefault()
      const t = zoomTransformRef.current || d3.zoomIdentity
      const [sx, sy] = t.apply([d.x, d.y])
      const rectSel = d3.select(this as SVGGElement).select('rect')
      const width = Number(rectSel.attr('width')) || (d as any).width || 120
      const height = Number(rectSel.attr('height')) || (d as any).height || 40
      setEditing({ id: d.id, value: d.label, left: sx - width / 2, top: sy - height / 2, width, height })
    })

    // FR: Ajout de logs sur les sous-éléments pour diagnostic
    //
    // EN: Add logs on sub-elements for diagnostics
    nodeGroups.select('rect').on('dblclick.log', function(event: any, d: any) {
      console.log('[dblclick] rect id=', d.id, 'detail=', event.detail)
    })
    nodeGroups.select('text').on('dblclick.log', function(event: any, d: any) {
      console.log('[dblclick] text id=', d.id, 'detail=', event.detail)
    })

    // FR: Log de secours sur le SVG pour vérifier la remontée du double‑clic
    //
    // EN: Fallback log on SVG to check double‑click bubbling
    d3.select(svgRef.current).on('dblclick.log', function(event: any) {
      console.log('[dblclick] svg captured, target=', (event.target as Element).tagName)
    })

    // FR: Gérer le drag simple
    //
    // EN: Handle simple node drag
    const drag = d3.drag<SVGGElement, any>()
      // FR: Ne pas démarrer un drag pendant un double‑clic ni lorsqu'on clique une pastille de toggle
      //
      // EN: Do not start a drag during a double‑click or when clicking a toggle badge
      .filter((event: any) => {
        const target: Element | null = event?.sourceEvent?.target || null
        if (target && (target as Element).closest && ((target as Element).closest('.node-toggle') || (target as Element).closest('.root-side-toggle'))) {
          return false
        }
        const isDbl = event?.detail >= 2
        return !isDbl
      })
      .on('start', function(event, d) {
        event.sourceEvent.stopPropagation()
        d3.select(this).raise()
        // FR: Fixer la position actuelle pour démarrer sans "saut"
        //
        // EN: Pin the current position to start without a visual "jump"
        d.startX = d.x
        d.startY = d.y
        // FR: Préparer des ancres de drag pour le nœud et sa descendance
        //
        // EN: Prepare drag anchors for the node and its descendants
        d.descendants = getDescendantIds(d.id)
        const idsToTrack: string[] = [d.id, ...d.descendants]
        d.dragAnchors = new Map<string, { x: number; y: number }>()
        idsToTrack.forEach((id) => {
          const nodeObj = nodes.find(n => n.id === id)
          if (nodeObj) d.dragAnchors.set(id, { x: nodeObj.x, y: nodeObj.y })
        })
        // FR: Masquer le lien parent → nœud pendant le drag
        //
        // EN: Hide the parent → node link during drag
        g.selectAll('path.connection')
          .filter((l: any) => String(l.target) === String(d.id))
          .attr('visibility', 'hidden')
        // FR: Sauvegarder temporairement les couleurs/strokes originaux si besoin
        //
        // EN: Snapshot original fills/strokes if needed
        g.selectAll('g.node rect').each(function() {
          const rect = d3.select(this)
          if (!rect.attr('data-fill-original')) {
            rect.attr('data-fill-original', rect.attr('fill') || '')
            rect.attr('data-stroke-original', rect.attr('stroke') || '')
            rect.attr('data-stroke-width-original', rect.attr('stroke-width') || '2')
          }
        })
      })
      .on('drag', function(event, d) {
        event.sourceEvent.stopPropagation()
        const dx = event.x - d.startX
        const dy = event.y - d.startY
        const shiftOnly = !!event.sourceEvent.shiftKey
        const moveIds: string[] = shiftOnly ? [d.id] : [d.id, ...(d.descendants || [])]
        // FR: Mettre à jour les positions en mémoire et à l'écran
        //
        // EN: Update positions in memory and on screen
        const moveSet = new Set(moveIds)
        moveIds.forEach((id) => {
          const anchor = d.dragAnchors?.get(id)
          if (!anchor) return
          const nodeObj = nodes.find(n => n.id === id)
          if (!nodeObj) return
          nodeObj.x = anchor.x + dx
          nodeObj.y = anchor.y + dy
        })
        // FR: Appliquer la transform aux groupes concernés
        //
        // EN: Apply transform to the affected groups
        g.selectAll('g.node')
          .filter((n: any) => moveSet.has(n.id))
          .attr('transform', (n: any) => `translate(${n.x}, ${n.y})`)
        
        // FR: Mettre à jour les liens orthogonaux arrondis
        //
        // EN: Update orthogonal rounded links
        g.selectAll('path.connection')
          .attr('d', (link: any) => {
            const source = nodes.find(n => n.id === link.source)
            const target = nodes.find(n => n.id === link.target)
            if (!source || !target) return ''
            const sw = (source as any).width || 120
            const tw = (target as any).width || 120
            return buildOrthRoundedPath(source.x, source.y, target.x, target.y, sw, tw)
          })

        // FR: Détection et surlignage du parent potentiel sous le curseur
        //
        // EN: Detect and highlight potential parent under the cursor
        try {
          const svgRect = svgRef.current?.getBoundingClientRect()
          const t = zoomTransformRef.current || d3.zoomIdentity
          if (svgRect) {
            const px = event.sourceEvent.clientX - svgRect.left
            const py = event.sourceEvent.clientY - svgRect.top
            const [gx, gy] = t.invert([px, py])
            const invalidIds = new Set<string>([d.id, ...(d.descendants || [])])
            let dropTarget: any | null = null
            const tol = dropTolerancePx
            for (const candidate of nodes) {
              if (invalidIds.has(candidate.id)) continue
              const w = (candidate as any).width || 120
              const h = (candidate as any).height || 40
              const left = candidate.x - w / 2 - tol
              const right = candidate.x + w / 2 + tol
              const top = candidate.y - h / 2 - tol
              const bottom = candidate.y + h / 2 + tol
              if (gx >= left && gx <= right && gy >= top && gy <= bottom) { dropTarget = candidate; break }
            }
            const prev = hoverTargetIdRef.current
            const next = dropTarget?.id || null
            if (prev !== next) {
              // FR: Restaurer l'ancien
              //
              // EN: Restore previous highlight
              if (prev) {
                const prevRect = g.selectAll('g.node').filter((n: any) => n.id === prev).select('rect')
                prevRect.attr('fill', (prevRect.attr('data-fill-original') || ''))
                prevRect.attr('stroke', (prevRect.attr('data-stroke-original') || ''))
                prevRect.attr('stroke-width', (prevRect.attr('data-stroke-width-original') || '2'))
              }
              // FR: Appliquer le nouveau surlignage
              //
              // EN: Apply new highlight
              if (next) {
                const nextRect = g.selectAll('g.node').filter((n: any) => n.id === next).select('rect')
                nextRect.attr('fill', hexToRgba(accentColor, 0.15))
                nextRect.attr('stroke', accentColor)
                nextRect.attr('stroke-width', 3)
              }
              hoverTargetIdRef.current = next
            }
          }
        } catch {}
      })
      .on('end', function(event, d) {
        // FR: Nettoyer un éventuel surlignage résiduel
        //
        // EN: Clear any remaining highlight
        if (hoverTargetIdRef.current) {
          const prevRect = g.selectAll('g.node').filter((n: any) => n.id === hoverTargetIdRef.current).select('rect')
          prevRect.attr('fill', (prevRect.attr('data-fill-original') || ''))
          prevRect.attr('stroke', (prevRect.attr('data-stroke-original') || ''))
          prevRect.attr('stroke-width', (prevRect.attr('data-stroke-width-original') || '2'))
          hoverTargetIdRef.current = null
        }
        // FR: Si on lâche sur un autre nœud (non‑descendant), rattacher comme enfant
        //
        // EN: If dropped on another (non‑descendant) node, reparent as a child
        try {
          const svgRect = svgRef.current?.getBoundingClientRect()
          const t = zoomTransformRef.current || d3.zoomIdentity
          if (svgRect) {
            const px = event.sourceEvent.clientX - svgRect.left
            const py = event.sourceEvent.clientY - svgRect.top
            const [gx, gy] = t.invert([px, py])
            const invalidIds = new Set<string>([d.id, ...(d.descendants || [])])
            // FR: Priorité au parent surligné s'il existe
            //
            // EN: Give priority to the highlighted parent if present
            let dropTarget: any | null = hoverTargetIdRef.current
              ? nodes.find(n => n.id === hoverTargetIdRef.current) || null
              : null
            // FR: Sinon, recherche avec tolérance
            //
            // EN: Otherwise search using tolerance
            if (!dropTarget) {
              const tol = dropTolerancePx
              for (const candidate of nodes) {
                if (invalidIds.has(candidate.id)) continue
                const w = (candidate as any).width || 120
                const h = (candidate as any).height || 40
                const left = candidate.x - w / 2 - tol
                const right = candidate.x + w / 2 + tol
                const top = candidate.y - h / 2 - tol
                const bottom = candidate.y + h / 2 + tol
                if (gx >= left && gx <= right && gy >= top && gy <= bottom) { dropTarget = candidate; break }
              }
            }
            if (dropTarget) {
              moveAsChildStore(d.id, dropTarget.id)
              select(d.id)
        return
      }
          }
        } catch {}

        // FR: Sinon: persister les positions locales et sélectionner le nœud à la fin du drag
        //
        // EN: Otherwise: persist local positions and select the node at drag end
        const dx = (d.x ?? d.startX) - d.startX
        const dy = (d.y ?? d.startY) - d.startY
        const shiftOnly = !!event.sourceEvent.shiftKey
        const moveIds: string[] = shiftOnly ? [d.id] : [d.id, ...(d.descendants || [])]
        const moveSet = new Set(moveIds)
        setNodes(prev => prev.map(n => {
          if (!moveSet.has(n.id)) return n
          const anchor = d.dragAnchors?.get(n.id)
          if (!anchor) return n
          return { ...n, x: anchor.x + dx, y: anchor.y + dy }
        }))
        select(d.id)
        // FR: Ré‑afficher le lien parent → nœud s'il n'y a pas eu de reparentage
        //
        // EN: Re‑show the parent → node link if no reparenting occurred
        g.selectAll('path.connection')
          .filter((l: any) => String(l.target) === String(d.id))
          .attr('visibility', 'visible')
      })

    nodeGroups.call(drag)

    // Zoom/Pan via D3 appliqué au zoomPane uniquement
    const zoomBehavior = d3.zoom<SVGRectElement, unknown>()
      .scaleExtent([0.5, 2])
      // Autoriser le zoom à la molette uniquement si Ctrl/Cmd
      .filter((event: any) => {
        if (event.type === 'wheel') return !!(event.ctrlKey || event.metaKey)
        return true
      })
      .on('zoom', (event) => {
        console.log('ZOOM EVENT:', event.transform)
        g.attr('transform', event.transform)
        setZoom(Number(event.transform.k.toFixed(2)))
        zoomTransformRef.current = event.transform
      })
      .on('start', (event) => {
        console.log('ZOOM START:', event.sourceEvent?.type)
      })
      .on('end', (event) => {
        console.log('ZOOM END:', event.sourceEvent?.type)
      })
    // Appliquer le zoom uniquement sur le pane de fond
    zoomPane.call(zoomBehavior as any)
    // Molette: pan vertical par défaut; Shift + molette: pan horizontal; Ctrl/Cmd + molette: zoom (géré par filter ci-dessus)
    zoomPane.on('wheel.pan', (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) return // laisser d3-zoom gérer
      event.preventDefault()
      const factor = 1
      const dx = event.shiftKey ? -event.deltaY * factor : 0
      const dy = event.shiftKey ? 0 : -event.deltaY * factor
      try { (zoomPane as any).call((zoomBehavior as any).translateBy, dx, dy) } catch {}
    })
    // Synchroniser la transform actuelle si on en a une
    if (zoomTransformRef.current) {
      (zoomPane as any).call((zoomBehavior as any).transform, zoomTransformRef.current)
    }
    // Désactiver double-clic zoom sur le pane
    zoomPane.on('dblclick.zoom', null)
    // Pour les boutons +/-
    svgSelRef.current = zoomPane as any
    zoomBehaviorRef.current = zoomBehavior as any

  }, [root, select, selectedId, dimensions, nodes, links])

  // Fonction pour ajouter un nouveau nœud avec layout en arbre
  /**
   * addNewNode
   * Ajoute un enfant à un parent existant et recalcule une position simple
   * (utilisé dans la démo). Le layout complet est géré ailleurs.
   */
  const addNewNode = (parentId: string, label: string) => {
    const parent = nodes.find(n => n.id === parentId)
    if (!parent) return

    // Direction horizontale héritée: si parent est à gauche de la racine, enfants à gauche; sinon à droite
    const rootNode = nodes.find(n => n.id === 'root')!
    const horizontalDir = parent.x < rootNode.x ? -1 : 1

    // Calculer index enfant et distribution verticale
    const existingChildren = links
      .filter(l => l.source === parentId)
      .map(l => l.target)
    const childIndex = existingChildren.length
    const siblingCount = childIndex + 1
    const horizontalGap = 160
    const verticalGap = 70

    // Centrer les enfants autour du parent sur l'axe vertical
    const offsetY = (childIndex - (siblingCount - 1) / 2) * verticalGap

    const newNode = {
      id: `node_${Date.now()}`,
      label,
      x: parent.x + horizontalDir * horizontalGap,
      y: parent.y + offsetY,
      color: '#f0f0f0',
      borderColor: '#666'
    }
    
    // Commit: update links first and relayout nodes using the freshly computed links
    const linkToAdd = { source: parentId, target: newNode.id }
    setLinks(prevLinks => {
      const nextLinks = [...prevLinks, linkToAdd]
      setNodes(prevNodes => relayoutSubtreePure([...prevNodes, newNode], nextLinks, parentId))
      return nextLinks
    })
  }

  // Ajouter un frère: trouve le parent du nœud sélectionné et ajoute un enfant à ce parent
  const addSiblingNode = (nodeId: string, label: string) => {
    if (nodeId === 'root') return
    const parentLink = links.find(l => l.target === nodeId)
    const parentId = parentLink?.source as string | undefined
    if (!parentId) return
    addNewNode(parentId, label)
  }

  // Gérer le redimensionnement
  React.useEffect(() => {
    const handleResize = () => {
      const container = svgRef.current?.parentElement
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight
        })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const ae = document.activeElement as HTMLElement | null
      if (ae) {
        const tag = ae.tagName?.toLowerCase()
        const isEditable = ae.isContentEditable || ae.getAttribute('contenteditable') === 'true'
        if (isEditable || tag === 'input' || tag === 'textarea' || tag === 'select') return
      }
      if (e.key === 'Tab' && selectedId) {
        e.preventDefault(); addChild(selectedId)
      } else if (e.key === 'Enter' && selectedId) {
        e.preventDefault(); addSibling(selectedId)
      } else if (e.key === 'Delete' && selectedId) {
        e.preventDefault(); setNodes(prev => prev.filter(n => n.id !== selectedId)); select('root')
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault(); if (e.shiftKey) redo(); else undo()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedId, addSibling, addChild, remove, undo, redo])

  const tabs = useApp((s) => s.tabs)
  const files = useApp((s) => s.files)
  const activeFileId = useApp((s) => s.activeFileId)
  const activeTabId = useApp((s) => s.activeTabId)
  const activate = useApp((s) => s.activate)
  const closeTab = useApp((s) => s.closeTab)
  const updateTabMap = useApp((s) => s.updateTabMap)
  const resetEmpty = useMindMap((s) => s.resetEmpty)

  // Persist current map into active tab whenever it changes
  // Debounced persist of current map into active tab to avoid update loops
  React.useEffect(() => {
    const active = tabs.find(t => t.id === activeTabId)
    if (!active || active.type !== 'mindmap') return
    const handler = setTimeout(() => {
      updateTabMap(active.id, root)
    }, 50)
    return () => clearTimeout(handler)
  }, [root, activeTabId, tabs])

  // When changing active tab, if it has a stored map, load it into mindmap store
  React.useEffect(() => {
    const active = tabs.find(t => t.id === activeTabId)
    if (active && active.type === 'mindmap' && active.map) {
      useMindMap.setState({ root: active.map, past: [], future: [], selectedId: null })
      const built = buildFromRoot(active.map)
      setNodes(built.nodes)
      setLinks(built.links)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabId])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Topbar />
      <MenuBar />
      {/* Tabs bar – only tabs of the active file */}
      <div className="tabs" style={{ ['--accent' as any]: accentColor }}>
        {tabs.filter(t => t.type !== 'mindmap' || !activeFileId || t.fileId === activeFileId).map((t, idx) => (
          <div key={t.id}
            draggable
            onDragStart={(e) => { e.dataTransfer.setData('text/tab-index', String(idx)) }}
            onDragOver={(e) => { e.preventDefault(); (e.currentTarget.previousSibling as HTMLElement | null)?.classList.remove('show-drop'); }}
            onDragEnter={(e) => { e.preventDefault(); }}
            onDrop={(e) => { const from = Number(e.dataTransfer.getData('text/tab-index')); if (!Number.isNaN(from)) useApp.getState().moveTab(from, idx); (e.currentTarget.querySelector('.tab-drop') as HTMLElement | null)?.remove?.(); }}
            onDragLeave={(e) => { (e.currentTarget.querySelector('.tab-drop') as HTMLElement | null)?.remove?.(); }}
            onDragOverCapture={(e) => {
              // Show visual indicator before current tab
              const el = e.currentTarget as HTMLElement
              if (!el.querySelector('.tab-drop')) {
                const marker = document.createElement('div')
                marker.className = 'tab-drop'
                el.prepend(marker)
              }
            }}
            onAuxClick={(e) => { if (e.button === 1) closeTab(t.id) }}
            onClick={() => activate(t.id)}
            className={`tab ${activeTabId === t.id ? 'active' : ''}`}>
            <span>{t.title}</span>
            {/* dirty indicator placeholder */}
            <button className="tab-close" onClick={(e) => { e.stopPropagation(); closeTab(t.id) }} title={t.dirty ? 'Unsaved changes' : 'Close'}>
              {t.dirty ? (
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 999, background: 'var(--accent)' }} />
              ) : (
                '×'
              )}
            </button>
                  </div>
        ))}
        <button onClick={() => { useApp.getState().openMindmap(); resetEmpty(); }} title="New tab" style={{
          width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent)'
        }}>+
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Left sidebar only for mindmap tabs */}
        {tabs.find(t => t.id === activeTabId)?.type === 'mindmap' && (
          <div style={{
            width: showLeft ? leftWidth : 0,
            transition: `width ${collapseMs}ms ease`,
            overflow: 'hidden',
            borderRight: showLeft ? '1px solid #e5e7eb' : 'none',
            background: 'var(--panel)',
            position: 'relative'
          }}>
            {showLeft && <SidebarLeft />}
            {/* Resizer */}
            {showLeft && (
              <div
                onMouseDown={(e) => {
                  const startX = e.clientX
                  const start = leftWidth
                  const onMove = (ev: MouseEvent) => {
                    const next = Math.max(160, Math.min(480, start + (ev.clientX - startX)))
                    setLeftWidth(next)
                  }
                  const onUp = () => {
                    window.removeEventListener('mousemove', onMove)
                    window.removeEventListener('mouseup', onUp)
                  }
                  window.addEventListener('mousemove', onMove)
                  window.addEventListener('mouseup', onUp)
                }}
                className="resizer-handle"
                style={{ position: 'absolute', top: 0, right: 0, width: 6, cursor: 'col-resize', height: '100%' }}
              />
            )}
          </div>
        )}
        <div style={{ flex: 1, background: 'var(--bg, #f8fafc)', position: 'relative' }}>
          {tabs.find(t => t.id === activeTabId)?.type === 'mindmap' ? (
            <>
              <svg
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                style={{ width: '100%', height: '100%' }}
              />
              {/* Toggle buttons for sidebars */}
              {showToggles && <button
                className="sidebar-toggle right"
                aria-label={showRight ? t('Hide right panel') : t('Show right panel')}
                title={showRight ? t('Hide right panel') : t('Show right panel')}
                onClick={() => setShowRight(!showRight)}
                style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10, boxShadow: '0 1px 3px rgba(0,0,0,.12)' }}
              >
                {showRight ? (
                  // open → chevron vers la droite pour indiquer repli vers la droite
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
                ) : (
                  // fermé → chevron vers la gauche pour réafficher
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
                )}
              </button>}
              {showToggles && <button
                className="sidebar-toggle left"
                aria-label={showLeft ? t('Hide left panel') : t('Show left panel')}
                title={showLeft ? t('Hide left panel') : t('Show left panel')}
                onClick={() => setShowLeft(!showLeft)}
                style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 10, boxShadow: '0 1px 3px rgba(0,0,0,.12)' }}
              >
                {showLeft ? (
                  // open → chevron vers la gauche pour indiquer repli vers la gauche
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
                ) : (
                  // fermé → chevron vers la droite pour réafficher
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
                )}
              </button>}
              {editing && (
                <input
                  autoFocus
                  value={editing.value}
                  onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const newLabel = editing.value.trim()
                      if (newLabel) {
                        setNodes(prev => prev.map(n => n.id === editing.id ? { ...n, label: newLabel } : n))
                        renameInStore(editing.id, newLabel)
                      }
                      setEditing(null)
                    } else if (e.key === 'Escape') {
                      setEditing(null)
                    }
                  }}
                  onBlur={() => {
                    const newLabel = editing.value.trim()
                    if (newLabel) {
                      setNodes(prev => prev.map(n => n.id === editing.id ? { ...n, label: newLabel } : n))
                      renameInStore(editing.id, newLabel)
                    }
                    setEditing(null)
                  }}
                  style={{ position: 'absolute', left: editing.left, top: editing.top, width: editing.width, height: editing.height, fontWeight: 'bold', fontSize: 14, borderRadius: 8, border: '1px solid var(--muted)', padding: '8px 10px', zIndex: 100, background: 'var(--panel)', color: 'var(--fg)', boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}
                />
              )}
            </>
          ) : tabs.find(t => t.id === activeTabId)?.type === 'settings' ? (
            <SettingsPane />
          ) : (
            <WelcomePane />
          )}
        </div>
        {tabs.find(t => t.id === activeTabId)?.type === 'mindmap' && (
          <div style={{
            width: showRight ? rightWidth : 0,
            transition: `width ${collapseMs}ms ease`,
            overflow: 'hidden',
            borderLeft: showRight ? '1px solid #e5e7eb' : 'none',
            background: 'var(--panel)',
            position: 'relative'
          }}>
            {showRight && <SidebarRight />}
            {showRight && (
              <div
                onMouseDown={(e) => {
                  const startX = e.clientX
                  const start = rightWidth
                  const onMove = (ev: MouseEvent) => {
                    const delta = startX - ev.clientX
                    const next = Math.max(200, Math.min(520, start + delta))
                    setRightWidth(next)
                  }
                  const onUp = () => {
                    window.removeEventListener('mousemove', onMove)
                    window.removeEventListener('mouseup', onUp)
                  }
                  window.addEventListener('mousemove', onMove)
                  window.addEventListener('mouseup', onUp)
                }}
                className="resizer-handle"
                style={{ position: 'absolute', top: 0, left: 0, width: 6, cursor: 'col-resize', height: '100%' }}
              />
            )}
            </div>
        )}
          </div>
      {/* FR: Barre d’onglets en bas (déplacée depuis le haut)
          
          EN: Bottom tabs bar (moved from the top) */}
      <div className="tabs" style={{ ['--accent' as any]: accentColor, borderTop: '1px solid var(--muted)' }}>
        {tabs.map((t, idx) => (
          <div key={t.id}
            draggable
            onDragStart={(e) => { e.dataTransfer.setData('text/tab-index', String(idx)) }}
            onDragOver={(e) => { e.preventDefault(); (e.currentTarget.previousSibling as HTMLElement | null)?.classList.remove('show-drop'); }}
            onDragEnter={(e) => { e.preventDefault(); }}
            onDrop={(e) => { const from = Number(e.dataTransfer.getData('text/tab-index')); if (!Number.isNaN(from)) useApp.getState().moveTab(from, idx); (e.currentTarget.querySelector('.tab-drop') as HTMLElement | null)?.remove?.(); }}
            onDragLeave={(e) => { (e.currentTarget.querySelector('.tab-drop') as HTMLElement | null)?.remove?.(); }}
            onDragOverCapture={(e) => {
              // FR: Afficher un marqueur visuel avant l’onglet courant
              //
              // EN: Show a visual marker before the current tab
              const el = e.currentTarget as HTMLElement
              if (!el.querySelector('.tab-drop')) {
                const marker = document.createElement('div')
                marker.className = 'tab-drop'
                el.prepend(marker)
              }
            }}
            onAuxClick={(e) => { if (e.button === 1) closeTab(t.id) }}
            onClick={() => activate(t.id)}
            className={`tab ${activeTabId === t.id ? 'active' : ''}`}>
            <span>{t.title}</span>
            {/* FR: Indicateur “dirty” si l’onglet a des modifications non enregistrées
                
                EN: “Dirty” indicator if the tab has unsaved changes */}
            <button className="tab-close" onClick={(e) => { e.stopPropagation(); closeTab(t.id) }} title={t.dirty ? 'Unsaved changes' : 'Close'}>
              {t.dirty ? (
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 999, background: 'var(--accent)' }} />
              ) : (
                '×'
              )}
            </button>
          </div>
        ))}
        <button onClick={() => { useApp.getState().openMindmap(); resetEmpty(); }} title="New tab" style={{
          width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent)'
        }}>+
        </button>
      </div>

      {/* Status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderTop: '1px solid var(--muted)', background: 'var(--panel)', color: 'var(--fg)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          <span className="tag-muted">{t('Language:') + ' ' + language.toUpperCase()}</span>
          <span className="tag-muted">{t('Selection:') + ' ' + (selectedId || '—')}</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <button className="icon-btn" aria-label={t('Zoom out')} title={t('Zoom out')} onClick={() => {
            if (!svgSelRef.current || !zoomBehaviorRef.current) return
            svgSelRef.current.transition().duration(150).call(zoomBehaviorRef.current.scaleBy as any, 1/1.1)
          }}>
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          <span className="tag-muted">{Math.round(zoom * 100)}%</span>
          <button className="icon-btn" aria-label={t('Zoom in')} title={t('Zoom in')} onClick={() => {
            if (!svgSelRef.current || !zoomBehaviorRef.current) return
            svgSelRef.current.transition().duration(150).call(zoomBehaviorRef.current.scaleBy as any, 1.1)
          }}>
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          <button className="icon-btn" aria-label={t('Reset zoom')} title={t('Reset zoom')} onClick={() => {
            if (!svgSelRef.current || !zoomBehaviorRef.current) return
            svgSelRef.current.transition().duration(150).call(zoomBehaviorRef.current.scaleTo as any, 1)
          }}>
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
          </button>
          <button className="icon-btn" aria-label="Fit map" title="Fit map" onClick={fitToView}>
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="3 9 3 3 9 3" />
              <polyline points="21 15 21 21 15 21" />
              <polyline points="9 21 3 21 3 15" />
              <polyline points="15 3 21 3 21 9" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

const App: React.FC = () => {
  return <MindMap />
}

export default App


