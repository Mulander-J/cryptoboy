# features

> 按功能划分的页面与流程：组合 `ui` + `domain` / `data` / `i18n`，承载业务状态。

## 约束

- 页面级状态与流程放本层；可复用纯展示下沉到 `ui`
- 全局唯一弹层（帮助）用 Controller / Context，禁止各页各挂一份
- 跨目录引用使用 `@/`（如 `@/domain`、`@/ui/...`）

## 子目录

| 目录 | 说明 |
| ------ | ------ |
| `menu/` | 主菜单、主题/语言/音效、自由练习配置、关于 / 交流、预设答案与换手 |
| `solo/` | 闯关与练习共用的 `GameBoard`、顶栏、计时 / 键盘 hooks |
| `help/` | 全局帮助 `HelpController` / `HelpPanel`、快捷键 |

## 现状与规划

- 现状：`App` 内 `Screen` 状态切换（无 URL）
- 规划：路由体系见 [CODE_STANDARDS §1.1](../../docs/CODE_STANDARDS.md) / [PLAN P4.9](../../docs/PLAN.md)

## 相关

- [根 README](../../README.md)
- [`ui`](../ui/README.md)
