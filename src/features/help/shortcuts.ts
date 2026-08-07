/** 桌面快捷键键位（文案见 i18n `m.shortcuts`） */
export type ShortcutKeys = {
  keys: string
}

/** 与 i18n shortcuts 顺序对齐的键位（语言无关） */
export const GAME_SHORTCUT_KEYS: ShortcutKeys[] = [
  { keys: '1–6 / 7–8' },
  { keys: '← / → · A / D' },
  { keys: '↑ / ↓ · W / S · Space' },
  { keys: 'Enter' },
  { keys: 'Esc' },
  { keys: '? / H' },
]

/** @deprecated 使用 i18n `m.shortcuts`；保留供测试键位存在 */
export const GAME_SHORTCUTS = GAME_SHORTCUT_KEYS.map((row, i) => ({
  keys: row.keys,
  action: `action-${i}`,
}))

export function isEditableTarget(target: EventTarget | null): boolean {
  if (target == null || typeof HTMLElement === 'undefined') return false
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return Boolean(target.closest('[contenteditable="true"]'))
}
