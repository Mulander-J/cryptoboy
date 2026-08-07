/**
 * 拼接 `public/` 下资源路径，兼容 Vite `base`（如 GitHub Pages `/cryptoboy/`）。
 * @example assetUrl('imgs/cursor.svg') → '/imgs/cursor.svg' 或 '/cryptoboy/imgs/cursor.svg'
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL
  const normalized = path.replace(/^\/+/, '')
  return `${base}${normalized}`
}
