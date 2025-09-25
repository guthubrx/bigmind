// Re-export all types from stores
export type { Topic } from '../store/mindmap'
export type { Tab, AppState } from '../store/app'

// Additional types
export type RootSide = 'left' | 'right' | 'balanced'

export type RecentFile = {
  path: string
  title: string
  openedAt: number
  thumbnailDataUrl?: string
}

export type SheetParsed = {
  title: string
  root: Topic
}

export type EditingState = {
  id: string
  value: string
  left: number
  top: number
  width: number
  height: number
} | null

export type Dimensions = {
  width: number
  height: number
}

export type Theme = {
  [key: string]: string
}

export type Themes = {
  [key: string]: Theme
}
