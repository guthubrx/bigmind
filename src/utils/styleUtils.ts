import { UI_CONSTANTS } from './constants'

export const commonStyles = {
  button: {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid var(--muted)',
    background: 'var(--panel)',
    cursor: 'pointer',
  },
  input: {
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid var(--muted)',
    background: 'var(--panel)',
    color: 'var(--text)',
  },
  panel: {
    background: 'var(--panel)',
    border: '1px solid var(--muted)',
    borderRadius: 12,
  },
  card: {
    padding: 24,
    background: 'var(--panel)',
    border: '1px solid var(--muted)',
    borderRadius: 12,
    minWidth: 520,
  },
  recentFileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  recentFileThumbnail: {
    width: 56,
    height: 40,
    objectFit: 'cover' as const,
    borderRadius: 6,
    border: '1px solid var(--muted)',
  },
  recentFilePlaceholder: {
    width: 56,
    height: 40,
    borderRadius: 6,
    border: '1px solid var(--muted)',
    background: '#f3f4f6',
  },
  toggleButton: {
    width: UI_CONSTANTS.TOGGLE_BUTTON_RADIUS * 2,
    height: UI_CONSTANTS.TOGGLE_BUTTON_RADIUS * 2,
    borderRadius: '50%',
    border: 'none',
    background: 'var(--accent)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 'bold',
  },
} as const

export const createToggleButtonStyle = (isLeft: boolean) => ({
  ...commonStyles.toggleButton,
  position: 'absolute' as const,
  transform: `translate(${isLeft ? -UI_CONSTANTS.TOGGLE_BUTTON_OFFSET : UI_CONSTANTS.TOGGLE_BUTTON_OFFSET}px, -50%)`,
  top: '50%',
  [isLeft ? 'left' : 'right']: 0,
})

export const createNodeToggleButtonStyle = (isLeft: boolean) => ({
  ...commonStyles.toggleButton,
  position: 'absolute' as const,
  transform: `translate(${isLeft ? -UI_CONSTANTS.TOGGLE_BUTTON_OFFSET : UI_CONSTANTS.TOGGLE_BUTTON_OFFSET}px, -50%)`,
  top: '50%',
  [isLeft ? 'left' : 'right']: 0,
})
