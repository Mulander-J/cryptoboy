import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { useI18n } from '@/i18n'
import { DropdownPanel } from '@/ui/DropdownPanel'
import { THEMES, type ThemeId } from '@/ui/theme/themes'

type Props = {
  current: ThemeId
  onSelect: (theme: ThemeId) => void
  /** 设置行内用 inline；保留 chrome 样式以备他处复用 */
  variant?: 'chrome' | 'inline'
}

/** 主题选择器（设置页使用；下拉列表复用 DropdownPanel） */
export function ThemePicker({ current, onSelect, variant = 'inline' }: Props) {
  const { m, t } = useI18n()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const active = THEMES.find((theme) => theme.id === current) ?? THEMES[0]!
  const activeLabel = m.theme.labels[active.id]

  useEffect(() => {
    if (!open) return

    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
      }
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div
      className={`theme-dock theme-dock-${variant}${open ? ' open' : ''}`}
      ref={rootRef}
    >
      <button
        type="button"
        className="theme-dock-trigger"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        title={t(m.theme.triggerTitle, { label: activeLabel })}
        onClick={() => setOpen((v) => !v)}
        style={
          {
            ['--swatch-shell']: active.swatchShell,
            ['--swatch-knob']: active.swatchKnob,
            ['--swatch-button']: active.swatchButton,
          } as CSSProperties
        }
      >
        <span className="theme-swatch-trio" aria-hidden>
          <span className="theme-swatch-dot shell" />
          <span className="theme-swatch-dot knob" />
          <span className="theme-swatch-dot button" />
        </span>
        <span className="theme-dock-label">{activeLabel}</span>
      </button>

      {open ? (
        <DropdownPanel
          id={listId}
          className="theme-dock-dropdown"
          aria-label={m.theme.panelAria}
          moreAboveHint={m.theme.moreAboveHint}
          moreBelowHint={m.theme.moreBelowHint}
        >
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              role="option"
              aria-selected={current === theme.id}
              className="theme-swatch"
              title={m.theme.blurbs[theme.id]}
              style={
                {
                  ['--swatch-shell']: theme.swatchShell,
                  ['--swatch-knob']: theme.swatchKnob,
                  ['--swatch-button']: theme.swatchButton,
                } as CSSProperties
              }
              onClick={() => {
                onSelect(theme.id)
                setOpen(false)
              }}
            >
              <span className="theme-swatch-trio" aria-hidden>
                <span className="theme-swatch-dot shell" />
                <span className="theme-swatch-dot knob" />
                <span className="theme-swatch-dot button" />
              </span>
              {m.theme.labels[theme.id]}
            </button>
          ))}
        </DropdownPanel>
      ) : null}
    </div>
  )
}
