/**
 * 拼接 `public/` 下资源路径，兼容 Vite `base`（如 GitHub Pages `/cryptoboy/`）。
 * @example assetUrl('fonts/press-start-2p-latin.woff2') → '/fonts/...' 或 '/cryptoboy/fonts/...'
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL
  const normalized = path.replace(/^\/+/, '')
  return `${base}${normalized}`
}
