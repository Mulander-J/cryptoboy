/**
 * GitHub Pages SPA 回退：深链刷新时 Pages 会找 404.html。
 * 与 index.html 同内容，交给前端路由处理。
 */
import { copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist')
const indexHtml = join(dist, 'index.html')
const notFoundHtml = join(dist, '404.html')

if (!existsSync(indexHtml)) {
  console.error('copy-404: dist/index.html missing — run vite build first')
  process.exit(1)
}

copyFileSync(indexHtml, notFoundHtml)
console.log('copy-404: wrote dist/404.html')
