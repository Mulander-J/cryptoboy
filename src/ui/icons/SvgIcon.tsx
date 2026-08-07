import { useMemo, type CSSProperties } from 'react'
import chevronSvg from '@/ui/icons/assets/chevron.svg?raw'
import githubMarkSvg from '@/ui/icons/assets/github-mark.svg?raw'
import helpCircleSvg from '@/ui/icons/assets/help-circle.svg?raw'
import infoCircleSvg from '@/ui/icons/assets/info-circle.svg?raw'
import mitLicenseSvg from '@/ui/icons/assets/mit-license.svg?raw'

type IconPreset = {
  svg: string
  size?: number
  width?: number
  height?: number
  className?: string
  label?: string
}

const ICON_REGISTRY = {
  'github-mark': {
    svg: githubMarkSvg,
    size: 14,
    className: 'github-mark',
  },
  'help-circle': {
    svg: helpCircleSvg,
    size: 15,
  },
  'info-circle': {
    svg: infoCircleSvg,
    size: 14,
  },
  chevron: {
    svg: chevronSvg,
    width: 14,
    height: 9,
  },
  'mit-license': {
    svg: mitLicenseSvg,
    width: 90,
    height: 20,
    className: 'mit-license-badge',
    label: 'license: MIT',
  },
} as const satisfies Record<string, IconPreset>

export type SvgIconName = keyof typeof ICON_REGISTRY

export type SvgIconProps = {
  name: SvgIconName
  className?: string
  /** 传给外层，供 SVG 内 `currentColor` 使用；多色图标可省略 */
  color?: string
  /** 正方形边长；与 width/height 二选一或作默认 */
  size?: number
  width?: number
  height?: number
  /** 有值时作为可访问名称；否则按装饰性图标处理（部分 name 自带默认 label） */
  label?: string
  style?: CSSProperties
}

function escapeAttr(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

/** 给根 `<svg>` 写入尺寸 / a11y，保留资源文件内的 fill（含 currentColor 或写死色） */
function prepareSvg(
  raw: string,
  opts: { width?: number; height?: number; label?: string },
): string {
  let svg = raw.trim().replace(/^<\?xml[^>]*>\s*/i, '')

  svg = svg.replace(/<svg\b([^>]*)>/i, (_match, attrs: string) => {
    let next = attrs
      .replace(/\s(?:width|height|aria-hidden|focusable)="[^"]*"/gi, '')
      .replace(/\s(?:width|height|aria-hidden|focusable)='[^']*'/gi, '')

    if (opts.width != null) next += ` width="${opts.width}"`
    if (opts.height != null) next += ` height="${opts.height}"`

    if (opts.label) {
      if (!/\brole=/i.test(next)) next += ' role="img"'
      if (!/\baria-label=/i.test(next)) next += ` aria-label="${escapeAttr(opts.label)}"`
    } else {
      next += ' aria-hidden="true" focusable="false"'
    }

    return `<svg${next}>`
  })

  return svg
}

/**
 * 按 name 使用 `assets/*.svg`。
 * 需变色的资源写 `currentColor`；多色徽章可写死色值。
 */
export function SvgIcon({
  name,
  className,
  color,
  size,
  width,
  height,
  label,
  style,
}: SvgIconProps) {
  const preset: IconPreset = ICON_REGISTRY[name]
  const w = width ?? size ?? preset.width ?? preset.size
  const h = height ?? size ?? preset.height ?? preset.size ?? w
  const resolvedLabel = label ?? preset.label
  const resolvedClass = className ?? preset.className

  const html = useMemo(
    () => prepareSvg(preset.svg, { width: w, height: h, label: resolvedLabel }),
    [preset.svg, w, h, resolvedLabel],
  )

  return (
    <span
      className={resolvedClass}
      style={{
        color,
        display: 'inline-flex',
        lineHeight: 0,
        flexShrink: 0,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
