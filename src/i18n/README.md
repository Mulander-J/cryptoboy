# i18n

> 简体中文 / English：文案 JSON、Context、插值与文档语言同步。

## 约束

- 用户可见文案放 `locales/*.json`，**不用** YAML、不在组件内硬编码长句
- 两语结构键须对齐（`i18n.test.ts` 校验）
- `domain` 不依赖本层

## 主要文件

| 文件 / 目录 | 说明 |
| ------ | ------ |
| `locales/zh-CN.json` | 简中文案 |
| `locales/en.json` | 英文文案 |
| `messages.ts` | `Messages` 类型、`CATALOG`、`interpolate` |
| `context.tsx` | `I18nProvider` / `useI18n`、`document` lang |
| `types.ts` | `Locale`、`resolveLocale` |
| `index.ts` | 对外导出 |

## 用法摘要

```ts
const { m, t, locale, setLocale } = useI18n()
t(m.menu.levelBtn, { level: 3 }) // 「第 3 关」
```

语言偏好写入 `data/progress` 的 `settings.locale`。

## 相关

- [根 README](../../README.md)
- [代码规范 · i18n](../../docs/CODE_STANDARDS.md)
