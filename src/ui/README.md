# ui

> 可复用展示层：机身、通用控件、主题、图标与轻量音效。尽量无业务状态机。

## 约束

- 不直接改全局 `Screen` / 进度；由 `features` 传入 props / 回调
- 样式优先 CSS 变量（主题 token）；组件私有类名带前缀
- 图标统一 `<SvgIcon name="..." />`（见 `icons/`）

## 结构

| 路径 | 说明 |
| ------ | ------ |
| `device/` | 机身：`DeviceShell`、灯阵、数码管、旋钮、色盘 |
| `theme/` | 主题 CSS / `applyTheme`（详见 [theme/README](./theme/README.md)） |
| `icons/` | `SvgIcon` + `assets/*.svg`；需变色用 `currentColor` |
| `audio/` | 轻量音效 |
| 根下组件 | `DropdownPanel`、`SegmentedControl`、`MenuSettingRow`、`ModalBackdrop`、`IconButton`、`ResultModal`、`TimerDisplay` 等 |

## 相关

- [根 README](../../README.md)
- [主题说明](./theme/README.md)
- [代码规范 · 组件模块化](../../docs/CODE_STANDARDS.md)
