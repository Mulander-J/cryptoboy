# lib

> 与框架 / 部署相关的薄工具。无业务规则、无 UI。

## 约束

- 保持小而稳；业务逻辑放 `domain` / `data`，展示放 `ui` / `features`
- 跨目录引用：`@/lib/...`

## 主要文件

| 文件 | 说明 |
| ------ | ------ |
| `assetUrl.ts` | 拼接 `public/` 资源路径，兼容 Vite `base`（如 GitHub Pages `/cryptoboy/`） |

```ts
import { assetUrl } from '@/lib/assetUrl'

assetUrl('fonts/press-start-2p-latin.woff2')
// 本地 → /fonts/press-start-2p-latin.woff2
// Pages → /cryptoboy/fonts/press-start-2p-latin.woff2
```

## 相关

- [根 README](../../README.md)
- [Vite `base` / Pages 部署](../../.github/workflows/deploy-pages.yml)
