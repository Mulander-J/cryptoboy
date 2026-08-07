/** 可切换外观主题（与 data-theme / CSS 对齐）
 *  菜单顺序：经典原皮置顶；其余按色点相似邻近
 *  色点三色：外壳/背景 + 旋钮 + 主按钮
 *  文案见 i18n theme.labels / blurbs
 */

export const THEME_IDS = [
  'classic',
  'sanxingdui',
  'xmas',
  'cyber',
  'cappuccino',
  'plum-snow',
  'cny',
  'panzer',
  'americana',
] as const

export type ThemeId = (typeof THEME_IDS)[number]

export type ThemeMeta = {
  id: ThemeId
  /** 外壳或页面主背景气质色 */
  swatchShell: string
  /** 旋钮色（与当前格闪烁对齐） */
  swatchKnob: string
  /** 主按钮 / 强调色 */
  swatchButton: string
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'classic',
    swatchShell: '#a8d400',
    swatchKnob: '#ff6a00',
    swatchButton: '#8fb000',
  },
  {
    id: 'sanxingdui',
    swatchShell: '#527a5c',
    swatchKnob: '#d4b060',
    swatchButton: '#6a9f7a',
  },
  {
    id: 'xmas',
    swatchShell: '#1f6b3a',
    swatchKnob: '#c41e3a',
    swatchButton: '#d4a017',
  },
  {
    id: 'cyber',
    swatchShell: '#243448',
    swatchKnob: '#ff2a6d',
    swatchButton: '#2de2e6',
  },
  {
    id: 'cappuccino',
    swatchShell: '#d4b896',
    swatchKnob: '#a67c52',
    swatchButton: '#c4a484',
  },
  {
    id: 'plum-snow',
    swatchShell: '#f7fafc',
    swatchKnob: '#c45c5c',
    swatchButton: '#a04048',
  },
  {
    id: 'cny',
    swatchShell: '#c8102e',
    swatchKnob: '#e8c04a',
    swatchButton: '#f0d78c',
  },
  {
    id: 'panzer',
    swatchShell: '#2e2e2e',
    swatchKnob: '#e00000',
    swatchButton: '#ffcc00',
  },
  {
    id: 'americana',
    swatchShell: '#1e4580',
    swatchKnob: '#c8102e',
    swatchButton: '#f4f7fb',
  },
]

export const DEFAULT_THEME: ThemeId = 'classic'

/** 已下线主题 → 就近迁移 */
const THEME_MIGRATIONS: Record<string, ThemeId> = {
  glass: 'classic',
  aurora: 'cyber',
  macintosh: 'classic',
}

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && (THEME_IDS as readonly string[]).includes(value)
}

export function applyTheme(theme: ThemeId): void {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
}

export function resolveTheme(value: unknown): ThemeId {
  if (isThemeId(value)) return value
  if (typeof value === 'string' && value in THEME_MIGRATIONS) {
    return THEME_MIGRATIONS[value]
  }
  return DEFAULT_THEME
}
