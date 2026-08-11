# features

> 按功能划分的页面与流程：组合 `ui` + `domain` / `data` / `i18n`，承载业务状态。

## 约束

- 页面级状态与流程放本层；可复用纯展示下沉到 `ui`
- 全局唯一弹层（帮助）用 Controller / Context，禁止各页各挂一份
- 跨目录引用使用 `@/`（如 `@/domain`、`@/ui/...`）

## 子目录

| 目录 | 说明 |
| ------ | ------ |
| `menu/` | 主菜单、主题/语言/音效、自定义试炼配置、数据页、关于 |
| `solo/` | 闯关 / 练习 / 无尽共用的 `GameBoard`、`fateNight/`（FateNightWatcher）、顶栏、计时 / 键盘 hooks |
| `help/` | 全局帮助 `HelpController` / `HelpPanel`、快捷键 |

## 路由页面

各特性下 `pages/` 为路由入口（含 `StatsPage` → `/stats`）；路径表见 [CODE_STANDARDS §1.1](../../docs/CODE_STANDARDS.md) 与 `src/app/paths.ts`。

## 相关

- [根 README](../../README.md)
- [`ui`](../ui/README.md)
