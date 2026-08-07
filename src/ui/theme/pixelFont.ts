import { assetUrl } from '@/lib/assetUrl'

/** 注册 public/fonts 像素字体（带 Vite base，兼容 GitHub Pages 子路径） */
export function injectPixelFont(): void {
  const id = 'cryptoboy-pixel-font'
  if (document.getElementById(id)) return

  const style = document.createElement('style')
  style.id = id
  style.textContent = `
@font-face {
  font-family: 'Press Start 2P';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('${assetUrl('fonts/press-start-2p-latin.woff2')}') format('woff2');
}
`
  document.head.appendChild(style)
}
